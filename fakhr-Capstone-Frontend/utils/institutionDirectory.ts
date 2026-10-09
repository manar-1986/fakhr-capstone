import catalog from "../data/institutions/catalog.json";
import { BILINGUAL_CENTERS, BILINGUAL_SCHOOLS } from "../constants/directoryBilingual";
import type { Institution, InstitutionCategory, InstitutionObservation } from "../types/institution";
import type { HealthCenter } from "../types/directory.types";

export const INSTITUTIONS = catalog.institutions as Institution[];
export const INSTITUTION_SOURCES = catalog.sources;
const byId = new Map(INSTITUTIONS.map(item => [item.id, item]));

/** Navigation classification is exclusive; preserve all original source categories.
 * When sources list a rehabilitation center as a school too, keep it in Centers. */
export function institutionDirectoryCategory(item: Institution): InstitutionCategory {
  if (item.categories.includes("rehabilitation")) return "rehabilitation";
  return item.categories.includes("nursery") ? "nursery" : "school";
}

export const normalizeInstitutionSearch = (value: string) => value.toLowerCase()
  .normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "")
  .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
  .replace(/\s+/g, " ").trim();

const observation = (values: Partial<InstitutionObservation>): InstitutionObservation => ({
  sourceId: "legacy", page: 0, row: "", nameAr: "", governorateAr: null,
  areaAr: null, addressAr: null, phones: [], needsAr: null, stagesAr: null,
  classroomAr: null, capacityAr: null, agesAr: null, ...values,
});

// Retain existing identities for review. Synthetic ratings/images and unsupported booking
// claims are intentionally not transferred to the source-based directory.
export const LEGACY_INSTITUTIONS: Institution[] = [
  ...BILINGUAL_SCHOOLS.map(item => ({
    id: item.id, nameAr: item.nameAr, nameEn: null, categories: ["school"] as InstitutionCategory[],
    observations: [observation({ nameAr: item.nameAr, areaAr: item.cityAr,
      needsAr: item.specialtyAr, stagesAr: item.stageAr, agesAr: item.ageRangeAr })],
    reviewStatus: "unverified" as const, origin: "legacy" as const,
    reviewNotesAr: ["سجل محلي سابق لم تثبت مطابقته للمصادر. الاسم الإنجليزي والبيانات القديمة تحتاج مراجعة قبل اعتمادها."],
    disabilityTags: [], stageTags: [], sourceExtras: { previousEnglishName: item.nameEn },
  })),
  ...BILINGUAL_CENTERS.map(item => ({
    id: item.id, nameAr: item.nameAr, nameEn: null, categories: ["rehabilitation"] as InstitutionCategory[],
    observations: [observation({ nameAr: item.nameAr, needsAr: item.specialtyAr })],
    reviewStatus: "unverified" as const, origin: "legacy" as const,
    reviewNotesAr: ["سجل مركز محلي سابق. نوع المركز ومطابقته للمصادر غير متحقق منهما؛ احتُفظ به للمراجعة دون ربطه بمركز آخر."],
    disabilityTags: [], stageTags: [], sourceExtras: { previousEnglishName: item.nameEn },
  })),
];

export function findInstitution(id?: string): Institution | undefined {
  return id ? byId.get(id) ?? LEGACY_INSTITUTIONS.find(item => item.id === id) : undefined;
}

/** Never join by order or by approximate name. Keep each API record's actual identity. */
export function backendInstitution(center: HealthCenter): Institution {
  const rawId = center.id || (center as HealthCenter & { _id?: string })._id;
  return {
    id: `backend:${rawId}`, nameAr: center.name, categories: ["rehabilitation"],
    origin: "backend", reviewStatus: "unverified", disabilityTags: [], stageTags: [],
    reviewNotesAr: ["سجل من قاعدة البيانات. تصنيفه ومطابقته لقوائم المؤسسات يحتاجان مراجعة؛ لم يُدمج تلقائياً."],
    observations: [observation({ sourceId: "backend", row: rawId || "", nameAr: center.name,
      areaAr: center.city || null, addressAr: center.address || null,
      phones: center.phone ? [String(center.phone)] : [], needsAr: center.specialties?.join("، ") || null })],
    // Existing coordinates are not independently verified; do not promote them to a verified map.
  };
}

export type InstitutionFilters = { search?: string; governorate?: string; area?: string; disability?: string; stage?: string };
export function filterInstitutions(items: Institution[], filters: InstitutionFilters): Institution[] {
  const query = normalizeInstitutionSearch(filters.search || "");
  return items.filter(item => {
    if (query && ![item.nameAr, item.nameEn || "", ...item.observations.map(o => o.nameAr)]
      .some(name => normalizeInstitutionSearch(name).includes(query))) return false;
    if ((filters.governorate || filters.area) && !item.observations.some(o =>
      (!filters.governorate || o.governorateAr === filters.governorate) &&
      (!filters.area || o.areaAr === filters.area))) return false;
    if (filters.disability && !item.disabilityTags.includes(filters.disability)) return false;
    if (filters.stage && !item.stageTags.includes(filters.stage)) return false;
    return true;
  });
}

export function institutionPhoneUrl(raw: string): string | undefined {
  const value = raw.replace(/[٠-٩]/g, c => String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/[\s()-]/g, "");
  if (/^[1-9]\d{7}$/.test(value)) return `tel:+965${value}`;
  if (/^1\d{6}$/.test(value)) return `tel:${value}`; // Kuwait short service number as printed.
  if (/^\+965[1-9]\d{7}$/.test(value)) return `tel:${value}`;
  return undefined;
}

export function institutionMapUrl(item: Institution): string | undefined {
  if (!item.mapVerification?.verifiedAt || !item.mapVerification.evidence || !item.verifiedMapUrl) return;
  try {
    const url = new URL(item.verifiedMapUrl);
    if (url.protocol === "https:" && ["maps.google.com", "www.google.com", "maps.app.goo.gl"].includes(url.hostname)) return url.href;
  } catch { /* Invalid or missing URLs do not become tappable map links. */ }
}

export function hasSourceDifferences(item: Institution): boolean {
  return (["addressAr", "phones", "needsAr", "stagesAr", "agesAr", "capacityAr"] as const)
    .some(field => new Set(item.observations.map(o => Array.isArray(o[field]) ? (o[field] as string[]).join(",") : o[field]).filter(Boolean)).size > 1);
}
