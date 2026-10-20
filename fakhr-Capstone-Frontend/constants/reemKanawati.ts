import type { ApprovedDoctor } from "./approvedDoctors";

// Clinic affiliation supplied by the user. No nationality, licensing or further credentials inferred.
export const REEM_KANAWATI: ApprovedDoctor = {
  id: "doctor-reem-kanawati", nameAr: "د. ريم قنواتي", nameEn: "Dr. Reem Kanawati",
  group: "pediatrics", englishVerified: true,
  suppliedSpecialty: { ar: "استشارية طب الأطفال", en: "Consultant Pediatrician", provenance: "user-provided", independentlyVerified: false },
  suppliedBiography: { ar: "د. ريم قنواتي، استشارية طب الأطفال.", en: "Dr. Reem Kanawati is a Consultant Pediatrician.", provenance: "user-provided", independentlyVerified: false },
  clinic: { nameAr: "Medica Physio", nameEn: "Medica Physio", mapUrl: "", instagram: "https://www.instagram.com/medicaphysiokw/" },
  sources: [
    {title:"Kana Group — named leadership portrait",url:"https://hunt.kayanhr.com/CareerSite/Index/aXVCTUhjanFoR2MwSlQs"},
    {title:"RGF Worldwide — Consultant Pediatrician biography",url:"https://rgfworldwide.com/beauty-station/"},
  ],
  noteEn: "Research 2026-10-10: Instagram unavailable. Medica Physio phone, WhatsApp, address, Maps, website, logo, clinic photos, qualifications and services not verified. Related Medica Care details not transferred.",
};
