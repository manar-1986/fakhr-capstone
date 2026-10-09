import { describe, expect, test } from "@jest/globals";
import { backendInstitution, filterInstitutions, findInstitution, INSTITUTIONS, INSTITUTION_SOURCES, institutionDirectoryCategory, institutionMapUrl, institutionPhoneUrl, LEGACY_INSTITUTIONS, normalizeInstitutionSearch } from "../utils/institutionDirectory";
import { legacyInstitutionId } from "../utils/legacyInstitutionRoute";
import type { HealthCenter } from "../types/directory.types";

describe("PDF evidence and identities", () => {
  test("exclusive navigation categories preserve all 90 identities and source observations", () => {
    const counts = { school: 0, nursery: 0, rehabilitation: 0 };
    INSTITUTIONS.forEach(item => counts[institutionDirectoryCategory(item)]++);
    expect(counts).toEqual({ school: 39, nursery: 39, rehabilitation: 12 });
    const autism = findInstitution("kw-autism-kuwait")!;
    expect(institutionDirectoryCategory(autism)).toBe("rehabilitation");
    expect(autism.categories).toEqual(["school", "rehabilitation"]);
  });
  test("all source pages are represented, identical PDFs do not double the directory", () => {
    expect(INSTITUTIONS).toHaveLength(90);
    expect(new Set(INSTITUTIONS.map(i => i.id)).size).toBe(90);
    expect(INSTITUTION_SOURCES[0].files).toEqual(["menwhm.pdf", "menwhmة.pdf"]);
    expect(INSTITUTIONS.filter(i => i.categories.includes("school"))).toHaveLength(40);
    expect(INSTITUTIONS.filter(i => i.categories.includes("nursery"))).toHaveLength(39);
    expect(INSTITUTIONS.filter(i => i.categories.includes("rehabilitation"))).toHaveLength(12);
    for (const source of INSTITUTION_SOURCES) {
      const pages = new Set(INSTITUTIONS.flatMap(i => i.observations.filter(o => o.sourceId === source.id).map(o => o.page)));
      expect([...pages].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    }
    const observations = INSTITUTIONS.flatMap(i => i.observations);
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
    for (const id of ["kw-s-riyada-boys", "kw-s-riyada-girls", "kw-s-dasman-1", "kw-s-dasman-2", "kw-n-nasser", "kw-n-nasser-2", "kw-n-nasser-3"]) expect(findInstitution(id)).toBeDefined();
    expect(findInstitution("kw-s-dasman-1")?.observations[0].capacityAr).toContain("مشتركة");
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
      expect(item.nameEn).toBeNull();
      expect(item.reviewStatus).toBe("unverified");
      expect(institutionMapUrl(item)).toBeUndefined();
      expect(item).not.toHaveProperty("rating");
      expect(item).not.toHaveProperty("reviews");
      expect(item).not.toHaveProperty("booking");
    }
    expect(LEGACY_INSTITUTIONS).toHaveLength(12);
  });
});

describe("filtering and links", () => {
  test("Arabic normalization, source aliases, and combined filters", () => {
    expect(normalizeInstitutionSearch("أَكــاديمية")).toBe("اكاديميه");
    expect(filterInstitutions(INSTITUTIONS, { search: "مركز الكويت للدسلكسيا" }).map(i => i.id)).toEqual(["kw-r-dyslexia"]);
    const results = filterInstitutions(INSTITUTIONS, { governorate: "حولي", area: "السالمية", disability: "learning" });
    expect(results.map(i => i.id)).toContain("kw-s-manarat");
    expect(filterInstitutions(INSTITUTIONS, { governorate: "الجهراء", area: "الخالدية" })).toHaveLength(0);
    expect(filterInstitutions(INSTITUTIONS, { search: "دسمان", stage: "secondary" }).map(i => i.id)).toEqual(["kw-s-dasman-2"]);
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
