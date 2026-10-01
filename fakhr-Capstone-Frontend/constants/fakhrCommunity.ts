/** Stable category IDs stored as backend post tags; user-authored text is never translated. */
export const FAKHR_COMMUNITY_CATEGORIES = [
  { id: "all", ar: "الكل", en: "All", icon: "grid-outline" },
  { id: "autism", ar: "التوحد", en: "Autism", icon: "infinite-outline" },
  { id: "developmental", ar: "تأخر نمائي", en: "Developmental Delay", icon: "leaf-outline" },
  { id: "learning", ar: "صعوبات التعلم", en: "Learning Difficulties", icon: "book-outline" },
  { id: "physical", ar: "الإعاقة الحركية", en: "Physical Disability", icon: "accessibility-outline" },
  { id: "adhd", ar: "اضطراب فرط الحركة", en: "ADHD", icon: "bulb-outline" },
  { id: "general", ar: "تجارب عامة", en: "General Experiences", icon: "chatbubbles-outline" },
  { id: "hearing", ar: "الإعاقة السمعية", en: "Hearing Support", icon: "ear-outline" },
  { id: "visual", ar: "الإعاقة البصرية", en: "Visual Support", icon: "eye-outline" },
] as const;
