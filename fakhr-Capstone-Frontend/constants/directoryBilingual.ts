export type BiText = {
  ar: string;
  en: string;
};

export type CenterType = "public" | "private";

export type BilingualCenter = {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  specialtyKey: string;
  rating: number;
  reviews: number;
  type: CenterType;
};

export type BilingualSchool = {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  cityKey: string;
  rating: number;
  reviews: number;
  type: CenterType;
  branchAr: string;
  branchEn: string;
  branchKey: string;
  specialtyAr: string;
  specialtyEn: string;
  aboutAr: string;
  aboutEn: string;
  ageRangeAr: string;
  ageRangeEn: string;
  stageAr: string;
  stageEn: string;
  hoursAr: string;
  hoursEn: string;
};

export const BILINGUAL_CENTERS: BilingualCenter[] = [
  {
    id: "center-khatwa",
    nameAr: "مركز خطوة للتأهيل",
    nameEn: "Khutwa Rehabilitation Center",
    specialtyAr: "الاستشارات النفسية",
    specialtyEn: "Psychological counseling",
    specialtyKey: "psych",
    rating: 4.9,
    reviews: 73,
    type: "private",
  },
  {
    id: "center-kayan",
    nameAr: "مركز كيان",
    nameEn: "Kayan Center",
    specialtyAr: "العلاج الوظيفي",
    specialtyEn: "Occupational therapy",
    specialtyKey: "ot",
    rating: 4.7,
    reviews: 120,
    type: "private",
  },
  {
    id: "center-funoon",
    nameAr: "مركز فنون",
    nameEn: "Funoon Center",
    specialtyAr: "العلاج الطبيعي",
    specialtyEn: "Physical therapy",
    specialtyKey: "pt",
    rating: 4.8,
    reviews: 88,
    type: "public",
  },
  {
    id: "center-child-dev",
    nameAr: "مركز تنمية الطفل",
    nameEn: "Child Development Center",
    specialtyAr: "التدخل المبكر",
    specialtyEn: "Early intervention",
    specialtyKey: "early",
    rating: 4.9,
    reviews: 70,
    type: "private",
  },
  {
    id: "center-amal",
    nameAr: "مركز الأمل للتنمية",
    nameEn: "Al Amal Development Center",
    specialtyAr: "النطق والتخاطب",
    specialtyEn: "Speech and language",
    specialtyKey: "speech",
    rating: 4.6,
    reviews: 54,
    type: "private",
  },
  {
    id: "center-noor",
    nameAr: "مركز نور الحياة",
    nameEn: "Noor Al Hayat Center",
    specialtyAr: "التوحد",
    specialtyEn: "Autism",
    specialtyKey: "autism",
    rating: 4.8,
    reviews: 91,
    type: "public",
  },
  {
    id: "center-bidaya",
    nameAr: "مركز بداية",
    nameEn: "Bidaya Center",
    specialtyAr: "العلاج السلوكي",
    specialtyEn: "Behavioral therapy",
    specialtyKey: "behavioral",
    rating: 4.5,
    reviews: 62,
    type: "private",
  },
];

const SCHOOL_ABOUT_AR =
  "تقدم تعليماً متخصصاً وشاملاً للأطفال من ذوي الاحتياجات الخاصة، مع بيئة آمنة ومحفزة وبرامج تربوية متخصصة.";
const SCHOOL_ABOUT_EN =
  "Specialized, inclusive education for children with additional needs, in a safe and supportive setting with tailored programs.";

