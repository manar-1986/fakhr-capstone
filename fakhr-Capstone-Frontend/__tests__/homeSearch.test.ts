import { buildHomeSearchRecords, searchHomeRecords } from "../utils/homeSearch";
import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { HOME_PRODUCTS } from "../constants/homeProducts";
import { HOME_SERVICE_PROVIDERS } from "../constants/homeServiceProviders";
import { INSTITUTIONS } from "../utils/institutionDirectory";
import type { HealthCenter } from "../types/directory.types";
const records = buildHomeSearchRecords();
test("all current local records have unique exact detail identities", () => {
  expect(records).toHaveLength(INSTITUTIONS.length - 1 + PUBLIC_DOCTORS.length + HOME_PRODUCTS.length + HOME_SERVICE_PROVIDERS.length);
  expect(new Set(records.map(r => r.key)).size).toBe(records.length);
  for (const record of records) {
    expect(record.href).toMatchObject({ params: { id: record.id } });
    expect((record.href as { pathname: string }).pathname).toMatch(/details$/);
  }
});
test.each([
  ["هَدِيل الفرس", "doctor-hadeel-yassin-faras"], ["HADEEL", "doctor-hadeel-yassin-faras"],
  ["البستان", "kw-n-bustan"], ["تقويم الطفل", "kw-s-child"], ["الكويت للتوحد", "kw-autism-kuwait"],
  ["Therapy Care", "home-provider-therapy-care"], ["كرسي", "p-1"], ["Wheelchair", "p-1"],
])("search %s finds existing record %s", (query, id) => expect(searchHomeRecords(records, query).some(r => r.id === id)).toBe(true));
test("empty queries and unmatched text return no records; both category languages work", () => {
  expect(searchHomeRecords(records, "   ")).toEqual([]);
  expect(searchHomeRecords(records, "xyz-no-such-item")).toEqual([]);
  expect(searchHomeRecords(records, "Schools").every(r => r.category === "school")).toBe(true);
  expect(searchHomeRecords(records, "الحضانات").length).toBeGreaterThan(0);
});
test("API records retain their own IDs; duplicate IDs and malformed IDs are excluded", () => {
  const center = { id: "123456789012345678901234", name: "API test center", city: "Area" } as HealthCenter;
  const result = searchHomeRecords(buildHomeSearchRecords([center, center, { ...center, id: "bad-id" }]), "API test center");
  expect(result).toHaveLength(1);
  expect(result[0].href).toEqual({ pathname: "/(tabs)/directory/institution-details", params: { id: `backend:${center.id}` } });
});

test("hidden doctors cannot be found by either language or spelling variants", () => {
  for (const query of ["ناهد", "Nahed", "عايض", "Ayed", "بوسانكا", "Bosanka", "منى القبندي", "Mona Al-Qabandi", "عبير عوض", "Abeer Awad"]) {
    expect(searchHomeRecords(records, query).filter(record => record.category === "doctor")).toHaveLength(0);
  }
  expect(searchHomeRecords(records, "Doctors").filter(record => record.category === "doctor").slice(0, 2).map(record => record.id))
    .toEqual(["doctor-hadeel-yassin-faras", "doctor-fatima-al-awadhi"]);
});


test("Speak Clinic is indexed once in Home Services, including a duplicate API response",()=>{
 const matches=buildHomeSearchRecords([{id:"123456789012345678901234",name:"Speak Clinic"} as HealthCenter]).filter(i=>i.id==="center-speak-clinic" || i.name.en.includes("Speak Clinic"));
 expect(matches).toHaveLength(1);expect(matches[0].category).toBe("service");
});
