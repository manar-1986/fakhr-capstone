import type { BiText } from "./directoryBilingual";

/** Required bilingual shape for every doctor/specialist shown in the app. */
export type BilingualDoctor = {
  id: string;
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  specialtyKey: string;
  bioAr: string;
  bioEn: string;
  locationAr: string;
  locationEn: string;
  availabilityAr: string;
  availabilityEn: string;
  nextAvailableAr: string;
  nextAvailableEn: string;
  experienceAr: string;
  experienceEn: string;
  educationAr: string[];
  educationEn: string[];
  certificationsAr: string[];
  certificationsEn: string[];
  languagesAr: string[];
  languagesEn: string[];
  servicesAr: string[];
  servicesEn: string[];
  centerNameAr: string;
  centerNameEn: string;
  rating: number;
  reviews: number;
};

export const SPECIALTY_LABELS: Record<string, BiText> = {
  speech: { ar: "أخصائي نطق ولغة", en: "Speech & Language Therapist" },
  behavioral: { ar: "أخصائي سلوكي", en: "Behavioral Therapist" },
  occupational: { ar: "أخصائي علاج وظيفي", en: "Occupational Therapist" },
  physical: { ar: "أخصائي علاج طبيعي", en: "Physiotherapist" },
  educational: { ar: "أخصائي تربوي", en: "Educational Support Specialist" },
  psychologist: { ar: "اختصاصية نفسية", en: "Psychologist" },
  pediatric: { ar: "استشاري أطفال", en: "Pediatric Consultant" },
  neurology: { ar: "استشاري أعصاب", en: "Neurology Consultant" },
  nutrition: { ar: "استشارية تغذية", en: "Nutrition Consultant" },
};

export const LANGUAGE_PAIRS: BiText[] = [
  { ar: "العربية", en: "Arabic" },
  { ar: "الإنجليزية", en: "English" },
];

const LOC: Record<string, BiText> = {
  "Kuwait City": { ar: "مدينة الكويت", en: "Kuwait City" },
  Salmiya: { ar: "السالمية", en: "Salmiya" },
  "Sabah Al Salem": { ar: "صباح السالم", en: "Sabah Al Salem" },
  Khaldiya: { ar: "الخالدية", en: "Khaldiya" },
};

const AVAIL: Record<string, BiText> = {
  "Sun–Thu": { ar: "الأحد–الخميس", en: "Sun–Thu" },
  "Sun–Wed, Sat": { ar: "الأحد–الأربعاء، السبت", en: "Sun–Wed, Sat" },
};

const NEXT: Record<string, BiText> = {
  "Within 3 days": { ar: "خلال 3 أيام", en: "Within 3 days" },
  "Within 5 days": { ar: "خلال 5 أيام", en: "Within 5 days" },
  "Within 7 days": { ar: "خلال 7 أيام", en: "Within 7 days" },
  "Next week": { ar: "الأسبوع القادم", en: "Next week" },
  "Next 7 days": { ar: "خلال 7 أيام", en: "Next 7 days" },
};

