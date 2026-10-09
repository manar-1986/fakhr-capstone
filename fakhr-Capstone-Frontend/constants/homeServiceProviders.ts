import type { BiText } from "./directoryBilingual";

export type HomeServiceCategory = "physiotherapy" | "speech" | "occupational" | "home-healthcare";
export const HOME_SERVICE_CATEGORIES: { id: HomeServiceCategory; label: BiText; icon: "pulse-outline" | "chatbubbles-outline" | "hand-left-outline" | "home-outline" }[] = [
  { id: "physiotherapy", label: { ar: "العلاج الطبيعي", en: "Physiotherapy" }, icon: "pulse-outline" },
  { id: "speech", label: { ar: "علاج النطق والتخاطب", en: "Speech & Language Therapy" }, icon: "chatbubbles-outline" },
  { id: "occupational", label: { ar: "العلاج الوظيفي", en: "Occupational Therapy" }, icon: "hand-left-outline" },
  { id: "home-healthcare", label: { ar: "الرعاية الصحية المنزلية", en: "Home Healthcare" }, icon: "home-outline" },
];
export type HomeServiceProvider = {
  id: string; name: BiText; phone: string; categories: HomeServiceCategory[];
  service: BiText; description: BiText; verification: BiText;
  pediatricHomeVisits: "unconfirmed";
  sources: { title: string; url: string }[];
};
/** User-supplied contacts checked against provider publications, 2026-10-08.
 * Categories contain the main supported offering only. Additional advertised services
 * remain notes until verified for this home-services directory; never imply pediatric visits.
 * No backend identity or appointment inventory is associated with these local records.
 */
export const HOME_SERVICE_PROVIDERS: HomeServiceProvider[] = [
  { id: "home-provider-therapy-care", name: { ar: "ثيرابي كير", en: "Therapy Care" }, phone: "98938009", categories: ["physiotherapy"],
    service: { ar: "علاج طبيعي منزلي", en: "Home physiotherapy" },
    description: { ar: "يقدم العلاج الطبيعي في المنزل. يعلن أيضاً عن علاج النطق والعلاج الوظيفي؛ توفرهما منزلياً للأطفال يحتاج تحققاً.", en: "Provides home physiotherapy. Speech and occupational therapy are also advertised; their home availability for children needs verification." },
    verification: { ar: "تقديم الخدمة المنزلية للأطفال ونوع العلاج المناسب يحتاجان تأكيداً من المزود.", en: "Confirm pediatric home availability and the appropriate therapy directly with the provider." }, pediatricHomeVisits: "unconfirmed",
    sources: [{ title: "Therapy Care", url: "https://therapy-kw.com/" }] },
  { id: "home-provider-human-touch", name: { ar: "هيومن تاتش", en: "Human Touch" }, phone: "50055510", categories: ["physiotherapy"],
    service: { ar: "علاج طبيعي منزلي", en: "Home physiotherapy" },
    description: { ar: "يقدم العلاج الطبيعي في المنزل. علاج النطق معلن أيضاً؛ تقديمه منزلياً للأطفال غير مؤكد.", en: "Provides home physiotherapy. Speech therapy is also reported as advertised; pediatric home provision is unconfirmed." },
    verification: { ar: "توفر العلاج المنزلي للأطفال، وخاصة علاج النطق، يحتاج تأكيداً من المزود.", en: "Children’s home therapy availability, especially speech therapy, requires provider confirmation." }, pediatricHomeVisits: "unconfirmed",
    sources: [{ title: "Human Touch — physiotherapy", url: "https://www.humantouch-physio.com/" }] },
  { id: "home-provider-lets-speech", name: { ar: "Let's Speech", en: "Let's Speech" }, phone: "97944756", categories: ["speech"],
    service: { ar: "علاج النطق واللغة والبلع", en: "Speech, language and swallowing therapy" },
    description: { ar: "خدمات لتقييم وعلاج النطق واللغة والبلع. الإدراج هنا لا يعني توفر زيارات منزلية للأطفال.", en: "Speech, language and swallowing assessment and therapy. Inclusion here does not imply pediatric home visits." },
    verification: { ar: "الزيارات المنزلية للأطفال غير مؤكدة. الموقع يذكر زيارات منزلية لكبار السن؛ لا يُعمّم ذلك على الأطفال.", en: "Home visits for children are not confirmed. The website lists elderly home visits; this does not establish pediatric home availability." }, pediatricHomeVisits: "unconfirmed",
    sources: [{ title: "Let's Speech", url: "https://www.letspeech.com/" }] },
  { id: "home-provider-al-shifa", name: { ar: "الشفاء للرعاية الصحية المنزلية", en: "Al Shifa Home Healthcare" }, phone: "51003780", categories: ["home-healthcare"],
    service: { ar: "رعاية صحية منزلية وخدمات دعم", en: "Home healthcare and support services" },
    description: { ar: "رعاية منزلية وخدمات دعم. لم يتم تأكيد نطاق الخدمات المخصصة للأطفال؛ لا تُصنّف هنا كعلاج للأطفال.", en: "Home healthcare and support. The exact services for children have not been confirmed; this is not listed as pediatric therapy." },
    verification: { ar: "خدمات الأطفال والفئات العمرية المؤهلة تحتاج تحققاً مباشراً من المزود.", en: "Exact children’s services and eligible age groups require direct provider verification." }, pediatricHomeVisits: "unconfirmed",
    sources: [{ title: "Al Shifa — special needs care", url: "https://alshifa.health/special-needs-care/" }] },
];
export const findHomeServiceProvider = (id?: string) => HOME_SERVICE_PROVIDERS.find(p => p.id === id);
export const filterHomeServiceProviders = (category?: string) => HOME_SERVICE_PROVIDERS.filter(p => !category || p.categories.includes(category as HomeServiceCategory));
export const homeProviderPhoneUrl = (phone: string) => /^[569]\d{7}$/.test(phone) ? `tel:+965${phone}` : undefined;
export const homeServiceText = {
  all: { ar: "الكل", en: "All" }, details: { ar: "تفاصيل المزود", en: "Provider details" },
  call: { ar: "اتصال", en: "Call" }, review: { ar: "التوفر للأطفال يحتاج تحققاً", en: "Children’s availability needs verification" },
  intro: { ar: "التصنيفات توضح الخدمة الأساسية، ولا تؤكد توفر زيارات منزلية للأطفال. تواصل مع المزود للتحقق.", en: "Categories describe the main service, not confirmed pediatric home visits. Contact the provider to verify availability." },
  empty: { ar: "لا يوجد مزود مؤكد ضمن هذا التصنيف بعد. خدمات العلاج الوظيفي المعلنة لدى ثيرابي كير مذكورة في تفاصيله وتحتاج تحققاً قبل إدراجها كخدمة منزلية.", en: "No confirmed provider in this category yet. Therapy Care’s advertised occupational therapy is noted in its details and needs verification before listing as a home service." },
  sources: { ar: "مصادر معلومات الخدمة", en: "Service information sources" },
  error: { ar: "تعذر فتح الرابط على هذا الجهاز.", en: "This device could not open the link." },
  missing: { ar: "المزود غير موجود.", en: "Provider not found." },
} satisfies Record<string, BiText>;
