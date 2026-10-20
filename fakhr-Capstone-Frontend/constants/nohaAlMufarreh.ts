import type { ApprovedDoctor } from "./approvedDoctors";
// Spelling retained from KCLD's existing staff list; details supplied by the user.
export const NOHA_AL_MUFARREH: ApprovedDoctor = {
 id: "specialist-noha-al-mufarreh", nameAr: "د. نهى المفرح", nameEn: "Dr. Noha Al-Mufarreh", englishVerified: false,
 group: "learning-difficulties", sources: [],
 suppliedSpecialty: { ar: "صعوبات القراءة والكتابة", en: "Reading and Writing Learning Difficulties", provenance: "user-provided", independentlyVerified: false },
 suppliedSpecializations: { ar: ["صعوبات القراءة والكتابة"], en: ["Reading and Writing Learning Difficulties"], provenance: "user-provided", independentlyVerified: false },
 // Associated center's contacts, not personal contact information.
 clinic: { nameAr: "المركز الكويتي لصعوبات التعلم", nameEn: "Kuwait Center for Learning Difficulties (KCLD)", phone: "+96522233696", additionalPhone: "+96555975385", whatsapp: { phone: "+96555269262", url: "https://wa.me/96555269262" }, instagram: "https://www.instagram.com/kcld_support/", website: "https://kcld-kw.com/arabic/index.html", mapUrl: "https://maps.app.goo.gl/93FnN5o6wHvRq9Xa7" },
};
