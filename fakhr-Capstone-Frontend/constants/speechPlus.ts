import providers from "../data/institutions/verified-providers.json";
import type { Institution } from "../types/institution";
import type { ApprovedDoctor } from "./approvedDoctors";

// One retained source record, projected into Doctors; no new institution or database record.
export const SPEECH_PLUS_ID = "center-speech-plus";
export const SPEECH_PLUS_SOURCE = providers.find(item => item.id === SPEECH_PLUS_ID)! as Institution;
export const isSpeechPlus = (item: { id: string; canonicalId?: string }) => (item.canonicalId || item.id) === SPEECH_PLUS_ID;
const qualification = { ar: "دكتوراه في التربية الخاصة – تخصص التوحد", en: "PhD in Special Education – Autism Specialization", provenance: "user-provided" as const, independentlyVerified: false as const };
export const SPEECH_PLUS_DOCTOR: ApprovedDoctor = {
  id: SPEECH_PLUS_ID, nameAr: "د. دعاء الملك", nameEn: "Dr. Doaa Al-Malek", englishVerified: false,
  group: "education", sources: [], sourceInstitution: SPEECH_PLUS_SOURCE,
  suppliedSpecialty: qualification, suppliedBiography: qualification,
  clinic: { nameAr: SPEECH_PLUS_SOURCE.nameAr, nameEn: SPEECH_PLUS_SOURCE.nameEn || "Speech Plus",
    phone: SPEECH_PLUS_SOURCE.publicProfile?.phone, additionalPhone: SPEECH_PLUS_SOURCE.publicProfile?.additionalPhone,
    whatsapp: SPEECH_PLUS_SOURCE.publicProfile?.whatsapp, mapUrl: SPEECH_PLUS_SOURCE.publicProfile?.mapUrl || "",
    instagram: SPEECH_PLUS_SOURCE.publicProfile?.instagram },
};
