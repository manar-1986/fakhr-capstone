import { buildHomeCarouselRecords, eligibleCarouselCenter } from "../utils/homeCarouselRecords";
import { findInstitution } from "../utils/institutionDirectory";
import { findApprovedDoctor } from "../constants/approvedDoctors";
import { findHomeServiceProvider } from "../constants/homeServiceProviders";
import { HOME_PRODUCTS } from "../constants/homeProducts";
import type { HealthCenter } from "../types/directory.types";

test("every local slide resolves to its own existing record, with no duplicates or fabricated photos", () => {
  const slides = buildHomeCarouselRecords();
  expect(slides).toHaveLength(6);
  expect(new Set(slides.map(s => s.id)).size).toBe(slides.length);
  for (const slide of slides) {
    const href = slide.href as { pathname: string; params: { id: string } };
    expect(href.params.id).toBe(slide.id);
    const record = findInstitution(slide.id) || findApprovedDoctor(slide.id) || findHomeServiceProvider(slide.id) || HOME_PRODUCTS.find(p => p.id === slide.id);
    expect(record).toBeDefined();
    if (href.pathname.endsWith("institution-details")) {
      const institution = findInstitution(slide.id)!;
      expect(slide.name.ar).toBe(institution.nameAr);
      expect(slide.name.en).toBe(institution.nameEn || institution.nameAr);
      expect(slide.image).toBeUndefined();
    }
    if (href.pathname.endsWith("professional-details")) expect(slide.image).toBeUndefined();
    expect(href.pathname).toMatch(/details$/);
  }
});
test("backend identity is retained independently and malformed or duplicate centers are excluded", () => {
  const center = { id: "123456789012345678901234", name: "API fixture", city: "Area" } as HealthCenter;
  const slide = buildHomeCarouselRecords(center).at(-1)!;
  expect(slide.id).toBe(`backend:${center.id}`);
  expect(slide.href).toEqual({ pathname: "/(tabs)/directory/institution-details", params: { id: slide.id } });
  expect(slide.image).toBeUndefined();
  expect(eligibleCarouselCenter({ ...center, id: "invalid" })).toBe(false);
  expect(eligibleCarouselCenter({ ...center, name: buildHomeCarouselRecords()[0].name.ar })).toBe(false);
  expect(buildHomeCarouselRecords({ ...center, id: "invalid" })).toHaveLength(6);
});
