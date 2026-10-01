import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import {
  HOME_ACTIVITY_CATEGORIES,
  HOME_ACTIVITY_VIDEOS,
  thumbnailForVideo,
  youtubeIdFromUrl,
  type HomeActivityCategoryId,
  type HomeActivityVideo,
} from "../../../constants/homeActivityLibrary";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors as palette } from "../../../theme";

import { useAuth } from "../../../context/AuthContext";
import { addJourneyRecord } from "../../../utils/journeyStore";

const colors = {
  bg: palette.background,
  title: palette.textSecondary,
  text: palette.textSecondary,
  muted: palette.textMuted,
  selected: palette.primary,
  unselectedBg: palette.borderLight,
  unselectedText: palette.textSecondary,
  white: palette.white,
  playBg: "rgba(0,0,0,0.38)",
  durationBg: "rgba(35,40,55,0.78)",
};

const DESIGN_W = 390;

type FilterId = "all" | HomeActivityCategoryId;

async function openActivityVideo(url: string) {
  try {
    if (Platform.OS === "web") {
      await Linking.openURL(url);
      return;
    }
    await WebBrowser.openBrowserAsync(url);
  } catch {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert("Unable to open link", "This video link is not supported on your device.");
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open link", "Please try again later.");
    }
  }
}

