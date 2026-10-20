import { isHiddenAlShifa } from "./centerVisibility";
import type { Href } from "expo-router";
import { PUBLIC_DOCTORS, doctorGroupLabel } from "../constants/approvedDoctors";
import { HOME_PRODUCTS, PRODUCT_SUPPORT_CATEGORIES } from "../constants/homeProducts";
import { HOME_SERVICE_PROVIDERS } from "../constants/homeServiceProviders";
import type { HealthCenter } from "../types/directory.types";
import { INSTITUTIONS, backendInstitution, institutionDirectoryCategory, normalizeInstitutionSearch } from "./institutionDirectory";
import { centerRecordId } from "./homeCarouselRecords";

type Copy = { ar: string; en: string };
type Category = "sports" | "school" | "nursery" | "rehabilitation" | "doctor" | "service" | "product";
export const SEARCH_CATEGORIES: Record<Category, Copy> = {
  sports: { ar: "النوادي الرياضية", en: "Sports Clubs" },
  school: { ar: "المدارس", en: "Schools" }, nursery: { ar: "الحضانات", en: "Nurseries" },
  rehabilitation: { ar: "مراكز التأهيل", en: "Rehabilitation centers" },
  doctor: { ar: "الأطباء والمراكز", en: "Doctors & Centers" },
  service: { ar: "الخدمات المنزلية", en: "Home services" }, product: { ar: "المنتجات المنزلية", en: "Home products" },
};
export type HomeSearchRecord = { key: string; id: string; name: Copy; category: Category; details: Copy; note?: Copy; href: Href; searchText: string };
type SearchInput = Omit<HomeSearchRecord, "key" | "searchText"> & { aliases?: string[] };
export function buildHomeSearchRecords(centers: HealthCenter[] = []): HomeSearchRecord[] {
  const inputs: SearchInput[] = [];
  const apiInstitutions = centers.filter(c => /^[a-f\d]{24}$/i.test(centerRecordId(c)) && typeof c?.name === "string" && c.name.trim()).map(backendInstitution);
  for (const item of [...INSTITUTIONS, ...apiInstitutions]) {
    if ([item.id,item.canonicalId].includes("center-speak-clinic")) continue;
    if (isHiddenAlShifa({...item,nameEn:item.nameEn || undefined})) continue;
    const details = [...new Set(item.observations.flatMap(o => [o.areaAr, o.needsAr]).filter(Boolean))].join(" · ");
    inputs.push({ id: item.categories.includes("sports") ? (item.canonicalId || item.id) : item.id, name: { ar: item.nameAr, en: item.nameEn || item.nameAr },
      category: institutionDirectoryCategory(item), details: { ar: details, en: details },
      note: { ar: "بيانات مرجعية تحتاج تحققاً", en: "Reference information needs verification" },
      aliases: item.observations.flatMap(o => [o.nameAr, o.governorateAr || "", o.areaAr || ""]),
      href: { pathname: "/(tabs)/directory/institution-details", params: { id: item.id } } });
  }
  // Use the directory's approved doctors; never reintroduce retired fictional API fallbacks.
  for (const doctor of PUBLIC_DOCTORS) inputs.push({ id: doctor.id, category: "doctor",
    aliases: doctor.id === "doctor-hadeel-yassin-faras" ? ["هديل الفرس", "Hadeel Yaseen Faras", "Hadeel Yassin Faras"] : undefined,
    name: { ar: doctor.nameAr, en: doctor.nameEn }, details: { ar: doctorGroupLabel(doctor, true), en: doctorGroupLabel(doctor, false) },
    note: doctor.id === "doctor-hadeel-yassin-faras" ? undefined : { ar: "تفاصيل غير مكتملة · تحتاج مراجعة", en: "Incomplete details · review needed" },
    href: { pathname: "/(tabs)/directory/professional-details", params: { id: doctor.id } } });
  for (const provider of HOME_SERVICE_PROVIDERS) inputs.push({ id: provider.id, category: "service", name: provider.name, details: provider.service,
    note: { ar: "التوفر للأطفال يحتاج تحققاً", en: "Children’s availability needs verification" },
    href: { pathname: "/(tabs)/services/service-details", params: { id: provider.id } } });
  for (const product of HOME_PRODUCTS) inputs.push({ id: product.id, category: "product", name: { ar: product.nameAr, en: product.nameEn },
    details: { ar: product.priceLabel || "", en: product.priceLabel || "" },
    aliases: PRODUCT_SUPPORT_CATEGORIES.filter(c => (product.supportCategories as readonly string[]).includes(c.id)).flatMap(c => [c.nameAr, c.nameEn]),
    href: { pathname: "/(tabs)/products/product-details", params: { id: product.id } } });
  const seen = new Set<string>();
  return inputs.filter(item => { const key = `${item.category}:${item.id}`; if (seen.has(key)) return false; seen.add(key); return true; })
    .map(({ aliases = [], ...item }) => ({ ...item, key: `${item.category}:${item.id}`,
      searchText: normalizeInstitutionSearch([item.name.ar, item.name.en, item.details.ar, item.details.en,
        SEARCH_CATEGORIES[item.category].ar, SEARCH_CATEGORIES[item.category].en, ...aliases].join(" ")) }));
}
export function searchHomeRecords(records: HomeSearchRecord[], query: string): HomeSearchRecord[] {
  const words = normalizeInstitutionSearch(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  return records.filter(item => words.every(word => item.searchText.includes(word))).sort((a, b) => {
    const nameMatch = (item: HomeSearchRecord) => words.every(w => normalizeInstitutionSearch(`${item.name.ar} ${item.name.en}`).includes(w));
    return Number(nameMatch(b)) - Number(nameMatch(a));
  });
}
