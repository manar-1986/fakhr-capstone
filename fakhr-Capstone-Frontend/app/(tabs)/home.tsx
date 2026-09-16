import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
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
import { getCurrentUser } from "../../api/users.api";
import { WEB_PHONE_WIDTH } from "../../components/layout/WebAppShell";
import { useAuth } from "../../context/AuthContext";

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#6E7479",
  brand: "#6F80B4",
  icon: "#6F80B4",
  specialist: "#3EC8B3",
  placeholder: "#A8ABB4",
  searchBg: "#F4F5F8",
  searchBorder: "#E6E8EE",
  white: "#FFFFFF",
  bannerBtn: "#F4F6FB",
  bannerBtnText: "#5A6480",
};

const DESIGN_W = 437;

type ServiceItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href?: string;
  onPress: () => void;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);
  const [search, setSearch] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!user,
    retry: false,
  });

  const userName = currentUser?.name || user?.name || "";
  const firstName = useMemo(() => {
    const name = userName.trim();
    if (!name) return "شيخة";
    return name.split(/\s+/)[0];
  }, [userName]);

  const padX = ms(20);
  const gridGap = ms(10);
  const innerW = contentW - padX * 2;
  const cellW = Math.floor((innerW - gridGap * 3) / 4);

  const openSearch = () => {
    router.navigate("/directory");
  };

  const services: ServiceItem[] = [
    {
      id: "disability",
      label: "فئات الإعاقة\nتعرف إلى إعاقة",
      icon: "accessibility-outline",
      color: colors.icon,
      href: "/resources",
      onPress: () => router.navigate("/resources"),
    },
    {
      id: "schools",
      label: "المدارس",
      icon: "school-outline",
      color: colors.icon,
      href: "/directory/schools",
      onPress: () => router.navigate("/directory/schools"),
    },
    {
      id: "centers",
      label: "المراكز",
      icon: "business-outline",
      color: colors.icon,
      href: "/directory/centers",
      onPress: () => router.navigate("/directory/centers"),
    },
    {
      id: "doctors",
      label: "الأطباء\nومتخصصين",
      icon: "person-outline",
      color: colors.specialist,
      href: "/directory/professionals",
      onPress: () => router.navigate("/directory/professionals"),
    },
    {
      id: "activities",
      label: "الأنشطة\nوالبرامج",
      icon: "people-outline",
      color: colors.icon,
      href: "/services",
      onPress: () => router.navigate("/services"),
    },
    {
      id: "products",
      label: "المنتجات\nالمنزلية",
      icon: "storefront-outline",
      color: colors.icon,
      href: "/products",
      onPress: () => router.navigate("/products"),
    },
    {
      id: "homeServices",
      label: "الخدمات\nالمنزلية",
      icon: "home-outline",
      color: colors.icon,
      href: "/services",
      onPress: () => router.navigate("/services"),
    },
    {
      id: "consultations",
      label: "الاستشارات",
      icon: "chatbubble-ellipses-outline",
      color: colors.icon,
      href: "/community/advice",
      onPress: () => router.navigate("/community/advice"),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            maxWidth: WEB_PHONE_WIDTH,
            paddingHorizontal: padX,
            paddingTop: ms(6),
            paddingBottom: ms(108),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topRow, { height: ms(56), marginBottom: ms(4) }]}>
          <Pressable
            onPress={() => {
              Alert.alert(t("home.notifications"), t("home.newNotifications"));
            }}
            hitSlop={10}
            style={({ pressed }) => [styles.iconBtn, styles.iconLeft, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="الإشعارات"
          >
            <Ionicons name="notifications-outline" size={ms(24)} color={colors.title} />
          </Pressable>
          <Image
            source={require("../../assets/images/fakhr-wordmark-blue.png")}
            style={{ width: ms(42), height: ms(52) }}
            resizeMode="contain"
            accessibilityLabel="فخر"
          />
          <Pressable
            onPress={() => {}}
            hitSlop={10}
            style={({ pressed }) => [styles.iconBtn, styles.iconRight, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="تحديث"
          >
            <Ionicons name="refresh-outline" size={ms(24)} color={colors.title} />
          </Pressable>
        </View>

        <Text
          style={[
            styles.greeting,
            { fontSize: ms(26), lineHeight: ms(34), marginTop: ms(4) },
          ]}
        >
          {`مرحباً ${firstName}`}
        </Text>
        <Text
          style={[
            styles.helpLine,
            { fontSize: ms(14), lineHeight: ms(22), marginBottom: ms(14) },
          ]}
        >
          كيف يمكننا مساعدتك اليوم؟
        </Text>

        <Pressable
          onPress={openSearch}
          style={[
            styles.searchBar,
            {
              minHeight: ms(46),
              borderRadius: ms(22),
              paddingHorizontal: ms(16),
              marginBottom: ms(14),
            },
          ]}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن خدمة، جهة، أو منتج"
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { fontSize: ms(14) }]}
            textAlign="right"
            returnKeyType="search"
            onSubmitEditing={openSearch}
            onFocus={openSearch}
          />
          <Ionicons name="search-outline" size={ms(20)} color={colors.placeholder} />
        </Pressable>

        <View
          style={[
            styles.hero,
            {
              minHeight: ms(148),
              borderRadius: ms(22),
              marginBottom: ms(16),
              paddingLeft: ms(18),
            },
          ]}
        >
          <View style={styles.heroTextCol}>
            <Text style={[styles.heroTitle, { fontSize: ms(20), lineHeight: ms(28) }]}>
              {"كل ما تحتاجه\nفي مكان واحد"}
            </Text>
            <Pressable
              onPress={() => router.navigate("/directory")}
              style={({ pressed }) => [
                styles.heroBtn,
                { borderRadius: ms(14), minHeight: ms(32), paddingHorizontal: ms(14) },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="اكتشف الآن"
            >
              <Text style={[styles.heroBtnText, { fontSize: ms(13) }]}>اكتشف الآن</Text>
            </Pressable>
          </View>
          <Image
            source={require("../../assets/images/home-hero-girl.png")}
            style={{ width: ms(148), height: ms(148) }}
            resizeMode="cover"
          />
        </View>

        <View
          style={[
            styles.grid,
            {
              width: innerW,
              gap: gridGap,
              marginBottom: ms(16),
            },
          ]}
        >
          {services.map((item) => {
            const cell = (
              <Pressable
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.cell,
                  { width: "100%", minHeight: ms(96) },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label.replace("\n", " ")}
              >
                <Ionicons name={item.icon} size={ms(32)} color={item.color} />
                <Text
                  style={[
                    styles.cellLabel,
                    { fontSize: ms(11), lineHeight: ms(16), marginTop: ms(8) },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
            return (
              <View key={item.id} style={{ width: cellW }}>
                {item.href ? (
                  <Link href={item.href} asChild>
                    {cell}
                  </Link>
                ) : (
                  cell
                )}
              </View>
            );
          })}
        </View>

        <View
          style={[
            styles.aiBanner,
            {
              minHeight: ms(148),
              borderRadius: ms(22),
              paddingLeft: ms(18),
              paddingVertical: ms(16),
            },
          ]}
        >
          <View style={styles.aiTextCol}>
            <Text style={[styles.aiTitle, { fontSize: ms(28), lineHeight: ms(36) }]}>
              اسأل فخر
            </Text>
            <Text
              style={[
                styles.aiSub,
                { fontSize: ms(13), lineHeight: ms(20), marginBottom: ms(12) },
              ]}
            >
              مساعدك الذكي على مدار الساعة
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/directory/helpCenter")}
              style={({ pressed }) => [
                styles.aiBtn,
                { borderRadius: ms(16), minHeight: ms(36), paddingHorizontal: ms(16) },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="ابدأ المحادثة"
            >
              <Text style={[styles.aiBtnText, { fontSize: ms(14) }]}>ابدأ المحادثة</Text>
            </Pressable>
          </View>
          <Image
            source={require("../../assets/images/home-robot.png")}
            style={{ width: ms(120), height: ms(132), marginRight: ms(6) }}
            resizeMode="contain"
          />
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
    width: "100%",
  },
  scrollContent: {
    alignSelf: "center",
  },
  topRow: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 6,
    zIndex: 2,
  },
  iconLeft: {
    left: 0,
  },
  iconRight: {
    right: 0,
  },
  greeting: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  helpLine: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "center",
    writingDirection: "rtl",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.searchBg,
    borderWidth: 1,
    borderColor: colors.searchBorder,
  },
  searchInput: {
    flex: 1,
    color: colors.title,
    paddingVertical: 8,
    writingDirection: "rtl",
  },
  hero: {
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  heroTextCol: {
    flex: 1,
    alignItems: "flex-start",
    paddingVertical: 16,
    gap: 12,
  },
  heroTitle: {
    fontWeight: "800",
    color: colors.white,
    textAlign: "right",
    writingDirection: "rtl",
  },
  heroBtn: {
    backgroundColor: colors.bannerBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBtnText: {
    fontWeight: "700",
    color: colors.bannerBtnText,
    writingDirection: "rtl",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "flex-start",
  },
  cell: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 8,
  },
  cellLabel: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  aiBanner: {
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  aiTextCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  aiTitle: {
    fontWeight: "800",
    color: colors.white,
    textAlign: "right",
    writingDirection: "rtl",
  },
  aiSub: {
    fontWeight: "500",
    color: colors.white,
    textAlign: "right",
    writingDirection: "rtl",
  },
  aiBtn: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  aiBtnText: {
    fontWeight: "700",
    color: colors.brand,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.85,
  },
});
