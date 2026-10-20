import { controls as sharedControls } from "../../theme/controls";
import { Text } from "../../components/ui/AppText";
import { typography } from "../../theme/typography";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { colors as palette } from "../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  body: palette.text,
  brand: palette.primary,
  white: palette.white,
};

const DESIGN_W = 387;
const ILLUSTRATION_W = 332;
const ILLUSTRATION_H = 310;

const FEATURE_KEYS = [
  "ui.trustedServices",
  "ui.easyAccess",
  "ui.tailoredExperience",
] as const;

export default function SignupWelcomeIntroScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const illW = Math.min(ms(ILLUSTRATION_W), contentW - ms(40));
  const illH = Math.round(illW * (ILLUSTRATION_H / ILLUSTRATION_W));

  const handleStart = () => {
    router.push({ pathname: "/(signup)/interests", params: role ? { role } : {} });
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            width: contentW,
            paddingHorizontal: ms(32),
            paddingTop: ms(18),
            paddingBottom: ms(20),
          },
        ]}
      >
        <Text
          style={[
            styles.heading,
            {
              fontSize: typography.title,
              lineHeight: typography.titleLineHeight,
              marginBottom: ms(12),
            },
          ]}
        >
          {t("home.welcomeToFakhr")}
        </Text>

        <Image
          source={require("../../assets/images/welcome-family.png")}
          style={{
            width: illW,
            height: illH,
            alignSelf: "center",
            marginBottom: ms(18),
          }}
          resizeMode="contain"
          accessibilityLabel={t("ui.kuwaitiFamily")}
        />

        <Text
          style={[
            styles.subtitle,
            {
              fontSize: typography.body,
              lineHeight: typography.bodyLineHeight,
              marginBottom: ms(16),
            },
          ]}
        >
          {t("ui.everythingOnePlace")}
        </Text>

        <View
          style={[
            styles.features,
            { gap: ms(12), marginBottom: ms(28), width: ms(268) },
          ]}
        >
          {FEATURE_KEYS.map((key) => (
            <View key={key} style={[styles.featureRow, { gap: ms(8) }]}>
              <Text
                style={[
                  styles.featureText,
                  { fontSize: typography.body, lineHeight: typography.bodyLineHeight },
                ]}
                numberOfLines={1}
              >
                {t(key)}
              </Text>
              <Text
                style={[
                  styles.check,
                  { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, width: ms(18) },
                ]}
              >
                ✓
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              minHeight: ms(58),
              borderRadius: ms(18),
            },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("ui.startNow")}
        >
          <Text style={[styles.primaryButtonText, { fontSize: typography.cardTitle }]}>
            {t("ui.startNow")}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          hitSlop={12}
          style={({ pressed }) => [
            styles.skipButton,
            { marginTop: ms(16) },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("ui.skip")}
        >
          <Text style={[styles.skipText, { fontSize: typography.body }]}>{t("ui.skip")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  content: {
    flex: 1,
    maxWidth: 430,
    alignSelf: "center",
  },
  heading: {
    fontWeight: typography.weightSemibold,
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    fontWeight: typography.weightRegular,
    color: colors.body,
    textAlign: "center",
    writingDirection: "rtl",
  },
  features: {
    alignItems: "stretch",
    alignSelf: "center",
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },
  featureText: {
    fontWeight: typography.weightMedium,
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
    flexShrink: 1,
  },
  check: {
    color: "#0B093B",
    fontWeight: typography.weightRegular,
    textAlign: "center",
    flexShrink: 0,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.brand,
    
    
   ...sharedControls.button },
  primaryButtonText: {
    fontWeight: typography.weightMedium,
    color: "#0B093B",
    writingDirection: "rtl",
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontWeight: typography.weightMedium,
    color: "#0B093B",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.85,
  },
});
