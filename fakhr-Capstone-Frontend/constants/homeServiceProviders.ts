import verifiedProviders from "../data/institutions/verified-providers.json";
import { isHiddenAlShifa } from "../utils/centerVisibility";
import type { BiText } from "./directoryBilingual";

export type HomeServiceCategory = "physiotherapy" | "speech" | "occupational" | "home-healthcare" | "home-rehabilitation";
export const HOME_SERVICE_CATEGORIES: { id: HomeServiceCategory; label: BiText; icon: "pulse-outline" | "chatbubbles-outline" | "hand-left-outline" | "home-outline" }[] = [
  { id: "physiotherapy", label: { ar: "العلاج الطبيعي", en: "Physiotherapy" }, icon: "pulse-outline" },
  { id: "speech", label: { ar: "علاج النطق والتخاطب", en: "Speech & Language Therapy" }, icon: "chatbubbles-outline" },
  { id: "occupational", label: { ar: "العلاج الوظيفي", en: "Occupational Therapy" }, icon: "hand-left-outline" },
  { id: "home-rehabilitation", label: {ar:"التأهيل المنزلي",en:"Home-Based Rehabilitation"}, icon:"home-outline" },
  { id: "home-healthcare", label: { ar: "الرعاية الصحية المنزلية", en: "Home Healthcare" }, icon: "home-outline" },
];
export type HomeServiceProvider = {
  id: string; name: BiText; phone?: string; whatsapp?: {phone:string;url:string}; categories: HomeServiceCategory[];
  service: BiText; description: BiText; verification: BiText;
  pediatricHomeVisits: "unconfirmed";
  providerName?: string; image?: "therapyKw" | "humanTouch" | "speakclinic"; officialWebsite?: boolean;
  sections?: {title: BiText; items?: {ar:string[];en:string[]}; description?: BiText}[];
  sources: { title: string; url: string }[];
};
/** User-supplied contacts checked against provider publications, 2026-10-08.
 * Categories contain the main supported offering only. Additional advertised services
 * remain notes until verified for this home-services directory; never imply pediatric visits.
 * No backend identity or appointment inventory is associated with these local records.
 */
