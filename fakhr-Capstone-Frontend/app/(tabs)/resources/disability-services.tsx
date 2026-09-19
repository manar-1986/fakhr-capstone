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

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#6A6D76",
  chevron: "#9AA0B3",
  back: "#3A4060",
  white: "#FFFFFF",
};

const DESIGN_W = 419;

type ServiceCategory = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  pathname:
    | "/(tabs)/directory/centers"
    | "/(tabs)/directory/professionals"
    | "/(tabs)/directory/schools"
    | "/(tabs)/services"
    | "/(tabs)/community/advice"
    | "/(tabs)/products";
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "centers",
    label: "المراكز",
    icon: "business-outline",
    iconColor: "#5C6BB3",
    backgroundColor: "#EBEEF9",
    pathname: "/(tabs)/directory/centers",
  },
  {
    id: "professionals",
    label: "الأطباء والمتخصصين",
    icon: "person-outline",
    iconColor: "#3EC8B3",
    backgroundColor: "#E8F8F5",
    pathname: "/(tabs)/directory/professionals",
  },
  {
    id: "schools",
    label: "المدارس",
    icon: "school-outline",
    iconColor: "#4A7FA3",
    backgroundColor: "#E6F4FD",
    pathname: "/(tabs)/directory/schools",
  },
  {
    id: "activities",
    label: "الأنشطة والبرامج",
    icon: "people-outline",
    iconColor: "#5C6BB3",
    backgroundColor: "#EBEEF9",
    pathname: "/(tabs)/services",
  },
  {
    id: "consultations",
    label: "الاستشارات",
    icon: "chatbubble-ellipses-outline",
    iconColor: "#7B6AA8",
    backgroundColor: "#EEEAF8",
    pathname: "/(tabs)/community/advice",
  },
  {
    id: "home-services",
    label: "الخدمات المنزلية",
    icon: "home-outline",
    iconColor: "#3E7A9A",
    backgroundColor: "#E8F4FC",
    pathname: "/(tabs)/services",
  },
  {
    id: "products",
    label: "المنتجات",
    icon: "storefront-outline",
    iconColor: "#C45A78",
    backgroundColor: "#F8EEF4",
    pathname: "/(tabs)/products",
  },
];

function firstParam(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function DisabilityServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const disabilityId = firstParam(params.id);
  const disabilityName = useMemo(() => {
    const raw = firstParam(params.name).trim();
    return raw || "الخدمات";
  }, [params.name]);

  const goBack = () => {
    router.navigate("/(tabs)/resources");
  };

  const openService = (item: ServiceCategory) => {
    router.push({
      pathname: item.pathname,
      params: {
        disabilityId,
        disabilityName,
        serviceCategory: item.id,
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
            paddingTop: ms(2),
            paddingBottom: ms(96),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { minHeight: ms(44), marginBottom: ms(8) }]}>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
          >
            <Ionicons name="chevron-back" size={ms(26)} color={colors.back} />
          </Pressable>
          <Text
            style={[styles.title, { fontSize: ms(22), lineHeight: ms(30) }]}
            numberOfLines={2}
          >
            {disabilityName}
          </Text>
        </View>

        <Text
          style={[
            styles.subtitle,
            {
              fontSize: ms(13),
              lineHeight: ms(22),
              marginBottom: ms(12),
            },
          ]}
        >
          {"اختر نوع الخدمة المناسبة\nللفئة المحددة"}
        </Text>

        <View style={{ gap: ms(6) }}>
          {SERVICE_CATEGORIES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openService(item)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: item.backgroundColor,
                  minHeight: ms(54),
                  borderRadius: ms(16),
                  paddingHorizontal: ms(12),
                  paddingVertical: ms(8),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.icon} size={ms(26)} color={item.iconColor} />
              <Text
                style={[
                  styles.cardLabel,
                  { fontSize: ms(14), lineHeight: ms(20) },
                ]}
              >
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={ms(18)}
                color={colors.chevron}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  subtitle: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "center",
    writingDirection: "rtl",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardLabel: {
    flex: 1,
    fontWeight: "700",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
