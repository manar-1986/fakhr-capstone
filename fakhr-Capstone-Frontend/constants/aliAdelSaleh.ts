import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied details; no independent credential verification asserted.
export const ALI_ADEL_SALEH: ApprovedDoctor = {
 id: "doctor-ali-adel-saleh", nameAr: "د. علي عادل صالح", nameEn: "Dr. Ali Adel Saleh", englishVerified: false,
 group: "pediatric-orthopedics", specialtyIds: ["orthopedic-surgery"], sources: [],
 suppliedSpecialty: { ar: "جراحة عظام الأطفال", en: "Pediatric Orthopedics", provenance: "user-provided", independentlyVerified: false },
 suppliedBiography: { ar: "استشاري جراحة العظام وجراحة عظام الأطفال", en: "Consultant Orthopedic Surgeon and Pediatric Orthopedic Surgeon", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: {
 ar: ["كسور العظام لدى الأطفال والكبار", "الخلع الولادي", "القدم المسطحة والقدم المخلبية لدى الأطفال", "تقوس الساقين والتفاف الأقدام لدى الأطفال", "اضطرابات الحركة وتيبس العضلات لدى حالات الشلل الدماغي"],
 en: ["Bone fractures in children and adults", "Developmental dysplasia of the hip (DDH)", "Flat feet and clubfoot in children", "Bowed legs and rotational foot deformities in children", "Movement disorders and muscle stiffness associated with cerebral palsy"],
 provenance: "user-provided", independentlyVerified: false },
 // Contact holder is the doctor; no clinic name or address was supplied.
 clinic: { nameAr: "د. علي عادل صالح", nameEn: "Dr. Ali Adel Saleh", whatsapp: { phone: "+9651830003", url: "https://wa.me/9651830003" }, mapUrl: "https://maps.app.goo.gl/4xEnUoCt7wJmevRR9" },
};
