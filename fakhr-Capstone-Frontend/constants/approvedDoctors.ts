/** Stage-one allowlist. No array-position/name joins to API records are permitted.
 * Arabic names are supplied by the user; English spellings are sourced or explicitly provisional.
 * Specialty verification does not establish current workplace, licensing or availability.
 */
export type DoctorGroup = "developmental" | "neurology" | "dentistry" | "review";
export type ApprovedDoctor = {
  id: string; nameAr: string; nameEn: string; englishVerified: boolean;
  group: DoctorGroup; sources: { title: string; url: string }[];
  noteAr?: string; noteEn?: string;
};
export const DOCTOR_GROUPS: { key: DoctorGroup; ar: string; en: string }[] = [
  { key: "developmental", ar: "طب الأطفال التطوري", en: "Developmental pediatrics" },
  { key: "neurology", ar: "أعصاب الأطفال", en: "Pediatric neurology" },
  { key: "dentistry", ar: "طب أسنان ذوي الاحتياجات الخاصة", en: "Special needs dentistry" },
  { key: "review", ar: "التخصص قيد التحقق", en: "Specialty awaiting verification" },
];
export const APPROVED_DOCTORS: ApprovedDoctor[] = [
  { id: "doctor-hadeel-yassin-faras", nameAr: "د. هديل ياسين الفرس", nameEn: "Dr. Hadeel Yassin Faras", englishVerified: true, group: "developmental",
    sources: [{ title: "Qatar National Library", url: "https://www.qnl.qa/en/about/news/qatar-national-library-explores-strategies-support-language-development-among-children" }] },
  { id: "doctor-fatima-al-awadhi", nameAr: "د. فاطمة العوضي", nameEn: "Dr. Fatima Al-Awadhi", englishVerified: false, group: "review",
    sources: [{ title: "Al-Anba — 2011 interview (historical)", url: "https://www.alanba.com.kw/246888/" }],
    noteAr: "توجد مقابلة قديمة عن طب الأطفال التطوري وأسماء مشابهة بتخصصات أخرى؛ يلزم تأكيد الهوية والتخصص من مصدر مهني حديث.",
    noteEn: "A historical developmental-pediatrics interview and namesakes in other specialties were found. Identity and specialty need a current professional source." },
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
  { id: "doctor-mohammed-almuhtab", nameAr: "د. محمد المحطب", nameEn: "Dr. Mohammed Almuhtab", englishVerified: true, group: "dentistry",
    sources: [{ title: "SN Clinic — Arabic profile", url: "https://snclinics.com/محمد-المحطب/?lang=ar" }, { title: "SN Clinic — English profile", url: "https://snclinics.com/dr-mohammed-almuhtab/" }] },
  { id: "doctor-ahmed-al-tamimi", nameAr: "د. أحمد التميمي", nameEn: "Dr. Ahmed Al tamimi", englishVerified: true, group: "dentistry",
    sources: [{ title: "Al Seef Hospital — doctor profile", url: "https://www.alseef-hospital.com/dr-ahmed-al-tamimi/" }] },
  { id: "doctor-dalal-alsubaie", nameAr: "د. دلال السبيعي", nameEn: "Dr. Dalal Alsubaie", englishVerified: false, group: "dentistry",
    sources: [{ title: "Al Salam Hospitals — doctor profile", url: "https://www.alsalamhosp.com/find-doctor/dr-dalal-alsubaie" }] },
];
export const DOCTOR_REVIEW_DATE = "2026-10-08";
export const findApprovedDoctor = (id?: string) => APPROVED_DOCTORS.find(doctor => doctor.id === id);
export const doctorGroupLabel = (doctor: ApprovedDoctor, rtl: boolean) => DOCTOR_GROUPS.find(g => g.key === doctor.group)![rtl ? "ar" : "en"];
export const doctorReviewLabel = (rtl: boolean) => rtl ? "تفاصيل غير مكتملة · تحتاج مراجعة" : "Incomplete details · review needed";
export const englishNameReviewLabel = (rtl: boolean) => rtl ? "الاسم الإنجليزي كتابة صوتية مبدئية تحتاج تأكيداً." : "English name is a provisional transliteration; spelling needs confirmation.";
export const doctorMissingDetails = (rtl: boolean) => rtl ? "المؤهلات ومكان العمل وبيانات الاتصال والصورة ومواعيد الحجز لم تُعتمد في فخر بعد." : "Qualifications, workplace, contact details, photo and booking availability have not yet been approved in Fakhr.";
