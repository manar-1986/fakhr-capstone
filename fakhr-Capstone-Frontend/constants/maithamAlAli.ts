import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied details; no independent credential verification asserted.
export const MAITHAM_AL_ALI: ApprovedDoctor = {
 id: "doctor-maitham-al-ali", nameAr: "د. ميثم العلي", nameEn: "Dr. Maitham Al-Ali", englishVerified: false,
 group: "ophthalmology", sources: [],
 suppliedSpecialty: { ar: "طب عيون الأطفال والحَوَل", en: "Pediatric Ophthalmology and Strabismus", provenance: "user-provided", independentlyVerified: false },
 suppliedBiography: { ar: "اختصاصي أول طب وجراحة العيون", en: "Senior Specialist Ophthalmologist", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: { ar: ["فحص وعلاج مشاكل العيون لدى الأطفال.", "فحص وعلاج مشاكل العيون لدى الأطفال ذوي الاحتياجات الخاصة.", "علاج طول النظر وقصر النظر لدى الأطفال."], en: ["Eye examinations and treatment for children.", "Eye examinations and treatment for children with special needs.", "Treatment of farsightedness and nearsightedness in children."], provenance: "user-provided", independentlyVerified: false },
 // Contact holder is the doctor; no clinic name or address was supplied.
 clinic: { nameAr: "د. ميثم العلي", nameEn: "Dr. Maitham Al-Ali", mapUrl: "https://maps.app.goo.gl/3UyMZJrF6b7XvqsM9" },
};
