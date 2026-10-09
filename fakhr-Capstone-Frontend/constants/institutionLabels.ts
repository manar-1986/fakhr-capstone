/** Interface translations only. Institution names and quoted source details are not translated. */
export const institutionLabels = {
  centers: ["المراكز", "Centers"],
  title: ["دليل المؤسسات", "Institution directory"],
  school: ["المدارس", "Schools"], nursery: ["الحضانات", "Nurseries"],
  rehabilitation: ["مراكز التأهيل", "Rehabilitation Centers"],
  search: ["ابحث باسم المؤسسة", "Search institution name"],
  governorate: ["المحافظة", "Governorate"], area: ["المنطقة", "Area"],
  disability: ["نوع الإعاقة", "Disability type"], stage: ["المرحلة التعليمية", "Educational stage"],
  all: ["الكل", "All"], clear: ["مسح الفلاتر", "Clear filters"], close: ["إغلاق", "Close"],
  count: ["مؤسسة", "institutions"], noResults: ["لا توجد نتائج مطابقة. جرّب مسح الفلاتر.", "No matching institutions. Try clearing filters."],
  reference: ["بيانات مرجعية · تحتاج تحقق", "Reference data · unverified"],
  warning: ["المصادر مرجعية، ومنها قائمة بتاريخ 20 أبريل 2023. لا تؤكد استمرار العمل أو قبول طلبة جدد. تواصل مع المؤسسة للتأكد من التفاصيل.", "Reference sources include a list dated 20 April 2023. They do not confirm current operation or admissions. Contact the institution to confirm details."],
  arabicSource: ["تُحفظ الأسماء والتفاصيل كما وردت بالعربية.", "Names and source details remain in Arabic where no verified English version is available."],
  review: ["مراجعة المعلومات", "Information review"],
  differs: ["توجد فروق بين المصادر؛ اعرض التفاصيل أدناه قبل الاعتماد عليها.", "Source details differ. Review the versions below before relying on them."],
  evidence: ["تفاصيل المصادر", "Source details"], page: ["صفحة", "page"], row: ["صف", "row"],
  noDate: ["تاريخ غير مذكور", "Date not stated"],
  address: ["العنوان كما ورد", "Address as reported"], phones: ["أرقام الاتصال", "Phone numbers"],
  needs: ["الإعاقات والاحتياجات المدعومة", "Disabilities and educational needs"],
  ages: ["الأعمار", "Age groups"], stages: ["المراحل كما وردت", "Stages as reported"],
  classroom: ["نوع الفصل", "Classroom type"], capacity: ["الطاقة الاستيعابية كما وردت", "Reported capacity"],
  missing: ["غير مذكور في المصدر", "Not stated in source"],
  call: ["اتصال", "Call"], map: ["عرض الموقع المتحقق منه", "Open verified map"],
  noMap: ["الموقع الجغرافي غير متحقق منه؛ لا يتوفر رابط خريطة معتمد.", "Location has not been verified; no verified map link is available."],
  failedLink: ["تعذر فتح الرابط على هذا الجهاز.", "This device could not open the link."],
  notFound: ["المؤسسة غير موجودة. لم يتم عرض مؤسسة بديلة.", "Institution not found. No substitute record has been shown."],
  back: ["رجوع", "Back"],
  existing: ["السجلات السابقة للمراجعة", "Existing records for review"],
  existingInfo: ["هذه السجلات محفوظة دون دمج أو ربط تلقائي. لم تُثبت مطابقتها للمصادر أو صحة تصنيفها.", "These records are preserved without automatic merging or linking. Their source matches and classification have not been verified."],
  legacy: ["سجل محلي سابق", "Previous local record"], backend: ["سجل قاعدة البيانات", "Database record"],
  loadFailed: ["تعذر جلب سجلات المراكز الحالية. بيانات المصادر متاحة أدناه.", "Existing center records could not be loaded. Source records remain available below."],
  loading: ["جاري تحميل السجلات الحالية…", "Loading existing records…"], retry: ["إعادة المحاولة", "Retry"],
  extras: ["معلومات إضافية من المصدر (غير متحقق منها)", "Additional source information (unverified)"],
} as const;
export type InstitutionLabel = keyof typeof institutionLabels;
export const institutionText = (key: InstitutionLabel, isRTL: boolean): string => institutionLabels[key][isRTL ? 0 : 1];

export const disabilityLabels: Record<string, [string, string]> = {
  autism: ["التوحد", "Autism"], intellectual: ["الإعاقة الذهنية", "Intellectual disability"],
  hearing: ["الإعاقة السمعية", "Hearing disability"], vision: ["الإعاقة البصرية", "Visual disability"],
  motor: ["الإعاقة الحركية / الجسدية", "Motor / physical disability"], down: ["متلازمة داون", "Down syndrome"],
  learning: ["صعوبات وبطء التعلم", "Learning difficulties"], developmental: ["التأخر النمائي", "Developmental delay"],
  speech: ["النطق واللغة", "Speech and language"], multiple: ["الإعاقات المزدوجة", "Multiple disabilities"],
  "cerebral-palsy": ["الشلل الدماغي", "Cerebral palsy"], adhd: ["فرط الحركة وتشتت الانتباه", "Hyperactivity / inattention"],
  epilepsy: ["الصرع", "Epilepsy"], "all-as-reported": ["جميع الإعاقات حسب المصدر", "All disabilities as reported"],
};
export const stageLabels: Record<string, [string, string]> = {
  nursery: ["حضانة", "Nursery"], kindergarten: ["رياض الأطفال", "Kindergarten"],
  primary: ["ابتدائي", "Primary"], middle: ["متوسط", "Middle"], secondary: ["ثانوي", "Secondary"],
  "all-as-reported": ["جميع المراحل حسب المصدر", "All stages as reported"],
};
export const governorateLabels: Record<string, string> = {
  "العاصمة": "Capital", "حولي": "Hawalli", "الفروانية": "Farwaniya",
  "الجهراء": "Jahra", "مبارك الكبير": "Mubarak Al-Kabeer", "الأحمدي": "Ahmadi",
};
