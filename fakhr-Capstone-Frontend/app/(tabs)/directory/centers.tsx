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
import type { HealthCenter } from "../../../types/directory.types";

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#8B91AF",
  filter: "#3A4060",
  placeholder: "#A8ABB4",
  searchBorder: "#E6E8EE",
  chipBorder: "#D8DCE8",
  star: "#DCAC2E",
  chevron: "#B2B1B5",
  button: "#7182B6",
  overlay: "rgba(26, 28, 41, 0.35)",
  white: "#FFFFFF",
};

const DESIGN_W = 390;
const PAGE_SIZE = 4;

const PHOTOS = [
  require("../../../assets/images/center-1.png"),
  require("../../../assets/images/center-2.png"),
  require("../../../assets/images/center-3.png"),
  require("../../../assets/images/center-4.png"),
];

type CenterType = "public" | "private";

type CenterRow = {
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  type: CenterType;
};

const CENTERS: CenterRow[] = [
  {
    name: "مركز خطوة للتأهيل",
    specialty: "الاستشارات النفسية",
    rating: 4.9,
    reviews: 73,
    type: "private",
  },
  {
    name: "مركز كيان",
    specialty: "العلاج الوظيفي",
    rating: 4.7,
    reviews: 120,
    type: "private",
  },
  {
    name: "مركز فنون",
    specialty: "العلاج الطبيعي",
    rating: 4.8,
    reviews: 88,
    type: "public",
  },
  {
    name: "مركز تنمية الطفل",
    specialty: "التدخل المبكر",
    rating: 4.9,
    reviews: 70,
    type: "private",
  },
  {
    name: "مركز الأمل للتنمية",
    specialty: "النطق والتخاطب",
    rating: 4.6,
    reviews: 54,
    type: "private",
  },
  {
    name: "مركز نور الحياة",
    specialty: "التوحد",
    rating: 4.8,
    reviews: 91,
    type: "public",
  },
  {
    name: "مركز بداية",
    specialty: "العلاج السلوكي",
    rating: 4.5,
    reviews: 62,
    type: "private",
  },
];

const SPECIALTY_OPTIONS = [
  "الكل",
  ...Array.from(new Set(CENTERS.map((center) => center.specialty))),
];
const TYPE_OPTIONS: { label: string; value: CenterType | "all" }[] = [
  { label: "الكل", value: "all" },
  { label: "خاصة", value: "private" },
  { label: "حكومية", value: "public" },
];
const RATING_OPTIONS: { label: string; value: "all" | "high" | "4.5" | "4.0" }[] =
  [
    { label: "الكل", value: "all" },
    { label: "الأعلى تقييماً", value: "high" },
    { label: "4.5 فأكثر", value: "4.5" },
    { label: "4.0 فأكثر", value: "4.0" },
  ];

type PickerKind = "specialty" | "type" | "rating" | null;

function centerIdOf(center?: HealthCenter) {
  if (!center) return undefined;
  return center.id || (center as { _id?: string })._id;
}

export default function CentersScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("الكل");
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
      if (specialty !== "الكل" && center.specialty !== specialty) return false;
      if (type !== "all" && center.type !== type) return false;
      if (ratingFilter === "4.5" && center.rating < 4.5) return false;
      if (ratingFilter === "4.0" && center.rating < 4.0) return false;
      if (!q) return true;
      return center.name.includes(q) || center.specialty.includes(q);
    });
    if (ratingFilter === "high") {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  }, [search, specialty, type, ratingFilter]);

  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const openCenter = (center: CenterRow) => {
    const index = CENTERS.findIndex((item) => item.name === center.name);
    const id = centerIdOf(apiCenters[index] ?? apiCenters[0]);
    router.push(
      `/(tabs)/directory/center-details?id=${id ?? ""}` as const,
    );
  };

  const pickerTitle =
    picker === "specialty"
      ? "التخصص"
      : picker === "type"
        ? "النوع"
        : "التقييم";

  const pickerOptions =
    picker === "specialty"
      ? SPECIALTY_OPTIONS.map((label) => ({
          label,
          onSelect: () => setSpecialty(label),
        }))
      : picker === "type"
        ? TYPE_OPTIONS.map((item) => ({
            label: item.label,
            onSelect: () => setType(item.value),
          }))
        : RATING_OPTIONS.map((item) => ({
            label: item.label,
            onSelect: () => setRatingFilter(item.value),
          }));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
          <Text style={[styles.title, { fontSize: ms(26), lineHeight: ms(34) }]}>
            المراكز
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
              direction: "ltr" as const,
            },
          ]}
        >
          <TextInput
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="ابحث عن مركز..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { fontSize: ms(14) }]}
            textAlign="right"
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
              direction: "ltr" as const,
            },
          ]}
        >
          <View style={styles.chipWrap}>
            <FilterChip
              label="التقييم"
              size={ms}
              onPress={() => setPicker("rating")}
            />
          </View>
          <View style={styles.chipWrap}>
            <FilterChip
              label="النوع"
              size={ms}
              onPress={() => setPicker("type")}
            />
          </View>
          <View style={styles.chipWrap}>
            <FilterChip
              label="التخصص"
              size={ms}
              onPress={() => setPicker("specialty")}
            />
          </View>
        </View>

        <View style={{ gap: ms(16), width: "100%" }}>
          {visibleRows.map((center) => {
            const index = CENTERS.findIndex((item) => item.name === center.name);
            const photoW = ms(108);
            const photoH = ms(80);
            return (
              <Pressable
                key={center.name}
                onPress={() => openCenter(center)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    gap: ms(10),
                    minHeight: photoH,
                    direction: "ltr" as const,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={center.name}
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
                <View style={styles.info}>
                  <Text
                    style={[
                      styles.centerName,
                      { fontSize: ms(15), lineHeight: ms(22) },
                    ]}
                    numberOfLines={1}
                  >
                    {center.name}
                  </Text>
                  <Text
                    style={[
                      styles.centerSpecialty,
                      {
                        fontSize: ms(12),
                        lineHeight: ms(18),
                        marginTop: ms(1),
                      },
                    ]}
                  >
                    {center.specialty}
                  </Text>
                  <View
                    style={[
                      styles.ratingRow,
                      {
                        marginTop: ms(4),
                        gap: ms(4),
                        direction: "ltr" as const,
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
          accessibilityLabel="عرض المزيد"
        >
          <Text style={[styles.moreBtnText, { fontSize: ms(16) }]}>
            عرض المزيد
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
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
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
                <Text style={styles.modalOptionText}>{option.label}</Text>
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
          direction: "ltr" as const,
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="chevron-down" size={size(12)} color={colors.filter} />
      <Text style={[styles.chipLabel, { fontSize: size(13) }]}>{label}</Text>
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
    writingDirection: "rtl",
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
    writingDirection: "rtl",
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
    writingDirection: "rtl",
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
    textAlign: "right",
    writingDirection: "rtl",
  },
  centerSpecialty: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    direction: "ltr",
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
    writingDirection: "rtl",
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
    writingDirection: "rtl",
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
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
