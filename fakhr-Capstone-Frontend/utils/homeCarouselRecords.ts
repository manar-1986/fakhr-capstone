import type { Href } from "expo-router";
import type { ImageSourcePropType } from "react-native";
import { APPROVED_DOCTORS, doctorGroupLabel } from "../constants/approvedDoctors";
import { HOME_PRODUCTS } from "../constants/homeProducts";
import { productIllustration } from "../constants/productImages";
import { HOME_SERVICE_PROVIDERS } from "../constants/homeServiceProviders";
import type { HealthCenter } from "../types/directory.types";
import type { Institution } from "../types/institution";
import { INSTITUTIONS, backendInstitution, institutionDirectoryCategory, normalizeInstitutionSearch } from "./institutionDirectory";

type Copy = { ar: string; en: string };
export type HomeCarouselRecord = {
  id: string; name: Copy; description: Copy; note: Copy; href: Href;
  icon: "school-outline" | "happy-outline" | "business-outline" | "person-outline" | "cube-outline" | "pulse-outline";
  image?: ImageSourcePropType;
};
// This is the existing product illustration, not a verified seller photograph.
const review = { ar: "بيانات تحتاج مراجعة", en: "Details need review" };
const directory = { ar: "من دليل فخر", en: "From Fakhr" };
export function centerRecordId(center?: HealthCenter): string {
  return center?.id || (center as (HealthCenter & { _id?: string }) | undefined)?._id || "";
}
export function eligibleCarouselCenter(center: HealthCenter): boolean {
  return /^[a-f\d]{24}$/i.test(centerRecordId(center)) && typeof center.name === "string" && !!center.name.trim()
    && !INSTITUTIONS.some(item => normalizeInstitutionSearch(item.nameAr) === normalizeInstitutionSearch(center.name));
}
function institutionSlide(item: Institution): HomeCarouselRecord {
  const category = institutionDirectoryCategory(item);
  const area = item.observations.find(o => o.areaAr)?.areaAr || "";
  return {
    id: item.id, name: { ar: item.nameAr, en: item.nameEn || item.nameAr },
    // Preserve source Arabic when no verified translation exists.
    description: { ar: area, en: area }, note: review,
    icon: category === "school" ? "school-outline" : category === "nursery" ? "happy-outline" : "business-outline",
    href: { pathname: "/(tabs)/directory/institution-details", params: { id: item.id } },
  };
}
/** One existing record per directory keeps pagination compact. Never join by array position.
 * Optional API record must have been resolved through its own detail endpoint first. */
export function buildHomeCarouselRecords(resolvedCenter?: HealthCenter): HomeCarouselRecord[] {
  const slides: HomeCarouselRecord[] = [];
  for (const category of ["school", "nursery"] as const) {
    const item = INSTITUTIONS.find(i => institutionDirectoryCategory(i) === category && i.id && i.nameAr.trim());
    if (item) slides.push(institutionSlide(item));
  }
  const doctor = APPROVED_DOCTORS.find(d => d.id && d.englishVerified && d.group !== "review");
  if (doctor) slides.push({ id: doctor.id, name: { ar: doctor.nameAr, en: doctor.nameEn },
    description: { ar: doctorGroupLabel(doctor, true), en: doctorGroupLabel(doctor, false) }, note: directory,
    icon: "person-outline", href: { pathname: "/(tabs)/directory/professional-details", params: { id: doctor.id } } });
  const center = INSTITUTIONS.find(i => institutionDirectoryCategory(i) === "rehabilitation" && i.id && i.nameAr.trim());
  if (center) slides.push(institutionSlide(center));
  const product = HOME_PRODUCTS.find(p => p.id && p.nameAr && productIllustration(p.id));
  if (product) slides.push({ id: product.id, name: { ar: product.nameAr, en: product.nameEn },
    description: { ar: product.priceLabel || "", en: product.priceLabel || "" },
    note: { ar: "صورة توضيحية", en: "Illustration" }, image: productIllustration(product.id), icon: "cube-outline",
    href: { pathname: "/(tabs)/products/product-details", params: { id: product.id } } });
  const provider = HOME_SERVICE_PROVIDERS.find(p => p.id && p.name.ar);
  if (provider) slides.push({ id: provider.id, name: provider.name, description: provider.service,
    note: { ar: "تحقق من توفر الخدمة", en: "Confirm availability" }, icon: "pulse-outline",
    href: { pathname: "/(tabs)/services/service-details", params: { id: provider.id } } });
  if (resolvedCenter && eligibleCarouselCenter(resolvedCenter)) slides.push(institutionSlide(backendInstitution(resolvedCenter)));
  return slides.filter((slide, index) => slides.findIndex(other => other.id === slide.id) === index);
}