/** Demo list used when the API is empty. Every future local doctor must use this shape. */
export const BILINGUAL_DOCTORS: BilingualDoctor[] = [
  {
    id: "doc-1",
    nameAr: "د. نورة الشمري",
    nameEn: "Dr. Noura Al-Shammari",
    specialtyKey: "psychologist",
    specialtyAr: "اختصاصية نفسية",
    specialtyEn: "Psychologist",
    bioAr: "تقدم خطط دعم سلوكي وروتين يومي إيجابي للمنزل والمدرسة.",
    bioEn: "Builds supportive behavior plans and positive daily routines for home and school.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "خلال 7 أيام",
    nextAvailableEn: "Within 7 days",
    experienceAr: "٦+ سنوات",
    experienceEn: "6+ years",
    educationAr: ["بكالوريوس علم نفس"],
    educationEn: ["BA Psychology"],
    certificationsAr: ["أساسيات تحليل السلوك التطبيقي"],
    certificationsEn: ["ABA Foundations"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["خطة سلوكية", "تدريب الوالدين"],
    servicesEn: ["Behavior plan", "Parent training"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.9,
    reviews: 73,
  },
  {
    id: "doc-2",
    nameAr: "د. أحمد المطيري",
    nameEn: "Dr. Ahmed Al-Mutairi",
    specialtyKey: "pediatric",
    specialtyAr: "استشاري أطفال",
    specialtyEn: "Pediatric Consultant",
    bioAr: "متابعة نمو الطفل والتدخل المبكر مع توجيه الأسرة.",
    bioEn: "Follows child development and early intervention with family guidance.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "خلال 5 أيام",
    nextAvailableEn: "Within 5 days",
    experienceAr: "٨+ سنوات",
    experienceEn: "8+ years",
    educationAr: ["طب الأطفال"],
    educationEn: ["Pediatrics"],
    certificationsAr: ["التدخل المبكر"],
    certificationsEn: ["Early intervention"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["تقييم", "متابعة نمائية"],
    servicesEn: ["Assessment", "Developmental follow-up"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.8,
    reviews: 68,
  },
  {
    id: "doc-3",
    nameAr: "د. فاطمة العلي",
    nameEn: "Dr. Fatima Al-Ali",
    specialtyKey: "speech",
    specialtyAr: "اختصاصية نطق ولغة",
    specialtyEn: "Speech and Language Specialist",
    bioAr: "تركز على التواصل المبكر واللغة الوظيفية مع الأسرة.",
    bioEn: "Focuses on early communication and functional language with families.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "خلال 3 أيام",
    nextAvailableEn: "Within 3 days",
    experienceAr: "٦+ سنوات",
    experienceEn: "6+ years",
    educationAr: ["بكالوريوس علاج نطق"],
    educationEn: ["BSc Speech Therapy"],
    certificationsAr: ["شهادة التدخل المبكر"],
    certificationsEn: ["Early Intervention Certificate"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["تقييم", "جلسات علاج", "تدريب الوالدين"],
    servicesEn: ["Assessment", "Therapy sessions", "Parent coaching"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.7,
    reviews: 55,
  },
  {
    id: "doc-4",
    nameAr: "د. سالم الحربي",
    nameEn: "Dr. Salem Al-Harbi",
    specialtyKey: "neurology",
    specialtyAr: "استشاري أعصاب",
    specialtyEn: "Neurology Consultant",
    bioAr: "تقييم الجوانب العصبية النمائية وتنسيق خطة الرعاية.",
    bioEn: "Assesses developmental neurology and coordinates the care plan.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "الأسبوع القادم",
    nextAvailableEn: "Next week",
    experienceAr: "١٠+ سنوات",
    experienceEn: "10+ years",
    educationAr: ["طب الأعصاب"],
    educationEn: ["Neurology"],
    certificationsAr: ["أعصاب الأطفال"],
    certificationsEn: ["Pediatric neurology"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["تقييم", "خطة رعاية"],
    servicesEn: ["Assessment", "Care plan"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.9,
    reviews: 50,
  },
  {
    id: "doc-5",
    nameAr: "د. خالد العنزي",
    nameEn: "Dr. Khaled Al-Anzi",
    specialtyKey: "occupational",
    specialtyAr: "أخصائي علاج وظيفي",
    specialtyEn: "Occupational Therapist",
    bioAr: "يدعم التنظيم الحسي ومهارات الحياة اليومية عبر اللعب.",
    bioEn: "Supports sensory regulation and daily living skills through play.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "الأسبوع القادم",
    nextAvailableEn: "Next week",
    experienceAr: "٥+ سنوات",
    experienceEn: "5+ years",
    educationAr: ["بكالوريوس علاج وظيفي"],
    educationEn: ["BSc Occupational Therapy"],
    certificationsAr: ["ورشة التكامل الحسي"],
    certificationsEn: ["Sensory Integration Workshop"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["تقييم وظيفي", "خطة حسية"],
    servicesEn: ["OT assessment", "Sensory plan"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.6,
    reviews: 41,
  },
  {
    id: "doc-6",
    nameAr: "د. مريم السالم",
    nameEn: "Dr. Maryam Al-Salem",
    specialtyKey: "nutrition",
    specialtyAr: "استشارية تغذية",
    specialtyEn: "Nutrition Consultant",
    bioAr: "خطط تغذية عملية تناسب روتين الطفل والأسرة.",
    bioEn: "Practical nutrition plans that fit the child’s and family’s routine.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "خلال 7 أيام",
    nextAvailableEn: "Within 7 days",
    experienceAr: "٧+ سنوات",
    experienceEn: "7+ years",
    educationAr: ["تغذية علاجية"],
    educationEn: ["Clinical nutrition"],
    certificationsAr: ["تغذية الأطفال"],
    certificationsEn: ["Pediatric nutrition"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["استشارة تغذية", "خطة وجبات"],
    servicesEn: ["Nutrition consult", "Meal plan"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.8,
    reviews: 37,
  },
  {
    id: "doc-7",
    nameAr: "د. يوسف العتيبي",
    nameEn: "Dr. Yousef Al-Otaibi",
    specialtyKey: "behavioral",
    specialtyAr: "أخصائي سلوكي",
    specialtyEn: "Behavioral Specialist",
    bioAr: "يبني خطط سلوك وتعزيز إيجابي للمنزل والمدرسة.",
    bioEn: "Builds behavior plans and positive reinforcement for home and school.",
    locationAr: "مدينة الكويت",
    locationEn: "Kuwait City",
    availabilityAr: "الأحد–الخميس",
    availabilityEn: "Sun–Thu",
    nextAvailableAr: "خلال 7 أيام",
    nextAvailableEn: "Within 7 days",
    experienceAr: "٦+ سنوات",
    experienceEn: "6+ years",
    educationAr: ["بكالوريوس علم نفس"],
    educationEn: ["BA Psychology"],
    certificationsAr: ["دعم سلوكي"],
    certificationsEn: ["Behavior support"],
    languagesAr: ["العربية", "الإنجليزية"],
    languagesEn: ["Arabic", "English"],
    servicesAr: ["خطة سلوكية", "تدريب الوالدين"],
    servicesEn: ["Behavior plan", "Parent training"],
    centerNameAr: "",
    centerNameEn: "",
    rating: 4.5,
    reviews: 29,
  },
];

type SeedI18n = {
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  bioAr: string;
  locationAr: string;
};

/** Lookup for current and future API rows keyed by English or Arabic name. */
export const API_DOCTOR_I18N: Record<string, SeedI18n> = {
  "Dr. Sara Al-Mutairi": {
    nameAr: "د. سارة المطيري",
    nameEn: "Dr. Sara Al-Mutairi",
    specialtyAr: "أخصائية نطق ولغة",
    specialtyEn: "Speech & Language Therapist",
    bioAr: "تركز على التواصل المبكر والانتباه المشترك واللغة الوظيفية.",
    locationAr: "مدينة الكويت",
  },
  "Ahmed Al-Rashidi": {
    nameAr: "أحمد الرشيدي",
    nameEn: "Ahmed Al-Rashidi",
    specialtyAr: "أخصائي علاج وظيفي",
    specialtyEn: "Occupational Therapist",
    bioAr: "يدعم التنظيم الحسي ومهارات الحياة اليومية عبر اللعب.",
    locationAr: "مدينة الكويت",
  },
  "Noura Al-Shammari": {
    nameAr: "نورة الشمري",
    nameEn: "Noura Al-Shammari",
    specialtyAr: "أخصائية سلوكية / تحليل سلوك تطبيقي",
    specialtyEn: "ABA / Behavioral Therapist",
    bioAr: "تبني خطط سلوك بالتعزيز الإيجابي وروتين المنزل والمدرسة.",
    locationAr: "مدينة الكويت",
  },
  "Faisal Al-Kandari": {
    nameAr: "فيصل الكندري",
    nameEn: "Faisal Al-Kandari",
    specialtyAr: "أخصائي علاج طبيعي",
    specialtyEn: "Physiotherapist",
    bioAr: "يدعم التوازن والتنسيق والحركة عبر روتين علاجي قائم على اللعب.",
    locationAr: "مدينة الكويت",
  },
  "Maher Hussein": {
    nameAr: "ماهر حسين",
    nameEn: "Maher Hussein",
    specialtyAr: "دعم سلوكي",
    specialtyEn: "Behavioral Support",
    bioAr: "دعم سلوكي وتدريب الوالدين.",
    locationAr: "مدينة الكويت",
  },
  "Moustafa Abdou": {
    nameAr: "مصطفى عبده",
    nameEn: "Moustafa Abdou",
    specialtyAr: "دعم تربوي",
    specialtyEn: "Educational Support",
    bioAr: "دعم تربوي وإرشاد تعلّمي.",
    locationAr: "مدينة الكويت",
  },
  "Hessa Al-Dosari": {
    nameAr: "حصة الدوسري",
    nameEn: "Hessa Al-Dosari",
    specialtyAr: "أخصائية نطق ولغة",
    specialtyEn: "Speech & Language Therapist",
    bioAr: "تركز على النطق واللغة التعبيرية المبكرة وخطط التدريب المنزلي.",
    locationAr: "مدينة الكويت",
  },
  "Yousef Al-Fadhli": {
    nameAr: "يوسف الفضلي",
    nameEn: "Yousef Al-Fadhli",
    specialtyAr: "أخصائي علاج وظيفي",
    specialtyEn: "Occupational Therapist",
    bioAr: "يدعم التنظيم الحسي وروتين الحياة اليومية.",
    locationAr: "مدينة الكويت",
  },
  "Rehab Specialist (KDC Demo)": {
    nameAr: "أخصائي تأهيل (تجريبي)",
    nameEn: "Rehab Specialist (KDC Demo)",
    specialtyAr: "أخصائي علاج طبيعي",
    specialtyEn: "Physiotherapist",
    bioAr: "يدعم التناسق الحركي وروتين الحركة.",
    locationAr: "السالمية",
  },
  "Layla Al-Mansouri": {
    nameAr: "ليلى المنصوري",
    nameEn: "Layla Al-Mansouri",
    specialtyAr: "أخصائية نطق ولغة",
    specialtyEn: "Speech & Language Therapist",
    bioAr: "متخصصة في تطور اللغة المبكر ودعم التواصل.",
    locationAr: "السالمية",
  },
  "Rania Al-Hajri": {
    nameAr: "رانيا الهاجري",
    nameEn: "Rania Al-Hajri",
    specialtyAr: "أخصائية علاج وظيفي",
    specialtyEn: "Occupational Therapist",
    bioAr: "تعمل على التكامل الحسي والمهارات الدقيقة والاستعداد المدرسي.",
    locationAr: "السالمية",
  },
  "Abdullah Al-Sabah": {
    nameAr: "عبدالله الصباح",
    nameEn: "Abdullah Al-Sabah",
    specialtyAr: "أخصائي سلوكي",
    specialtyEn: "Behavioral Therapist",
    bioAr: "تدريب سلوكي للروتين والانتقالات والتعزيز الإيجابي في المنزل.",
    locationAr: "السالمية",
  },
  "Mariam Al-Najjar": {
    nameAr: "مريم النجار",
    nameEn: "Mariam Al-Najjar",
    specialtyAr: "أخصائية تحليل سلوك تطبيقي",
    specialtyEn: "ABA Therapist",
    bioAr: "تدخل مبكر قائم على تحليل السلوك مع تدريب الوالدين.",
    locationAr: "السالمية",
  },
  "Hind Al-Qattan": {
    nameAr: "هند القطان",
    nameEn: "Hind Al-Qattan",
    specialtyAr: "أخصائية نطق ولغة",
    specialtyEn: "Speech & Language Therapist",
    bioAr: "دعم النطق والتدخل المبكر وخطط منزلية يقودها الأهل.",
    locationAr: "السالمية",
  },
  "Dr. Faisal Al-Ajmi": {
    nameAr: "د. فيصل العجمي",
    nameEn: "Dr. Faisal Al-Ajmi",
    specialtyAr: "أخصائي علاج طبيعي",
    specialtyEn: "Physiotherapist",
    bioAr: "يدعم المهارات الحركية الكبرى والحركة عبر روتين منظم.",
    locationAr: "صباح السالم",
  },
  "Noor Al-Saad": {
    nameAr: "نور السعد",
    nameEn: "Noor Al-Saad",
    specialtyAr: "أخصائية علاج وظيفي",
    specialtyEn: "Occupational Therapist",
    bioAr: "روتين علاج وظيفي للتنظيم الحسي ومهارات الحياة اليومية.",
    locationAr: "صباح السالم",
  },
  "Abeer Al-Khaled": {
    nameAr: "عبير الخالد",
    nameEn: "Abeer Al-Khaled",
    specialtyAr: "معلمة تربية خاصة",
    specialtyEn: "Special Education Teacher",
    bioAr: "الاستعداد المدرسي وروتين التعلّم للسنوات المبكرة.",
    locationAr: "الخالدية",
  },
  "Dr. Reem Al-Fares": {
    nameAr: "د. ريم الفارس",
    nameEn: "Dr. Reem Al-Fares",
    specialtyAr: "أخصائية نفسية للأطفال",
    specialtyEn: "Child Psychologist",
    bioAr: "دعم إرشادي للأسرة والطفل: الروتين وإدارة التوتر وخطط السلوك.",
    locationAr: "مدينة الكويت",
  },
};

function indexDoctorNames(): Record<string, BilingualDoctor | SeedI18n> {
  const map: Record<string, BilingualDoctor | SeedI18n> = {};
  const add = (key: string, value: BilingualDoctor | SeedI18n) => {
    const k = key.trim();
    if (!k) return;
    map[k] = value;
    map[k.toLowerCase()] = value;
  };
  BILINGUAL_DOCTORS.forEach((doc) => {
    add(doc.id, doc);
    add(doc.nameAr, doc);
    add(doc.nameEn, doc);
  });
  Object.entries(API_DOCTOR_I18N).forEach(([en, row]) => {
    add(en, row);
    add(row.nameAr, row);
    add(row.nameEn, row);
  });
  return map;
}

export const DOCTOR_NAME_INDEX = indexDoctorNames();

export function locationPair(value?: string): BiText | undefined {
  if (!value) return undefined;
  return LOC[value] ?? LOC[value.trim()];
}

export function availabilityPair(value?: string): BiText | undefined {
  if (!value) return undefined;
  return AVAIL[value] ?? AVAIL[value.trim()];
}

export function nextAvailablePair(value?: string): BiText | undefined {
  if (!value) return undefined;
  return NEXT[value] ?? NEXT[value.trim()];
}

export function languagePair(value?: string): BiText | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return LANGUAGE_PAIRS.find(
    (pair) => pair.ar === trimmed || pair.en === trimmed || pair.en.toLowerCase() === trimmed.toLowerCase(),
  );
}
