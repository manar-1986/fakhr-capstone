import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
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
import type { HealthCenter } from "../../../types/directory.types";
import { tryNavigateToDisabilityServices } from "../../../utils/disabilityFlowNav";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import {
  BILINGUAL_SCHOOLS,
  schoolDisplayName,
  type BilingualSchool,
  type CenterType as SchoolType,
} from "../../../constants/directoryBilingual";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  subtitle: palette.textMuted,
  back: palette.textSecondary,
  filter: palette.textSecondary,
  placeholder: palette.textLight,
  searchBorder: palette.border,
  chipBorder: palette.border,
  star: palette.star,
  overlay: "rgba(26, 28, 41, 0.35)",
  white: palette.white,
};

const DESIGN_W = 423;
const schoolPhoto = require("../../../assets/images/school-building.png");

export type SchoolRow = BilingualSchool;

const SCHOOLS = BILINGUAL_SCHOOLS;

const CITY_OPTIONS = [
  { key: "all", labelAr: "الكل", labelEn: "All" },
  { key: "hawalli", labelAr: "حولي", labelEn: "Hawalli" },
  { key: "farwaniya", labelAr: "الفروانية", labelEn: "Farwaniya" },
  { key: "jahra", labelAr: "الجهراء", labelEn: "Jahra" },
  { key: "capital", labelAr: "العاصمة", labelEn: "Capital" },
];
const TYPE_OPTIONS: { value: SchoolType | "all" }[] = [
  { value: "all" },
  { value: "private" },
  { value: "public" },
];
const BRANCH_OPTIONS = [
  { key: "all", labelAr: "الكل", labelEn: "All" },
  { key: "special-ed", labelAr: "التربية الخاصة", labelEn: "Special education" },
  { key: "inclusive", labelAr: "الشاملة", labelEn: "Inclusive" },
  { key: "private", labelAr: "الخاصة", labelEn: "Private" },
  { key: "international", labelAr: "العالمية", labelEn: "International" },
  { key: "deaf", labelAr: "الصم", labelEn: "Deaf education" },
];

type PickerKind = "city" | "type" | "branch" | null;

function centerIdOf(center?: HealthCenter) {
  if (!center) return undefined;
  return center.id || (center as { _id?: string })._id;
}

