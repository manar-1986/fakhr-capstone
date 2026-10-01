import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  I18nManager,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getCurrentUser } from "../../api/users.api";
import { WEB_PHONE_WIDTH } from "../../components/layout/WebAppShell";
import { useAuth } from "../../context/AuthContext";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors as palette } from "../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  subtitle: palette.textMuted,
  brand: palette.primary,
  icon: palette.primary,
  specialist: palette.primary,
  placeholder: palette.textLight,
  searchBg: palette.borderLight,
  searchBorder: palette.border,
  white: palette.white,
  bannerBtn: palette.borderLight,
  bannerBtnText: palette.textSecondary,
};

const DESIGN_W = 437;

type ServiceItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: Href;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { align, isRTL } = useI18nLayout();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  // Match the existing absolute tab bar and reserve a separate launcher area.
  const assistantSize = 60;
  const assistantBottom = 58 + Math.max(insets.bottom, 8) + 12;
  // Keep the web bubble within the launcher area, clear of scrollable content.
  const assistantClearance = assistantBottom + assistantSize + (Platform.OS === "web" ? 44 : 12);
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);
  const [search, setSearch] = useState("");
  const [assistantHovered, setAssistantHovered] = useState(false);
  const [assistantFocused, setAssistantFocused] = useState(false);
  const assistantLabel = `${t("ui.askFakhr")} ✨ AI`;

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!user,
    retry: false,
  });

  const userName = currentUser?.name || user?.name || "";
  const firstName = useMemo(() => {
    const name = userName.trim();
    if (!name) return t("ui.demoName");
    return name.split(/\s+/)[0];
  }, [userName, t]);

  const padX = ms(20);
  const colGap = ms(10);
  const rowGap = ms(16);
  const iconSlot = ms(36);

  const openSearch = () => {
    router.navigate("/(tabs)/directory/centers");
  };

  const openCategory = (href: Href) => {
    router.push(href);
  };

  const services: ServiceItem[] = [
    {
      id: "disability",
      label: t("ui.disabilityCategories"),
      icon: "accessibility-outline",
      color: colors.icon,
      href: "/(tabs)/resources",
    },
    {
      id: "schools",
      label: t("ui.schools"),
      icon: "school-outline",
      color: colors.icon,
      href: "/(tabs)/directory/schools",
    },
    {
      id: "centers",
      label: t("ui.centers"),
      icon: "business-outline",
      color: colors.icon,
      href: "/(tabs)/directory/centers",
    },
    {
      id: "doctors",
      label: t("ui.doctors"),
      icon: "person-outline",
      color: colors.specialist,
      href: "/(tabs)/directory/professionals",
    },
    {
      id: "activities",
      label: t("ui.activities"),
      icon: "play-circle-outline",
      color: colors.icon,
      href: "/(tabs)/activity-library",
    },
    {
      id: "products",
      label: t("ui.homeProducts"),
      icon: "storefront-outline",
      color: colors.icon,
      href: "/(tabs)/products",
    },
    {
      id: "homeServices",
      label: t("ui.homeServices"),
      icon: "home-outline",
      color: colors.icon,
      href: "/(tabs)/services",
    },
    {
      id: "community",
      label: t("ui.fakhrCommunity"),
      icon: "people-outline",
      color: colors.icon,
      href: "/(tabs)/community",
    },
  ];

  const serviceRows = [services.slice(0, 4), services.slice(4, 8)];
  const gridRowDir =
    isRTL === I18nManager.isRTL ? "row" : "row-reverse";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={[styles.scroll, { marginBottom: assistantClearance }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            maxWidth: WEB_PHONE_WIDTH,
            paddingHorizontal: padX,
            paddingTop: ms(6),
            paddingBottom: ms(8),
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
            accessibilityLabel={t("ui.notifications")}
          >
            <Ionicons name="notifications-outline" size={ms(24)} color={colors.title} />
          </Pressable>
          <Image
            source={require("../../assets/images/fakhr-wordmark-blue.png")}
            style={{ width: ms(42), height: ms(52) }}
            resizeMode="contain"
            accessibilityLabel={t("ui.brand")}
          />
          <Pressable
            onPress={() => {}}
            hitSlop={10}
            style={({ pressed }) => [styles.iconBtn, styles.iconRight, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t("ui.refresh")}
          >
            <Ionicons name="refresh-outline" size={ms(24)} color={colors.title} />
          </Pressable>
        </View>

        <Text
          style={[
            styles.greeting,
            { fontSize: ms(26), lineHeight: ms(34), marginTop: ms(4), textAlign: "center" },
          ]}
        >
          {t("ui.helloName", { name: firstName })}
        </Text>
        <Text
          style={[
            styles.helpLine,
            { fontSize: ms(14), lineHeight: ms(22), marginBottom: ms(14), textAlign: "center" },
          ]}
        >
          {t("ui.helpToday")}
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
            placeholder={t("ui.searchHome")}
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { fontSize: ms(14) }]}
            textAlign={align}
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
              {t("ui.heroTitle")}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.heroBtn,
                { borderRadius: ms(14), minHeight: ms(32), paddingHorizontal: ms(14) },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("ui.discoverNow")}
            >
              <Text style={[styles.heroBtnText, { fontSize: ms(13) }]}>{t("ui.discoverNow")}</Text>
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
              width: "100%",
              gap: rowGap,
              marginBottom: ms(16),
            },
          ]}
        >
          {serviceRows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={[styles.gridRow, { gap: colGap, flexDirection: gridRowDir }]}
            >
              {row.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => openCategory(item.href)}
                  style={({ pressed }) => [
                    styles.cellWrap,
                    styles.cell,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label.replace(/\n/g, " ")}
                >
                  <View
                    pointerEvents="none"
                    style={[styles.iconSlot, { height: iconSlot }]}
                  >
                    <Ionicons name={item.icon} size={ms(32)} color={item.color} />
                  </View>
                  <Text
                    pointerEvents="none"
                    style={[
                      styles.cellLabel,
                      { fontSize: ms(11), lineHeight: ms(16), marginTop: ms(8) },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View
        pointerEvents="box-none"
        style={[
          styles.assistantDock,
          {
            width: contentW,
            bottom: assistantBottom,
            paddingHorizontal: padX,
            alignItems: isRTL ? "flex-start" : "flex-end",
          },
        ]}
      >
        {Platform.OS === "web" && (assistantHovered || assistantFocused) && (
          <View
            pointerEvents="none"
            role="tooltip"
            nativeID="ask-fakhr-tooltip"
            style={[
              styles.assistantTooltip,
              { bottom: assistantSize + 8 },
              isRTL ? { left: padX } : { right: padX },
            ]}
          >
            <Text style={styles.assistantTooltipText} numberOfLines={1}>
              {assistantLabel}
            </Text>
          </View>
        )}
        <Pressable
          onHoverIn={() => Platform.OS === "web" && setAssistantHovered(true)}
          onHoverOut={() => setAssistantHovered(false)}
          onFocus={() => Platform.OS === "web" && setAssistantFocused(true)}
          onBlur={() => setAssistantFocused(false)}
          onPress={() => {
            setAssistantHovered(false);
            setAssistantFocused(false);
            router.push("/(tabs)/directory/helpCenter");
          }}
          accessibilityRole="button"
          accessibilityLabel={assistantLabel}
          accessibilityHint={t("ui.startChat")}
          style={({ pressed }) => [
            styles.assistantLauncher,
            { width: assistantSize, height: assistantSize, borderRadius: assistantSize / 2 },
            pressed && styles.pressed,
          ]}
        >
          <View pointerEvents="none" style={styles.assistantAvatar}>
            <Image
              source={require("../../assets/images/fakhr-assistant-baby.png")}
              style={styles.assistantImage}
              resizeMode="cover"
              accessible={false}
            />
          </View>
        </Pressable>
      </View>
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
  },
  helpLine: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "center",
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
    alignSelf: "center",
    alignItems: "stretch",
    width: "100%",
  },
  gridRow: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  cellWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: "stretch",
    zIndex: 2,
    cursor: "pointer",
  },
  cell: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconSlot: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cellLabel: {
    width: "100%",
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  assistantDock: {
    position: "absolute",
    alignSelf: "center",
    direction: "ltr",
  },
  assistantLauncher: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.searchBorder,
    padding: 3,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  assistantTooltip: {
    position: "absolute",
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  assistantTooltipText: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    writingDirection: "ltr",
  },
  assistantAvatar: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.brand,
  },
  assistantImage: {
    // Frame the face and shoulders without altering the original image asset.
    position: "absolute",
    width: "200%",
    height: "160%",
    left: "-40%",
    top: 0,
  },
  pressed: {
    opacity: 0.85,
  },
});
