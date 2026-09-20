import { useLanguage } from "../context/LanguageContext";

export function useI18nLayout() {
  const { isRTL, locale } = useLanguage();
  return {
    isRTL,
    locale,
    dir: (isRTL ? "rtl" : "ltr") as "rtl" | "ltr",
    align: (isRTL ? "right" : "left") as "left" | "right",
    tabRow: (isRTL ? "row-reverse" : "row") as "row" | "row-reverse",
  };
}
