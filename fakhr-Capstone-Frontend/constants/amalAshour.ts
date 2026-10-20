import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied details; no independent credential verification asserted.
export const AMAL_ASHOUR: ApprovedDoctor = {
  id: "specialist-amal-ashour", nameAr: "د. آمال عاشور", nameEn: "Dr. Amal Ashour", englishVerified: false,
  group: "child-adolescent-mental-health", sources: [],
  suppliedSpecialty: { ar: "الصحة النفسية للأطفال والمراهقين", en: "Child and Adolescent Mental Health", provenance: "user-provided", independentlyVerified: false },
  suppliedBiography: { ar: "استشارية نفسية متخصصة في الأطفال والمراهقين", en: "Psychological Consultant Specializing in Children and Adolescents", provenance: "user-provided", independentlyVerified: false },
  // Contact holder is the specialist; no clinic name, address, or call number was supplied.
  clinic: { nameAr: "د. آمال عاشور", nameEn: "Dr. Amal Ashour", whatsapp: { phone: "+96599494181", url: "https://wa.me/96599494181" }, instagram: "https://www.instagram.com/dr.amalashour/", mapUrl: "https://maps.app.goo.gl/Z2pP6RwSXvviPzaa6" },
};
