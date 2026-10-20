// Exact identity aliases only; unrelated Al Shifa institutions stay public.
export function isHiddenAlShifa(item: {id?: string; canonicalId?: string; name?: string; nameAr?: string; nameEn?: string | null}): boolean {
 const names=["الشفاء للرعاية الصحية المنزلية","الشفاء للرعاية المنزلية","al shifa home healthcare","al shifa home care"];
 return [item.id,item.canonicalId].some(id=>id?.replace(/^backend:/,"")==="home-provider-al-shifa") || [item.name,item.nameAr,item.nameEn].some(name=>!!name && names.includes(name.trim().toLowerCase().replace(/\s+/g," ")));
}
// Targeted public deactivation; stored records and other institutions remain intact.
const hiddenIds = new Set(["kw-s-jahra-academy", "kw-s-future-girls", "kw-s-dasman-2", "center-khatwa", "center-funoon", "center-child-dev", "center-kayan", "center-amal", "center-noor", "center-bidaya"]);
const hiddenNames = [
 /^مدرسة المستقبل ثنائية اللغة الخاصة - بنات$/,
 /^المستقبل ثنائية اللغة \(بنات\)$/,
 /^مدرسة دسمان ثنائية اللغة الخاصة \(2\)$/, // Exact duplicate only; preserve the original school.
 /^\s*مركز\s+(?:ا{1,2}ل)?خطو[ةه]\s+للت[أا]هيل\s*$/i,
 /^\s*(?:al[ -]+)?(?:khatwa|khutwa|khotwa)\s+rehabilitation\s+cent(?:er|re)\s*$/i,
 /^\s*مركز\s+فنون\s*$/i, /^\s*funoon\s+cent(?:er|re)\s*$/i,
 /^\s*مركز\s+تنمي[ةه]\s+الطفل\s*$/i, /^\s*child\s+development\s+cent(?:er|re)\s*$/i,
 /^\s*مركز\s+كيان\s*$/i, /^\s*(?:kayan|kayaan)\s+cent(?:er|re)\s*$/i,
 /^\s*مركز\s+[أا]ل[أا]مل\s+للتنمي[ةه]\s*$/i, /^\s*(?:al[ -]+)?amal\s+development\s+cent(?:er|re)\s*$/i,
 /^\s*مركز\s+نور\s+الحيا[ةه]\s*$/i, /^\s*(?:noor|nour)\s+al[ -]+hayat\s+cent(?:er|re)\s*$/i,
 /^\s*مركز\s+بداي[ةه]\s*$/i, /^\s*(?:bidaya|bidayah|bedaya|bedayah)\s+cent(?:er|re)\s*$/i,
];
export function isPublicCenter(item: {id?: string; name?: string; nameAr?: string; nameEn?: string | null; isActive?: boolean}): boolean {
 return !isHiddenAlShifa(item) && item.isActive !== false && !hiddenIds.has((item.id || "").replace(/^backend:/,"")) && ![item.name,item.nameAr,item.nameEn].some(name=>!!name && hiddenNames.some(pattern=>pattern.test(name)));
}

// Navigation placement only: keep the source record and existing Doctors profile intact.
export const doctorOnlyCenterNames = [/^\s*blue[ -]*wing(?:\s+cent(?:er|re))?\s*$/i, /^\s*(?:مركز\s+)?بلو\s*وين[جغ]?\s*$/i];
// Exact Schools listing exclusions; keep catalog/source records and detail navigation intact.
const hiddenSchoolListingIds = new Set(["kw-r-day-jahra", "kw-r-day-ahmadi", "kw-r-umm-qura", "kw-s-tarbiya", "kw-s-gulf-american"]);
// Exact nursery listing exclusions; retain its catalog, seed data and detail references.
const hiddenNurseryListingIds = new Set(["kw-n-blue-sky", "kw-n-jwan", "kw-n-qudrat", "kw-n-sabah", "kw-n-big-wish", "kw-n-salam", "kw-n-portage", "kw-n-tabarak"]);
export function isListedCenter(item: {id?: string; canonicalId?: string; name?: string; nameAr?: string; nameEn?: string | null; isActive?: boolean}): boolean {
  if ([item.id,item.canonicalId].some(id=>id?.replace(/^backend:/, "") === "center-speak-clinic")) return false; // Listed in Home Services; same stored identity.
  if (isHiddenAlShifa(item)) return false;
  if ([item.id, item.canonicalId].some(id => !!id && hiddenSchoolListingIds.has(id.replace(/^backend:/, "")))) return false;
  if ([item.id, item.canonicalId].some(id => !!id && hiddenNurseryListingIds.has(id.replace(/^backend:/, "")))) return false;
  // Listing-only preference: retain both Al Nibras records and direct detail access.
  if ([item.id, item.canonicalId].some(id => id?.replace(/^backend:/, "") === "kw-s-nebras-int")) return false;
  return isPublicCenter(item) && ![item.id,item.canonicalId].some(id=>id?.replace(/^backend:/,"") === "center-blue-wing") && ![item.name,item.nameAr,item.nameEn].some(name=>!!name && doctorOnlyCenterNames.some(pattern=>pattern.test(name)));
}
