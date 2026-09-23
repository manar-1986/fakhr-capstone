import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getCenterDetails } from "../../../api/directory.api";
import type { DirectoryListing } from "../../../components/directory/types";
import type { HealthCenter } from "../../../types/directory.types";
import { openInGoogleMaps } from "../../../utils/openMaps";
import { useTranslation } from "react-i18next";
import { knownText } from "../../../utils/knownText";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  body: palette.text,
  subtitle: palette.textMuted,
  icon: palette.primary,
  brand: palette.primary,
  star: palette.star,
  border: palette.border,
  tabBorder: palette.borderLight,
  white: palette.white,
  back: palette.textSecondary,
};

const DESIGN_W = 435;
const heroPhoto = require("../../../assets/images/school-details-hero.png");

type SchoolPayload = {
  name: string;
  city: string;
  rating: number;
  reviews: number;
  type: "public" | "private";
  branch: string;
  specialty: string;
  about: string;
  ageRange: string;
  stage: string;
  hours: string;
};

type TabKey = "about" | "gallery" | "programs" | "location" | "reviews";

const TABS: {
  key: TabKey;
  labelKey: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "about", labelKey: "copy.about", icon: "id-card-outline" },
  { key: "gallery", labelKey: "copy.gallery", icon: "images-outline" },
  { key: "programs", labelKey: "copy.programs", icon: "apps-outline" },
  { key: "location", labelKey: "copy.location", icon: "star-outline" },
  { key: "reviews", labelKey: "copy.reviews", icon: "star-outline" },
];

function parseSchool(raw: string | string[] | undefined): SchoolPayload | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return null;
  const tryParse = (x: string) => JSON.parse(x) as SchoolPayload;
  try {
    return tryParse(decodeURIComponent(s));
  } catch {
    try {
      return tryParse(s);
    } catch {
      return null;
    }
  }
}

function typeLabel(type: string | undefined, t: (key: string) => string) {
  if (type === "public" || type === "حكومي") return t("copy.gov");
  if (type === "private" || type === "خاص") return t("copy.priv");
  return type ? knownText(t, type) : t("copy.priv");
}

