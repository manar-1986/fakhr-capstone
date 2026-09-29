import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { centersListQueryKey, getCenters } from "../../../api/directory.api";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import type { HealthCenter } from "../../../types/directory.types";
import {
  BILINGUAL_CENTERS,
  centerDisplayName,
  centerDisplaySpecialty,
  type BilingualCenter,
  type CenterType,
} from "../../../constants/directoryBilingual";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  subtitle: palette.textMuted,
  filter: palette.textSecondary,
  placeholder: palette.textLight,
  searchBorder: palette.border,
  chipBorder: palette.border,
  star: palette.star,
  chevron: palette.chevron,
  button: palette.primary,
  overlay: "rgba(26, 28, 41, 0.35)",
  white: palette.white,
};

const DESIGN_W = 390;
const PAGE_SIZE = 4;

const PHOTOS = [
  require("../../../assets/images/center-1.png"),
  require("../../../assets/images/center-2.png"),
  require("../../../assets/images/center-3.png"),
  require("../../../assets/images/center-4.png"),
];

const CENTERS = BILINGUAL_CENTERS;

const SPECIALTY_OPTIONS = [
  { key: "all", labelAr: "الكل", labelEn: "All" },
  ...Array.from(
    new Map(
      CENTERS.map((center) => [
        center.specialtyKey,
        { key: center.specialtyKey, labelAr: center.specialtyAr, labelEn: center.specialtyEn },
      ]),
    ).values(),
  ),
];
const TYPE_OPTIONS: { value: CenterType | "all" }[] = [
  { value: "all" },
  { value: "private" },
  { value: "public" },
];
const RATING_OPTIONS: { value: "all" | "high" | "4.5" | "4.0" }[] = [
  { value: "all" },
  { value: "high" },
  { value: "4.5" },
  { value: "4.0" },
];

type PickerKind = "specialty" | "type" | "rating" | null;

function centerIdOf(center?: HealthCenter) {
  if (!center) return undefined;
  return center.id || (center as { _id?: string })._id;
}

