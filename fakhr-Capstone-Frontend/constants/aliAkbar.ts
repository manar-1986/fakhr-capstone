import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied profile; no independent credential verification asserted.
export const ALI_AKBAR: ApprovedDoctor = {
 id: "doctor-ali-akbar", nameAr: "د. علي أكبر", nameEn: "Dr. Ali Akbar", englishVerified: false,
 group: "dentistry", specialtyIds: ["pediatric-dentistry", "special-needs-dentistry"], sources: [],
 suppliedSpecialty: { ar: "اختصاصي أسنان أطفال وذوي الاحتياجات الخاصة", en: "Pediatric and Special Needs Dental Specialist", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: { ar: ["طب أسنان الأطفال", "طب أسنان ذوي الاحتياجات الخاصة"], en: ["Pediatric Dentistry", "Special Needs Dentistry"], provenance: "user-provided", independentlyVerified: false },
 clinic: { nameAr: "عيادة بيان للأسنان", nameEn: "Bayan Dental", whatsapp: { url: "https://wa.link/w6qo4o" }, instagram: "https://www.instagram.com/bayandental/", mapUrl: "https://maps.app.goo.gl/ToHzMwuhZRprinyH7?g_st=ic" },
};
