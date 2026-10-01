import { beforeEach, expect, jest, test } from "@jest/globals";
import { addJourneyRecord, readJourney, removeJourneyRecord, upcomingAppointments, type JourneyRecord } from "../utils/journeyStore";
const mockStorage = new Map<string, string>();
jest.mock("../utils/secureStorage", () => ({
  getItemAsync: async (key: string) => mockStorage.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => { mockStorage.set(key, value); },
  deleteItemAsync: async (key: string) => { mockStorage.delete(key); },
}));
beforeEach(() => mockStorage.clear());
test("accounts start empty and never share records", async () => {
  expect(await readJourney("parent-a")).toEqual([]);
  await addJourneyRecord("parent-a", { type: "note", childId: "child-a", titleAr: "ملاحظة", titleEn: "Note" });
  expect(await readJourney("parent-b")).toEqual([]);
  expect(await readJourney("parent-a")).toHaveLength(1);
});
test("concurrent writes survive reload without losing records or exceeding index page size", async () => {
  await Promise.all(Array.from({ length: 105 }, (_, i) => addJourneyRecord("parent-a", { type: "note", childId: "child-a", titleAr: String(i), titleEn: String(i) })));
  expect(await readJourney("parent-a")).toHaveLength(105);
  expect([...mockStorage.entries()].filter(([key]) => key.includes("_index_")).every(([, value]) => value.length < 2000)).toBe(true);
});
test("removing an item preserves other children and accounts", async () => {
  const first = await addJourneyRecord("parent-a", { type: "note", childId: "child-a", titleAr: "a", titleEn: "a" });
  await addJourneyRecord("parent-a", { type: "note", childId: "child-b", titleAr: "b", titleEn: "b" });
  await removeJourneyRecord("parent-a", first.id);
  expect((await readJourney("parent-a")).map(r => r.childId)).toEqual(["child-b"]);
});
test("appointments only include future center requests and sort chronologically", () => {
  const base = { type: "appointment", titleAr: "", titleEn: "", createdAt: "2026-01-01", time: "10:00 AM" } as const;
  const records: JourneyRecord[] = [
    { ...base, id: "later", kind: "center", dateKey: "2026-10-03" },
    { ...base, id: "past", kind: "center", dateKey: "2026-09-30" },
    { ...base, id: "unknown", dateKey: "2026-10-02" },
    { ...base, id: "soon", kind: "center", dateKey: "2026-10-02" },
  ];
  expect(upcomingAppointments(records, new Date(2026, 9, 1)).map(r => r.id)).toEqual(["soon", "later"]);
});
