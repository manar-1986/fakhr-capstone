import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useTranslation } from "react-i18next";
import { knownText } from "../../../utils/knownText";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.textSecondary,
  text: palette.textSecondary,
  selected: palette.primary,
  unselectedBg: palette.borderLight,
  unselectedText: palette.textSecondary,
  star: palette.star,
  chevron: palette.chevron,
  divider: palette.divider,
  white: palette.white,
};

const DESIGN_W = 390;
const PAGE_SIZE = 4;

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "أدوات تعليمية", label: "أدوات تعليمية" },
  { id: "المستلزمات", label: "المستلزمات" },
] as const;

const PHOTOS = [
  require("../../../assets/images/product-1.png"),
  require("../../../assets/images/product-2.png"),
  require("../../../assets/images/product-3.png"),
  require("../../../assets/images/product-4.png"),
];

type ProductRow = {
  id: string;
  name: string;
  category: string;
  priceLabel: string;
  photoIndex: number;
};

const PRODUCTS: ProductRow[] = [
  {
    id: "p-1",
    name: "كرسي متحرك",
    category: "المستلزمات",
    priceLabel: "KD 95.000",
    photoIndex: 0,
  },
  {
    id: "p-2",
    name: "بطاقات تواصل مصورة",
    category: "أدوات تعليمية",
    priceLabel: "KD 6.500",
    photoIndex: 1,
  },
  {
    id: "p-3",
    name: "سماعات عازلة للضوضاء",
    category: "المستلزمات",
    priceLabel: "KD 12.000",
    photoIndex: 2,
  },
  {
    id: "p-4",
    name: "أدوات تنمية مهارات",
    category: "أدوات تعليمية",
    priceLabel: "KD 16.000",
    photoIndex: 3,
  },
  {
    id: "p-5",
    name: "لوحة تواصل",
    category: "أدوات تعليمية",
    priceLabel: "KD 8.000",
    photoIndex: 1,
  },
  {
    id: "p-6",
    name: "وسادة دعم",
    category: "المستلزمات",
    priceLabel: "KD 14.000",
    photoIndex: 0,
  },
  {
    id: "p-7",
    name: "مكعبات حسية",
    category: "أدوات تعليمية",
    priceLabel: "KD 9.500",
    photoIndex: 3,
  },
  {
    id: "p-8",
    name: "حزام أمان",
    category: "المستلزمات",
    priceLabel: "KD 11.000",
    photoIndex: 2,
  },
];

export default function ProductsScreen() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredRows = useMemo(() => {
    if (filter === "all") return PRODUCTS;
    return PRODUCTS.filter((row) => row.category === filter);
  }, [filter]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRows.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
          <View style={[styles.header, { height: ms(44), marginBottom: ms(16) }]}>
            <DisabilityAwareHeaderBackButton color={colors.title} />
            <Text
              style={[
                styles.title,
                {
                  fontSize: ms(24),
                  lineHeight: ms(32),
                },
              ]}
            >
              {t("ui.products")}
            </Text>
          </View>

          <View
            style={[
              styles.filters,
              {
                gap: ms(8),
                marginBottom: ms(10),
              },
            ]}
          >
            {FILTERS.map((item) => {
              const selected = filter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setFilter(item.id);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  style={({ pressed }) => [
                    styles.filterBtn,
                    {
                      minHeight: ms(38),
                      borderRadius: ms(10),
                      backgroundColor: selected
                        ? colors.selected
                        : colors.unselectedBg,
                    },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={
                    item.id === "all"
                      ? t("ui.all")
                      : item.id === "أدوات تعليمية"
                        ? t("ui.educationalTools")
                        : t("ui.supplies")
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        fontSize: ms(14),
                        color: selected ? colors.white : colors.unselectedText,
                      },
                    ]}
                  >
                    {item.id === "all"
                      ? t("ui.all")
                      : item.id === "أدوات تعليمية"
                        ? t("ui.educationalTools")
                        : t("ui.supplies")}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {visibleRows.map((row, index) => {
            const imageSize = ms(68);
            const photo = PHOTOS[row.photoIndex % PHOTOS.length];
            return (
              <Pressable
                key={`${row.id}-${index}`}
                style={({ pressed }) => [
                  styles.row,
                  {
                    minHeight: ms(88),
                    paddingVertical: ms(12),
                    gap: ms(14),
                    borderBottomWidth:
                      index === visibleRows.length - 1
                        ? 0
                        : StyleSheet.hairlineWidth,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={knownText(t, row.name)}
              >
                <Image
                  source={photo}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: ms(10),
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
                    {knownText(t, row.name)}
                  </Text>
                  <View
                    style={[
                      styles.priceRow,
                      {
                        marginTop: ms(6),
                        gap: ms(5),
                      },
                    ]}
                  >
                    <Ionicons name="star" size={ms(13)} color={colors.star} />
                    <Text
                      style={[
                        styles.price,
                        { fontSize: ms(13), lineHeight: ms(18) },
                      ]}
                    >
                      {row.priceLabel}
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

          <Pressable
            onPress={() => {
              if (hasMore) setVisibleCount((count) => count + PAGE_SIZE);
            }}
            style={({ pressed }) => [
              styles.moreBtn,
              {
                marginTop: ms(18),
                minHeight: ms(48),
                borderRadius: ms(12),
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
    writingDirection: "rtl",
  },
  filters: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  filterBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  filterText: {
    fontWeight: "700",
    writingDirection: "rtl",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.divider,
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  name: {
    fontWeight: "800",
    color: colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontWeight: "600",
    color: colors.text,
  },
  moreBtn: {
    backgroundColor: colors.selected,
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
