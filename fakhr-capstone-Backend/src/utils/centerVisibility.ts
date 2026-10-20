// Targeted public deactivation; stored records and other institutions remain intact.
const hiddenIds = new Set(["kw-s-future-girls", "kw-s-dasman-2", "center-khatwa", "center-funoon", "center-child-dev", "center-kayan", "center-amal", "center-noor", "center-bidaya"]);
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
export function isPublicCenter(item: {id?: string; name?: string; nameAr?: string; nameEn?: string; isActive?: boolean}): boolean {
 return item.isActive !== false && !hiddenIds.has((item.id || "").replace(/^backend:/,"")) && ![item.name,item.nameAr,item.nameEn].some(name=>!!name && hiddenNames.some(pattern=>pattern.test(name)));
}


// Navigation placement only: keep the source record and existing Doctors profile intact.
export const doctorOnlyCenterNames = [/^\s*blue[ -]*wing(?:\s+cent(?:er|re))?\s*$/i, /^\s*(?:مركز\s+)?بلو\s*وين[جغ]?\s*$/i];
export function isListedCenter(item: {id?: string; canonicalId?: string; name?: string; nameAr?: string; nameEn?: string; isActive?: boolean}): boolean {
  return isPublicCenter(item) && ![item.id,item.canonicalId].some(id=>id?.replace(/^backend:/,"") === "center-blue-wing") && ![item.name,item.nameAr,item.nameEn].some(name=>!!name && doctorOnlyCenterNames.some(pattern=>pattern.test(name)));
}

export const publicCenterQuery = { name: { $nin: [...hiddenNames, ...doctorOnlyCenterNames] } };