export const BILINGUAL_SCHOOLS: BilingualSchool[] = [
  {
    id: "school-noor",
    nameAr: "مدرسة النور للتربية الخاصة",
    nameEn: "Al Noor School for Special Education",
    cityAr: "حولي",
    cityEn: "Hawalli",
    cityKey: "hawalli",
    rating: 4.8,
    reviews: 128,
    type: "private",
    branchAr: "التربية الخاصة",
    branchEn: "Special education",
    branchKey: "special-ed",
    specialtyAr: "صعوبات التعلم",
    specialtyEn: "Learning difficulties",
    aboutAr: SCHOOL_ABOUT_AR,
    aboutEn: SCHOOL_ABOUT_EN,
    ageRangeAr: "3 - 18 سنة",
    ageRangeEn: "Ages 3–18",
    stageAr: "ابتدائي - ثانوي",
    stageEn: "Primary – secondary",
    hoursAr: "7:30 ص - 1:30 م",
    hoursEn: "7:30 AM – 1:30 PM",
  },
  {
    id: "school-amal",
    nameAr: "مدرسة الأمل الشاملة",
    nameEn: "Al Amal Inclusive School",
    cityAr: "الفروانية",
    cityEn: "Farwaniya",
    cityKey: "farwaniya",
    rating: 4.6,
    reviews: 96,
    type: "private",
    branchAr: "الشاملة",
    branchEn: "Inclusive",
    branchKey: "inclusive",
    specialtyAr: "التعليم الشامل",
    specialtyEn: "Inclusive education",
    aboutAr: SCHOOL_ABOUT_AR,
    aboutEn: SCHOOL_ABOUT_EN,
    ageRangeAr: "3 - 18 سنة",
    ageRangeEn: "Ages 3–18",
    stageAr: "ابتدائي - ثانوي",
    stageEn: "Primary – secondary",
    hoursAr: "7:30 ص - 1:30 م",
    hoursEn: "7:30 AM – 1:30 PM",
  },
  {
    id: "school-bayan",
    nameAr: "مدرسة البيان الخاصة",
    nameEn: "Al Bayan Private School",
    cityAr: "الجهراء",
    cityEn: "Jahra",
    cityKey: "jahra",
    rating: 4.7,
    reviews: 85,
    type: "private",
    branchAr: "الخاصة",
    branchEn: "Private",
    branchKey: "private",
    specialtyAr: "التربية الخاصة",
    specialtyEn: "Special education",
    aboutAr: SCHOOL_ABOUT_AR,
    aboutEn: SCHOOL_ABOUT_EN,
    ageRangeAr: "3 - 18 سنة",
    ageRangeEn: "Ages 3–18",
    stageAr: "ابتدائي - ثانوي",
    stageEn: "Primary – secondary",
    hoursAr: "7:30 ص - 1:30 م",
    hoursEn: "7:30 AM – 1:30 PM",
  },
  {
    id: "school-tamayoz",
    nameAr: "مدرسة التميز العالمية",
    nameEn: "Al Tamayoz International School",
    cityAr: "العاصمة",
    cityEn: "Capital",
    cityKey: "capital",
    rating: 4.5,
    reviews: 73,
    type: "private",
    branchAr: "العالمية",
    branchEn: "International",
    branchKey: "international",
    specialtyAr: "منهج عالمي",
    specialtyEn: "International curriculum",
    aboutAr: SCHOOL_ABOUT_AR,
    aboutEn: SCHOOL_ABOUT_EN,
    ageRangeAr: "3 - 18 سنة",
    ageRangeEn: "Ages 3–18",
    stageAr: "ابتدائي - ثانوي",
    stageEn: "Primary – secondary",
    hoursAr: "7:30 ص - 1:30 م",
    hoursEn: "7:30 AM – 1:30 PM",
  },
  {
    id: "school-deaf",
    nameAr: "مدرسة الكويت للصم",
    nameEn: "Kuwait School for the Deaf",
    cityAr: "حولي",
    cityEn: "Hawalli",
    cityKey: "hawalli",
    rating: 4.9,
    reviews: 64,
    type: "public",
    branchAr: "الصم",
    branchEn: "Deaf education",
    branchKey: "deaf",
    specialtyAr: "الإعاقة السمعية",
    specialtyEn: "Hearing disability",
    aboutAr: SCHOOL_ABOUT_AR,
    aboutEn: SCHOOL_ABOUT_EN,
    ageRangeAr: "3 - 18 سنة",
    ageRangeEn: "Ages 3–18",
    stageAr: "ابتدائي - ثانوي",
    stageEn: "Primary – secondary",
    hoursAr: "7:30 ص - 1:30 م",
    hoursEn: "7:30 AM – 1:30 PM",
  },
];

const SLUG_PAIRS: BiText[] = [
  { ar: "التوحد", en: "Autism" },
  { ar: "التدخل المبكر", en: "Early intervention" },
  { ar: "النطق والتخاطب", en: "Speech and language" },
  { ar: "العلاج الوظيفي", en: "Occupational therapy" },
  { ar: "العلاج السلوكي", en: "Behavioral therapy" },
  { ar: "التأهيل", en: "Rehabilitation" },
  { ar: "فرط الحركة", en: "ADHD" },
  { ar: "متلازمة داون", en: "Down syndrome" },
  { ar: "العلاج الطبيعي", en: "Physical therapy" },
  { ar: "التعليم الظلي", en: "Shadow teaching" },
  { ar: "الإرشاد الأسري", en: "Family counseling" },
  { ar: "الدعم التعليمي", en: "Educational support" },
  { ar: "تحليل السلوك التطبيقي", en: "ABA" },
  { ar: "التقييم", en: "Assessment" },
  { ar: "علم النفس", en: "Psychology" },
  { ar: "التأخر النمائي", en: "Developmental delay" },
  { ar: "الاستعداد للمدرسة", en: "School readiness" },
  { ar: "الاحتياجات الخاصة", en: "Special needs" },
  { ar: "مدينة الكويت", en: "Kuwait City" },
  { ar: "السالمية", en: "Salmiya" },
  { ar: "صباح السالم", en: "Sabah Al Salem" },
  { ar: "الخالدية", en: "Khaldiya" },
  { ar: "حولي", en: "Hawalli" },
  { ar: "الفروانية", en: "Farwaniya" },
  { ar: "الجهراء", en: "Jahra" },
  { ar: "العاصمة", en: "Capital" },
  { ar: "الاستشارات النفسية", en: "Psychological counseling" },
  { ar: "التربية الخاصة", en: "Special education" },
  { ar: "الشاملة", en: "Inclusive" },
  { ar: "الخاصة", en: "Private" },
  { ar: "العالمية", en: "International" },
  { ar: "الصم", en: "Deaf education" },
  { ar: "صعوبات التعلم", en: "Learning difficulties" },
  { ar: "التعليم الشامل", en: "Inclusive education" },
  { ar: "منهج عالمي", en: "International curriculum" },
  { ar: "الإعاقة السمعية", en: "Hearing disability" },
  { ar: "3 - 18 سنة", en: "Ages 3–18" },
  { ar: "ابتدائي - ثانوي", en: "Primary – secondary" },
  { ar: "7:30 ص - 1:30 م", en: "7:30 AM – 1:30 PM" },
  { ar: SCHOOL_ABOUT_AR, en: SCHOOL_ABOUT_EN },
  {
    ar: "تقدم تعليماً متخصصاً وشاملاً للأطفال من ذوي الاحتياجات الخاصة، مع بيئة آمنة ومحفزة وبرامج تربوية متخصصة",
    en: SCHOOL_ABOUT_EN,
  },
  { ar: "حكومي", en: "Public" },
  { ar: "خاص", en: "Private" },
  { ar: "الأحد - الخميس 8:00 - 14:00", en: "Sun–Thu 8:00–14:00" },
];

