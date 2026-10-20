import { NESMA_AL_ARIDI } from "./nesmaAlAridi";
import { SONDOS_AL_HADHOUD } from "./sondosAlHadhoud";
import { AMAL_ASHOUR } from "./amalAshour";
import { NOHA_AL_MUFARREH } from "./nohaAlMufarreh";
import { AHMED_NABIL_SAAD } from "./ahmedNabilSaad";
import { RAWAN_AL_KHUWAITEM } from "./rawanAlKhuwaitem";
import { ANOUD_AL_JASSER_AL_RAJHI } from "./anoudAlJasserAlRajhi";
import { ABDULAZIZ_AL_THUNAYAN } from "./abdulazizAlThunayan";
import { SALMAN_BIN_NAKHI } from "./salmanBinNakhi";
import { MAITHAM_AL_ALI } from "./maithamAlAli";
import { ALI_AKBAR } from "./aliAkbar";
import { ALI_ADEL_SALEH } from "./aliAdelSaleh";
import { NOUR_QAHFARANI } from "./nourQahfarani";
import { FAJER_AL_MUNAIE } from "./fajerAlMunaie";
import { ESSA_AL_MASHMOUM } from "./essaAlMashmoum";
import { REEM_KANAWATI } from "./reemKanawati";
import { BLUE_WING_DOCTOR } from "./blueWing";
import { SPEECH_PLUS_DOCTOR } from "./speechPlus";
import type { Institution } from "../types/institution";
/** Stage-one allowlist. No array-position/name joins to API records are permitted.
 * Arabic names are supplied by the user; English spellings are sourced or explicitly provisional.
 * Specialty verification does not establish current workplace, licensing or availability.
 */
