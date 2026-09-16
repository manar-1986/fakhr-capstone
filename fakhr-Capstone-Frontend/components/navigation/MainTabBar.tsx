import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const colors = {
  white: "#FFFFFF",
  active: "#6F80B4",
  inactive: "#3A3D4A",
  border: "#ECEEF3",
};

type TabDef = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconFocused: React.ComponentProps<typeof Ionicons>["name"];
  routeName: "home" | "profile";
};

const TABS: TabDef[] = [
  { key: "home", label: "الرئيسية", icon: "home-outline", iconFocused: "home", routeName: "home" },
  { key: "profile", label: "حسابي", icon: "person-outline", iconFocused: "person", routeName: "profile" },
];

type MainTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented: boolean };
  };
};

export function MainTabBar({ state, navigation }: MainTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const bottomPad = Math.max(insets.bottom, 8);
  const barHeight = 58;
  const focusedRoute = state.routes[state.index]?.name;

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
    const route = state.routes.find((r) => r.name === tab.routeName);
    if (!route) return;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      router.navigate(`/(tabs)/${tab.routeName}`);
    }
  };

  return (
    <View style={[styles.outer, { paddingBottom: bottomPad }]}>
      <View style={[styles.row, { minHeight: barHeight }]}>
        {TABS.map((tab) => {
          const focused = isFocused(tab);
          const color = focused ? colors.active : colors.inactive;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => onPressTab(tab)}
              style={styles.tab}
            >
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={22}
                color={color}
              />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {tab.label}
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
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    writingDirection: "rtl",
  },
});
