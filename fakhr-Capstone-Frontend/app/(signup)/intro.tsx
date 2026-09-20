import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  body: "#3A3D4A",
  brand: "#6F80B4",
  white: "#FFFFFF",
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
    const next = role
      ? `/(signup)/interests?role=${role}`
      : "/(signup)/interests";
    router.push(next);
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
              fontSize: ms(28),
              lineHeight: ms(38),
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
              fontSize: ms(17),
              lineHeight: ms(26),
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
                  { fontSize: ms(16), lineHeight: ms(24) },
                ]}
                numberOfLines={1}
              >
                {t(key)}
              </Text>
              <Text
                style={[
                  styles.check,
                  { fontSize: ms(18), lineHeight: ms(24), width: ms(18) },
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
          <Text style={[styles.primaryButtonText, { fontSize: ms(18) }]}>
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
          <Text style={[styles.skipText, { fontSize: ms(17) }]}>{t("ui.skip")}</Text>
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
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    fontWeight: "700",
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
    flexDirection: "row",
  },
  featureText: {
    fontWeight: "600",
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
    flexShrink: 1,
  },
  check: {
    color: colors.brand,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 0,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontWeight: "700",
    color: colors.white,
    writingDirection: "rtl",
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontWeight: "700",
    color: colors.brand,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.85,
  },
});
