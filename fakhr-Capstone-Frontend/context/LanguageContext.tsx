import { useLocales } from "expo-localization";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  applyLayoutDirection,
  changeAppLanguage,
  getDeviceLanguage,
  normalizeLanguage,
  reloadForLayoutDirection,
  resolveStoredOrDeviceLanguage,
  type AppLanguage,
} from "../i18n";

interface LanguageContextType {
  locale: AppLanguage;
  isRTL: boolean;
  setLocale: (locale: AppLanguage) => void;
  t: (key: string, options?: object) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const deviceLocales = useLocales();
  const [locale, setLocaleState] = useState<AppLanguage>(() =>
    normalizeLanguage(i18n.language)
  );

  useEffect(() => {
    let cancelled = false;

    const syncLanguage = async () => {
      const resolved = await resolveStoredOrDeviceLanguage(deviceLocales);
      if (cancelled) return;

      const needsReload = applyLayoutDirection(resolved);
      if (normalizeLanguage(i18n.language) !== resolved) {
        await i18n.changeLanguage(resolved);
      }
      if (!cancelled) {
        setLocaleState(resolved);
      }
      if (needsReload) {
        await reloadForLayoutDirection();
      }
    };

    void syncLanguage();
    return () => {
      cancelled = true;
    };
  }, [deviceLocales, i18n]);

  useEffect(() => {
    const onChanged = (lng: string) => {
      setLocaleState(normalizeLanguage(lng));
    };
    i18n.on("languageChanged", onChanged);
    return () => {
      i18n.off("languageChanged", onChanged);
    };
  }, [i18n]);

  const isRTL = locale === "ar";

  const value = useMemo<LanguageContextType>(
    () => ({
      locale,
      isRTL,
      setLocale: (newLocale: AppLanguage) => {
        setLocaleState(newLocale);
        void changeAppLanguage(newLocale);
      },
      t: (key: string, options?: object) => String(t(key, options)),
    }),
    [locale, isRTL, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { getDeviceLanguage };
