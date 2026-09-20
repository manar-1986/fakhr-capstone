import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WEB_PHONE_WIDTH } from "../../../components/layout/WebAppShell";
import {
  DISABILITY_GUIDES,
  localizeGuide,
} from "../../../constants/disabilityGuides";
import { useTranslation } from "react-i18next";

const colors = {
  bg: "#F7F8FC",
  white: "#FFFFFF",
  title: "#3B4A8A",
  heading: "#3D4A86",
  body: "#4A5168",
  muted: "#8A90A8",
  brand: "#6F80B4",
  brandSoft: "#EEF1FA",
  cardBorder: "#EEF0F6",
  disclaimerBg: "#F4F1FB",
  disclaimerBorder: "#D9D4EE",
  back: "#3A4060",
};

const DESIGN_W = 390;

export default function DisabilityDetailsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth || WEB_PHONE_WIDTH, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const guide = useMemo(() => {
    const base = id && DISABILITY_GUIDES[id] ? DISABILITY_GUIDES[id] : DISABILITY_GUIDES.autism;
    return localizeGuide(base, i18n.language);
  }, [id, i18n.language]);

  const goBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/resources");
  };

  const openSpecialists = () => {
    router.navigate("/directory/professionals");
  };

  const openRelatedExplore = () => {
    router.navigate({
      pathname: "/(tabs)/discover",
      params: {
        related: guide.id,
        category: guide.exploreCategory,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            paddingHorizontal: ms(20),
            paddingTop: ms(4),
            paddingBottom: ms(160),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { height: ms(44), marginBottom: ms(10) }]}>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="chevron-back" size={ms(26)} color={colors.back} />
          </Pressable>
          <Text
            style={[styles.headerTitle, { fontSize: ms(18), lineHeight: ms(26) }]}
            numberOfLines={1}
          >
            {t("copy.knowDisability")}
          </Text>
        </View>

        <View
          style={[
            styles.hero,
            {
              backgroundColor: guide.backgroundColor,
              borderRadius: ms(20),
              padding: ms(16),
              marginBottom: ms(16),
            },
          ]}
        >
          <View
            style={[
              styles.heroIcon,
              {
                width: ms(52),
                height: ms(52),
                borderRadius: ms(16),
                backgroundColor: colors.white,
              },
            ]}
          >
            <Ionicons name={guide.icon} size={ms(26)} color={guide.iconColor} />
          </View>
          <Text
            style={[
              styles.heroName,
              { fontSize: ms(22), lineHeight: ms(32), marginTop: ms(10) },
            ]}
          >
            {guide.name}
          </Text>
        </View>

        <Section title={t("copy.simpleDef")} ms={ms}>
          <Text style={[styles.body, { fontSize: ms(14), lineHeight: ms(24) }]}>
            {guide.definition}
          </Text>
        </Section>

        <Section title={t("copy.commonSigns")} ms={ms}>
          {guide.signs.map((item) => (
            <Bullet key={item} text={item} ms={ms} />
          ))}
        </Section>

        <Section title={t("copy.whenToSeek")} ms={ms}>
          {guide.whenToSeek.map((item) => (
            <Bullet key={item} text={item} ms={ms} />
          ))}
        </Section>

        <Section title={t("copy.helpAtHome")} ms={ms}>
          {guide.homeSupport.map((item) => (
            <Bullet key={item} text={item} ms={ms} />
          ))}
        </Section>

        <View
          style={[
            styles.disclaimer,
            {
              borderRadius: ms(16),
              padding: ms(14),
              marginBottom: ms(18),
            },
          ]}
        >
          <View style={styles.disclaimerHead}>
            <Text style={[styles.disclaimerTitle, { fontSize: ms(13) }]}>
              {t("copy.importantNote")}
            </Text>
            <Ionicons name="information-circle" size={ms(18)} color={colors.brand} />
          </View>
          <Text
            style={[
              styles.disclaimerText,
              { fontSize: ms(13), lineHeight: ms(22), marginTop: ms(6) },
            ]}
          >
            {t("copy.disclaimer")}
          </Text>
        </View>

        <Pressable
          onPress={openSpecialists}
          style={({ pressed }) => [
            styles.primaryBtn,
            { minHeight: ms(48), borderRadius: ms(16) },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("copy.findSpecialist")}
        >
          <Ionicons name="search-outline" size={ms(18)} color={colors.white} />
          <Text style={[styles.primaryBtnText, { fontSize: ms(15) }]}>
            {t("copy.findSpecialist")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openRelatedExplore}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              minHeight: ms(48),
              borderRadius: ms(16),
              marginTop: ms(10),
            },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("copy.relatedContent")}
        >
          <Ionicons name="compass-outline" size={ms(18)} color={colors.brand} />
          <Text style={[styles.secondaryBtnText, { fontSize: ms(15) }]}>
            {t("copy.relatedContent")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
  ms,
}: {
  title: string;
  children: React.ReactNode;
  ms: (n: number) => number;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: ms(18),
          padding: ms(14),
          marginBottom: ms(12),
        },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          { fontSize: ms(15), lineHeight: ms(24), marginBottom: ms(8) },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Bullet({
  text,
  ms,
}: {
  text: string;
  ms: (n: number) => number;
}) {
  return (
    <View style={[styles.bulletRow, { marginBottom: ms(8) }]}>
      <Text style={[styles.body, { flex: 1, fontSize: ms(13), lineHeight: ms(22) }]}>
        {text}
      </Text>
      <View
        style={[
          styles.dot,
          {
            width: ms(7),
            height: ms(7),
            borderRadius: ms(4),
            marginTop: ms(8),
            marginLeft: ms(8),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignSelf: "center",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerTitle: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  hero: {
    alignItems: "flex-end",
  },
  heroIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    shadowColor: "#8A94B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: "800",
    color: colors.heading,
    textAlign: "right",
    writingDirection: "rtl",
  },
  body: {
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dot: {
    backgroundColor: colors.brand,
  },
  disclaimer: {
    backgroundColor: colors.disclaimerBg,
    borderWidth: 1,
    borderColor: colors.disclaimerBorder,
  },
  disclaimerHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  disclaimerTitle: {
    fontWeight: "800",
    color: colors.heading,
    writingDirection: "rtl",
  },
  disclaimerText: {
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
  },
  primaryBtn: {
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "800",
    writingDirection: "rtl",
  },
  secondaryBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    color: colors.brand,
    fontWeight: "800",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
