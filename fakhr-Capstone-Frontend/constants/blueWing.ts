import type { ApprovedDoctor } from "./approvedDoctors";
import type { Institution } from "../types/institution";

// Local, user-provided directory information; no database write or verification claim.
export const BLUE_WING_CENTER_ID = "center-blue-wing";
export const BLUE_WING_DOCTOR: ApprovedDoctor = {
  id: "doctor-dalal-sulaiman-al-shayji",
  nameAr: "د. دلال سليمان الشايجي", nameEn: "Dr. Dalal Sulaiman Al-Shayji",
  englishVerified: false, group: "psychology", sources: [],
  suppliedSpecialty: { ar: "اختصاصية نفسية إكلينيكية متخصصة في اضطراب طيف التوحد", en: "Clinical Psychologist specializing in Autism Spectrum Disorder.", provenance: "user-provided", independentlyVerified: false },
  suppliedBiography: { ar: "اختصاصية نفسية إكلينيكية متخصصة في اضطراب طيف التوحد.", en: "Clinical Psychologist specializing in Autism Spectrum Disorder.", provenance: "user-provided", independentlyVerified: false },
  clinic: { nameAr: "مركز بلو وينج", nameEn: "Blue Wing Center", whatsapp: { phone: "69666041", url: "https://wa.me/96569666041" }, mapUrl: "https://maps.app.goo.gl/RA3VhkwEQ4Ma2gYy7" },
};
export const BLUE_WING_INSTITUTION: Institution = {
  id: BLUE_WING_CENTER_ID, nameAr: BLUE_WING_DOCTOR.clinic!.nameAr, nameEn: BLUE_WING_DOCTOR.clinic!.nameEn,
  categories: ["rehabilitation"], observations: [], reviewStatus: "unverified", reviewNotesAr: [], disabilityTags: [], stageTags: [],
};
