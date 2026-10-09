import { homeTheme } from "../../theme/home";
import { Text } from "../ui/AppText";
import { typography, tabBarContentHeight } from "../../theme/typography";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors as palette } from "../../theme";

const colors = {
  white: palette.white,
  active: palette.primary,
  inactive: palette.text,
  border: palette.borderLight,
};

type TabRoute = "home" | "plan" | "discover" | "profile" | "products";

type TabDef = {
  key: string;
  labelKey: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconFocused: React.ComponentProps<typeof Ionicons>["name"];
  routeName: TabRoute;
  href: "/(tabs)/home" | "/(tabs)/plan" | "/(tabs)/discover" | "/(tabs)/profile" | "/(tabs)/products";
};

const TABS: TabDef[] = [
  {
    key: "home",
    labelKey: "tabs.home",
    icon: "home-outline",
    iconFocused: "home",
    routeName: "home",
    href: "/(tabs)/home",
  },
  {
    key: "plan",
    labelKey: "tabs.plan",
    icon: "calendar-outline",
    iconFocused: "calendar-outline",
    routeName: "plan",
    href: "/(tabs)/plan",
  },
  {
    key: "activities",
    labelKey: "tabs.activities",
    icon: "people-outline",
    iconFocused: "people",
    routeName: "discover",
    href: "/(tabs)/discover",
  },
  {
    key: "profile",
    labelKey: "tabs.account",
    icon: "person-outline",
    iconFocused: "person",
    routeName: "profile",
    href: "/(tabs)/profile",
  },
];

type MainTabBarProps = Partial<Pick<BottomTabBarProps, "state" | "navigation">> & { inline?: boolean };

export function MainTabBar({ state, navigation, inline = false }: MainTabBarProps) {
  const { t } = useTranslation();
  const { tabRow, dir } = useI18nLayout();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const bottomPad = Math.max(insets.bottom, 8);
  const { fontScale } = useWindowDimensions();
  const barHeight = tabBarContentHeight(fontScale);
  const focusedRoute = state?.routes[state.index]?.name;
  // Home and Products use compact navigation typography; other screens retain their styling.
  const homeAppearance = pathname === "/home" || pathname === "/register" || pathname.startsWith("/products");
  const visibleTabs: TabDef[] = [TABS[0], { key: "store", labelKey: "", icon: "storefront-outline", iconFocused: "storefront", routeName: "products", href: "/(tabs)/products" }, TABS[1], TABS[3]];

  if (
    pathname.includes("school-details") ||
    pathname.includes("helpCenter") ||
    pathname.includes("booking") ||
    pathname.includes("logout") ||
    pathname.includes("service-details")
  ) {
    return null;
  }

  const isFocused = (tab: TabDef) => focusedRoute === tab.routeName;

  const onPressTab = (tab: TabDef) => {
    const route = state?.routes.find((r) => r.name === tab.routeName);
    const event = route && navigation ? navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    }) : undefined;
    if (!event?.defaultPrevented) router.navigate(tab.href);
  };
  return (
    <View style={[styles.outer, inline && { position: "relative" }, homeAppearance && { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopColor: homeTheme.border }, { paddingBottom: bottomPad }]}>
      <View style={[styles.row, { minHeight: barHeight, flexDirection: tabRow }]}>
        {visibleTabs.map((tab) => {
          const focused = isFocused(tab);
          const color = homeAppearance ? (focused ? homeTheme.blue : homeTheme.muted) : focused ? colors.active : colors.inactive;
          const label = tab.key === "store" ? (dir === "rtl" ? "المتجر" : "Store") : t(tab.labelKey);
          return (
            <Pressable
              key={tab.key}
              testID={`main-tab-${tab.key}`}
              accessibilityState={{ selected: focused }}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => onPressTab(tab)}
              style={styles.tab}
            >
              {tab.routeName === "plan" ? <MaterialCommunityIcons
                name="calendar-check-outline"
                size={homeAppearance ? 24 : 22}
                color={color}
              /> : <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={homeAppearance ? 24 : 22}
                color={color}
              />}
              <Text
                style={[styles.label, homeAppearance && [styles.homeLabel], { color, writingDirection: dir }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === "android" ? 12 : 0,
  },
  row: {
    alignItems: "center",
    width: "100%",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: typography.label,
    lineHeight: typography.labelLineHeight,
    textAlign: "center",
    fontWeight: "600",
    marginTop: 4,
  },
  homeLabel: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
});



