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
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import {
  getServices,
  HOME_SERVICES,
  type Service,
} from "../../../api/services.api";

const colors = {
  bg: "#FFFFFF",
  title: "#2C3558",
  text: "#2C3558",
  selected: "#6E7CAF",
  unselectedBg: "#EEF0F6",
  unselectedText: "#5A6178",
  star: "#F4C430",
  chevron: "#C5C7CE",
  divider: "#F0F1F4",
  white: "#FFFFFF",
};

const DESIGN_W = 390;
const PAGE_SIZE = 4;

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "زراعية", label: "زراعية" },
  { id: "التنظيف", label: "التنظيف" },
] as const;

const PHOTOS = [
  require("../../../assets/images/home-service-1.png"),
  require("../../../assets/images/home-service-2.png"),
  require("../../../assets/images/home-service-3.png"),
  require("../../../assets/images/home-service-4.png"),
];

type ServiceRow = {
  id: string;
  name: string;
  category: string;
  priceLabel: string;
  photoIndex: number;
  imageUri?: string;
};

function formatKd(value: number): string {
  return `KD ${value.toFixed(3)}`;
}

function servicePrice(service: Service): string {
  const raw = service.price;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return formatKd(raw);
  }
  const extra = service as Service & { startingPrice?: number; cost?: number };
  const fallback = extra.startingPrice ?? extra.cost;
  if (typeof fallback === "number" && Number.isFinite(fallback)) {
    return formatKd(fallback);
  }
  return "";
}

function remoteImage(uri?: string): string | undefined {
  const value = uri?.trim();
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return undefined;
}

function mapService(service: Service, index: number): ServiceRow {
  return {
    id: service.id,
    name: service.name,
    category: service.category || "",
    priceLabel: servicePrice(service),
    photoIndex: index % PHOTOS.length,
    imageUri: remoteImage(service.image),
  };
}

export default function ServicesScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: apiServices } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    retry: false,
  });

  const rows = useMemo(() => {
    const source =
      apiServices && apiServices.length > 0 ? apiServices : HOME_SERVICES;
    return source.map(mapService);
  }, [apiServices]);

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((row) => row.category === filter);
  }, [rows, filter]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRows.length;

  const openService = (id: string) => {
    router.push({
      pathname: "/(tabs)/services/service-details",
      params: { id },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: ms(18),
            paddingTop: ms(10),
            paddingBottom: ms(28),
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
              الخدمات المنزلية
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
                  accessibilityLabel={item.label}
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
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {visibleRows.map((row, index) => {
            const imageSize = ms(68);
            const photo = PHOTOS[row.photoIndex % PHOTOS.length];
            const source = row.imageUri ? { uri: row.imageUri } : photo;
            return (
              <Pressable
                key={`${row.id}-${index}`}
                onPress={() => openService(row.id)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    minHeight: ms(88),
                    paddingVertical: ms(12),
                    gap: ms(14),
                    borderBottomWidth: index === visibleRows.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={row.name}
              >
                <Image
                  source={source}
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
                    {row.name}
                  </Text>
                  {!!row.priceLabel && (
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
                  )}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
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