export const STORED_HOME_SERVICE_PROVIDERS: HomeServiceProvider[] = [
  { id: "home-provider-therapy-care", name: { ar: "ثيرابي كير", en: "Therapy Care" }, providerName:"THERAPY KW", phone: "98938009", categories: ["physiotherapy","speech"],
    service: { ar: "العلاج الطبيعي للأطفال", en: "Pediatric Physiotherapy" },
    description: { ar: "معالجة مشاكل النطق والصوت واللغة.", en: "Treatment of speech, voice, and language difficulties." },
    verification:{ar:"",en:""}, pediatricHomeVisits:"unconfirmed", image:"therapyKw",
    sections:[
     {title:{ar:"العلاج الطبيعي للأطفال",en:"Pediatric Physiotherapy"},items:{ar:["تأخر النمو الحركي","حالات تشوهات العظام","اضطرابات الأعصاب الطرفية","الشلل الدماغي","الإعاقات الحركية"],en:["Delayed motor development","Musculoskeletal deformities","Peripheral nerve disorders","Cerebral palsy","Motor disabilities"]}},
     {title:{ar:"علاج النطق والتخاطب",en:"Speech and Language Therapy"},description:{ar:"معالجة مشاكل النطق والصوت واللغة.",en:"Treatment of speech, voice, and language difficulties."}}
    ],sources:[{title:"THERAPY KW",url:"https://www.therapy-kw.com"}] },
  { id:"home-provider-human-touch",name:{ar:"مركز هيومن تاتش",en:"Human Touch Center"},categories:["home-rehabilitation"],
    service:{ar:"التأهيل المنزلي",en:"Home-Based Rehabilitation"},
    description:{ar:"برامج متخصصة لإعادة التأهيل الحركي للأطفال وذوي الاحتياجات الخاصة، تُقدَّم في بيئة آمنة داخل المنزل.",en:"Specialized motor rehabilitation programs for children and individuals with special needs, delivered in a safe home environment."},
    verification:{ar:"",en:""},pediatricHomeVisits:"unconfirmed",image:"humanTouch",officialWebsite:true,
    whatsapp:{phone:"+96550055510",url:"https://wa.me/96550055510"},sources:[{title:"Human Touch Center",url:"https://humantouch-homecare.com/"}] },
  { id: "home-provider-al-shifa", name: { ar: "الشفاء للرعاية الصحية المنزلية", en: "Al Shifa Home Healthcare" }, phone: "51003780", categories: ["home-healthcare"],
    service: { ar: "رعاية صحية منزلية وخدمات دعم", en: "Home healthcare and support services" },
    description: { ar: "رعاية منزلية وخدمات دعم. لم يتم تأكيد نطاق الخدمات المخصصة للأطفال؛ لا تُصنّف هنا كعلاج للأطفال.", en: "Home healthcare and support. The exact services for children have not been confirmed; this is not listed as pediatric therapy." },
    verification: { ar: "خدمات الأطفال والفئات العمرية المؤهلة تحتاج تحققاً مباشراً من المزود.", en: "Exact children’s services and eligible age groups require direct provider verification." }, pediatricHomeVisits: "unconfirmed",
    sources: [{ title: "Al Shifa — special needs care", url: "https://alshifa.health/special-needs-care/" }] },
];
// Public projection: preserve the original stored profile without exposing it.
// Read the existing clinic identity; this is a presentation adapter, not a second stored record.
const speakClinic = verifiedProviders.find(item=>item.id === "center-speak-clinic")!;
const speakProfile = speakClinic.publicProfile!;
const speakHomeProvider: HomeServiceProvider = {id:speakClinic.id,name:{ar:speakClinic.nameAr,en:speakClinic.nameEn},phone:speakProfile.phone!.replace("+965",""),categories:["speech","occupational"],service:speakProfile.classification!,description:speakProfile.description!,verification:{ar:"",en:""},pediatricHomeVisits:"unconfirmed",image:"speakclinic",sources:[]};
export const HOME_SERVICE_PROVIDERS = [...STORED_HOME_SERVICE_PROVIDERS.filter(p => !isHiddenAlShifa({id:p.id,nameAr:p.name.ar,nameEn:p.name.en})),speakHomeProvider];
export const findHomeServiceProvider = (id?: string) => HOME_SERVICE_PROVIDERS.find(p => p.id === id);
export const filterHomeServiceProviders = (category?: string) => HOME_SERVICE_PROVIDERS.filter(p => !category || p.categories.includes(category as HomeServiceCategory));
export const homeProviderPhoneUrl = (phone: string = "") => /^[569]\d{7}$/.test(phone) ? `tel:+965${phone}` : undefined;
export const homeServiceText = {
  all: { ar: "الكل", en: "All" }, details: { ar: "تفاصيل المزود", en: "Provider details" },
  call: { ar: "اتصال", en: "Call" }, review: { ar: "التوفر للأطفال يحتاج تحققاً", en: "Children’s availability needs verification" },
  intro: { ar: "التصنيفات توضح الخدمة الأساسية، ولا تؤكد توفر زيارات منزلية للأطفال. تواصل مع المزود للتحقق.", en: "Categories describe the main service, not confirmed pediatric home visits. Contact the provider to verify availability." },
  empty: { ar: "لا يوجد مزود مؤكد ضمن هذا التصنيف بعد.", en: "No confirmed provider in this category yet." },
  sources: { ar: "مصادر معلومات الخدمة", en: "Service information sources" },
  error: { ar: "تعذر فتح الرابط على هذا الجهاز.", en: "This device could not open the link." },
  missing: { ar: "المزود غير موجود.", en: "Provider not found." },
} satisfies Record<string, BiText>;
