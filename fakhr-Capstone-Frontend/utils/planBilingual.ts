import { containsArabic } from "../constants/directoryBilingual";
import { knownText } from "./knownText";

export type BiFields = {
  ar?: string;
  en?: string;
};

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

/** Pulls `{ ar, en }` from nested objects used by APIs and future AI payloads. */
function nestedBi(value: unknown): BiFields {
  const rec = asRecord(value);
  if (!rec) return {};
  return {
    ar: asTrimmed(rec.ar) ?? asTrimmed(rec.arAR) ?? asTrimmed(rec.arabic),
    en: asTrimmed(rec.en) ?? asTrimmed(rec.enUS) ?? asTrimmed(rec.english),
  };
}

/**
 * Reads bilingual copies for one field from current and future API shapes:
 * titleAr / titleEn, title_ar / title_en, title: { ar, en }, i18n.title, localized.title
 */
export function extractBi(raw: Record<string, unknown> | undefined, base: string): BiFields {
  if (!raw) return {};
  const capitalized = base.charAt(0).toUpperCase() + base.slice(1);
  const fromNested = nestedBi(raw[base]);
  const fromI18n = nestedBi(asRecord(raw.i18n)?.[base]);
  const fromLocalized = nestedBi(asRecord(raw.localized)?.[base]);
  return {
    ar:
      asTrimmed(raw[`${base}Ar`]) ??
      asTrimmed(raw[`${base}_ar`]) ??
      asTrimmed(raw[`${base}AR`]) ??
      asTrimmed(raw[`ar${capitalized}`]) ??
      fromNested.ar ??
      fromI18n.ar ??
      fromLocalized.ar,
    en:
      asTrimmed(raw[`${base}En`]) ??
      asTrimmed(raw[`${base}_en`]) ??
      asTrimmed(raw[`${base}EN`]) ??
      asTrimmed(raw[`en${capitalized}`]) ??
      fromNested.en ??
      fromI18n.en ??
      fromLocalized.en,
  };
}

function firstNonArabic(values: Array<string | undefined>): string | undefined {
  return values.find((value) => value && !containsArabic(value));
}

/**
 * Locale picker for plan copy. English never falls back to Arabic.
 * Untranslated Arabic in English mode uses `planUi.missingTranslation`.
 * Set `allowArabicInEnglish` for proper nouns (child names).
 */
export function planLocaleText(
  isRTL: boolean,
  fields: BiFields & { legacy?: string },
  t: Translate,
  options?: { allowArabicInEnglish?: boolean },
): string {
  const ar = fields.ar?.trim() || undefined;
  const en = fields.en?.trim() || undefined;
  const legacy = fields.legacy?.trim() || undefined;
  const viaKnown = (value?: string) => {
    if (!value) return "";
    return knownText(t, value);
  };

  if (isRTL) {
    const candidate = ar || legacy || en || "";
    if (!candidate) return "";
    const translated = viaKnown(candidate);
    return translated || candidate;
  }

  const knownEn = [en, legacy, ar]
    .map((value) => viaKnown(value))
    .find((value) => value && !containsArabic(value));
  if (knownEn) return knownEn;

  const latin = firstNonArabic([en, legacy, ar]);
  if (latin) return latin;

  const leftover = ar || legacy || en || "";
  if (!leftover) return "";
  if (options?.allowArabicInEnglish) return leftover;
  if (containsArabic(leftover)) return t("planUi.missingTranslation");
  return leftover;
}

export function mergeBi(primary: BiFields, fallback?: BiFields): BiFields {
  return {
    ar: primary.ar || fallback?.ar,
    en: primary.en || fallback?.en,
  };
}