export type DoctorGroup = "clinical-nutrition" | "pediatric-cardiology" | "fetal-cardiology" | "learning-difficulties" | "child-adolescent-mental-health" | "ophthalmology" | "pediatric-dentistry" | "special-needs-dentistry" | "pediatric-orthopedics" | "orthopedic-surgery" | "aba" | "developmental" | "neurology" | "dentistry" | "review" | "psychology" | "education" | "pediatrics";
export type ApprovedDoctor = {
  id: string; nameAr: string; nameEn: string; englishVerified: boolean;
  specialtyIds?: readonly DoctorGroup[];
  group: DoctorGroup; sources: { title: string; url: string }[];
  sourceInstitution?: Institution;
  noteAr?: string; noteEn?: string;
  suppliedQualifications?: { ar: string[]; en: string[]; abbreviations: string; provenance: "user-provided"; independentlyVerified: false };
  suppliedDiagnosticServices?: { ar: string[]; en: string[]; provenance: "user-provided"; independentlyVerified: false };
  suppliedSpecializations?: { ar: string[]; en: string[]; provenance: "user-provided"; independentlyVerified: false };
  suppliedAboutItems?: { ar: string[]; en: string[]; provenance: "user-provided"; independentlyVerified: false };
  suppliedBiography?: { ar: string; en: string; provenance: "user-provided"; independentlyVerified: false };
  suppliedSpecialty?: { ar: string; en: string; provenance: "user-provided"; independentlyVerified: false };
  branches?: { id: string; nameAr: string; nameEn: string; mapUrl: string; whatsapp: { phone: string; url: string } }[];
  clinic?: { nameAr: string; nameEn: string; phone?: string; additionalPhone?: string; address?: string; addressEn?: string; mapUrl: string; website?: string; instagram?: string; whatsapp?: { phone?: string; url: string } };
};
export const DOCTOR_GROUPS: { key: DoctorGroup; ar: string; en: string }[] = [
  { key: "clinical-nutrition", ar: "التغذية العلاجية", en: "Clinical Nutrition" },
  { key: "pediatric-cardiology", ar: "طب قلب الأطفال", en: "Pediatric Cardiology" },
  { key: "fetal-cardiology", ar: "أمراض قلب الجنين", en: "Fetal Cardiology" },
  { key: "learning-difficulties", ar: "صعوبات التعلم", en: "Learning Difficulties" },
  { key: "child-adolescent-mental-health", ar: "الصحة النفسية للأطفال والمراهقين", en: "Child and Adolescent Mental Health" },
  { key: "ophthalmology", ar: "طب العيون", en: "Ophthalmology" },
  { key: "pediatric-dentistry", ar: "طب أسنان الأطفال", en: "Pediatric Dentistry" },
  { key: "special-needs-dentistry", ar: "طب أسنان ذوي الاحتياجات الخاصة", en: "Special Needs Dentistry" },
  { key: "pediatric-orthopedics", ar: "جراحة عظام الأطفال", en: "Pediatric Orthopedics" },
  { key: "orthopedic-surgery", ar: "جراحة العظام", en: "Orthopedic Surgery" },
  { key: "aba", ar: "تحليل السلوك التطبيقي (ABA)", en: "Applied Behavior Analysis (ABA)" },
  { key: "pediatrics", ar: "طب الأطفال", en: "Pediatrics" },
  { key: "education", ar: "التربية الخاصة", en: "Special Education" },
  { key: "developmental", ar: "طب الأطفال التطوري", en: "Developmental pediatrics" },
  { key: "neurology", ar: "أعصاب الأطفال", en: "Pediatric neurology" },
  { key: "dentistry", ar: "طب الأسنان", en: "Dentistry" },
  { key: "psychology", ar: "علم النفس الإكلينيكي", en: "Clinical Psychology" },
  { key: "review", ar: "التخصص قيد التحقق", en: "Specialty awaiting verification" },
];
export const APPROVED_DOCTORS: ApprovedDoctor[] = [
  { id: "doctor-hadeel-yassin-faras", nameAr: "د. هديل فرس", nameEn: "Dr. Hadeel Faras", englishVerified: true, group: "developmental",
    clinic: { nameAr: "عيادة د. هديل فرس", nameEn: "Dr. Hadeel Faras Clinic", phone: "22286547", whatsapp: { phone: "99670739", url: "https://wa.me/96599670739" }, instagram: "https://www.instagram.com/dr.hadeel.faras.clinic/", mapUrl: "https://maps.app.goo.gl/g4asgvEuRzJxeoE86" },
    sources: [{ title: "Qatar National Library", url: "https://www.qnl.qa/en/about/news/qatar-national-library-explores-strategies-support-language-development-among-children" }] },
  { id: "doctor-fatima-al-awadhi", nameAr: "د. فاطمة العوضي", nameEn: "Dr. Fatma Al-Awadhi", englishVerified: false, group: "review",
    suppliedSpecialty: { ar: "دكتورة الأطفال التطوري", en: "Developmental Pediatrician", provenance: "user-provided", independentlyVerified: false },
    clinic: { nameAr: "عيادة د. فاطمة العوضي", nameEn: "Dr. Fatma Al-Awadhi Clinic", phone: "60009762", address: "Forth Ring Road, Abdullah Al-Fadhallah St., Salmiya, Kuwait, Hamoud Zaid Al Khaled St, Salmiya", mapUrl: "https://maps.app.goo.gl/69fMMjTqrm31MYZn6", instagram: "https://www.instagram.com/fatmaclinic/" },
    sources: [{ title: "Al-Anba — 2011 interview (historical)", url: "https://www.alanba.com.kw/246888/" }],
    noteAr: "توجد مقابلة قديمة عن طب الأطفال التطوري وأسماء مشابهة بتخصصات أخرى؛ يلزم تأكيد الهوية والتخصص من مصدر مهني حديث.",
    noteEn: "A historical developmental-pediatrics interview and namesakes in other specialties were found. Identity and specialty need a current professional source." },
  BLUE_WING_DOCTOR,
  { id: "doctor-mona-al-qabandi", nameAr: "د. منى القبندي", nameEn: "Dr. Mona Al-Qabandi", englishVerified: true, group: "review",
    sources: [{ title: "PubMed — Pediatrics, 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21669896/" }],
    noteAr: "بحث منشور عام 2011 يذكر ارتباطاً بطب الأطفال التطوري؛ التخصص والممارسة الحالية يحتاجان تأكيداً حديثاً.",
    noteEn: "A 2011 publication lists a developmental-pediatrics affiliation. Current specialty and practice require updated confirmation." },
  { id: "doctor-nahed-al-ateeqi", nameAr: "د. ناهد العتيقي", nameEn: "Dr. Nahed Alateeqi", englishVerified: true, group: "developmental",
    sources: [{ title: "Quote Hub — speaker biography", url: "https://quotehubkw.com/team-members/dr-nahed-alateeqi/" } ] },
  { id: "doctor-ayed-al-hajri", nameAr: "د. عايض الهاجري", nameEn: "Dr. Ayed Al-Hajri", englishVerified: false, group: "developmental",
    sources: [{ title: "Association of Kuwaiti Doctors in Canada — 2024", url: "https://akdc.ca/events/akdc-paediatrics-royal-college-exams-prep-talk-2024/" }],
    noteAr: "مصدر الجمعية لعام 2024 يذكر التدريب في طب الأطفال التطوري؛ لا نعرض رتبة استشاري أو مكان عمل حالي دون تأكيد.",
    noteEn: "The association's 2024 source describes developmental-pediatrics training. Current rank and workplace have not been confirmed." },
  { id: "doctor-bosanka-jocic-jakubi", nameAr: "د. بوسانكا يوسيتش ياكوبي", nameEn: "Dr. Bosanka Jocic Jakubi", englishVerified: true, group: "neurology",
    sources: [{ title: "Dar Al Shifa — doctor profile", url: "https://www.daralshifa.com/en/Doctors/Details/bosanka-jocic-jakubi-5952" }] },
  { id: "doctor-abeer-awad", nameAr: "د. عبير عوض", nameEn: "Dr. Abeer Awad", englishVerified: false, group: "review", sources: [],
    noteAr: "لم يتوفر مصدر مهني موثوق يثبت التخصص والهوية المقصودة في الكويت. لا نربطها بأطباء يحملون اسماً مشابهاً.",
    noteEn: "The intended Kuwait doctor's identity and specialty need a reliable professional source. Namesakes have not been linked." },
  { id: "doctor-mohammed-almuhtab", nameAr: "د. محمد المحطب", nameEn: "Dr. Mohammed Al-Muhtab", englishVerified: true, group: "dentistry",
    suppliedSpecialty: { ar: "طب أسنان الأطفال وذوي الاحتياجات الخاصة", en: "Pediatric Dentistry & Special Needs", provenance: "user-provided", independentlyVerified: false },
    suppliedBiography: { ar: "طبيب أسنان متخصص في طب أسنان الأطفال وذوي الاحتياجات الخاصة.", en: "Dentist specializing in pediatric dentistry and dental care for children with special needs.", provenance: "user-provided", independentlyVerified: false },
    clinic: { nameAr: "عيادة سن التخصصية", nameEn: "SN Dental Clinic", phone: "1808111", additionalPhone: "55885566", instagram: "https://www.instagram.com/dr_almuhtab/", mapUrl: "https://maps.app.goo.gl/2DvBC13b9ThH2VcXA" },
    sources: [{ title: "SN Clinic — Arabic profile", url: "https://snclinics.com/محمد-المحطب/?lang=ar" }, { title: "SN Clinic — English profile", url: "https://snclinics.com/dr-mohammed-almuhtab/" }] },
  { id: "doctor-ahmed-al-tamimi", nameAr: "د. أحمد التميمي", nameEn: "Dr. Ahmed Al-Tamimi", englishVerified: true, group: "dentistry",
    suppliedSpecialty: { ar: "اختصاصي أسنان أطفال وذوي الاحتياجات الخاصة", en: "Pediatric and Special Needs Dentist", provenance: "user-provided", independentlyVerified: false },
    suppliedBiography: { ar: "اختصاصي طب أسنان الأطفال وذوي الاحتياجات الخاصة.", en: "Specialist in Pediatric and Special Needs Dentistry.", provenance: "user-provided", independentlyVerified: false },
    suppliedQualifications: {
      ar: ["دكتوراه في طب أسنان الأطفال وذوي الاحتياجات الخاصة – جامعة ليدز.", "زميل كلية الجراحين الملكية الإيرلندية لطب أسنان الأطفال."],
      en: ["Doctorate in Pediatric and Special Needs Dentistry – University of Leeds.", "Fellow of the Royal College of Surgeons in Ireland in Paediatric Dentistry."],
      abbreviations: "B.Med.Sci (Dent), BDM, MFDS RCS (Ed), DPaedDent, FFD RCSI (Paed Dent)", provenance: "user-provided", independentlyVerified: false },
    clinic: { nameAr: "مستشفى السيف", nameEn: "Al Seef Hospital", phone: "1881122", mapUrl: "https://maps.app.goo.gl/ndCUFr3rjJNvvBTKA", instagram: "https://www.instagram.com/drahmedaltimimi/" },
    sources: [{ title: "Al Seef Hospital — doctor profile", url: "https://www.alseef-hospital.com/dr-ahmed-al-tamimi/" }] },
  { id: "doctor-dalal-alsubaie", nameAr: "د. دلال السبيعي", nameEn: "Dr. Dalal Al-Subaie", englishVerified: false, group: "dentistry",
    suppliedSpecialty: { ar: "استشارية ورئيسة طب الأسنان", en: "Consultant and Head of Dentistry", provenance: "user-provided", independentlyVerified: false },
    suppliedAboutItems: {
      ar: ["بكالوريوس طب وجراحة الفم والأسنان – جامعة الملك سعود – الرياض.", "ماجستير وزمالة الكلية الملكية للجراحين في آيرلندا.", "دكتوراه البورد الكويتي لطب الأسنان الشامل المتطور.", "خبرة 32 عاماً في وزارة الصحة، منها 20 عاماً في علاج الأطفال و12 عاماً في علاج مرضى الاحتياجات الخاصة.", "رئيسة قسم الاحتياجات الخاصة في مستشفى جابر سابقاً."],
      en: ["Bachelor of Oral and Dental Medicine and Surgery – King Saud University – Riyadh.", "Master’s degree and Fellowship of the Royal College of Surgeons in Ireland.", "Kuwaiti Board Doctorate in Advanced Comprehensive Dentistry.", "32 years of experience at the Ministry of Health, including 20 years treating children and 12 years treating patients with special needs.", "Former Head of the Special Needs Department at Jaber Hospital."],
      provenance: "user-provided", independentlyVerified: false },
    clinic: { nameAr: "مستشفى السلام الأحمدي", nameEn: "Al Salam Al Ahmadi Hospital", phone: "1830003", mapUrl: "https://maps.app.goo.gl/6F4yskuFGoYspmfs8" },
    sources: [{ title: "Al Salam Hospitals — doctor profile", url: "https://www.alsalamhosp.com/find-doctor/dr-dalal-alsubaie" }] },
];
APPROVED_DOCTORS.push(NESMA_AL_ARIDI, SONDOS_AL_HADHOUD, AMAL_ASHOUR, NOHA_AL_MUFARREH, AHMED_NABIL_SAAD, RAWAN_AL_KHUWAITEM, ANOUD_AL_JASSER_AL_RAJHI, ABDULAZIZ_AL_THUNAYAN, SALMAN_BIN_NAKHI, MAITHAM_AL_ALI, ALI_AKBAR, ALI_ADEL_SALEH, FAJER_AL_MUNAIE, NOUR_QAHFARANI, SPEECH_PLUS_DOCTOR, REEM_KANAWATI, ESSA_AL_MASHMOUM);
export const DOCTOR_REVIEW_DATE = "2026-10-08";
// Public presentation only: retain the original records and verification metadata.
export const HIDDEN_DOCTOR_IDS = new Set([
  "doctor-nahed-al-ateeqi", "doctor-ayed-al-hajri", "doctor-bosanka-jocic-jakubi",
  "doctor-mona-al-qabandi", "doctor-abeer-awad",
]);
export const PRIORITY_DOCTOR_IDS = ["doctor-hadeel-yassin-faras", "doctor-fatima-al-awadhi", BLUE_WING_DOCTOR.id];
export function publicDoctors<T extends { id: string }>(doctors: T[]): T[] {
  const seen = new Set<string>();
  const rank = (id: string) => {
    const index = PRIORITY_DOCTOR_IDS.indexOf(id);
    return index < 0 ? PRIORITY_DOCTOR_IDS.length : index;
  };
  return doctors.filter(doctor => {
    if (HIDDEN_DOCTOR_IDS.has(doctor.id) || seen.has(doctor.id)) return false;
    seen.add(doctor.id);
    return true;
  }).sort((a, b) => rank(a.id) - rank(b.id));
}
export const PUBLIC_DOCTORS = publicDoctors(APPROVED_DOCTORS);
export const findApprovedDoctor = (id?: string) => APPROVED_DOCTORS.find(doctor => doctor.id === id);
export const doctorGroupLabel = (doctor: ApprovedDoctor, rtl: boolean) => DOCTOR_GROUPS.find(g => g.key === doctor.group)![rtl ? "ar" : "en"];
export const doctorReviewLabel = (rtl: boolean) => rtl ? "تفاصيل غير مكتملة · تحتاج مراجعة" : "Incomplete details · review needed";
export const englishNameReviewLabel = (rtl: boolean) => rtl ? "الاسم الإنجليزي كتابة صوتية مبدئية تحتاج تأكيداً." : "English name is a provisional transliteration; spelling needs confirmation.";
export const doctorMissingDetails = (rtl: boolean) => rtl ? "المؤهلات ومكان العمل وبيانات الاتصال والصورة ومواعيد الحجز لم تُعتمد في فخر بعد." : "Qualifications, workplace, contact details, photo and booking availability have not yet been approved in Fakhr.";
