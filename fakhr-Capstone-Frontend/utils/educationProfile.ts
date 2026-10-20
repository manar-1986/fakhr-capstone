import type { Institution } from "../types/institution";
import { centerPhone } from "./centerPublicProfile";
const unique = (values: (string | null | undefined)[]) => [...new Set(values.filter((v): v is string => !!v?.trim()))];
const bilingual = (values: string[]) => values.length ? { ar: values.join("\n"), en: values.join("\n") } : undefined;
/** Read-only presentation of legacy public information. Never writes back to source records. */
export function educationProfile(item: Institution): Institution {
  const profile = item.publicProfile || {};
  // Already curated profiles (including intentional field omissions) retain their exact presentation.
  if (item.branches || profile.classification || profile.description || profile.phone || profile.services) return item;
  const phones = unique(item.observations.flatMap(o => o.phones)).filter(phone => !!centerPhone(phone));
  const services = unique(item.observations.flatMap(o => [o.stagesAr, o.classroomAr]));
  const needs = unique(item.observations.map(o => o.needsAr));
  return { ...item, publicProfile: {
    ...profile,
    phone: profile.phone || item.publicContact?.phone || phones[0],
    extraPhones: profile.extraPhones || phones.slice(item.publicContact?.phone ? 0 : 1).filter(phone => phone !== item.publicContact?.phone).map(phone => ({phone, label: {ar:"رقم إضافي",en:"Additional contact"}})),
    address: profile.address || bilingual(unique(item.observations.map(o => o.addressAr))),
    area: profile.area || bilingual(unique(item.observations.map(o => o.areaAr))),
    services: profile.additionalServices ? { ar: unique([...services, ...profile.additionalServices.ar]), en: unique([...services, ...profile.additionalServices.en]) } : (services.length ? {ar:services,en:services} : undefined),
    supportedConditions: profile.supportedConditions || (needs.length ? {ar:needs,en:needs} : undefined),
    ages: profile.ages || bilingual(unique(item.observations.map(o => o.agesAr))),
  }};
}
