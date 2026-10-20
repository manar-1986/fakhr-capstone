import { PUBLIC_DOCTORS, type ApprovedDoctor } from "../constants/approvedDoctors";
import { isListedCenter } from "./centerVisibility";
import { INSTITUTIONS, institutionDirectoryCategory, normalizeInstitutionSearch } from "./institutionDirectory";
import { HOME_PRODUCTS, type ProductSupportCategory } from "../constants/homeProducts";
import type { Institution } from "../types/institution";
export const CATEGORY_PRODUCT_TAGS: Record<string, ProductSupportCategory[]> = {
 autism: ["autism-sensory"], adhd: [], intellectual: ["skills"], learning: ["skills"], motor: ["mobility"], hearing: ["hearing"], vision: ["visual"], speech: ["communication"], multiple: [], down: [], developmental: ["skills"], mental: [],
};
/** Approved 2026-10-16: exact source identities only; never expand to branches or all disabilities.
 * Centers: saved official-source descriptions (provider-research, 2026-10-10).
 * Education: retained directory/scan observations; original eligibility stays on the record.
 */
const APPROVED_CATEGORY_LINKS: Record<string, readonly string[]> = {
 "center-qudrat-early-intervention": ["developmental"],
 "center-kcld": ["developmental"],
 "center-first-step": ["developmental"],
 "kw-n-insan-1": ["intellectual", "motor"],
 "kw-r-integrated": ["intellectual"],
 "kw-r-day-hawalli": ["motor"], // This branch explicitly records cerebral palsy.
 "kw-n-nada": ["multiple"],
 "kw-n-basma": ["mental"], // Educational emotional/behavioral support, not psychotherapy.
};
export function hasApprovedCategoryLink(item: Institution, category: string): boolean {
 return item.disabilityTags.includes(category) || !!APPROVED_CATEGORY_LINKS[item.id]?.includes(category);
}
/** Browse explicit catalog tags and approved evidence links; not clinical recommendations. */
export function categoryContent(id: string, query = "", area = "", institutions: Institution[] = INSTITUTIONS) {
 const words = normalizeInstitutionSearch(query).split(" ").filter(Boolean);
 const matches = (value: string) => words.every(word => normalizeInstitutionSearch(value).includes(word));
 const tagged = institutions.filter(item => isListedCenter(item) && hasApprovedCategoryLink(item,id));
 const places = tagged.filter(item => (!area || item.observations.some(o => o.areaAr === area)) && matches([item.nameAr, item.nameEn, ...item.observations.flatMap(o => [o.needsAr, o.areaAr]), ...(item.publicProfile?.services?.ar ?? []), ...(item.publicProfile?.services?.en ?? [])].join(" ")));
 return {
  professionals: PUBLIC_DOCTORS.filter(doctor => {
   if (["psychology", "child-adolescent-mental-health", "clinical-nutrition", "dentistry", "pediatric-dentistry", "special-needs-dentistry", "pediatric-cardiology", "fetal-cardiology"].includes(doctor.group)) return false;
   // Explicit source-category links or narrowly relevant documented specialties only.
   const terms: Record<string, RegExp> = {autism:/autism|توحد/i, adhd:/\badhd\b|فرط الحركة/i, intellectual:/intellectual disabilit|إعاقة ذهنية/i, learning:/learning difficult|dyslexia|صعوبات التعلم/i, motor:/cerebral palsy|شلل دماغي/i, hearing:/hearing impair|إعاقة سمعية/i, vision:/visual impair|إعاقة بصرية/i, speech:/speech.*(?:delay|disorder)|اضطرابات النطق/i, down:/down syndrome|متلازمة داون/i, developmental:/developmental delay|تأخر نمائي/i};
   const recorded = [doctor.suppliedSpecialty?.en,doctor.suppliedSpecialty?.ar,...(doctor.suppliedSpecializations?.en ?? []),...(doctor.suppliedSpecializations?.ar ?? [])].join(" ");
   const linked = doctor.sourceInstitution?.disabilityTags.includes(id) || (!!terms[id] && terms[id].test(recorded));
   const specialty = (id === "developmental" && doctor.id === "doctor-hadeel-yassin-faras" && doctor.group === "developmental") || (id === "vision" && doctor.group === "ophthalmology") || (id === "learning" && doctor.group === "learning-difficulties") || (id === "motor" && doctor.group === "pediatric-orthopedics");
   if (places.some(item => item.id === doctor.id && institutionDirectoryCategory(item) === "rehabilitation")) return false;
   return (linked || specialty) && (!area || doctor.sourceInstitution?.observations.some(o => o.areaAr === area)) && matches([doctor.nameAr, doctor.nameEn, doctor.clinic?.nameAr, doctor.clinic?.nameEn].join(" "));
  }),
  centers: places.filter(item => institutionDirectoryCategory(item) === "rehabilitation"),
  education: places.filter(item => ["school", "nursery"].includes(institutionDirectoryCategory(item))),
  areas: [...new Set(tagged.flatMap(item => item.observations.map(o => o.areaAr).filter((a): a is string => !!a)))].sort(),
  products: HOME_PRODUCTS.filter(item => item.supportCategories.some(tag => (CATEGORY_PRODUCT_TAGS[id] ?? []).includes(tag)) && matches(item.nameAr + " " + item.nameEn)),
 };
}