export default function SchoolDetailsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const { id, school: schoolParam } = useLocalSearchParams<{
    id?: string;
    school?: string;
  }>();
  const passed = useMemo(() => parseSchool(schoolParam), [schoolParam]);
  const [tab, setTab] = useState<TabKey>("about");

  const { data: center } = useQuery({
    queryKey: ["center", id],
    queryFn: () => getCenterDetails(id as string),
    enabled: !!id && id !== "undefined" && id.length > 0,
    retry: 1,
  });

  const name = passed?.name || center?.name || "مدرسة النور للتربية الخاصة";
  const city = passed?.city || center?.city || "حولي";
  const specialty =
    passed?.specialty || center?.specialties?.[0] || "صعوبات التعلم";
  const rating = passed?.rating ?? center?.rating ?? 4.8;
  const reviews = passed?.reviews ?? center?.reviews?.length ?? 128;
  const about =
    passed?.about ||
    center?.description ||
    "تقدم تعليماً متخصصاً وشاملاً للأطفال من ذوي الاحتياجات الخاصة، مع بيئة آمنة ومحفزة وبرامج تربوية متخصصة";
  const ageRange = passed?.ageRange || "3 - 18 سنة";
  const stage = passed?.stage || "ابتدائي - ثانوي";
  const hours = passed?.hours || center?.operatingHours || "7:30 ص - 1:30 م";
  const kind = typeLabel(center?.type || passed?.type, t);
  const cityLabel = knownText(t, city);
  const specialtyLabel = knownText(t, specialty);
  const aboutText = knownText(t, about);
  const ageLabel = knownText(t, ageRange);
  const stageLabel = knownText(t, stage);
  const hoursLabel = knownText(t, hours);
  const phone = center?.phone != null ? String(center.phone) : "";

  const goBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/directory/schools");
  };

  const handleCall = () => {
    if (!phone) {
      Alert.alert(t("copy.callTitle"), t("copy.phoneUnavailable"));
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() => {});
  };

  const handleOpenGoogleMaps = () => {
    const line = [center?.address, city]
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .join(", ");
    void openInGoogleMaps({
      mapUrl: center?.mapUrl,
      latitude: center?.latitude,
      longitude: center?.longitude,
      addressLine: line || city,
      placeName: name,
    });
  };

  const handleShare = () => {
    Share.share({ message: `${name}\n${city} - ${specialty}` }).catch(() => {});
  };

  const handleBook = () => {
    const listing: DirectoryListing = {
      id: id || center?.id || "school",
      kind: "center",
      name,
      subtitle: specialty,
      status: "OPEN",
      locationLine: city,
      rating: String(rating),
      imageUrl: "",
      tags: center?.specialties ?? [],
      phone: phone || "",
    };
    router.push({
      pathname: "/(tabs)/directory/booking",
      params: { item: encodeURIComponent(JSON.stringify(listing)) },
    });
  };

  const onTabPress = (key: TabKey) => {
    setTab(key);
  };

  const infoRows: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
  }[] = [
    { icon: "home-outline", label: t("copy.ageGroup"), value: ageLabel },
    { icon: "reader-outline", label: t("copy.stage"), value: stageLabel },
    { icon: "apps-outline", label: t("ui.type"), value: kind },
    { icon: "time-outline", label: t("copy.workingHours"), value: hoursLabel },
    { icon: "location-outline", label: t("copy.location"), value: cityLabel },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.page, { width: contentW }]}>
      <View style={styles.scrollWrap}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: ms(18),
          paddingBottom: ms(16),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { height: ms(44), marginHorizontal: ms(-8) }]}>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="chevron-back" size={ms(26)} color={colors.back} />
          </Pressable>
          <Pressable
            onPress={handleShare}
            hitSlop={12}
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("copy.share")}
          >
            <Ionicons name="person-add-outline" size={ms(22)} color={colors.icon} />
          </Pressable>
        </View>

        <Image
          source={heroPhoto}
          style={{
            width: "100%",
            height: ms(200),
            borderRadius: ms(18),
          }}
          resizeMode="cover"
        />

        <Text
          style={[
            styles.name,
            { fontSize: ms(22), lineHeight: ms(32), marginTop: ms(14) },
          ]}
        >
          {name}
        </Text>
        <Text
          style={[
            styles.sub,
            { fontSize: ms(13), lineHeight: ms(20), marginTop: ms(2) },
          ]}
        >
          {`${cityLabel} - ${specialtyLabel}`}
        </Text>
        <View style={[styles.ratingRow, { marginTop: ms(6), gap: ms(5) }]}>
          <Ionicons name="star" size={ms(15)} color={colors.star} />
          <Text style={[styles.ratingText, { fontSize: ms(13) }]}>
            {`${Number(rating).toFixed(1)} (${reviews})`}
          </Text>
        </View>

        <View style={[styles.tabs, { marginTop: ms(16), gap: ms(8) }]}>
          {TABS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => onTabPress(item.key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  minHeight: ms(64),
                  borderRadius: ms(14),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
            >
              <Ionicons name={item.icon} size={ms(22)} color={colors.icon} />
              <Text style={[styles.tabLabel, { fontSize: ms(11), marginTop: ms(4) }]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "about" ? (
          <AboutBlock
            about={aboutText}
            infoRows={infoRows}
            ms={ms}
          />
        ) : null}

        {tab === "programs" ? (
          <View style={{ marginTop: ms(18) }}>
            <Text style={[styles.sectionTitle, { fontSize: ms(20), lineHeight: ms(28) }]}>
              {t("copy.programs")}
            </Text>
            <Text
              style={[
                styles.body,
                { fontSize: ms(14), lineHeight: ms(24), marginTop: ms(8) },
              ]}
            >
              {(center?.specialties && center.specialties.length > 0
                ? center.specialties.map((item) => knownText(t, item)).join(
                    i18n.language.startsWith("en") ? ", " : "، ",
                  )
                : knownText(t, passed?.branch)) || specialtyLabel}
            </Text>
          </View>
        ) : null}

        {tab === "gallery" ? (
          <View style={{ marginTop: ms(18) }}>
            <Image
              source={heroPhoto}
              style={{ width: "100%", height: ms(188), borderRadius: ms(18) }}
              resizeMode="cover"
            />
          </View>
        ) : null}

        {tab === "location" ? (
          <View style={{ marginTop: ms(18) }}>
            <Text style={[styles.sectionTitle, { fontSize: ms(20), lineHeight: ms(28) }]}>
              {t("copy.location")}
            </Text>
            <Text style={[styles.body, { fontSize: ms(14), lineHeight: ms(24), marginTop: ms(8) }]}>
              {cityLabel}
              {center?.address ? `\n${center.address}` : ""}
            </Text>
          </View>
        ) : null}

        {tab === "reviews" ? (
          <ReviewsBlock center={center} rating={rating} reviews={reviews} ms={ms} />
        ) : null}

        <View style={[styles.contactRow, { marginTop: ms(18), gap: ms(10) }]}>
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.contactBtn,
              { minHeight: ms(48), borderRadius: ms(14) },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("copy.call")}
          >
            <Ionicons name="call-outline" size={ms(18)} color={colors.icon} />
            <Text style={[styles.contactLabel, { fontSize: ms(15) }]}>{t("copy.call")}</Text>
          </Pressable>
          <Pressable
            onPress={handleOpenGoogleMaps}
            style={({ pressed }) => [
              styles.contactBtn,
              { minHeight: ms(48), borderRadius: ms(14) },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("copy.location")}
          >
            <Ionicons name="location-outline" size={ms(18)} color={colors.icon} />
            <Text style={[styles.contactLabel, { fontSize: ms(15) }]}>{t("copy.location")}</Text>
          </Pressable>
        </View>
      </ScrollView>
      </View>

      <View
        style={[
          styles.ctaWrap,
          {
            paddingHorizontal: ms(18),
            paddingBottom: Math.max(insets.bottom, 10) + ms(8),
            paddingTop: ms(6),
          },
        ]}
      >
        <Pressable
          onPress={handleBook}
          style={({ pressed }) => [
            styles.cta,
            { minHeight: ms(52), borderRadius: ms(16) },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("copy.bookAppointment")}
        >
          <Text style={[styles.ctaText, { fontSize: ms(18) }]}>{t("copy.bookAppointment")}</Text>
        </Pressable>
      </View>
      </View>
    </SafeAreaView>
  );
}

function AboutBlock({
  about,
  infoRows,
  ms,
}: {
  about: string;
  infoRows: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    value: string;
  }[];
  ms: (n: number) => number;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ marginTop: ms(18) }}>
      <Text style={[styles.sectionTitle, { fontSize: ms(20), lineHeight: ms(28) }]}>
        {t("copy.aboutSchool")}
      </Text>
      <Text
        style={[
          styles.body,
          { fontSize: ms(14), lineHeight: ms(24), marginTop: ms(8) },
        ]}
      >
        {about}
      </Text>
      <View style={{ marginTop: ms(16), gap: ms(12) }}>
        {infoRows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Ionicons name={row.icon} size={ms(18)} color={colors.icon} />
            <Text style={[styles.infoText, { fontSize: ms(14), lineHeight: ms(22) }]}>
              {row.label}:{" "}
              <Text style={styles.infoValue}>{row.value}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ReviewsBlock({
  center,
  rating,
  reviews,
  ms,
}: {
  center?: HealthCenter;
  rating: number;
  reviews: number;
  ms: (n: number) => number;
}) {
  const { t } = useTranslation();
  const list = center?.reviews ?? [];
  return (
    <View style={{ marginTop: ms(18) }}>
      <Text style={[styles.sectionTitle, { fontSize: ms(20), lineHeight: ms(28) }]}>
        {t("copy.reviews")}
      </Text>
      <View style={[styles.ratingRow, { marginTop: ms(8), gap: ms(5) }]}>
        <Ionicons name="star" size={ms(15)} color={colors.star} />
        <Text style={[styles.ratingText, { fontSize: ms(13) }]}>
          {`${Number(rating).toFixed(1)} (${reviews})`}
        </Text>
      </View>
      {list.map((item) => (
        <View key={item.id} style={{ marginTop: ms(12) }}>
          <Text style={[styles.infoText, { fontSize: ms(14) }]}>{item.userName}</Text>
          <Text style={[styles.body, { fontSize: ms(13), lineHeight: ms(20) }]}>
            {item.comment}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  page: {
    flex: 1,
    alignSelf: "center",
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    backgroundColor: colors.bg,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollWrap: {
    flex: 1,
    minHeight: 0,
  },
  name: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sub: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  ratingText: {
    fontWeight: "600",
    color: colors.subtitle,
    writingDirection: "ltr",
  },
  tabs: {
    flexDirection: "row",
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.tabBorder,
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  tabLabel: {
    fontWeight: "700",
    color: colors.icon,
    writingDirection: "rtl",
  },
  sectionTitle: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  body: {
    fontWeight: "500",
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontWeight: "600",
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
  },
  infoValue: {
    fontWeight: "600",
    color: colors.body,
    writingDirection: "ltr",
  },
  contactRow: {
    flexDirection: "row",
    flexDirection: "row",
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactLabel: {
    fontWeight: "700",
    color: colors.icon,
    writingDirection: "rtl",
  },
  ctaWrap: {
    backgroundColor: colors.bg,
    flexShrink: 0,
  },
  cta: {
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontWeight: "800",
    color: colors.white,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
