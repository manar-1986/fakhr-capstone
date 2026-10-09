import * as storage from "./secureStorage";

export type JourneyKind = "center" | "product" | "video" | "article";
export type JourneyRecord = {
  id: string;
  type: "activity" | "saved" | "appointment" | "report" | "note";
  createdAt: string;
  childId?: string;
  kind?: JourneyKind;
  titleAr: string;
  titleEn: string;
  href?: string;
  action?: "viewed" | "saved" | "booked" | "report" | "note";
  dateKey?: string;
  time?: string;
  centerAr?: string;
  centerEn?: string;
  locationAr?: string;
  locationEn?: string;
};

// Device-only repository; replace this adapter with an authenticated API when available.
// Records are split across secure-storage keys, rather than one unbounded secure-store value.
const prefix = (accountId: string) => `journey_v1_${Array.from(accountId).map(char => char.codePointAt(0)!.toString(16)).join("-")}`;
const queues = new Map<string, Promise<unknown>>();
async function ids(accountId: string): Promise<string[]> {
  const count = Number(await storage.getItemAsync(`${prefix(accountId)}_pages`) ?? 0);
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid journey storage");
  const pages = await Promise.all(Array.from({ length: count }, (_, i) => storage.getItemAsync(`${prefix(accountId)}_index_${i}`)));
  return pages.flatMap(value => {
    const parsed: unknown = JSON.parse(value ?? "null");
    if (!Array.isArray(parsed) || !parsed.every(id => typeof id === "string")) throw new Error("Invalid journey storage");
    return parsed;
  });
}
async function writeIndex(accountId: string, index: string[]) {
  const count = Math.ceil(index.length / 50);
  for (let i = 0; i < count; i++) await storage.setItemAsync(`${prefix(accountId)}_index_${i}`, JSON.stringify(index.slice(i * 50, (i + 1) * 50)));
  await storage.setItemAsync(`${prefix(accountId)}_pages`, String(count));
}
export async function readJourney(accountId: string): Promise<JourneyRecord[]> {
  await queues.get(accountId);
  const values = await Promise.all((await ids(accountId)).map(id => storage.getItemAsync(`${prefix(accountId)}_${id}`)));
  return values.filter((v): v is string => !!v).map(v => JSON.parse(v) as JourneyRecord)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function serialize<T>(accountId: string, work: () => Promise<T>): Promise<T> {
  const next = (queues.get(accountId) ?? Promise.resolve()).catch(() => {}).then(work);
  queues.set(accountId, next.catch(() => {}));
  return next;
}
export function addJourneyRecord(accountId: string, input: Omit<JourneyRecord, "id" | "createdAt">) {
  return serialize(accountId, async () => {
    const index = await ids(accountId);
    const record: JourneyRecord = { ...input, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() };
    await storage.setItemAsync(`${prefix(accountId)}_${record.id}`, JSON.stringify(record));
    await writeIndex(accountId, [...index, record.id]);
    return record;
  });
}
export function removeJourneyRecord(accountId: string, id: string) {
  return serialize(accountId, async () => {
    const index = await ids(accountId);
    await writeIndex(accountId, index.filter(item => item !== id));
    await storage.deleteItemAsync(`${prefix(accountId)}_${id}`);
  });
}
export function upcomingAppointments(records: JourneyRecord[], today = new Date()) {
  const start = (record: JourneyRecord) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.dateKey ?? "")) return NaN;
    const [year, month, day] = record.dateKey!.split("-").map(Number);
    const time = record.time?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!time) return new Date(year, month - 1, day, 23, 59).getTime();
    let hour = Number(time[1]);
    if (time[3]) hour = hour % 12 + (time[3].toUpperCase() === "PM" ? 12 : 0);
    return new Date(year, month - 1, day, hour, Number(time[2])).getTime();
  };
  return records.filter(r => r.type === "appointment" && r.kind === "center" && start(r) >= today.getTime())
    .sort((a, b) => start(a) - start(b));
}