const SLUG_TO_EN: Record<string, string> = {
  autism: "Autism",
  "early-intervention": "Early intervention",
  "speech-therapy": "Speech therapy",
  "occupational-therapy": "Occupational therapy",
  "behavioral-therapy": "Behavioral therapy",
  rehabilitation: "Rehabilitation",
  adhd: "ADHD",
  "down-syndrome": "Down syndrome",
  "physical-therapy": "Physical therapy",
  "shadow-teaching": "Shadow teaching",
  "family-counseling": "Family counseling",
  "educational-support": "Educational support",
  aba: "ABA",
  assessment: "Assessment",
  psychology: "Psychology",
  "developmental-delay": "Developmental delay",
  "school-readiness": "School readiness",
  "special-needs": "Special needs",
  "kuwait city": "Kuwait City",
  salmiya: "Salmiya",
  "sabah al salem": "Sabah Al Salem",
  khaldiya: "Khaldiya",
};

function indexPairs(pairs: BiText[]): Record<string, BiText> {
  const map: Record<string, BiText> = {};
  pairs.forEach((pair) => {
    map[pair.ar] = pair;
    map[pair.en] = pair;
  });
  BILINGUAL_CENTERS.forEach((center) => {
    const name = { ar: center.nameAr, en: center.nameEn };
    map[center.nameAr] = name;
    map[center.nameEn] = name;
    const spec = { ar: center.specialtyAr, en: center.specialtyEn };
    map[center.specialtyAr] = spec;
    map[center.specialtyEn] = spec;
  });
  BILINGUAL_SCHOOLS.forEach((school) => {
    const name = { ar: school.nameAr, en: school.nameEn };
    map[school.nameAr] = name;
    map[school.nameEn] = name;
    const city = { ar: school.cityAr, en: school.cityEn };
    map[school.cityAr] = city;
    map[school.cityEn] = city;
    const branch = { ar: school.branchAr, en: school.branchEn };
    map[school.branchAr] = branch;
    map[school.branchEn] = branch;
    const spec = { ar: school.specialtyAr, en: school.specialtyEn };
    map[school.specialtyAr] = spec;
    map[school.specialtyEn] = spec;
    const about = { ar: school.aboutAr, en: school.aboutEn };
    map[school.aboutAr] = about;
    map[school.aboutEn] = about;
  });
  return map;
}

export const DIRECTORY_LOOKUP = indexPairs(SLUG_PAIRS);

export function pickBi(text: BiText, isRTL: boolean): string {
  return isRTL ? text.ar : text.en;
}

export function containsArabic(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value);
}

export function directoryText(
  value: string | undefined | null,
  isRTL: boolean,
  fallbackTranslate?: (raw: string) => string,
): string {
  if (!value) return "";
  const trimmed = value.trim();
  const pair = DIRECTORY_LOOKUP[trimmed] ?? DIRECTORY_LOOKUP[value];
  if (pair) return pickBi(pair, isRTL);

  const slugEn = SLUG_TO_EN[trimmed.toLowerCase()];
  if (slugEn) {
    const slugPair = DIRECTORY_LOOKUP[slugEn];
    if (slugPair) return pickBi(slugPair, isRTL);
    return isRTL ? trimmed : slugEn;
  }

  if (fallbackTranslate) {
    const translated = fallbackTranslate(trimmed);
    if (translated && translated !== trimmed && (isRTL || !containsArabic(translated))) {
      return translated;
    }
  }

  if (!isRTL && containsArabic(trimmed)) return "";
  return trimmed;
}

export function centerDisplayName(center: BilingualCenter, isRTL: boolean): string {
  return isRTL ? center.nameAr : center.nameEn;
}

export function centerDisplaySpecialty(center: BilingualCenter, isRTL: boolean): string {
  return isRTL ? center.specialtyAr : center.specialtyEn;
}

export function schoolDisplayName(school: BilingualSchool, isRTL: boolean): string {
  return isRTL ? school.nameAr : school.nameEn;
}
