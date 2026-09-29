import instance from "./axios";

export interface Service {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  longDescription: string;
  longDescriptionAr?: string;
  longDescriptionEn?: string;
  icon: string;
  category: string;
  categoryAr?: string;
  categoryEn?: string;
  rating: number;
  reviews: number;
  providers: number;
  color: string;
  benefits: string[];
  benefitsAr?: string[];
  benefitsEn?: string[];
  duration: string;
  durationAr?: string;
  durationEn?: string;
  frequency: string;
  frequencyAr?: string;
  frequencyEn?: string;
  ageRange: string;
  ageRangeAr?: string;
  ageRangeEn?: string;
  specialty?: string;
  price?: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicesResponse {
  success: boolean;
  data: {
    services: Service[];
    count: number;
  };
}

export interface ServiceResponse {
  success: boolean;
  data: {
    service: Service;
  };
}

/** Home-services fallback when API is unreachable (e.g. mobile + localhost) */
export const HOME_SERVICES: Service[] = [
  {
    id: "hs-behavioral",
    name: "العلاج السلوكي",
    nameAr: "العلاج السلوكي",
    nameEn: "Behavioral Therapy",
    description: "دعم سلوكي في المنزل للروتين والمهارات الإيجابية.",
    descriptionAr: "دعم سلوكي في المنزل للروتين والمهارات الإيجابية.",
    descriptionEn: "In-home support for behavior, routines, and positive skills.",
    longDescription:
      "جلسات علاج سلوكي في المنزل تساعد الطفل على بناء مهارات إيجابية وتنظيم السلوك ضمن الروتين اليومي للأسرة.",
    longDescriptionAr:
      "جلسات علاج سلوكي في المنزل تساعد الطفل على بناء مهارات إيجابية وتنظيم السلوك ضمن الروتين اليومي للأسرة.",
    longDescriptionEn:
      "In-home behavioral therapy sessions that help your child build positive skills and regulate behavior within daily family routines.",
    icon: "pulse-outline",
    category: "علاج",
    categoryAr: "علاج",
    categoryEn: "Therapy",
    rating: 4.8,
    reviews: 64,
    providers: 12,
    color: "#6E7CAF",
    benefits: [
      "خطط سلوكية واضحة للمنزل",
      "دعم الأسرة في التعامل مع التحديات اليومية",
      "تعزيز المهارات الاجتماعية والاستقلالية",
    ],
    benefitsAr: [
      "خطط سلوكية واضحة للمنزل",
      "دعم الأسرة في التعامل مع التحديات اليومية",
      "تعزيز المهارات الاجتماعية والاستقلالية",
    ],
    benefitsEn: [
      "Clear behavior plans for home",
      "Family support for everyday challenges",
      "Stronger social skills and independence",
    ],
    duration: "45–60 دقيقة",
    durationAr: "45–60 دقيقة",
    durationEn: "45–60 min",
    frequency: "1–2 مرات أسبوعياً",
    frequencyAr: "1–2 مرات أسبوعياً",
    frequencyEn: "1–2× per week",
    ageRange: "2–18 سنة",
    ageRangeAr: "2–18 سنة",
    ageRangeEn: "Ages 2–18",
    specialty: "behavioral",
  },
  {
    id: "hs-occupational",
    name: "العلاج الوظيفي",
    nameAr: "العلاج الوظيفي",
    nameEn: "Occupational Therapy",
    description: "علاج وظيفي منزلي للمهارات الحسية والحياتية اليومية.",
    descriptionAr: "علاج وظيفي منزلي للمهارات الحسية والحياتية اليومية.",
    descriptionEn: "In-home occupational therapy for sensory and daily living skills.",
    longDescription:
      "يساعد العلاج الوظيفي في المنزل على تطوير المهارات الحسية والحركية الدقيقة وأنشطة الحياة اليومية في بيئة الطفل المألوفة.",
    longDescriptionAr:
      "يساعد العلاج الوظيفي في المنزل على تطوير المهارات الحسية والحركية الدقيقة وأنشطة الحياة اليومية في بيئة الطفل المألوفة.",
    longDescriptionEn:
      "In-home occupational therapy supports sensory processing, fine motor skills, and everyday activities in your child’s familiar environment.",
    icon: "hand-left-outline",
    category: "علاج",
    categoryAr: "علاج",
    categoryEn: "Therapy",
    rating: 4.7,
    reviews: 58,
    providers: 10,
    color: "#6E7CAF",
    benefits: [
      "تحسين المهارات الحسية والحركية",
      "دعم الاستقلالية في المهام اليومية",
      "تمارين عملية يمكن تطبيقها في المنزل",
    ],
    benefitsAr: [
      "تحسين المهارات الحسية والحركية",
      "دعم الاستقلالية في المهام اليومية",
      "تمارين عملية يمكن تطبيقها في المنزل",
    ],
    benefitsEn: [
      "Better sensory and motor skills",
      "More independence in daily tasks",
      "Practical exercises you can use at home",
    ],
    duration: "45–60 دقيقة",
    durationAr: "45–60 دقيقة",
    durationEn: "45–60 min",
    frequency: "1–2 مرات أسبوعياً",
    frequencyAr: "1–2 مرات أسبوعياً",
    frequencyEn: "1–2× per week",
    ageRange: "1–18 سنة",
    ageRangeAr: "1–18 سنة",
    ageRangeEn: "Ages 1–18",
    specialty: "occupational",
  },
  {
    id: "hs-speech",
    name: "علاج النطق",
    nameAr: "علاج النطق",
    nameEn: "Speech Therapy",
    description: "علاج نطق ولغة في المنزل لدعم التواصل.",
    descriptionAr: "علاج نطق ولغة في المنزل لدعم التواصل.",
    descriptionEn: "In-home speech and language therapy to support communication.",
    longDescription:
      "يركّز علاج النطق المنزلي على تطوير اللغة والتعبير والفهم، مع إشراك الأسرة في التمارين اليومية.",
    longDescriptionAr:
      "يركّز علاج النطق المنزلي على تطوير اللغة والتعبير والفهم، مع إشراك الأسرة في التمارين اليومية.",
    longDescriptionEn:
      "In-home speech therapy focuses on language, expression, and understanding, and involves the family in everyday practice.",
    icon: "chatbubbles-outline",
    category: "علاج",
    categoryAr: "علاج",
    categoryEn: "Therapy",
    rating: 4.9,
    reviews: 71,
    providers: 14,
    color: "#6E7CAF",
    benefits: [
      "تحسين التواصل والتعبير",
      "تمارين مناسبة للبيت والروتين اليومي",
      "إرشاد الأسرة لدعم لغة الطفل",
    ],
    benefitsAr: [
      "تحسين التواصل والتعبير",
      "تمارين مناسبة للبيت والروتين اليومي",
      "إرشاد الأسرة لدعم لغة الطفل",
    ],
    benefitsEn: [
      "Clearer communication and expression",
      "Exercises that fit home routines",
      "Guidance for families to support language",
    ],
    duration: "45–60 دقيقة",
    durationAr: "45–60 دقيقة",
    durationEn: "45–60 min",
    frequency: "1–3 مرات أسبوعياً",
    frequencyAr: "1–3 مرات أسبوعياً",
    frequencyEn: "1–3× per week",
    ageRange: "2–18 سنة",
    ageRangeAr: "2–18 سنة",
    ageRangeEn: "Ages 2–18",
    specialty: "speech",
  },
];

/** Fallback services when API is unreachable (e.g. mobile + localhost) */
const FALLBACK_SERVICES: Service[] = [
  { id: "fb-1", name: "Speech & Language Therapy", description: "Assessment and therapy for speech, language, and communication skills.", longDescription: "", icon: "chatbubbles", category: "Therapy", rating: 4.8, reviews: 124, providers: 18, color: "#6E7CAF", benefits: [], duration: "45-60 min", frequency: "1-3x per week", ageRange: "2-18 years" },
  { id: "fb-2", name: "Occupational Therapy", description: "Sensory integration and daily living skills support.", longDescription: "", icon: "hand-left", category: "Therapy", rating: 4.7, reviews: 98, providers: 15, color: "#8B91AF", benefits: [], duration: "45-60 min", frequency: "1-2x per week", ageRange: "1-18 years" },
  { id: "fb-3", name: "ABA Therapy", description: "Applied Behavior Analysis for autism and developmental needs.", longDescription: "", icon: "analytics", category: "Behavioral", rating: 4.6, reviews: 156, providers: 22, color: "#E8A838", benefits: [], duration: "60-120 min", frequency: "2-5x per week", ageRange: "2-12 years" },
  { id: "fb-4", name: "Psychological Assessment", description: "Comprehensive developmental and cognitive assessments.", longDescription: "", icon: "document-text", category: "Assessment", rating: 4.9, reviews: 87, providers: 8, color: "#9B59B6", benefits: [], duration: "2-4 hours", frequency: "One-time", ageRange: "2-18 years" },
  { id: "fb-5", name: "Physical Therapy", description: "Motor development and mobility support for children.", longDescription: "", icon: "fitness", category: "Therapy", rating: 4.7, reviews: 72, providers: 12, color: "#3498DB", benefits: [], duration: "45-60 min", frequency: "1-2x per week", ageRange: "0-18 years" },
  { id: "fb-6", name: "Parent Coaching", description: "Guidance and strategies for parents of children with special needs.", longDescription: "", icon: "people", category: "Support", rating: 4.8, reviews: 134, providers: 14, color: "#E74C3C", benefits: [], duration: "50 min", frequency: "Weekly or bi-weekly", ageRange: "All ages" },
  { id: "fb-7", name: "Early Intervention", description: "Support for infants and toddlers with developmental delays.", longDescription: "", icon: "heart", category: "Therapy", rating: 4.9, reviews: 95, providers: 16, color: "#E91E63", benefits: [], duration: "45-60 min", frequency: "1-3x per week", ageRange: "0-3 years" },
  { id: "fb-8", name: "School Readiness", description: "Preparation for mainstream or special education placement.", longDescription: "", icon: "school", category: "Education", rating: 4.6, reviews: 68, providers: 10, color: "#6E7CAF", benefits: [], duration: "60 min", frequency: "2-3x per week", ageRange: "3-6 years" },
];

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await instance.get("/services");
    const res = response as unknown as ServicesResponse;
    const data = res?.data;
    if (data && Array.isArray(data.services)) {
      return data.services;
    }
    if (Array.isArray(res)) return res;
    if (data && Array.isArray(data)) return data as Service[];
    return HOME_SERVICES;
  } catch {
    return HOME_SERVICES;
  }
};

export const getServiceById = async (serviceId: string): Promise<Service> => {
  const id = String(Array.isArray(serviceId) ? serviceId[0] : serviceId);
  const fallback = [...HOME_SERVICES, ...FALLBACK_SERVICES].find(
    (s) => s.id === id,
  );
  if (fallback) return fallback;
  try {
    const response = await instance.get(`/services/${id}`);
    const res = response as unknown as ServiceResponse;
    if (res?.data?.service) return res.data.service;
    throw new Error("Service not found");
  } catch (err) {
    throw err instanceof Error ? err : new Error("Service not found");
  }
};
