import { INSTITUTIONS, institutionDirectoryCategory, normalizeInstitutionSearch } from "./institutionDirectory";
import { HOME_PRODUCTS, type ProductSupportCategory } from "../constants/homeProducts";
import type { Institution } from "../types/institution";
export const CATEGORY_PRODUCT_TAGS: Record<string, ProductSupportCategory[]> = {
 autism: ["autism-sensory"], adhd: [], intellectual: ["skills"], learning: ["skills"], motor: ["mobility"], hearing: ["hearing"], vision: ["visual"], speech: ["communication"], multiple: [], down: [], developmental: ["skills"], mental: [],
};
/** Browse explicit catalog tags only; these matches are not clinical recommendations. */
export function categoryContent(id: string, query = "", area = "", institutions: Institution[] = INSTITUTIONS) {
 const words = normalizeInstitutionSearch(query).split(" ").filter(Boolean);
 const matches = (value: string) => words.every(word => normalizeInstitutionSearch(value).includes(word));
 const tagged = institutions.filter(item => item.disabilityTags.includes(id));
 const places = tagged.filter(item => (!area || item.observations.some(o => o.areaAr === area)) && matches([item.nameAr, item.nameEn, ...item.observations.flatMap(o => [o.needsAr, o.areaAr])].join(" ")));
 return {
  centers: places.filter(item => institutionDirectoryCategory(item) === "rehabilitation"),
  education: places.filter(item => institutionDirectoryCategory(item) !== "rehabilitation"),
  areas: [...new Set(tagged.flatMap(item => item.observations.map(o => o.areaAr).filter((a): a is string => !!a)))].sort(),
  products: HOME_PRODUCTS.filter(item => item.supportCategories.some(tag => (CATEGORY_PRODUCT_TAGS[id] ?? []).includes(tag)) && matches(item.nameAr + " " + item.nameEn)),
 };
}
