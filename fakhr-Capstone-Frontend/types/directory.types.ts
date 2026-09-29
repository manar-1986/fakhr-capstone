export interface HealthCenter {
  id: string;
  name: string;
  type: "public" | "private";
  address: string;
  city: string;
  phone: string | number;
  email?: string;
  description?: string;
  specialties?: string[];
  operatingHours?: string;
  rating?: number;
  latitude?: number;          
  longitude?: number;
  /** If set, "Open in Maps" uses this URL (e.g. curated Google Maps search). */
  mapUrl?: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  /** Required bilingual fields — every current and future doctor must include both locales. */
  nameAr: string;
  nameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  specialtyLabelAr: string;
  specialtyLabelEn: string;
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
  centerAddressAr: string;
  centerAddressEn: string;
  /** Legacy single-locale mirrors. Screens must use *Ar/*En + doctorLocaleText, never English←Arabic fallback. */
  name: string;
  specialty: string;
  specialtyLabel: string;
  experience: string;
  rating: number;
  reviews: number;
  availability: string;
  verified: boolean;
  color: string;
  bio: string;
  education: string[];
  certifications: string[];
  languages: string[];
  services: string[];
  location: string;
  consultationFee: string;
  nextAvailable: string;
  email?: string;
  phone?: string;
  image?: string;
  centerId?: string;
  centerName?: string;
  centerAddress?: string;
  centerPhone?: string;
  centerEmail?: string;
  /** From populated center — open in Google Maps when user taps Center Location */
  centerMapUrl?: string;
  centerLatitude?: number;
  centerLongitude?: number;
  createdAt?: string;
  updatedAt?: string;
}