export default function CentersScreen() {
  const { t } = useTranslation();
  const { align, isRTL, dir } = useI18nLayout();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [type, setType] = useState<CenterType | "all">("all");
  const [ratingFilter, setRatingFilter] = useState<
    "all" | "high" | "4.5" | "4.0"
  >("all");
  const [picker, setPicker] = useState<PickerKind>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: apiCenters = [] } = useQuery({
    queryKey: centersListQueryKey(),
    queryFn: () => getCenters(),
  });

  const rows = useMemo(() => {
    const q = search.trim();
    const filtered = CENTERS.filter((center) => {
      if (specialty !== "all" && center.specialtyKey !== specialty) return false;
      if (type !== "all" && center.type !== type) return false;
      if (ratingFilter === "4.5" && center.rating < 4.5) return false;
      if (ratingFilter === "4.0" && center.rating < 4.0) return false;
      if (!q) return true;
      const hay = `${center.nameAr} ${center.nameEn} ${center.specialtyAr} ${center.specialtyEn}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    if (ratingFilter === "high") {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  }, [search, specialty, type, ratingFilter]);

  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const openCenter = (center: BilingualCenter) => {
    const index = CENTERS.findIndex((item) => item.id === center.id);
    const id = centerIdOf(apiCenters[index] ?? apiCenters[0]);
    router.push({
      pathname: "/(tabs)/directory/center-details",
      params: {
        id: id ?? "",
        listing: encodeURIComponent(JSON.stringify(center)),
      },
    });
  };

  const pickerTitle =
    picker === "specialty"
      ? t("ui.specialty")
      : picker === "type"
        ? t("ui.type")
        : t("ui.rating");

  const pickerOptions =
    picker === "specialty"
      ? SPECIALTY_OPTIONS.map((item) => ({
          label: item.key === "all" ? t("ui.all") : isRTL ? item.labelAr : item.labelEn,
          onSelect: () => setSpecialty(item.key),
        }))
      : picker === "type"
        ? TYPE_OPTIONS.map((item) => ({
            label:
              item.value === "all"
                ? t("ui.all")
                : item.value === "private"
                  ? t("ui.private")
                  : t("ui.public"),
            onSelect: () => setType(item.value),
          }))
        : RATING_OPTIONS.map((item) => ({
            label:
              item.value === "all"
                ? t("ui.all")
                : item.value === "high"
                  ? t("ui.highestRated")
                  : item.value === "4.5"
                    ? t("ui.rating45")
                    : t("ui.rating40"),
            onSelect: () => setRatingFilter(item.value),
          }));

  return (
    <SafeAreaView style={[styles.safe, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: ms(18),
            paddingTop: ms(6),
            paddingBottom: ms(108),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { height: ms(44), marginBottom: ms(10) }]}>
          <DisabilityAwareHeaderBackButton color={colors.title} />
          <Text style={[styles.title, { fontSize: ms(26), lineHeight: ms(34), writingDirection: dir }]}>
            {t("ui.centers")}
          </Text>
        </View>

        <View
          style={[
            styles.searchBar,
            {
              minHeight: ms(44),
              borderRadius: ms(22),
              paddingHorizontal: ms(14),
              marginBottom: ms(12),
              gap: ms(8),
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <TextInput
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder={t("ui.searchCenter")}
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { fontSize: ms(14), writingDirection: dir }]}
            textAlign={align}
            returnKeyType="search"
          />
          <Ionicons
            name="search-outline"
            size={ms(20)}
            color={colors.placeholder}
          />
        </View>

        <View
          style={[
            styles.filterRow,
            {
              marginBottom: ms(16),
              gap: ms(8),
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <View style={styles.chipWrap}>
            <FilterChip
              label={t("ui.rating")}
              size={ms}
              onPress={() => setPicker("rating")}
            />
          </View>
          <View style={styles.chipWrap}>
            <FilterChip
              label={t("ui.type")}
              size={ms}
              onPress={() => setPicker("type")}
            />
          </View>
          <View style={styles.chipWrap}>
            <FilterChip
              label={t("ui.specialty")}
              size={ms}
              onPress={() => setPicker("specialty")}
            />
          </View>
        </View>

        <View style={{ gap: ms(16), width: "100%" }}>
          {visibleRows.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                {
                  fontSize: ms(14),
                  textAlign: isRTL ? "right" : "left",
                  writingDirection: dir,
                },
              ]}
            >
              {t("common.noResults")}
            </Text>
          ) : null}
          {visibleRows.map((center) => {
            const index = CENTERS.findIndex((item) => item.id === center.id);
            const photoW = ms(108);
            const photoH = ms(80);
            const name = centerDisplayName(center, isRTL);
            const specialtyLabel = centerDisplaySpecialty(center, isRTL);
            return (
              <Pressable
                key={center.id}
                onPress={() => openCenter(center)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    gap: ms(10),
                    minHeight: photoH,
                    flexDirection: isRTL ? "row-reverse" : "row",
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={name}
              >
                <Image
                  source={PHOTOS[index % PHOTOS.length]}
                  style={{
                    width: photoW,
                    height: photoH,
                    borderRadius: ms(12),
                  }}
                  resizeMode="cover"
                />
                <View style={[styles.info, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                  <Text
                    style={[
                      styles.centerName,
                      {
                        fontSize: ms(15),
                        lineHeight: ms(22),
                        textAlign: isRTL ? "right" : "left",
                        writingDirection: dir,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  <Text
                    style={[
                      styles.centerSpecialty,
                      {
                        fontSize: ms(12),
                        lineHeight: ms(18),
                        marginTop: ms(1),
                        textAlign: isRTL ? "right" : "left",
                        writingDirection: dir,
                      },
                    ]}
                  >
                    {specialtyLabel}
                  </Text>
                  <View
                    style={[
                      styles.ratingRow,
                      {
                        marginTop: ms(4),
                        gap: ms(4),
                        flexDirection: "row",
                      },
                    ]}
                  >
                    <Ionicons name="star" size={ms(13)} color={colors.star} />
                    <Text
                      style={[
                        styles.ratingText,
                        { fontSize: ms(12), lineHeight: ms(16) },
                      ]}
                    >
                      {`${center.rating.toFixed(1)} (${center.reviews})`}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={ms(16)}
                  color={colors.chevron}
                />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => {
            if (hasMore) setVisibleCount((count) => count + PAGE_SIZE);
          }}
          style={({ pressed }) => [
            styles.moreBtn,
            {
              marginTop: ms(22),
              minHeight: ms(52),
              borderRadius: ms(16),
            },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("ui.seeMore")}
        >
          <Text style={[styles.moreBtnText, { fontSize: ms(16) }]}>
            {t("ui.seeMore")}
          </Text>
        </Pressable>
      </ScrollView>
      </View>

      <Modal
        visible={picker != null}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPicker(null)}>
          <Pressable
            style={[styles.modalSheet, { width: Math.min(contentW - 40, 340) }]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { writingDirection: dir }]}>{pickerTitle}</Text>
            {pickerOptions.map((option) => (
              <Pressable
                key={option.label}
                onPress={() => {
                  option.onSelect();
                  setVisibleCount(PAGE_SIZE);
                  setPicker(null);
                }}
                style={({ pressed }) => [
                  styles.modalOption,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { textAlign: isRTL ? "right" : "left", writingDirection: dir },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  onPress,
  size,
}: {
  label: string;
  onPress: () => void;
  size: (n: number) => number;
}) {
  const { dir } = useI18nLayout();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        {
          minHeight: size(36),
          borderRadius: size(18),
          paddingHorizontal: size(10),
          flexDirection: "row",
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="chevron-down" size={size(12)} color={colors.filter} />
      <Text style={[styles.chipLabel, { fontSize: size(13), writingDirection: dir }]}>{label}</Text>
    </Pressable>
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
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    width: "100%",
    alignItems: "stretch",
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.searchBorder,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    color: colors.title,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
  },
  chipWrap: {
    flex: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    gap: 4,
    width: "100%",
  },
  chipLabel: {
    fontWeight: "700",
    color: colors.filter,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
  },
  centerName: {
    fontWeight: "800",
    color: colors.title,
  },
  centerSpecialty: {
    fontWeight: "500",
    color: colors.subtitle,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
  },
  ratingText: {
    fontWeight: "600",
    color: colors.title,
    writingDirection: "ltr",
  },
  moreBtn: {
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  moreBtnText: {
    color: colors.white,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    paddingVertical: 8,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.title,
  },
  emptyText: {
    color: colors.subtitle,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.88,
  },
});
