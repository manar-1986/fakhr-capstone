import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied details; no independent credential verification asserted.
export const RAWAN_AL_KHUWAITEM: ApprovedDoctor = {
 id: "doctor-rawan-al-khuwaitem", nameAr: "د. روان الخويتيم", nameEn: "Dr. Rawan Al-Khuwaitem", englishVerified: false,
 group: "dentistry", specialtyIds: ["pediatric-dentistry", "special-needs-dentistry"], sources: [],
 suppliedSpecialty: { ar: "اختصاصي أول طب أسنان الأطفال وذوي الاحتياجات الخاصة", en: "Senior Specialist in Pediatric and Special Needs Dentistry", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: { ar: ["طب أسنان الأطفال", "طب أسنان ذوي الاحتياجات الخاصة"], en: ["Pediatric Dentistry", "Special Needs Dentistry"], provenance: "user-provided", independentlyVerified: false },
 branches: [
 { id: "avenues", nameAr: "الأفنيوز", nameEn: "The Avenues", whatsapp: { phone: "+96551528694", url: "https://wa.me/96551528694" }, mapUrl: "https://maps.app.goo.gl/e5ozm9Vh8ToZamdj9" },
 { id: "jahra", nameAr: "الجهراء", nameEn: "Jahra", whatsapp: { phone: "+96522200073", url: "https://wa.me/96522200073" }, mapUrl: "https://maps.app.goo.gl/Tep8eFDLUyc9NV3M9" },
 ],
};