export default function HomeActivityLibraryScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isRTL, dir, align } = useI18nLayout();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);
  const [filter, setFilter] = useState<FilterId>("all");

  const loc = (ar: string, en: string) => (isRTL ? ar : en);

  const videos = useMemo(() => {
    if (filter === "all") return HOME_ACTIVITY_VIDEOS;
    return HOME_ACTIVITY_VIDEOS.filter((item) => item.category === filter);
  }, [filter]);

  const categoryLabel = (id: HomeActivityCategoryId) => {
    const cat = HOME_ACTIVITY_CATEGORIES.find((c) => c.id === id);
    return cat ? loc(cat.labelAr, cat.labelEn) : id;
  };

  const openVideo = (item: HomeActivityVideo) => {
    if (!item.youtubeUrl.trim()) return;
    void openActivityVideo(item.youtubeUrl.trim());
    if (user) void addJourneyRecord(user.id, { type: "activity", action: "viewed", kind: "video", titleAr: item.titleAr, titleEn: item.titleEn, href: item.youtubeUrl }).catch(() => {
      Alert.alert(isRTL ? "تعذر حفظ النشاط" : "Activity could not be saved", isRTL ? "يمكنك متابعة مشاهدة الفيديو." : "You can still watch the video.");
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: ms(18),
            paddingTop: ms(10),
            paddingBottom: ms(108),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { height: ms(44), marginBottom: ms(8) }]}>
            <DisabilityAwareHeaderBackButton color={colors.title} />
            <Text
              style={[
                styles.title,
                {
                  fontSize: ms(22),
                  lineHeight: ms(30),
                  writingDirection: dir,
                },
              ]}
            >
              {t("ui.activitiesOneLine")}
            </Text>
          </View>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: ms(13),
                lineHeight: ms(20),
                marginBottom: ms(14),
                textAlign: "center",
                writingDirection: dir,
              },
            ]}
          >
            {t("activityLibrary.subtitle")}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: ms(8),
              paddingBottom: ms(14),
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <Pressable
              onPress={() => setFilter("all")}
              style={({ pressed }) => [
                styles.chip,
                {
                  minHeight: ms(38),
                  borderRadius: ms(10),
                  paddingHorizontal: ms(12),
                  backgroundColor:
                    filter === "all" ? colors.selected : colors.unselectedBg,
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === "all" }}
              accessibilityLabel={t("ui.all")}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    fontSize: ms(13),
                    color: filter === "all" ? colors.white : colors.unselectedText,
                    writingDirection: dir,
                  },
                ]}
              >
                {t("ui.all")}
              </Text>
            </Pressable>
            {HOME_ACTIVITY_CATEGORIES.map((cat) => {
              const selected = filter === cat.id;
              const label = loc(cat.labelAr, cat.labelEn);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setFilter(cat.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      minHeight: ms(38),
                      borderRadius: ms(10),
                      paddingHorizontal: ms(12),
                      backgroundColor: selected
                        ? colors.selected
                        : colors.unselectedBg,
                    },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={label}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        fontSize: ms(13),
                        color: selected ? colors.white : colors.unselectedText,
                        writingDirection: dir,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {videos.length === 0 ? (
            <Text
              style={[
                styles.empty,
                {
                  fontSize: ms(14),
                  lineHeight: ms(22),
                  textAlign: "center",
                  writingDirection: dir,
                },
              ]}
            >
              {t("activityLibrary.empty")}
            </Text>
          ) : (
            videos.map((item, index) => {
              const title = loc(item.titleAr, item.titleEn);
              const description = loc(item.descriptionAr, item.descriptionEn);
              const source = loc(item.sourceAr, item.sourceEn);
              const thumb = thumbnailForVideo(item);
              const isYoutube = Boolean(youtubeIdFromUrl(item.youtubeUrl));
              const actionLabel = isYoutube
                ? t("activityLibrary.watchVideo")
                : t("activityLibrary.viewContent");
              return (
                <Pressable
                  key={`${item.youtubeUrl}-${index}`}
                  onPress={() => openVideo(item)}
                  style={({ pressed }) => [
                    styles.card,
                    { marginBottom: ms(14), borderRadius: ms(16) },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${title}. ${actionLabel}`}
                >
                  <View
                    style={[
                      styles.thumbWrap,
                      { height: ms(168), backgroundColor: colors.selected },
                    ]}
                  >
                    {thumb ? (
                      <Image
                        source={{ uri: thumb }}
                        style={styles.thumb}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.playCircle}>
                      <Ionicons
                        name="play"
                        size={ms(26)}
                        color={colors.white}
                        style={{ marginLeft: 3 }}
                      />
                    </View>
                    {!!item.duration && (
                      <View
                        style={[
                          styles.durationBadge,
                          isRTL ? { left: 10 } : { right: 10 },
                        ]}
                      >
                        <Text style={styles.durationText}>{item.duration}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ paddingHorizontal: ms(14), paddingVertical: ms(12) }}>
                    <Text
                      style={[
                        styles.cardCategory,
                        {
                          fontSize: ms(11),
                          textAlign: align,
                          writingDirection: dir,
                        },
                      ]}
                    >
                      {categoryLabel(item.category)}
                    </Text>
                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          fontSize: ms(16),
                          lineHeight: ms(22),
                          textAlign: align,
                          writingDirection: dir,
                        },
                      ]}
                    >
                      {title}
                    </Text>
                    {!!description && (
                      <Text
                        style={[
                          styles.cardBody,
                          {
                            fontSize: ms(13),
                            lineHeight: ms(19),
                            marginTop: ms(4),
                            textAlign: align,
                            writingDirection: dir,
                          },
                        ]}
                        numberOfLines={3}
                      >
                        {description}
                      </Text>
                    )}
                    {!!source && (
                      <Text
                        style={[
                          styles.cardSource,
                          {
                            fontSize: ms(12),
                            marginTop: ms(8),
                            textAlign: align,
                            writingDirection: dir,
                          },
                        ]}
                      >
                        {source}
                      </Text>
                    )}
                    {!isYoutube && (
                      <View
                        style={[
                          styles.cta,
                          {
                            marginTop: ms(12),
                            minHeight: ms(40),
                            borderRadius: ms(12),
                            alignSelf: isRTL ? "flex-end" : "flex-start",
                            paddingHorizontal: ms(16),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.ctaText,
                            { fontSize: ms(14), writingDirection: dir },
                          ]}
                        >
                          {actionLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
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
  column: {
    flex: 1,
    maxWidth: 430,
    width: "100%",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
  },
  subtitle: {
    fontWeight: "500",
    color: colors.muted,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  thumbWrap: {
    width: "100%",
    backgroundColor: colors.unselectedBg,
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  playCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    backgroundColor: colors.playBg,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 10,
    backgroundColor: colors.durationBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  durationText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  cardCategory: {
    fontWeight: "700",
    color: colors.selected,
    marginBottom: 4,
  },
  cardTitle: {
    fontWeight: "800",
    color: colors.text,
  },
  cardBody: {
    fontWeight: "500",
    color: colors.text,
    opacity: 0.78,
  },
  cardSource: {
    fontWeight: "600",
    color: colors.muted,
  },
  cta: {
    backgroundColor: colors.selected,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontWeight: "700",
    color: colors.white,
  },
  empty: {
    fontWeight: "500",
    color: colors.muted,
    marginTop: 24,
  },
  pressed: {
    opacity: 0.88,
  },
});
