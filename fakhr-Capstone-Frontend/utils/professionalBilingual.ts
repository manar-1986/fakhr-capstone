import {
  API_DOCTOR_I18N,
  DOCTOR_NAME_INDEX,
  SPECIALTY_LABELS,
  availabilityPair,
  languagePair,
  locationPair,
  nextAvailablePair,
  type BilingualDoctor,
} from "../constants/professionalBilingual";
import { containsArabic, directoryText } from "../constants/directoryBilingual";
import { extractBi, type BiFields } from "./planBilingual";
import { knownText } from "./knownText";

type Translate = (key: string) => string;

function asTrimmed(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asTrimmed(item)).filter((item): item is string => !!item);
}

function lookupCatalog(raw: Record<string, unknown>) {
  const keys = [
    asTrimmed(raw.id),
    asTrimmed(raw._id),
    asTrimmed(raw.name),
    asTrimmed(raw.nameAr),
    asTrimmed(raw.nameEn),
    asTrimmed(raw.name_ar),
    asTrimmed(raw.name_en),
  ].filter((key): key is string => !!key);
  for (const key of keys) {
    const hit = DOCTOR_NAME_INDEX[key] ?? DOCTOR_NAME_INDEX[key.toLowerCase()];
    if (hit) return hit;
  }
  return undefined;
}

/**
 * English never falls back to Arabic. Missing English is `planUi.missingTranslation`.
 * Arabic prefers Arabic, then a Latin value so the screen is not blank.
 */
export function doctorLocaleText(
  isRTL: boolean,
  fields: BiFields & { legacy?: string },
  t: Translate,
): string {
  const ar = fields.ar?.trim() || undefined;
  const en = fields.en?.trim() || undefined;
  const legacy = fields.legacy?.trim() || undefined;
  if (!ar && !en && !legacy) return "";
  const viaKnown = (value?: string) => {
    if (!value) return "";
    const mapped = knownText(t, value);
    return mapped || value;
  };

  if (isRTL) {
    const arabic = [ar, legacy && containsArabic(legacy) ? legacy : undefined].find(Boolean);
    if (arabic) {
      const translated = viaKnown(arabic);
      return translated || arabic;
    }
    return en || legacy || "";
  }

  const knownEn = [en, legacy, ar]
    .map((value) => viaKnown(value))
    .find((value) => value && !containsArabic(value));
  if (knownEn) return knownEn;

  const latin = [en, legacy && !containsArabic(legacy) ? legacy : undefined].find(
    (value) => value && !containsArabic(value),
  );
  if (latin) return latin;

  return t("planUi.missingTranslation");
}

export function doctorLocaleList(
  isRTL: boolean,
  ar: string[] | undefined,
  en: string[] | undefined,
  t: Translate,
  legacy?: string[],
): string[] {
  const arList = ar?.length ? ar : [];
  const enList = en?.length ? en : [];
  const legacyList = legacy?.length ? legacy : [];
  const max = Math.max(arList.length, enList.length, legacyList.length);
  if (max === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < max; i++) {
    out.push(
      doctorLocaleText(
        isRTL,
        { ar: arList[i], en: enList[i], legacy: legacyList[i] },
        t,
      ),
    );
  }
  return out;
}

function splitLegacyItem(value: string): BiFields {
  const pair =
    languagePair(value) ??
    locationPair(value) ??
    availabilityPair(value) ??
    nextAvailablePair(value);
  if (pair) return { ar: pair.ar, en: pair.en };
  if (containsArabic(value)) return { ar: value };
  return { en: value };
}

function mergeList(raw: Record<string, unknown>, base: string): { ar: string[]; en: string[] } {
  const ar = asStringArray(raw[`${base}Ar`] ?? raw[`${base}_ar`]);
  const en = asStringArray(raw[`${base}En`] ?? raw[`${base}_en`]);
  const legacy = asStringArray(raw[base]);
  if (ar.length || en.length) {
    const max = Math.max(ar.length, en.length);
    const outAr: string[] = [];
    const outEn: string[] = [];
    for (let i = 0; i < max; i++) {
      outAr.push(ar[i] ?? "");
      outEn.push(en[i] ?? "");
    }
    return { ar: outAr, en: outEn };
  }
  const outAr: string[] = [];
  const outEn: string[] = [];
  legacy.forEach((item) => {
    const split = splitLegacyItem(item);
    outAr.push(split.ar ?? "");
    outEn.push(split.en ?? "");
  });
  return { ar: outAr, en: outEn };
}

