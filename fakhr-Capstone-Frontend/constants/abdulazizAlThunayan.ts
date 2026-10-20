import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied details; no independent credential verification asserted.
export const ABDULAZIZ_AL_THUNAYAN: ApprovedDoctor = {
 id: "doctor-abdulaziz-al-thunayan", nameAr: "د. عبدالعزيز الثنيان", nameEn: "Dr. Abdulaziz Al-Thunayan", englishVerified: false,
 group: "dentistry", specialtyIds: ["pediatric-dentistry", "special-needs-dentistry"], sources: [],
 suppliedSpecialty: { ar: "اختصاصي أسنان الأطفال وذوي الاحتياجات الخاصة", en: "Pediatric and Special Needs Dental Specialist", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: { ar: ["طب أسنان الأطفال", "طب أسنان ذوي الاحتياجات الخاصة"], en: ["Pediatric Dentistry", "Special Needs Dentistry"], provenance: "user-provided", independentlyVerified: false },
 clinic: { nameAr: "مركز آيكون لطب الأسنان", nameEn: "Icon Dental Center", phone: "+96522070888", whatsapp: { phone: "+96569693010", url: "https://wa.me/96569693010" }, instagram: "https://www.instagram.com/icondentalcenter.kw/", website: "https://iconkw.co/", mapUrl: "https://maps.app.goo.gl/WkgqUaS32eN7YoVi9" },
};
