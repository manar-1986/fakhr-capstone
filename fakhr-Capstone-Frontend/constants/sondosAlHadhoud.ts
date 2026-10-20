import type { ApprovedDoctor } from "./approvedDoctors";
// Profile information supplied by the user; credentials are not independently verified.
export const SONDOS_AL_HADHOUD: ApprovedDoctor = {
  id: "doctor-sondos-al-hadhoud", nameAr: "د. سندس عبدالرحمن الهدهود", nameEn: "Dr. Sondos Abdulrahman Al-Hadhoud", englishVerified: false,
  group: "pediatric-cardiology", specialtyIds: ["pediatrics", "fetal-cardiology"], sources: [],
  suppliedSpecialty: { ar: "استشاري طب الأطفال وأمراض قلب الأطفال والجنين", en: "Consultant in Pediatrics, Pediatric and Fetal Cardiology", provenance: "user-provided", independentlyVerified: false },
  suppliedBiography: { ar: "استشاري طب الأطفال وأمراض قلب الأطفال والجنين", en: "Consultant in Pediatrics, Pediatric and Fetal Cardiology", provenance: "user-provided", independentlyVerified: false },
  suppliedSpecializations: {
    ar: ["أمراض وعيوب القلب الخلقية لدى الأطفال والمواليد.", "تشخيص العيوب الخلقية لدى الأجنة.", "علاج عدم انتظام ضربات القلب لدى الأطفال والأجنة.", "أمراض الأطفال العامة."],
    en: ["Congenital heart diseases and defects in children and newborns.", "Diagnosis of congenital defects in fetuses.", "Treatment of cardiac arrhythmias in children and fetuses.", "General pediatric conditions."],
    provenance: "user-provided", independentlyVerified: false,
  },
  suppliedDiagnosticServices: {
    ar: ["سونار القلب للمواليد والأطفال.", "سونار قلب الأجنة.", "تخطيط القلب.", "مراقبة تخطيط القلب لمدة 24 ساعة (هولتر).", "اختبار مجهود عضلة القلب."],
    en: ["Echocardiography for newborns and children.", "Fetal echocardiography.", "Electrocardiogram (ECG).", "24-hour Holter monitoring.", "Cardiac stress testing."],
    provenance: "user-provided", independentlyVerified: false,
  },
  clinic: { nameAr: "مستشفى هادي", nameEn: "Hadi Hospital", phone: "1828282",
    // Exact destination published by https://www.hadiclinic.com.kw/public/appointment (checked 2026-10-12).
    whatsapp: { phone: "1828282", url: "https://wa.me/%2B9651828282" },
    instagram: "https://www.instagram.com/hadiclinickw/", mapUrl: "https://maps.app.goo.gl/RgrEpwok2pGMzUHj7" },
};
