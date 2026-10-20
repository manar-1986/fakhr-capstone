import type { ApprovedDoctor } from "./approvedDoctors";
// User-supplied profile information; no independent credential verification asserted.
export const NESMA_AL_ARIDI: ApprovedDoctor = {
  id: "specialist-nesma-al-aridi", nameAr: "أ. نسمة العريضي", nameEn: "Nesma Al-Aridi", englishVerified: false,
  group: "clinical-nutrition", sources: [],
  suppliedSpecialty: { ar: "أخصائية تغذية علاجية للأطفال", en: "Pediatric Clinical Nutrition Specialist", provenance: "user-provided", independentlyVerified: false },
  suppliedBiography: { ar: "أخصائية تغذية علاجية للأطفال", en: "Pediatric Clinical Nutrition Specialist", provenance: "user-provided", independentlyVerified: false },
  suppliedQualifications: { ar: ["ماجستير في التغذية العلاجية"], en: ["Master's Degree in Clinical Nutrition"], abbreviations: "", provenance: "user-provided", independentlyVerified: false },
  suppliedSpecializations: {
    ar: ["التغذية العلاجية للأطفال.", "التغذية للأطفال المصابين باضطراب طيف التوحد.", "التغذية للأطفال المصابين بفرط الحركة وتشتت الانتباه.", "التغذية للأطفال الذين يعانون من مشاكل الجهاز الهضمي."],
    en: ["Pediatric clinical nutrition.", "Nutritional support for children with Autism Spectrum Disorder (ASD).", "Nutritional support for children with ADHD.", "Nutritional support for children with gastrointestinal conditions."],
    provenance: "user-provided", independentlyVerified: false,
  },
  // Empty location keeps the existing contact schema without inventing a destination.
  clinic: { mapUrl: "", nameAr: "عيادة كلينيك", nameEn: "Klinik", website: "https://www.klinik.com.kw/en/", whatsapp: { url: "https://wa.me/96522020404" }, instagram: "https://www.instagram.com/klinik.kw/" },
};
