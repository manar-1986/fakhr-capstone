import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";
import { useI18nLayout } from "../hooks/useI18nLayout";
import { colors as palette } from "../theme";
import WelcomeScreen from "./(auth)/welcome";
import SignupWelcomeIntroScreen from "./(signup)/intro";
import UserTypeSelectionScreen from "./(signup)/user-type";

/**
 * LOCAL TESTING ONLY — not linked from production navigation.
 * Open /local-test: Fakhr intro → user type → existing Welcome (Create Account / Login).
 */
type TestStep = 1 | 2 | 3;

export default function LocalOnboardingTestPage() {
  const { locale, setLocale } = useLanguage();
  const { dir, tabRow } = useI18nLayout();
  const [step, setStep] = useState<TestStep>(1);

  const goNext = () => setStep((s) => (s === 3 ? 3 : ((s + 1) as TestStep)));
  const goBack = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as TestStep)));

  return (
    <View style={styles.root} accessibilityLanguage={locale}>
      <View style={[styles.bar, { flexDirection: tabRow }]}>
        <Text style={styles.barTitle}>
          LOCAL TEST · {step}/3
        </Text>
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

      <View style={styles.stage} collapsable={false}>
        {step === 1 ? <SignupWelcomeIntroScreen /> : null}
        {step === 2 ? <UserTypeSelectionScreen /> : null}
        {step === 3 ? <WelcomeScreen /> : null}
      </View>

      <View style={[styles.footer, { flexDirection: tabRow }]}>
        <Pressable
          onPress={goBack}
          disabled={step === 1}
          style={[styles.navBtn, step === 1 && styles.navBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={locale === "ar" ? "السابق" : "Back"}
        >
          <Text style={styles.navBtnText}>
            {locale === "ar" ? "السابق" : "Back"}
          </Text>
        </Pressable>
        <Text style={styles.stepHint} nativeID="local-test-dir">
          {dir.toUpperCase()}
        </Text>
        <Pressable
          onPress={goNext}
          disabled={step === 3}
          style={[styles.navBtn, styles.navBtnPrimary, step === 3 && styles.navBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={locale === "ar" ? "التالي" : "Next"}
        >
          <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>
            {locale === "ar" ? "التالي" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
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
  },
  footer: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.brandPale,
    borderTopWidth: 1,
    borderTopColor: palette.brandMuted,
    gap: 8,
  },
  navBtn: {
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.brandMuted,
  },
  navBtnPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: palette.textSecondary,
  },
  navBtnPrimaryText: {
    color: palette.white,
  },
  stepHint: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.brandMuted,
  },
});
