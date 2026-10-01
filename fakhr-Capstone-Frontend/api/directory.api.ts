import { HealthCenter, Professional } from "../types/directory.types";
import { normalizeProfessional } from "../utils/professionalBilingual";
import instance from "./axios";
import { BILINGUAL_DOCTORS } from "../constants/professionalBilingual";
import { FEATURED_LISTINGS } from "../components/directory/directoryMockData";


export interface CenterFilters {
  type?: "public" | "private";
  city?: string;
  specialties?: string[];
}

/** React Query key — use for home + directory so the same cached list is shared when filters match. */
export const centersListQueryKey = (filters: CenterFilters = {}) =>
  [
    "centers",
    "list",
    filters.type ?? "all",
    filters.city ?? "",
    [...(filters.specialties ?? [])].sort().join("\0"),
  ] as const;

function isAxiosLikeResponse(v: unknown): v is { data: unknown; status: number } {
  return (
    !!v &&
    typeof v === "object" &&
    "data" in v &&
    "status" in v &&
    typeof (v as { status: unknown }).status === "number"
  );
}

/** Normalize GET /directory/centers body (interceptor usually returns `{ success, data }` but tolerate other shapes). */
function normalizeCentersResponse(raw: unknown): HealthCenter[] {
  let payload: unknown = raw;

  if (isAxiosLikeResponse(payload)) {
    payload = payload.data;
  }

  if (Array.isArray(payload)) {
    return payload as HealthCenter[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) {
      return inner as HealthCenter[];
    }
    if (
      inner &&
      typeof inner === "object" &&
      "centers" in inner &&
      Array.isArray((inner as { centers: unknown }).centers)
    ) {
      return (inner as { centers: HealthCenter[] }).centers;
    }
  }

  if (
    payload &&
    typeof payload === "object" &&
    "centers" in payload &&
    Array.isArray((payload as { centers: unknown }).centers)
  ) {
    return (payload as { centers: HealthCenter[] }).centers;
  }

  return [];
}

/**
 * Get health centers
 * GET /api/directory/centers
 */
export const getCenters = async (filters?: CenterFilters): Promise<HealthCenter[]> => {
  const params: Record<string, string> = {};

  if (filters?.type) params.type = filters.type;
  if (filters?.city) params.city = filters.city;
  if (filters?.specialties?.length) {
    // Backend accepts comma-separated specialties (or specialty) for $in filter
    params.specialties = filters.specialties.join(",");
  }

  const raw = await instance.get<unknown>("/directory/centers", { params });
  return normalizeCentersResponse(raw);
};

/**
 * Get list of available cities
 * GET /api/directory/centers/cities
 * Note: This endpoint needs to be implemented in the backend
 */
export const getCities = async (): Promise<string[]> => {
  try {
    const body = await instance.get<{ success: boolean; data: string[] }>("/directory/centers/cities");
    const payload = body as unknown as { success?: boolean; data?: string[] };
    if (Array.isArray(payload.data)) return payload.data;
  } catch {
    console.warn("Failed to fetch /directory/centers/cities; falling back to centers list");
  }
  try {
    const centers = await getCenters();
    return [...new Set(centers.map((center) => center.city).filter(Boolean))] as string[];
  } catch {
    return [];
  }
};

/**
 * Get list of center specialties
 * GET /api/directory/centers/specialties
 * Note: This endpoint needs to be implemented in the backend
 */
export const getSpecialties = async (): Promise<string[]> => {
  try {
    const body = await instance.get<{ success: boolean; data: string[] }>(
      "/directory/centers/specialties"
    );
    const payload = body as unknown as { success?: boolean; data?: string[] };
    if (Array.isArray(payload.data)) return payload.data.filter((s): s is string => typeof s === "string");
  } catch {
    console.warn("Failed to fetch /directory/centers/specialties; falling back to centers list");
  }
  try {
    const centers = await getCenters();
    const specialties = new Set<string>();
    centers.forEach((center) => {
      center.specialties?.forEach((spec) => specialties.add(spec));
    });
    return Array.from(specialties);
  } catch {
    return [];
  }
};


export interface ProfessionalFilters {
  specialty?: string;
  tags?: string[];
  city?: string;
  search?: string;
}


export const getProfessionals = async (filters?: ProfessionalFilters): Promise<Professional[]> => {
  const params: Record<string, string> = {};
  
  if (filters?.specialty) params.specialty = filters.specialty;
  if (filters?.tags?.length) params.tags = filters.tags.join(","); 
  if (filters?.city) params.city = filters.city;
  if (filters?.search) params.search = filters.search;
  
  const response = await instance.get<{ success: boolean; data: { professionals: Professional[]; count: number } }>("/directory/professionals", { params });
  // axios interceptor returns response.data directly, so response is already the full response object
  const data = (response as unknown as { success: boolean; data: { professionals: Professional[]; count: number } }).data;
  // Ensure we return an array
  if (Array.isArray(data.professionals)) {
    return data.professionals.map(normalizeProfessional);
  }
  return [];
};

/**
 * Get list of professional specialties
 * GET /api/directory/professionals/specialties/list
 */
export const getProfessionalSpecialties = async (): Promise<string[]> => {
  const response = await instance.get<{ success: boolean; data: string[] }>("/directory/professionals/specialties/list");
  // axios interceptor returns response.data directly, so response is already the full response object
  const data = (response as unknown as { success: boolean; data: string[] }).data;
  // Ensure we return an array
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

/**
 * Get list of professional tags (NOT IMPLEMENTED IN BACKEND)
 * GET /api/directory/professionals/tags/list
 */
export const getProfessionalTags = async (): Promise<string[]> => {
  // This endpoint is not implemented in the backend yet
  console.warn("Professional tags endpoint is not implemented in the backend");
  return [];
};

/**
 * Get center details by ID
 * GET /api/directory/centers/:centerId
 */
export const getCenterDetails = async (centerId: string): Promise<HealthCenter> => {
  const response = await instance.get<{ success: boolean; data: HealthCenter | { center: HealthCenter } }>(`/directory/centers/${centerId}`);
  const data = (response as unknown as { success: boolean; data: HealthCenter | { center: HealthCenter } }).data;
  if (data && typeof data === "object" && "center" in data) {
    return data.center;
  }
  return data as HealthCenter;
};



export const getProfessionalDetails = async (professionalId: string): Promise<Professional> => {
  const localDoctor = BILINGUAL_DOCTORS.find((doc) => doc.id === professionalId);
  if (localDoctor) return normalizeProfessional(localDoctor);
  const featured = FEATURED_LISTINGS.find((item) => item.kind === "doctor" && item.id === professionalId);
  if (featured) return normalizeProfessional({ ...featured, specialtyAr: featured.subtitleAr, specialtyEn: featured.subtitleEn, image: featured.imageUrl });
  const response = await instance.get<{ success: boolean; data: { professional: Professional } }>(`/directory/professionals/${professionalId}`);
  // axios interceptor returns response.data directly, so response is already the full response object
  const professional = (response as unknown as { success: boolean; data: { professional: Professional } }).data.professional;
  return normalizeProfessional(professional);
};
