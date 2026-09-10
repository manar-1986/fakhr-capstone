import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfessionals } from "../../../api/directory.api";
import type { Professional } from "../../../types/directory.types";

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#8B91AF",
  placeholder: "#A8ABB4",
  searchBorder: "#E6E8EE",
  star: "#DCAC2E",
  chevron: "#B2B1B5",
  button: "#7182B6",
  avatarBg: "#E8E9EE",
  white: "#FFFFFF",
};

const DESIGN_W = 390;
const PAGE_SIZE = 4;

const PHOTOS = [
  require("../../../assets/images/specialist-1.png"),
  require("../../../assets/images/specialist-2.png"),
  require("../../../assets/images/specialist-3.png"),
  require("../../../assets/images/specialist-4.png"),
];

type SpecialistRow = {
  id?: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  photoIndex: number;
  imageUri?: string;
};

const FALLBACK: SpecialistRow[] = [
  {
    name: "د. نورة الشمري",
    specialty: "اختصاصية نفسية",
    rating: 4.9,
    reviews: 73,
    photoIndex: 0,
  },
  {
    name: "د. أحمد المطيري",
    specialty: "استشاري أطفال",
    rating: 4.8,
    reviews: 68,
    photoIndex: 1,
  },
  {
    name: "د. فاطمة العلي",
    specialty: "اختصاصية نطق ولغة",
    rating: 4.7,
    reviews: 55,
    photoIndex: 2,
  },
  {
    name: "د. سالم الحربي",
    specialty: "استشاري أعصاب",
    rating: 4.9,
    reviews: 50,
    photoIndex: 3,
  },
  {
    name: "د. خالد العنزي",
    specialty: "أخصائي علاج وظيفي",
    rating: 4.6,
    reviews: 41,
    photoIndex: 1,
  },
  {
    name: "د. مريم السالم",
    specialty: "استشارية تغذية",
    rating: 4.8,
    reviews: 37,
    photoIndex: 0,
  },
  {
    name: "د. يوسف العتيبي",
    specialty: "أخصائي سلوكي",
    rating: 4.5,
    reviews: 29,
    photoIndex: 3,
  },
];

function professionalId(p: Professional) {
  return p.id || (p as { _id?: string })._id;
}

function mapApiProfessional(p: Professional, index: number): SpecialistRow {
  const uri = p.image?.trim();
  return {
    id: professionalId(p),
    name: p.name,
    specialty: p.specialtyLabel || p.specialty || "",
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviews: typeof p.reviews === "number" ? p.reviews : 0,
    photoIndex: index % PHOTOS.length,
    imageUri: uri || undefined,
  };
}

export default function ProfessionalsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: apiPros } = useQuery({
    queryKey: ["professionals", search],
    queryFn: () =>
      getProfessionals({
        search: search.trim() || undefined,
      }),
  });

  const rows = useMemo(() => {
    if (apiPros && apiPros.length > 0) {
      return apiPros.map(mapApiProfessional);
    }
    const q = search.trim();
    if (!q) return FALLBACK;
    return FALLBACK.filter(
      (row) => row.name.includes(q) || row.specialty.includes(q),
    );
  }, [apiPros, search]);

  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const openProfessional = (row: SpecialistRow, index: number) => {
    const id =
      row.id ||
      (apiPros && professionalId(apiPros[index])) ||
      (apiPros && professionalId(apiPros[0])) ||
      "";
    router.push(
      `/(tabs)/directory/professional-details?id=${id}` as const,
    );
  };

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
          <View style={[styles.header, { height: ms(48), marginBottom: ms(10) }]}>
            <Text
              style={[styles.title, { fontSize: ms(22), lineHeight: ms(30) }]}
              numberOfLines={1}
            >
              الأطباء والمختصون
            </Text>
          </View>

          <View
            style={[
              styles.searchBar,
              {
                minHeight: ms(44),
                borderRadius: ms(22),
                paddingHorizontal: ms(14),
                marginBottom: ms(18),
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
              placeholder="ابحث عن طبيب..."
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

          <View style={{ gap: ms(18), width: "100%" }}>
            {visibleRows.map((row, index) => {
              const avatar = ms(72);
              const source = row.imageUri
                ? { uri: row.imageUri }
                : PHOTOS[row.photoIndex % PHOTOS.length];
              return (
                <Pressable
                  key={`${row.id ?? row.name}-${index}`}
                  onPress={() => openProfessional(row, index)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      gap: ms(12),
                      minHeight: avatar,
                      direction: "ltr" as const,
                    },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={row.name}
                >
                  <Image
                    source={source}
                    style={{
                      width: avatar,
                      height: avatar,
                      borderRadius: avatar / 2,
                      backgroundColor: colors.avatarBg,
                    }}
                    resizeMode="cover"
                  />
                  <View style={styles.info}>
                    <Text
                      style={[
                        styles.name,
                        { fontSize: ms(16), lineHeight: ms(22) },
                      ]}
                      numberOfLines={1}
                    >
                      {row.name}
                    </Text>
                    <Text
                      style={[
                        styles.specialty,
                        {
                          fontSize: ms(12),
                          lineHeight: ms(18),
                          marginTop: ms(1),
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {row.specialty}
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
                        {`${Number(row.rating).toFixed(1)} (${row.reviews})`}
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
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF0F4",
    paddingBottom: 8,
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
  },
  name: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  specialty: {
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
  pressed: {
    opacity: 0.88,
  },
});
