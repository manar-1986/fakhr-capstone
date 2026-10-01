/** Stable category IDs are independent of the selected interface language. */
export const PRODUCT_SUPPORT_CATEGORIES = [
  { id: "mobility", nameAr: "الإعاقة الحركية", nameEn: "Mobility & Physical Disabilities" },
  { id: "autism-sensory", nameAr: "التوحد والاحتياجات الحسية", nameEn: "Autism & Sensory Needs" },
  { id: "hearing", nameAr: "الإعاقة السمعية", nameEn: "Hearing Support" },
  { id: "visual", nameAr: "الإعاقة البصرية", nameEn: "Visual Support" },
  { id: "communication", nameAr: "التواصل والنطق", nameEn: "Communication & Speech" },
  { id: "skills", nameAr: "المهارات والتأهيل", nameEn: "Skills & Rehabilitation" },
] as const;

export type ProductSupportCategory = (typeof PRODUCT_SUPPORT_CATEGORIES)[number]["id"];
export type ProductSupportFilter = "all" | ProductSupportCategory;

export type HomeProduct = {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Assign one or more relevant support needs; these are browsing tags, not treatment claims. */
  supportCategories: readonly [ProductSupportCategory, ...ProductSupportCategory[]];
  priceLabel: string;
  photoIndex: number;
};

export const HOME_PRODUCTS: readonly HomeProduct[] = [
  { id: "p-1", nameAr: "كرسي متحرك", nameEn: "Wheelchair", supportCategories: ["mobility"], priceLabel: "KD 95.000", photoIndex: 0 },
  { id: "p-2", nameAr: "بطاقات تواصل مصورة", nameEn: "Picture communication cards", supportCategories: ["communication"], priceLabel: "KD 6.500", photoIndex: 1 },
  { id: "p-3", nameAr: "سماعات عازلة للضوضاء", nameEn: "Noise-reducing headphones", supportCategories: ["autism-sensory"], priceLabel: "KD 12.000", photoIndex: 2 },
  { id: "p-4", nameAr: "أدوات تنمية مهارات", nameEn: "Skill-building tools", supportCategories: ["skills"], priceLabel: "KD 16.000", photoIndex: 3 },
  { id: "p-5", nameAr: "لوحة تواصل", nameEn: "Communication board", supportCategories: ["communication"], priceLabel: "KD 8.000", photoIndex: 1 },
  { id: "p-6", nameAr: "وسادة دعم", nameEn: "Support cushion", supportCategories: ["mobility"], priceLabel: "KD 14.000", photoIndex: 0 },
  { id: "p-7", nameAr: "مكعبات حسية", nameEn: "Sensory blocks", supportCategories: ["autism-sensory", "skills"], priceLabel: "KD 9.500", photoIndex: 3 },
  { id: "p-8", nameAr: "حزام أمان", nameEn: "Safety belt", supportCategories: ["mobility"], priceLabel: "KD 11.000", photoIndex: 2 },
];

export function filterHomeProducts(filter: ProductSupportFilter): readonly HomeProduct[] {
  return filter === "all" ? HOME_PRODUCTS : HOME_PRODUCTS.filter((product) => product.supportCategories.includes(filter));
}
