import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { I18nManager, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  bg: "#6F80B4",
  white: "#FFFFFF",
  buttonFill: "#F9FDFE",
  buttonText: "#55576A",
};

const DESIGN_W = 379;

export default function WelcomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const handleGetStarted = () => {
    router.replace("/(signup)");
  };

  const handleAlreadyHaveAccount = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <View style={[styles.content, { width: contentW, paddingHorizontal: ms(31) }]}>
        <View style={[styles.hero, { paddingTop: ms(62) }]}>
          <View style={{ width: ms(117), height: ms(164), marginBottom: ms(36) }}>
            <Image
              source={require("../../assets/images/fakhr-wordmark.png")}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="فخر"
            />
          </View>
          <Text
            style={[
              styles.tagline,
              { fontSize: ms(22), lineHeight: ms(36) },
            ]}
          >
            {"منصة ذكية لخدمة\nذوي الاحتياجات الخاصة\nو أسرهم"}
          </Text>
        </View>

        <View style={[styles.actions, { marginTop: ms(44) }]}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                minHeight: ms(64),
                borderRadius: ms(20),
                marginBottom: ms(16),
              },
            ]}
            onPress={handleGetStarted}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="إنشاء حساب جديد"
          >
            <Text style={[styles.primaryButtonText, { fontSize: ms(17) }]}>
              إنشاء حساب جديد
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                minHeight: ms(64),
                borderRadius: ms(20),
              },
            ]}
            onPress={handleAlreadyHaveAccount}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="تسجيل الدخول"
          >
            <Text style={[styles.secondaryButtonText, { fontSize: ms(17) }]}>
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.features,
            I18nManager.isRTL && styles.featuresRtl,
            { paddingBottom: ms(28) },
          ]}
        >
          <View style={styles.feature}>
            <Ionicons
              name="shield-checkmark-outline"
              size={ms(34)}
              color={colors.white}
            />
            <Text style={[styles.featureText, { fontSize: ms(13), lineHeight: ms(20) }]}>
              {"موثوقة لحماية\nالبيانات"}
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flash" size={ms(34)} color={colors.white} />
            <Text style={[styles.featureText, { fontSize: ms(13), lineHeight: ms(20) }]}>
              {"سهولة\nوسرعة"}
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons
              name="lock-closed-outline"
              size={ms(34)}
              color={colors.white}
            />
            <Text style={[styles.featureText, { fontSize: ms(13), lineHeight: ms(20) }]}>
              {"متنوعة\nللخدمات"}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    maxWidth: 430,
    alignSelf: "center",
  },
  hero: {
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  tagline: {
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
    writingDirection: "rtl",
  },
  actions: {},
  primaryButton: {
    backgroundColor: colors.buttonFill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontWeight: "600",
    color: colors.buttonText,
    writingDirection: "rtl",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.white,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontWeight: "600",
    color: colors.white,
    writingDirection: "rtl",
  },
  features: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  featuresRtl: {
    flexDirection: "row-reverse",
  },
  feature: {
    flex: 1,
    alignItems: "center",
  },
  featureText: {
    marginTop: 8,
    fontWeight: "500",
    color: colors.white,
    textAlign: "center",
    writingDirection: "rtl",
    minHeight: 40,
  },
});