/** Service tiles require explicit service evidence, not a condition or broad category tag. */
export function hasCategoryService(item: Institution, service: string): boolean {
 const patterns: Record<string,RegExp> = {speech:/speech|communication|نطق|تخاطب/i,ot:/occupational|وظيفي/i,behavior:/behavio|\baba\b|سلوك/i,early:/early intervention|التدخل المبكر/i,hearing:/hearing assessments?|audiolog|اختبارات السمع|تقييم السمع/i};
 const evidence=[...(item.publicProfile?.services?.ar ?? []),...(item.publicProfile?.services?.en ?? []),...(item.publicProfile?.additionalServices?.ar ?? []),...(item.publicProfile?.additionalServices?.en ?? [])].filter(line => !/psychotherap|cognitive behavio|counsell?ing|علاج نفسي|العلاج النفسي|(?:ال)?معرفي (?:ال)?سلوكي|السلوكي المعرفي/i.test(line)).join("\n");
 return evidence.split("\n").some(line => !!patterns[service]?.test(line));
}

/** Personal qualifications and documented clinic services remain separate. */
export function hasProfessionalCategoryService(doctor: ApprovedDoctor, service: string): boolean {
 if (service === "vision") return doctor.group === "ophthalmology";
 if (service === "mobility") return doctor.group === "pediatric-orthopedics";
 if (service === "behavior" && doctor.group === "aba") return true;
 return !!doctor.sourceInstitution && hasCategoryService(doctor.sourceInstitution, service);
}

/** Category priorities select only services with matches under the existing filters. */
export const CATEGORY_SERVICE_PRIORITY: Record<string, readonly string[]> = {
 autism:["speech","ot","behavior"], adhd:["speech","ot","behavior"],
 intellectual:["speech","ot","early","behavior"], learning:["speech","behavior","early"],
 motor:["mobility","ot","physical"], hearing:["hearing","speech","ot"],
 vision:["vision","ot"], speech:["speech","ot","behavior"],
 multiple:["speech","ot","physical","early"], down:["speech","ot","early","physical"],
 developmental:["early","speech","ot","physical"], mental:[],
};
export const CATEGORY_SERVICE_CARDS = [
 {query:"speech",ar:"النطق والتواصل",en:"Speech & communication",icon:"chatbubbles-outline",bg:"#EDF5FF"},
 {query:"ot",ar:"العلاج الوظيفي",en:"Occupational therapy",icon:"accessibility-outline",bg:"#F1EEFF"},
 {query:"behavior",ar:"دعم المهارات والسلوك",en:"Behavior support",icon:"bar-chart-outline",bg:"#ECF8F5"},
 {query:"early",ar:"التدخل المبكر",en:"Early intervention",icon:"leaf-outline",bg:"#F1EEFF"},
 {query:"hearing",ar:"تقييم السمع",en:"Hearing assessment",icon:"ear-outline",bg:"#EDF5FF"},
 {query:"vision",ar:"دعم البصر وطب العيون",en:"Vision & eye care",icon:"eye-outline",bg:"#EDF5FF"},
 {query:"mobility",ar:"عظام الأطفال والحركة",en:"Pediatric orthopedics",icon:"accessibility-outline",bg:"#F1EEFF"},
] as const;
export function categoryServiceCards(id: string, data: ReturnType<typeof categoryContent>) {
 const supported = (CATEGORY_SERVICE_PRIORITY[id] ?? []).flatMap(key => {
  const card = CATEGORY_SERVICE_CARDS.find(item => item.query === key);
  return card && (data.centers.some(item => hasCategoryService(item,key)) || data.professionals.some(item => hasProfessionalCategoryService(item,key))) ? [card] : [];
 });
 return supported.slice(0, data.education.length ? 3 : 4);
}

/** Fixed browsing choices approved by the parent; assignment never implies provider evidence. */
export const CATEGORY_SERVICE_SELECTION: Record<string, readonly string[]> = {
 autism:["speech","ot","behavior","education"], adhd:["speech","ot","behavior","education"],
 intellectual:["speech","ot","daily","education"], learning:["speech","behavior","early","education"],
 motor:["mobility","physical","ot","education"], hearing:["hearing","speech","ot","education"],
 vision:["vision","orientation","assistive","education"], speech:["speech","ot","behavior","education"],
 multiple:["speech","ot","physical","education"], down:["early","speech","ot","education"],
 developmental:["early","speech","ot","education"], mental:["family","daily","positive","education"],
};
const BROWSING_SERVICE_CARDS = [...CATEGORY_SERVICE_CARDS,
 {query:"education",ar:"التعليم والدعم",en:"Education & support",icon:"book-outline",bg:"#FFF5E9"},
 {query:"daily",ar:"دعم المهارات اليومية والاستقلالية",en:"Daily living & independence support",icon:"accessibility-outline",bg:"#ECF8F5"},
 {query:"physical",ar:"التأهيل الحركي",en:"Physical rehabilitation",icon:"walk-outline",bg:"#F1EEFF"},
 {query:"orientation",ar:"دعم التوجه والتنقل",en:"Orientation & mobility support",icon:"compass-outline",bg:"#F1EEFF"},
 {query:"assistive",ar:"التقنيات المساعدة",en:"Assistive technology",icon:"tablet-portrait-outline",bg:"#ECF8F5"},
 {query:"family",ar:"إرشاد الأسرة ودعمها",en:"Family guidance & support",icon:"people-outline",bg:"#EDF5FF"},
 {query:"positive",ar:"دعم السلوك الإيجابي",en:"Positive behavior support",icon:"bar-chart-outline",bg:"#ECF8F5"},
] as const;
export function hasServiceResults(data: ReturnType<typeof categoryContent>, key: string): boolean {
 return key === "education" ? data.education.length > 0 : data.centers.some(item=>hasCategoryService(item,key)) || data.professionals.some(item=>hasProfessionalCategoryService(item,key));
}
export function categoryBrowsingCards(id: string) {
 return (CATEGORY_SERVICE_SELECTION[id] ?? []).flatMap(key => {
  const card=BROWSING_SERVICE_CARDS.find(item=>item.query===key);return card ? [card] : [];
 });
}
