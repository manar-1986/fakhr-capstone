import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../context/LanguageContext";
import { useI18nLayout } from "../hooks/useI18nLayout";
import { colors as palette } from "../theme";

/**
 * LOCAL TESTING ONLY — not linked from production navigation.
 * Open /local-test-2 on Expo Web.
 */
export default function LocalTest2Page() {
  const { locale, setLocale } = useLanguage();
  const { dir, align, isRTL, tabRow } = useI18nLayout();
  const title = isRTL ? "صفحة اختبار محلية" : "Local test page";
  const body = isRTL
    ? "هذه صفحة مؤقتة لتجربة تصميم أو ميزة جديدة. ليست جزءاً من التطبيق الأساسي."
    : "This is a temporary page for testing a new design or feature. It is not part of the main app.";

  return (
    <SafeAreaView
      style={[styles.root, { direction: isRTL ? "rtl" : "ltr" }]}
      edges={["top", "bottom"]}
      accessibilityLanguage={locale}
    >
      <View style={[styles.bar, { flexDirection: tabRow }]}>
        <Text style={styles.barTitle}>LOCAL TEST 2</Text>
        <View style={[styles.langRow, { flexDirection: tabRow }]}>
          <Pressable
            onPress={() => setLocale("en")}
            style={[styles.langBtn, locale === "en" && styles.langBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: locale === "en" }}
            accessibilityLabel="English"
          >
            <Text style={[styles.langText, locale === "en" && styles.langTextOn]}>
              EN
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale("ar")}
            style={[styles.langBtn, locale === "ar" && styles.langBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: locale === "ar" }}
            accessibilityLabel="العربية"
          >
            <Text style={[styles.langText, locale === "ar" && styles.langTextOn]}>
              AR
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.stage}>
        <Text
          style={[
            styles.title,
            { textAlign: align, writingDirection: dir },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.body,
            { textAlign: align, writingDirection: dir },
          ]}
        >
          {body}
        </Text>
        <Text style={[styles.meta, { writingDirection: dir }]}>
          {dir.toUpperCase()} · {locale.toUpperCase()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  bar: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.primary,
    gap: 8,
  },
  barTitle: {
    color: palette.white,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  langRow: {
    gap: 8,
  },
  langBtn: {
    minWidth: 40,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: palette.brandSoft,
  },
  langBtnOn: {
    backgroundColor: palette.white,
  },
  langText: {
    color: palette.textSecondary,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  langTextOn: {
    color: palette.primary,
  },
  stage: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.text,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
    color: palette.textMuted,
    marginBottom: 16,
  },
  meta: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.primary,
  },
});