function fillFromLegacy(legacy: string | undefined, existing: BiFields): BiFields {
  if (!legacy) return existing;
  if (containsArabic(legacy)) {
    return { ar: existing.ar || legacy, en: existing.en };
  }
  return { ar: existing.ar, en: existing.en || legacy };
}

export function normalizeProfessional(rawInput: unknown): import("../types/directory.types").Professional {
  const raw = asRecord(rawInput) ?? {};
  const center = asRecord(raw.centerId);
  const catalog = lookupCatalog(raw);
  const catalogDoctor = catalog && "educationAr" in catalog ? (catalog as BilingualDoctor) : undefined;
  const catalogSeed = catalog && !("educationAr" in catalog) ? catalog : undefined;
  const apiHit =
    catalogSeed ||
    (asTrimmed(raw.name) ? API_DOCTOR_I18N[asTrimmed(raw.name)!] : undefined) ||
    (asTrimmed(raw.nameEn) ? API_DOCTOR_I18N[asTrimmed(raw.nameEn)!] : undefined);

  let name = fillFromLegacy(asTrimmed(raw.name), extractBi(raw, "name"));
  let specialtyLabel = fillFromLegacy(
    asTrimmed(raw.specialtyLabel),
    extractBi(raw, "specialtyLabel"),
  );
  const specialtyField = extractBi(raw, "specialty");
  let bio = fillFromLegacy(asTrimmed(raw.bio), extractBi(raw, "bio"));
  let location = fillFromLegacy(asTrimmed(raw.location), extractBi(raw, "location"));
  let availability = fillFromLegacy(asTrimmed(raw.availability), extractBi(raw, "availability"));
  let nextAvailable = fillFromLegacy(asTrimmed(raw.nextAvailable), extractBi(raw, "nextAvailable"));
  let experience = fillFromLegacy(asTrimmed(raw.experience), extractBi(raw, "experience"));
  let centerName = fillFromLegacy(asTrimmed(raw.centerName) || asTrimmed(center?.name), {
    ar: asTrimmed(raw.centerNameAr) || asTrimmed(center?.nameAr),
    en: asTrimmed(raw.centerNameEn) || asTrimmed(center?.nameEn),
  });
  const centerAddress = fillFromLegacy(asTrimmed(raw.centerAddress) || asTrimmed(center?.address), {
    ar: asTrimmed(raw.centerAddressAr) || asTrimmed(center?.addressAr),
    en: asTrimmed(raw.centerAddressEn) || asTrimmed(center?.addressEn),
  });

  const specialtyKey = asTrimmed(raw.specialty) || catalogDoctor?.specialtyKey || "";
  const specialtyFromKey = specialtyKey ? SPECIALTY_LABELS[specialtyKey] : undefined;

  if (catalogDoctor) {
    name = { ar: name.ar || catalogDoctor.nameAr, en: name.en || catalogDoctor.nameEn };
    specialtyLabel = {
      ar: specialtyLabel.ar || catalogDoctor.specialtyAr,
      en: specialtyLabel.en || catalogDoctor.specialtyEn,
    };
    bio = { ar: bio.ar || catalogDoctor.bioAr, en: bio.en || catalogDoctor.bioEn };
    location = { ar: location.ar || catalogDoctor.locationAr, en: location.en || catalogDoctor.locationEn };
    availability = {
      ar: availability.ar || catalogDoctor.availabilityAr,
      en: availability.en || catalogDoctor.availabilityEn,
    };
    nextAvailable = {
      ar: nextAvailable.ar || catalogDoctor.nextAvailableAr,
      en: nextAvailable.en || catalogDoctor.nextAvailableEn,
    };
    experience = {
      ar: experience.ar || catalogDoctor.experienceAr,
      en: experience.en || catalogDoctor.experienceEn,
    };
    centerName = {
      ar: centerName.ar || catalogDoctor.centerNameAr,
      en: centerName.en || catalogDoctor.centerNameEn,
    };
  } else if (apiHit) {
    name = { ar: name.ar || apiHit.nameAr, en: name.en || apiHit.nameEn };
    specialtyLabel = {
      ar: specialtyLabel.ar || apiHit.specialtyAr,
      en: specialtyLabel.en || apiHit.specialtyEn,
    };
    bio = { ar: bio.ar || apiHit.bioAr, en: bio.en };
    location = { ar: location.ar || apiHit.locationAr, en: location.en };
  }

  if (specialtyFromKey) {
    specialtyLabel = {
      ar: specialtyLabel.ar || specialtyFromKey.ar,
      en: specialtyLabel.en || specialtyFromKey.en,
    };
  }

  const locPair = locationPair(location.en || location.ar || asTrimmed(raw.location));
  if (locPair) {
    location = { ar: location.ar || locPair.ar, en: location.en || locPair.en };
  }
  const avPair = availabilityPair(availability.en || asTrimmed(raw.availability));
  if (avPair) {
    availability = { ar: availability.ar || avPair.ar, en: availability.en || avPair.en };
  }
  const nxPair = nextAvailablePair(nextAvailable.en || asTrimmed(raw.nextAvailable));
  if (nxPair) {
    nextAvailable = { ar: nextAvailable.ar || nxPair.ar, en: nextAvailable.en || nxPair.en };
  }

  const education = mergeList(raw, "education");
  const certifications = mergeList(raw, "certifications");
  const languages = mergeList(raw, "languages");
  const services = mergeList(raw, "services");

  if (catalogDoctor) {
    if (!education.ar.length && !education.en.length) {
      education.ar = catalogDoctor.educationAr;
      education.en = catalogDoctor.educationEn;
    }
    if (!certifications.ar.length && !certifications.en.length) {
      certifications.ar = catalogDoctor.certificationsAr;
      certifications.en = catalogDoctor.certificationsEn;
    }
    if (!languages.ar.length && !languages.en.length) {
      languages.ar = catalogDoctor.languagesAr;
      languages.en = catalogDoctor.languagesEn;
    }
    if (!services.ar.length && !services.en.length) {
      services.ar = catalogDoctor.servicesAr;
      services.en = catalogDoctor.servicesEn;
    }
  }

  const id =
    asTrimmed(raw.id) ||
    asTrimmed(raw._id) ||
    catalogDoctor?.id ||
    `${name.en || name.ar || "doctor"}`;

  const nameAr = name.ar ?? "";
  const nameEn = name.en ?? "";
  const specialtyAr = specialtyLabel.ar || specialtyField.ar || "";
  const specialtyEn = specialtyLabel.en || specialtyField.en || "";

  return {
    id,
    clinicNameAr: asTrimmed(raw.clinicNameAr),
    clinicNameEn: asTrimmed(raw.clinicNameEn),
    addressAr: asTrimmed(raw.addressAr),
    addressEn: asTrimmed(raw.addressEn),
    mapUrl: asTrimmed(raw.mapUrl),
    latitude: typeof raw.latitude === "number" ? raw.latitude : undefined,
    longitude: typeof raw.longitude === "number" ? raw.longitude : undefined,
    specialty: specialtyKey,
    nameAr,
    nameEn,
    specialtyAr,
    specialtyEn,
    specialtyLabelAr: specialtyAr,
    specialtyLabelEn: specialtyEn,
    bioAr: bio.ar ?? "",
    bioEn: bio.en ?? "",
    locationAr: location.ar ?? "",
    locationEn: location.en ?? "",
    availabilityAr: availability.ar ?? "",
    availabilityEn: availability.en ?? "",
    nextAvailableAr: nextAvailable.ar ?? "",
    nextAvailableEn: nextAvailable.en ?? "",
    experienceAr: experience.ar ?? "",
    experienceEn: experience.en ?? "",
    educationAr: education.ar,
    educationEn: education.en,
    certificationsAr: certifications.ar,
    certificationsEn: certifications.en,
    languagesAr: languages.ar,
    languagesEn: languages.en,
    servicesAr: services.ar,
    servicesEn: services.en,
    centerNameAr: centerName.ar ?? "",
    centerNameEn: centerName.en ?? "",
    centerAddressAr: centerAddress.ar ?? "",
    centerAddressEn: centerAddress.en ?? "",
    name: nameAr || nameEn,
    specialtyLabel: specialtyEn || specialtyAr,
    experience: experience.en || experience.ar || "",
    rating: typeof raw.rating === "number" ? raw.rating : catalogDoctor?.rating ?? 0,
    reviews: typeof raw.reviews === "number" ? raw.reviews : catalogDoctor?.reviews ?? 0,
    availability: availability.en || availability.ar || "",
    verified: Boolean(raw.verified),
    color: asTrimmed(raw.color) || "#6E7CAF",
    bio: bio.en || bio.ar || "",
    education: education.en.length ? education.en : education.ar,
    certifications: certifications.en.length ? certifications.en : certifications.ar,
    languages: languages.en.length ? languages.en : languages.ar,
    services: services.en.length ? services.en : services.ar,
    location: location.en || location.ar || "",
    consultationFee: asTrimmed(raw.consultationFee) || "",
    nextAvailable: nextAvailable.en || nextAvailable.ar || "",
    email: asTrimmed(raw.email),
    phone: asTrimmed(raw.phone),
    image: asTrimmed(raw.image),
    centerId: asTrimmed(raw.centerId),
    centerName: centerName.en || centerName.ar || asTrimmed(raw.centerName) || asTrimmed(center?.name),
    centerAddress: centerAddress.en || centerAddress.ar || asTrimmed(raw.centerAddress) || asTrimmed(center?.address),
    centerPhone: asTrimmed(raw.centerPhone) || asTrimmed(center?.phone),
    centerEmail: raw.centerEmail as string | undefined,
    centerMapUrl: asTrimmed(raw.centerMapUrl) || asTrimmed(center?.mapUrl),
    centerLatitude: typeof raw.centerLatitude === "number" ? raw.centerLatitude : typeof center?.latitude === "number" ? center.latitude : undefined,
    centerLongitude: typeof raw.centerLongitude === "number" ? raw.centerLongitude : typeof center?.longitude === "number" ? center.longitude : undefined,
    createdAt: asTrimmed(raw.createdAt),
    updatedAt: asTrimmed(raw.updatedAt),
  };
}

