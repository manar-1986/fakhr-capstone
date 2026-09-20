import * as Localization from "expo-localization";
import type { Locale } from "expo-localization";
import * as SecureStore from "../utils/secureStorage";
import * as Updates from "expo-updates";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DevSettings, I18nManager, NativeModules, Platform } from "react-native";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export type AppLanguage = "en" | "ar";

export const LANGUAGE_STORAGE_KEY = "fakhr.language";

const ARAB_REGIONS = new Set([
  "IQ",
  "SA",
  "AE",
  "KW",
  "BH",
  "OM",
  "QA",
  "YE",
  "JO",
  "PS",
  "LB",
  "SY",
  "EG",
  "SD",
  "LY",
  "TN",
  "DZ",
  "MA",
  "MR",
]);

function isArabicText(value: string | null | undefined): boolean {
  const v = (value ?? "").toLowerCase().replace("_", "-");
  return v === "ar" || v.startsWith("ar-") || v.startsWith("ar_");
}

function isArabicLocale(locale: Locale): boolean {
  if (isArabicText(locale.languageCode)) return true;
  if (isArabicText(locale.languageTag)) return true;
  if (locale.languageScriptCode?.toLowerCase() === "arab") return true;
  if (locale.textDirection === "rtl" && !locale.languageCode) return true;
  return false;
}

function getNativeLocaleString(): string {
  try {
    if (Platform.OS === "ios") {
      const settings = NativeModules.SettingsManager?.settings;
      const apple = settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
      return typeof apple === "string" ? apple : "";
    }
    const id = NativeModules.I18nManager?.localeIdentifier;
    return typeof id === "string" ? id : "";
  } catch {
    return "";
  }
}

export function normalizeLanguage(value: string | undefined | null): AppLanguage {
  return isArabicText(value) ? "ar" : "en";
}

export function getDeviceLanguage(
  locales: Locale[] = Localization.getLocales()
): AppLanguage {
  if (locales.some(isArabicLocale)) {
    return "ar";
  }

  const native = getNativeLocaleString();
  if (isArabicText(native)) {
    return "ar";
  }

  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (isArabicText(intlLocale)) {
      return "ar";
    }
  } catch {
    /* ignore */
  }

  const region = (
    locales[0]?.regionCode ||
    locales[0]?.languageRegionCode ||
    ""
  ).toUpperCase();
  if (ARAB_REGIONS.has(region)) {
    return "ar";
  }

  return "en";
}

/** true for Arabic (RTL), false for English (LTR). Returns whether a reload is needed. */
export function applyLayoutDirection(language: AppLanguage): boolean {
  const shouldBeRTL = language === "ar";
  I18nManager.allowRTL(shouldBeRTL);
  I18nManager.forceRTL(shouldBeRTL);
  return I18nManager.isRTL !== shouldBeRTL;
}

export async function reloadForLayoutDirection() {
  try {
    await Updates.reloadAsync();
  } catch {
    if (typeof DevSettings?.reload === "function") {
      DevSettings.reload();
    }
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "ar",
  fallbackLng: "ar",
  supportedLngs: ["en", "ar"],
  nonExplicitSupportedLngs: true,
  load: "languageOnly",
  initImmediate: false,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  react: {
    useSuspense: false,
  },
});

applyLayoutDirection(normalizeLanguage(i18n.language));

export async function changeAppLanguage(language: AppLanguage) {
  try {
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* web / unavailable */
  }
  applyLayoutDirection(language);
  await i18n.changeLanguage(language);
  await reloadForLayoutDirection();
}

export async function resolveStoredOrDeviceLanguage(
  locales: Locale[] = Localization.getLocales()
): Promise<AppLanguage> {
  try {
    const stored = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "ar";
}

export const setLocale = (locale: AppLanguage) => {
  void changeAppLanguage(locale);
};

export const getLocale = (): AppLanguage => {
  return normalizeLanguage(i18n.language);
};

export default i18n;