export default function SchoolsScreen() {
  const { t } = useTranslation();
  const { align, isRTL, dir } = useI18nLayout();
  const router = useRouter();
  const params = useLocalSearchParams<{
    disabilityId?: string;
    disabilityName?: string;
  }>();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState<SchoolType | "all">("all");
  const [branch, setBranch] = useState("all");
  const [picker, setPicker] = useState<PickerKind>(null);

  const { data: centers = [] } = useQuery({
    queryKey: centersListQueryKey(),
    queryFn: () => getCenters(),
  });

  const rows = useMemo(() => {
    const q = search.trim();
    return SCHOOLS.filter((school) => {
      if (city !== "all" && school.cityKey !== city) return false;
      if (type !== "all" && school.type !== type) return false;
      if (branch !== "all" && school.branchKey !== branch) return false;
      if (!q) return true;
      const hay = `${school.nameAr} ${school.nameEn} ${school.cityAr} ${school.cityEn} ${school.specialtyAr} ${school.specialtyEn}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [search, city, type, branch]);

  const goBack = () => {
    if (tryNavigateToDisabilityServices(router, params)) {
      return;
    }
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/home");
  };

  const openSchool = (school: SchoolRow) => {
    const index = SCHOOLS.findIndex((item) => item.id === school.id);
    const id = centerIdOf(centers[index] ?? centers[0]);
    router.push({
      pathname: "/(tabs)/directory/school-details",
      params: {
        id: id ?? "",
        school: encodeURIComponent(JSON.stringify(school)),
      },
    });
  };

  const pickerTitle =
    picker === "city" ? t("ui.area") : picker === "type" ? t("ui.type") : t("ui.branch");

  const pickerOptions =
    picker === "city"
      ? CITY_OPTIONS.map((item) => ({
          label: item.key === "all" ? t("ui.all") : isRTL ? item.labelAr : item.labelEn,
          onSelect: () => setCity(item.key),
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
        : BRANCH_OPTIONS.map((item) => ({
            label: item.key === "all" ? t("ui.all") : isRTL ? item.labelAr : item.labelEn,
            onSelect: () => setBranch(item.key),
          }));

  const resetFilters = () => {
    setCity("all");
    setType("all");
    setBranch("all");
  };

  return (
    <SafeAreaView style={[styles.safe, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            paddingHorizontal: ms(18),
            paddingTop: ms(2),
            paddingBottom: ms(108),
          },
        ]}
        keyboardShouldPersistTaps="handled"
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
          <Text style={[styles.title, { fontSize: ms(24), lineHeight: ms(32), writingDirection: dir }]}>
            {t("ui.schools")}
          </Text>
        </View>

        <View
          style={[
            styles.searchBar,
            {
              minHeight: ms(44),
              borderRadius: ms(22),
              paddingHorizontal: ms(14),
              marginBottom: ms(10),
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("ui.searchSchool")}
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { fontSize: ms(13), writingDirection: dir }]}
            textAlign={align}
            returnKeyType="search"
          />
          <Ionicons
            name="search-outline"
            size={ms(18)}
            color={colors.placeholder}
          />
        </View>

        <View style={[styles.filterRow, { marginBottom: ms(14), gap: ms(6), flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <FilterChip
            label={t("ui.area")}
            size={ms}
            onPress={() => setPicker("city")}
          />
          <FilterChip
            label={t("ui.type")}
            size={ms}
            onPress={() => setPicker("type")}
          />
          <FilterChip
            label={t("ui.branch")}
            size={ms}
            onPress={() => setPicker("branch")}
          />
          <Pressable
            onPress={() => {
              resetFilters();
              Alert.alert(t("ui.filters"), t("ui.filtersCleared"));
            }}
            style={({ pressed }) => [
              styles.filterIconBtn,
              {
                width: ms(36),
                height: ms(36),
                borderRadius: ms(10),
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("ui.filters")}
          >
            <Ionicons name="options-outline" size={ms(18)} color={colors.filter} />
          </Pressable>
        </View>

        <View style={{ gap: ms(12) }}>
          {rows.length === 0 ? (
            <Text
              style={{
                fontSize: ms(14),
                color: colors.subtitle,
                textAlign: isRTL ? "right" : "left",
                writingDirection: dir,
              }}
            >
              {t("common.noResults")}
            </Text>
          ) : null}
          {rows.map((school) => {
            const name = schoolDisplayName(school, isRTL);
            const cityLabel = isRTL ? school.cityAr : school.cityEn;
            return (
            <Pressable
              key={school.id}
              onPress={() => openSchool(school)}
              style={({ pressed }) => [
                styles.row,
                { gap: ms(12), flexDirection: isRTL ? "row-reverse" : "row" },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={name}
            >
              <Image
                source={schoolPhoto}
                style={{
                  width: ms(108),
                  height: ms(80),
                  borderRadius: ms(14),
                }}
                resizeMode="cover"
              />
              <View style={[styles.info, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                <Text
                  style={[
                    styles.schoolName,
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
                    styles.schoolCity,
                    {
                      fontSize: ms(12),
                      lineHeight: ms(18),
                      marginTop: ms(1),
                      textAlign: isRTL ? "right" : "left",
                      writingDirection: dir,
                    },
                  ]}
                >
                  {cityLabel}
                </Text>
                <View style={[styles.ratingRow, { marginTop: ms(4), gap: ms(4) }]}>
                  <Ionicons name="star" size={ms(13)} color={colors.star} />
                  <Text
                    style={[
                      styles.ratingText,
                      { fontSize: ms(12), lineHeight: ms(16) },
                    ]}
                  >
                    {`${school.rating.toFixed(1)} (${school.reviews})`}
                  </Text>
                </View>
              </View>
            </Pressable>
            );
          })}
        </View>
      </ScrollView>

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
  },
  scroll: {
    flex: 1,
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
    flexDirection: "row",
  },
  searchInput: {
    flex: 1,
    color: colors.title,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    gap: 4,
  },
  chipLabel: {
    fontWeight: "700",
    color: colors.filter,
  },
  filterIconBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    marginLeft: "auto",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
  },
  schoolName: {
    fontWeight: "800",
    color: colors.title,
  },
  schoolCity: {
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
    textAlign: "right",
  },
  pressed: {
    opacity: 0.88,
  },
});
