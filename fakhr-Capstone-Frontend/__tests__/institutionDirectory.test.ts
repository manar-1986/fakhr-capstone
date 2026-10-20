import catalog from "../data/institutions/catalog.json";
import providers from "../data/institutions/verified-providers.json";
import { CONFIRMED_SCHOOL_GROUPS } from "../utils/confirmedSchoolGroups";
import { describe, expect, test } from "@jest/globals";
import { backendInstitution, filterInstitutions, findInstitution, INSTITUTIONS, INSTITUTION_SOURCES, institutionDirectoryCategory, institutionMapUrl, institutionPhoneUrl, LEGACY_INSTITUTIONS, normalizeInstitutionSearch } from "../utils/institutionDirectory";
import { legacyInstitutionId } from "../utils/legacyInstitutionRoute";
import type { Institution } from "../types/institution";
import type { HealthCenter } from "../types/directory.types";

describe("PDF evidence and identities", () => {
  test("exclusive navigation categories preserve all 90 identities and source observations", () => {
    const counts = { school: 0, nursery: 0, rehabilitation: 0, sports: 0 };
    INSTITUTIONS.forEach(item => counts[institutionDirectoryCategory(item)]++);
    expect(counts).toEqual({ school: 47, nursery: 34, rehabilitation: 19, sports: 2 });
    const autism = findInstitution("kw-autism-kuwait")!;
    expect(institutionDirectoryCategory(autism)).toBe("school");
    expect(autism.categories).toEqual(["school", "rehabilitation"]);
  });
  test("all source pages are represented, identical PDFs do not double the directory", () => {
    expect(INSTITUTIONS).toHaveLength(102);
    expect(new Set(INSTITUTIONS.map(i => i.id)).size).toBe(102);
    expect(INSTITUTION_SOURCES[0].files).toEqual(["menwhm.pdf", "menwhmة.pdf"]);
    expect(catalog.institutions.filter(i => i.categories.includes("school"))).toHaveLength(40);
    expect(catalog.institutions.filter(i => i.categories.includes("nursery"))).toHaveLength(39);
    expect(catalog.institutions.filter(i => i.categories.includes("rehabilitation"))).toHaveLength(12);
    for (const source of INSTITUTION_SOURCES) {
      const pages = new Set(INSTITUTIONS.flatMap(i => i.observations.filter(o => o.sourceId === source.id).map(o => o.page)));
      expect([...pages].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    }
    const observations = (catalog.institutions as Institution[]).flatMap(i => i.observations);
    expect(observations).toHaveLength(164);
    for (const o of observations) {
      expect(INSTITUTION_SOURCES.some(s => s.id === o.sourceId)).toBe(true);
      expect(o.nameAr.trim()).not.toBe("");
      expect(o.phones.every(p => /^\d{7,8}$/.test(p))).toBe(true);
    }
  });
  test("duplicates consolidate while branches, divisions and shared capacities survive", () => {
    expect(findInstitution("kw-s-huda")?.observations.map(o => o.row)).toEqual(["24", "34", "8"]);
    expect(findInstitution("kw-s-kes")?.observations).toHaveLength(3);
    for (const id of ["kw-s-riyada-boys", "kw-s-riyada-girls", "kw-s-dasman-1", "kw-n-nasser", "kw-n-nasser-2", "kw-n-nasser-3"]) expect(findInstitution(id)).toBeDefined();
    expect(INSTITUTIONS.find(i=>i.id==="kw-s-dasman-2")?.observations[0].capacityAr).toContain("مشتركة");
    expect(findInstitution("kw-autism-kuwait")?.categories).toEqual(["school", "rehabilitation"]);
  });
  test("conflicting facts are retained with their own source instead of overwritten", () => {
    const center = findInstitution("kw-r-21")!;
    expect(center.observations.map(o => o.agesAr)).toEqual(["21–65 سنة", "21–45 سنة"]);
    expect(center.observations[0].addressAr).toContain("112");
    expect(center.observations[1].addressAr).toContain("117");
    expect(center.reviewNotesAr.length).toBeGreaterThan(0);
    expect(findInstitution("kw-s-national")!.observations[0].phones).not.toEqual(findInstitution("kw-s-national")!.observations[1].phones);
  });
  test("no invented translations, maps, ratings or booking claims enter source data", () => {
    for (const item of INSTITUTIONS) {
      if(item.nameEn) expect([...catalog.institutions, ...providers].some(source=>source.nameEn===item.nameEn) || CONFIRMED_SCHOOL_GROUPS.some(group=>group.en===item.nameEn) || item.id==="center-blue-wing" || item.id==="kw-s-maarifa").toBe(true);
      expect(["unverified", "verified", "partially-verified"]).toContain(item.reviewStatus);
      if(institutionMapUrl(item)) expect(institutionMapUrl(item)?.startsWith("https://")).toBe(true);
      expect(item).not.toHaveProperty("rating");
      expect(item).not.toHaveProperty("reviews");
      expect(item).not.toHaveProperty("booking");
    }
    expect(LEGACY_INSTITUTIONS).toHaveLength(5);
    expect(new Set(LEGACY_INSTITUTIONS.map(i=>i.id)).size).toBe(5);
  });
});

describe("filtering and links", () => {
  test("Arabic normalization, source aliases, and combined filters", () => {
    expect(normalizeInstitutionSearch("أَكــاديمية")).toBe("اكاديميه");
    expect(filterInstitutions(INSTITUTIONS, { search: "مركز الكويت للدسلكسيا" }).map(i => i.id)).toEqual(["kw-r-dyslexia"]);
    const results = filterInstitutions(INSTITUTIONS, { governorate: "حولي", area: "السالمية", disability: "learning" });
    expect(results.map(i => i.id)).toContain("kw-s-manarat");
    expect(filterInstitutions(INSTITUTIONS, { governorate: "الجهراء", area: "الخالدية" })).toHaveLength(0);
    expect(filterInstitutions(INSTITUTIONS, { search: "دسمان", stage: "secondary" }).map(i => i.id)).toEqual(["kw-s-dasman-1"]);
    expect(filterInstitutions(INSTITUTIONS, { search: "بورتج", disability: "vision" })).toHaveLength(0);
  });
  test.each([["24822086", "tel:+96524822086"], ["٢٤٨٢٢٠٨٦", "tel:+96524822086"], ["1832000", "tel:1832000"], ["41111577", "tel:+96541111577"], ["javascript:alert(1)", undefined]])("safe phone link: %s", (raw, expected) => {
    expect(institutionPhoneUrl(raw!)).toBe(expected);
  });
  test("map links need verification metadata and an allowed HTTPS host", () => {
    const item = findInstitution("kw-r-21")!;
    expect(institutionMapUrl({ ...item, verifiedMapUrl: "https://maps.google.com/?q=Kuwait" })).toBeUndefined();
    const verified = { ...item, mapVerification: { verifiedAt: "2026-10-08", evidence: "test fixture" } };
    expect(institutionMapUrl({ ...verified, verifiedMapUrl: "https://maps.google.com/?q=Kuwait" })).toBeDefined();
    expect(institutionMapUrl({ ...verified, verifiedMapUrl: "javascript:alert(1)" })).toBeUndefined();
  });
});

describe("regression: never join schools to backend centers by array index", () => {
  const backendId = "507f1f77bcf86cd799439011";
  test("old serialized school wins over unrelated backend ID; invalid links fail closed", () => {
    expect(legacyInstitutionId(backendId, encodeURIComponent(JSON.stringify({ id: "school-noor" })))).toBe("school-noor");
    expect(legacyInstitutionId(backendId, undefined)).toBe("not-found");
    expect(legacyInstitutionId(backendId, "broken", true)).toBe("not-found");
    expect(findInstitution("missing")).toBeUndefined();
    expect(legacyInstitutionId(backendId, undefined, true)).toBe(`backend:${backendId}`);
  });
  test("backend records preserve their own IDs and details regardless of list order", () => {
    const center = { id: backendId, name: "Actual center", city: "City", address: "Actual address", phone: "22222222" } as HealthCenter;
    const record = backendInstitution(center);
    expect(record.id).toBe(`backend:${backendId}`);
    expect(record.observations[0].phones).toEqual(["22222222"]);
    expect(record.nameAr).toBe("Actual center");
    expect(record.nameAr).not.toBe(findInstitution("school-noor")?.nameAr);
  });
});
