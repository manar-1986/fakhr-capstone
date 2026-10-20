import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied details; no independent credential verification asserted.
export const SALMAN_BIN_NAKHI: ApprovedDoctor = {
 id: "doctor-salman-bin-nakhi", nameAr: "د. سلمان بن نخي", nameEn: "Dr. Salman Bin Nakhi", englishVerified: false,
 group: "dentistry", specialtyIds: ["pediatric-dentistry", "special-needs-dentistry"], sources: [],
 suppliedSpecialty: { ar: "اختصاصي أسنان أطفال وذوي الاحتياجات الخاصة", en: "Pediatric and Special Needs Dental Specialist", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: { ar: ["طب أسنان الأطفال", "طب أسنان ذوي الاحتياجات الخاصة"], en: ["Pediatric Dentistry", "Special Needs Dentistry"], provenance: "user-provided", independentlyVerified: false },
 clinic: { nameAr: "عيادة رويال حياة للأسنان", nameEn: "Royale Hayat Dental Clinic", phone: "+96525360084", instagram: "https://www.instagram.com/royalehayatdentalclinic/", mapUrl: "https://maps.app.goo.gl/koaARYW5sBJ39KxP6" },
};
