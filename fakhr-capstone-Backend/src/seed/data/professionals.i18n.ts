type SeedI18n = {
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  bioAr: string;
  locationAr: string;
};

/** Must stay in sync with frontend `API_DOCTOR_I18N` so seeded API rows are bilingual. */
const MAP: Record<string, SeedI18n> = {
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

export function applyProfessionalI18n<
  T extends {
    name: string;
    specialtyLabel: string;
    bio: string;
    location: string;
  },
>(p: T) {
  const hit = MAP[p.name];
  return {
    ...p,
    nameAr: hit?.nameAr ?? "",
    nameEn: hit?.nameEn ?? p.name,
    specialtyLabelAr: hit?.specialtyAr ?? "",
    specialtyLabelEn: hit?.specialtyEn ?? p.specialtyLabel,
    bioAr: hit?.bioAr ?? "",
    bioEn: p.bio,
    locationAr: hit?.locationAr ?? "",
    locationEn: p.location,
  };
}