export function doctorFromCatalog(doc: BilingualDoctor) {
  return normalizeProfessional({
    ...doc,
    specialty: doc.specialtyKey,
    specialtyLabel: doc.specialtyEn,
    name: doc.nameAr,
  });
}

export function listingLocaleName(
  listing: {
    name?: string;
    nameAr?: string;
    nameEn?: string;
  },
  isRTL: boolean,
  t: Translate,
): string {
  return doctorLocaleText(
    isRTL,
    { ar: listing.nameAr, en: listing.nameEn, legacy: listing.name },
    t,
  );
}

export function listingLocaleSubtitle(
  listing: {
    subtitle?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    tags?: string[];
  },
  isRTL: boolean,
  t: Translate,
): string {
  return doctorLocaleText(
    isRTL,
    {
      ar: listing.subtitleAr,
      en: listing.subtitleEn,
      legacy: listing.subtitle?.trim() || listing.tags?.[0],
    },
    t,
  );
}

export function centerLocale(isRTL: boolean, ar: string, en: string, legacy: string | undefined, t: Translate) {
  const fromDir = directoryText(legacy, isRTL, (value) => knownText(t, value));
  if (fromDir && (isRTL || !containsArabic(fromDir))) return fromDir;
  return doctorLocaleText(isRTL, { ar, en, legacy }, t);
}
