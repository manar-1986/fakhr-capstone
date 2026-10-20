import { consolidateConfirmedSchools, canonicalSchoolId } from "./confirmedSchoolGroups";
import { unifyMaarifaSchools, MAARIFA_ID, MAARIFA_SOURCE_IDS } from "./maarifaSchool";
import { isListedCenter, isPublicCenter } from "./centerVisibility";
import { isSpeechPlus } from "../constants/speechPlus";
import { centerApiPublicProfile } from "./centerPublicProfile";
import { BLUE_WING_INSTITUTION } from "../constants/blueWing";
import catalog from "../data/institutions/catalog.json";
import verifiedProviders from "../data/institutions/verified-providers.json";
import { BILINGUAL_CENTERS, BILINGUAL_SCHOOLS } from "../constants/directoryBilingual";
import type { Institution, InstitutionCategory, InstitutionObservation } from "../types/institution";
import type { HealthCenter } from "../types/directory.types";

export const VERIFIED_PROVIDERS = verifiedProviders as Institution[];
export const INSTITUTIONS = [...consolidateConfirmedSchools(unifyMaarifaSchools(catalog.institutions as Institution[])), BLUE_WING_INSTITUTION, ...VERIFIED_PROVIDERS];
export const INSTITUTION_SOURCES = catalog.sources;
const byId = new Map(INSTITUTIONS.map(item => [item.id, item]));

/** Navigation placement only. Original facility classifications and source data remain intact. */
export const SCHOOL_NAVIGATION_INSTITUTION_IDS = new Set([
  "kw-autism-kuwait", "kw-r-21", "kw-r-ekhlas", "kw-r-day-hawalli",
  "kw-r-day-jahra", "kw-r-day-ahmadi", "kw-r-umm-qura", "kw-r-idad",
  "kw-r-irshad", "kw-r-integrated", "kw-r-integrated-2", "kw-r-dyslexia",
]);
export function institutionDirectoryCategory(item: Institution): InstitutionCategory {
  if (item.categories.includes("sports")) return "sports";
  if (SCHOOL_NAVIGATION_INSTITUTION_IDS.has(item.id)) return "school";
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
  ...BILINGUAL_CENTERS.filter(isPublicCenter).map(item => ({
    id: item.id, nameAr: item.nameAr, nameEn: null, categories: ["rehabilitation"] as InstitutionCategory[],
    observations: [observation({ nameAr: item.nameAr, needsAr: item.specialtyAr })],
    reviewStatus: "unverified" as const, origin: "legacy" as const,
    reviewNotesAr: ["سجل مركز محلي سابق. نوع المركز ومطابقته للمصادر غير متحقق منهما؛ احتُفظ به للمراجعة دون ربطه بمركز آخر."],
    disabilityTags: [], stageTags: [], sourceExtras: { previousEnglishName: item.nameEn },
  })),
];

export function findInstitution(id?: string): Institution | undefined {
  if (id === "kw-s-dasman-2" || id === "kw-s-future-girls") return undefined; // Publicly hidden; source record is retained.
  if (id && MAARIFA_SOURCE_IDS.includes(id)) return byId.get(MAARIFA_ID);
  return id ? byId.get(canonicalSchoolId(id)) ?? LEGACY_INSTITUTIONS.find(item => item.id === id) : undefined;
}

/** Never join by order or by approximate name. Keep each API record's actual identity. */
export function backendInstitution(center: HealthCenter): Institution {
  const rawId = center.id || (center as HealthCenter & { _id?: string })._id;
  const publicProfile = centerApiPublicProfile(center);
  const verified = VERIFIED_PROVIDERS.find(item => [item.nameAr, item.nameEn || "", ...(item.identityAliases || [])]
    .some(name => normalizeInstitutionSearch(name) === normalizeInstitutionSearch(center.name)));
  // This moved profile is a complete replacement; stale API fields must not leak back in.
  if (verified?.id === "home-provider-lets-speech") return verified;
  if (verified) return { ...verified, publicProfile: { ...publicProfile, ...verified.publicProfile }, id: `backend:${rawId}`, canonicalId: verified.id, origin: "backend",
    observations: [observation({ sourceId: "backend", row: rawId || "", nameAr: center.name,
      areaAr: center.city || null, addressAr: center.address || null, phones: center.phone ? [String(center.phone)] : [] })] };
  return {
    id: `backend:${rawId}`, nameAr: center.name, categories: ["rehabilitation"],
    publicProfile,
    origin: "backend", reviewStatus: "unverified", disabilityTags: [], stageTags: [],
    reviewNotesAr: ["سجل من قاعدة البيانات. تصنيفه ومطابقته لقوائم المؤسسات يحتاجان مراجعة؛ لم يُدمج تلقائياً."],
    observations: [observation({ sourceId: "backend", row: rawId || "", nameAr: center.name,
      areaAr: center.city || null, addressAr: center.address || null,
      phones: center.phone ? [String(center.phone)] : [], needsAr: center.specialties?.join("، ") || null })],
    // Existing coordinates are not independently verified; do not promote them to a verified map.
  };
}

/** A curated fallback and its exact API identity share one card; preserve the API ID. */
export function mergeInstitutions(local: Institution[], api: Institution[]): Institution[] {
  const merged = new Map<string, Institution>();
  for (const item of [...local, ...api]) {
    const key = item.canonicalId || item.id;
    if (!merged.has(key) || (item.origin === "backend" && merged.get(key)?.origin !== "backend")) merged.set(key, item);
  }
  return [...merged.values()];
}

export type InstitutionFilters = { search?: string; governorate?: string; area?: string; disability?: string; stage?: string };
export function filterInstitutions(items: Institution[], filters: InstitutionFilters): Institution[] {
  const query = normalizeInstitutionSearch(filters.search || "");
  return items.filter(item => {
    if (isSpeechPlus(item)) return false;
    if (!isListedCenter({ ...item, nameEn: item.nameEn || undefined })) return false;
    if (query && ![item.nameAr, item.nameEn || "", item.id === "kw-s-future" ? "Future Bilingual School" : "", ...(item.identityAliases || []), ...item.observations.map(o => o.nameAr)]
      .some(name => normalizeInstitutionSearch(name).includes(query))) return false;
    if ((filters.governorate || filters.area) && ![...item.observations, { governorateAr: item.publicProfile?.governorate?.ar, areaAr: item.publicProfile?.area?.ar }].some(o =>
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
  if (/^(?:\+965)?1\d{6}$/.test(value)) return `tel:${value}`; // Kuwait short service number as printed.
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
