import instance from "./axios";

export interface Service {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  category: string;
  rating: number;
  reviews: number;
  providers: number;
  color: string;
  benefits: string[];
  duration: string;
  frequency: string;
  ageRange: string;
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
  { id: "hs-1", name: "معلمة منزلية خاصة", description: "معلمة منزلية خاصة", longDescription: "", icon: "school", category: "تعليم", rating: 4.8, reviews: 40, providers: 6, color: "#6E7CAF", benefits: [], duration: "60 min", frequency: "Weekly", ageRange: "All ages", price: 10 },
  { id: "hs-2", name: "ممرضة منزلية", description: "ممرضة منزلية", longDescription: "", icon: "medkit", category: "رعاية", rating: 4.8, reviews: 36, providers: 8, color: "#6E7CAF", benefits: [], duration: "60 min", frequency: "As needed", ageRange: "All ages", price: 12 },
  { id: "hs-3", name: "أخصائية علاج طبيعي", description: "أخصائية علاج طبيعي", longDescription: "", icon: "fitness", category: "رعاية", rating: 4.9, reviews: 28, providers: 5, color: "#6E7CAF", benefits: [], duration: "45-60 min", frequency: "1-2x per week", ageRange: "All ages", price: 15 },
  { id: "hs-4", name: "مساعدة منزلية مدربة", description: "مساعدة منزلية مدربة", longDescription: "", icon: "home", category: "التنظيف", rating: 4.6, reviews: 22, providers: 10, color: "#6E7CAF", benefits: [], duration: "4-8 hours", frequency: "Weekly", ageRange: "All ages", price: 8 },
  { id: "hs-5", name: "عاملة تنظيف منزلية", description: "خدمات تنظيف منزلية", longDescription: "", icon: "sparkles", category: "التنظيف", rating: 4.5, reviews: 18, providers: 9, color: "#6E7CAF", benefits: [], duration: "3-6 hours", frequency: "Weekly", ageRange: "All ages", price: 9 },
  { id: "hs-6", name: "خدمات زراعية منزلية", description: "خدمات زراعية منزلية", longDescription: "", icon: "leaf", category: "زراعية", rating: 4.4, reviews: 12, providers: 4, color: "#6E7CAF", benefits: [], duration: "2-4 hours", frequency: "Weekly", ageRange: "All ages", price: 11 },
  { id: "hs-7", name: "مساعدة زراعية منزلية", description: "مساعدة زراعية منزلية", longDescription: "", icon: "leaf", category: "زراعية", rating: 4.3, reviews: 9, providers: 3, color: "#6E7CAF", benefits: [], duration: "2-4 hours", frequency: "Weekly", ageRange: "All ages", price: 13 },
];

/** Fallback services when API is unreachable (e.g. mobile + localhost) */
const FALLBACK_SERVICES: Service[] = [
  { id: "fb-1", name: "Speech & Language Therapy", description: "Assessment and therapy for speech, language, and communication skills.", longDescription: "", icon: "chatbubbles", category: "Therapy", rating: 4.8, reviews: 124, providers: 18, color: "#7FB77E", benefits: [], duration: "45-60 min", frequency: "1-3x per week", ageRange: "2-18 years" },
  { id: "fb-2", name: "Occupational Therapy", description: "Sensory integration and daily living skills support.", longDescription: "", icon: "hand-left", category: "Therapy", rating: 4.7, reviews: 98, providers: 15, color: "#5F8F8B", benefits: [], duration: "45-60 min", frequency: "1-2x per week", ageRange: "1-18 years" },
  { id: "fb-3", name: "ABA Therapy", description: "Applied Behavior Analysis for autism and developmental needs.", longDescription: "", icon: "analytics", category: "Behavioral", rating: 4.6, reviews: 156, providers: 22, color: "#E8A838", benefits: [], duration: "60-120 min", frequency: "2-5x per week", ageRange: "2-12 years" },
  { id: "fb-4", name: "Psychological Assessment", description: "Comprehensive developmental and cognitive assessments.", longDescription: "", icon: "document-text", category: "Assessment", rating: 4.9, reviews: 87, providers: 8, color: "#9B59B6", benefits: [], duration: "2-4 hours", frequency: "One-time", ageRange: "2-18 years" },
  { id: "fb-5", name: "Physical Therapy", description: "Motor development and mobility support for children.", longDescription: "", icon: "fitness", category: "Therapy", rating: 4.7, reviews: 72, providers: 12, color: "#3498DB", benefits: [], duration: "45-60 min", frequency: "1-2x per week", ageRange: "0-18 years" },
  { id: "fb-6", name: "Parent Coaching", description: "Guidance and strategies for parents of children with special needs.", longDescription: "", icon: "people", category: "Support", rating: 4.8, reviews: 134, providers: 14, color: "#E74C3C", benefits: [], duration: "50 min", frequency: "Weekly or bi-weekly", ageRange: "All ages" },
  { id: "fb-7", name: "Early Intervention", description: "Support for infants and toddlers with developmental delays.", longDescription: "", icon: "heart", category: "Therapy", rating: 4.9, reviews: 95, providers: 16, color: "#E91E63", benefits: [], duration: "45-60 min", frequency: "1-3x per week", ageRange: "0-3 years" },
  { id: "fb-8", name: "School Readiness", description: "Preparation for mainstream or special education placement.", longDescription: "", icon: "school", category: "Education", rating: 4.6, reviews: 68, providers: 10, color: "#16A085", benefits: [], duration: "60 min", frequency: "2-3x per week", ageRange: "3-6 years" },
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
  const fallback = [...HOME_SERVICES, ...FALLBACK_SERVICES].find(
    (s) => s.id === serviceId,
  );
  if (fallback) return fallback;
  try {
    const response = await instance.get(`/services/${serviceId}`);
    const res = response as unknown as ServiceResponse;
    if (res?.data?.service) return res.data.service;
    throw new Error("Service not found");
  } catch (err) {
    throw err instanceof Error ? err : new Error("Service not found");
  }
};
