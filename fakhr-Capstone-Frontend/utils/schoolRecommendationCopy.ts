import type { Institution, InstitutionObservation } from '../types/institution';
import { governorateLabels } from '../constants/institutionLabels';

// Some legacy presentation helpers copy Arabic into .en fields. Those are not translations.
const english = (value?: string | null) => value?.trim() && /[a-z]/i.test(value) && !/[\u0600-\u06ff]/.test(value) ? value.trim() : undefined;
const unique = (values: (string | null | undefined)[]) => [...new Set(values.filter((s): s is string => !!s?.trim()))];
export function recommendationName(item: Institution, ar: boolean) {
  const translated = english(item.nameEn);
  return { name: ar ? item.nameAr : translated || item.nameAr, missing: !ar && !translated };
}
export function recommendationCopy(branch: Institution, rows: InstitutionObservation[], ar: boolean) {
  // Use authored bilingual profile fields, never the synthesized legacy .en fallback.
  const p = branch.publicProfile;
  const info = ar
    ? p?.description?.ar || unique([...(p?.services?.ar || []), ...rows.flatMap(o => [o.needsAr, o.stagesAr, o.classroomAr])]).join(' · ')
    : english(p?.description?.en) || unique((p?.services?.en || []).map(english)).join(' · ') || 'English description unavailable. View Details for the original Arabic information.';
  const areas = unique(rows.map(o => o.areaAr));
  const governors = unique(rows.map(o => o.governorateAr));
  const location = ar
    ? unique([...(p?.area?.ar ? [p.area.ar] : areas), ...(p?.governorate?.ar ? [p.governorate.ar] : governors)]).join(' · ')
    : unique([
        ...(english(p?.area?.en) ? [english(p?.area?.en)] : areas.map(area => governorateLabels[area] || `${area} (Arabic source)`)),
        ...(english(p?.governorate?.en) ? [english(p?.governorate?.en)] : governors.map(gov => governorateLabels[gov] || `${gov} (Arabic source)`)),
      ]).join(' · ');
  return { info, location };
}
