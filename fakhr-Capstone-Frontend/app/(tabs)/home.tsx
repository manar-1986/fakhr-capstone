import {dashboardPreview} from '../../api/smartPlan.api';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { HomeIllustration } from "../../components/home/HomeIllustration";
import { colors as fakhrColors } from "../../theme/colors";
import { homeReference as homeTheme } from "../../theme/homeReference";
import HomeDiscoverySections from "../../components/home/HomeDiscoverySections";
import HomeAdCarousel from "../../components/home/HomeAdCarousel";
import HomeGlobalSearch from "../../components/home/HomeGlobalSearch";
import HomeDrawer from "../../components/home/HomeDrawer";
import { Text, ScrollView } from "../../components/ui/AppText";
import { typography, tabBarContentHeight } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
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
  placeholder: palette.textSecondary,
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
  const { isRTL, dir } = useI18nLayout();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const insets = useSafeAreaInsets();
  // Match the existing absolute tab bar and reserve a separate launcher area.
  const assistantSize = 56;
  const { width: windowWidth, fontScale } = useWindowDimensions();
  const assistantBottom = tabBarContentHeight(fontScale) + Math.max(insets.bottom, 8) + 12;
  // Keep the web bubble within the launcher area, clear of scrollable content.
  const assistantClearance = assistantBottom + assistantSize + 12;
  const contentW = Math.min(windowWidth, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);
  const [assistantHovered, setAssistantHovered] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assistantFocused, setAssistantFocused] = useState(false);
  const assistantLabel = t("ui.askFakhr");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser", user?.id],
    queryFn: getCurrentUser,
    enabled: !!user,
    retry: false,
  });

  const userName = currentUser?.name || user?.name || "";
  const firstName = useMemo(() => {
    const name = userName.trim();
    if (!name) return isRTL ? "ضيف" : "Guest";
    return name.split(/\s+/)[0];
  }, [userName, isRTL]);

  const padX = ms(20);
  const colGap = 8;
  const rowGap = 8;
  const iconSlot = 52;
  // AppText uses Tajawal Medium below weight 600 and a 1.5x minimum line height.
  // Home labels stay compact with natural accessibility wrapping.
  const serviceLabelSize = 14;
  const serviceLabelLineHeight = 21;

  const openCategory = (href: Href) => {
    router.push(href);
  };

  const services: ServiceItem[] = [
    {
      id: "disability",
      label: isRTL ? t("ui.disabilityCategories").split("\n")[0] : t("ui.disabilityCategories"),
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
      id: "doctors",
      label: t("ui.doctors"),
      icon: "person-outline",
      color: colors.specialist,
      href: "/(tabs)/directory/professionals",
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
      id: "sportsClubs",
      label: isRTL ? "النوادي الرياضية" : "Sports Clubs",
      icon: "trophy",
      color: "#D99B27",
      href: "/(tabs)/directory/sports-clubs",
    },
  ];

  // Keep labels readable on small phones and with larger accessibility text.
  const columns = 3;
  const cardWidth = (contentW - padX * 2 - colGap * (columns - 1)) / columns;
  // Measure natural label heights instead of clipping text or fixing oversized cards.
  // Scope measurements to the layout so changing language/font scale can shrink again.
  const layoutKey = `${cardWidth}:${fontScale}:${isRTL}`;
  const [labelSizes, setLabelSizes] = useState<{ key: string; heights: Record<string, number> }>({ key: "", heights: {} });
  const labelHeight = Math.max(serviceLabelLineHeight * 2,
    ...Object.values(labelSizes.key === layoutKey ? labelSizes.heights : {}));
  const cardHeight = Math.max(106, iconSlot + 2 + 12 + 2 + Math.ceil(labelHeight));
  const serviceRows = Array.from({ length: Math.ceil(services.length / columns) },
    (_, index) => services.slice(index * columns, (index + 1) * columns));
  const cardTints: Record<string, string> = {
    disability: "#EBF1FD",
    schools: "#EBF1FD",
    doctors: "#EBF1FD",
    products: "#EBF1FD",
    homeServices: "#EBF1FD",
    sportsClubs: "#EBF1FD",
  };
  const gridRowDir = isRTL ? "row-reverse" : "row";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <HomeDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={[styles.scroll, { marginBottom: assistantClearance }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            maxWidth: WEB_PHONE_WIDTH,
            paddingHorizontal: padX,
            paddingTop: 8,
            paddingBottom: 12,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topRow, { flexDirection: gridRowDir }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("tabs.account")} onPress={() => router.push("/(tabs)/profile")} style={[styles.identity, { flexDirection: gridRowDir }]}>
            <View style={styles.profileIcon}><Ionicons name="person-outline" size={23} color={homeTheme.blue} /></View>
            <Text style={[styles.profileName, { writingDirection: dir }]} numberOfLines={2}>{firstName}</Text>
          </Pressable>
          <Image source={require("../../assets/images/fakhr-wordmark-blue.png")} style={{ width: 46, height: 60 }} resizeMode="contain" accessibilityLabel={t("ui.brand")} />
          <View style={[styles.headerActions, { flexDirection: gridRowDir }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={t("ui.notifications")} onPress={() => Alert.alert(t("home.notifications"), t("home.newNotifications"))} style={styles.headerButton}><Ionicons name="notifications-outline" size={25} color={homeTheme.ink} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={isRTL ? "القائمة" : "Menu"} onPress={() => setDrawerOpen(true)} style={styles.headerButton}><Ionicons name="menu-outline" size={27} color={homeTheme.ink} /></Pressable>
          </View>
        </View>
        <HomeGlobalSearch />



        <View
          style={[
            styles.grid,
            {
              width: "100%",
              gap: rowGap,
              marginBottom: 12,
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
                  testID={`home-service-${item.id}`}
                  onPress={() => openCategory(item.href)}
                  style={({ pressed }) => [
                    styles.cellWrap,
                    styles.cell,
                    { borderColor: "#E8ECF5", shadowColor: "#263A72", shadowOffset: { width: 0, height: 4 }, shadowOpacity: .07, shadowRadius: 10, elevation: 2 },
                    { backgroundColor: cardTints[item.id], width: cardWidth, minHeight: cardHeight },
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label.replace(/\n/g, " ")}
                >
                  <View
                    pointerEvents="none"
                    style={[styles.iconSlot, { height: iconSlot }]}
                  >
                    <View testID={`home-emblem-${item.id}`}><HomeIllustration kind={item.id}/></View>
                  </View>
                  <Text
                    testID={`home-label-${item.id}`}
                    onLayout={({ nativeEvent }) => {
                      const height = Math.ceil(nativeEvent.layout.height);
                      setLabelSizes(previous => {
                        const heights = previous.key === layoutKey ? previous.heights : {};
                        return heights[item.id] === height ? previous : { key: layoutKey, heights: { ...heights, [item.id]: height } };
                      });
                    }}
                    pointerEvents="none"
                    style={[
                      styles.cellLabel,
                      { fontSize: serviceLabelSize, lineHeight: serviceLabelLineHeight, marginTop: 2, writingDirection: dir },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
        <HomeAdCarousel />
        <HomeDiscoverySections />
      </ScrollView>
      </KeyboardAvoidingView>
      <View
        pointerEvents="box-none"
        style={[
          styles.assistantDock,
          {
            width: contentW,
            bottom: assistantBottom,
            paddingHorizontal: padX,
            alignItems: "flex-end",
          },
        ]}
      >
        {dashboardPreview()&&<Pressable accessibilityRole="button" accessibilityLabel={isRTL?'معاينة المساعد — محاكاة محلية':'Assistant preview — local simulation'} onPress={()=>router.push('/(tabs)/plan/ask')} style={{padding:8,backgroundColor:'#FFFFFF',borderRadius:12,borderWidth:1,borderColor:'#BCC3D8',marginBottom:8}}><Text style={{color:'#6E7CAF',fontSize:12}}>{isRTL?'معاينة المساعد — محاكاة محلية':'Assistant preview — local simulation'}</Text></Pressable>}
        {Platform.OS === "web" && (assistantHovered || assistantFocused) && (
          <View
            pointerEvents="none"
            role="tooltip"
            nativeID="ask-fakhr-tooltip"
            style={[
              styles.assistantTooltip,
              { bottom: assistantSize + 8 },
              { right: padX },
            ]}
          >
            <Text style={[styles.assistantTooltipText]} numberOfLines={1}>
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
            if (requireAuth("/(tabs)/plan/ask")) router.push("/(tabs)/plan/ask");
          }}
          accessibilityRole="button"
          testID="home-ask-fakhr"
          accessibilityLabel={assistantLabel}
          accessibilityHint={t("ui.startChat")}
          style={({ pressed }) => [
            styles.assistantLauncher,
            { width: assistantSize, height: assistantSize, borderRadius: assistantSize / 2, borderTopRightRadius: 4 },
            pressed && styles.pressed,
          ]}
        >
          <View pointerEvents="none" accessible={false} style={styles.assistantChatIcon}>
            <View style={styles.assistantChatBody}>
              <View style={styles.assistantChatLine} />
              <View style={styles.assistantChatLine} />
              <View style={[styles.assistantChatLine, { width: 13 }]} />
            </View>
            <View style={styles.assistantChatTail} />
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    minHeight: 68,
  },
  identity: { flex: 1, alignItems: "center", gap: 6 }, profileIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: homeTheme.surface, alignItems: "center", justifyContent: "center" }, profileName: { fontSize: typography.cardTitle, fontWeight: typography.weightMedium, color: homeTheme.ink, flexShrink: 1 }, headerActions: { flex: 1, justifyContent: "flex-end" }, headerButton: { width: 36, minHeight: 44, alignItems: "center", justifyContent: "center" }, serviceEmblem: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: fakhrColors.backgroundWash, borderWidth: 1, borderColor: homeTheme.border },
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
    fontWeight: typography.weightRegular,
    color: homeTheme.muted,
    textAlign: "center",
  },
  helpLine: {
    fontWeight: typography.weightRegular,
    color: homeTheme.ink,
    textAlign: "center",
  },
  grid: {
    alignSelf: "center",
    alignItems: "stretch",
    width: "100%",
  },
  gridRow: {
    direction: "ltr",
    width: "100%",
    alignItems: "stretch",
    justifyContent: "center",
  },
  cellWrap: {
    flexGrow: 0,
    minWidth: 0,
    alignItems: "stretch",
    zIndex: 2,
    cursor: "pointer",
  },
  cell: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: homeTheme.border,
  },
  iconSlot: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cellLabel: {
    width: "100%",
    fontWeight: typography.weightMedium,
    color: homeTheme.ink,
    textAlign: "center",
  },
  assistantDock: {
    position: "absolute",
    alignSelf: "center",
    direction: "ltr",
  },
  assistantLauncher: {
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantChatIcon: {
    width: 28,
    height: 26,
    direction: "ltr",
  },
  assistantChatBody: {
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.white,
    paddingTop: 5,
    paddingHorizontal: 4.5,
    gap: 2.2,
  },
  assistantChatLine: {
    width: 19,
    height: 2.2,
    borderRadius: 2,
    backgroundColor: palette.brandSoft,
  },
  assistantChatTail: {
    position: "absolute",
    left: 0,
    top: 19,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderRightWidth: 8,
    borderTopColor: colors.white,
    borderRightColor: "transparent",
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
    fontSize: typography.helper,
    lineHeight: typography.helperLineHeight,
    fontWeight: typography.weightRegular,
    writingDirection: "ltr",
  },
  pressed: {
    opacity: 0.85,
  },
});
