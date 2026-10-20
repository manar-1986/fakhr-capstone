import { HOME_PRODUCTS, PRODUCT_SUPPORT_CATEGORIES, type HomeProduct } from "./homeProducts";
export const STORE_FILTERS = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "sensory", ar: "أدوات حسية", en: "Sensory Tools" },
  { id: "educational", ar: "ألعاب تعليمية", en: "Educational Toys" },
  { id: "communication", ar: "بطاقات تواصل", en: "Communication Cards" },
  { id: "assistive", ar: "أدوات مساعدة", en: "Assistive Devices" },
] as const;
export type StoreFilter = typeof STORE_FILTERS[number]["id"];
// Browse existing records by their actual product type, not reused photo indices.
const productTypes: Record<Exclude<StoreFilter, "all">, readonly string[]> = {
  sensory: ["p-7"], educational: [], communication: ["p-2"], assistive: ["p-1", "p-3", "p-5", "p-6", "p-8"],
};
export const normalizeProductSearch = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").trim();
export function searchStoreProducts(query: string, category: StoreFilter): readonly HomeProduct[] {
  const normalized = normalizeProductSearch(query);
  return HOME_PRODUCTS.filter(product => {
    const descriptions = PRODUCT_SUPPORT_CATEGORIES.filter(c => product.supportCategories.includes(c.id)).flatMap(c => [c.nameAr, c.nameEn]);
    return (category === "all" || productTypes[category].includes(product.id)) && normalizeProductSearch([product.nameAr, product.nameEn, ...descriptions].join(" ")).includes(normalized);
  });
}
