import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { Text } from "../ui/AppText";
import HomeDrawer from "../home/HomeDrawer";
import { SharedHeaderContext } from "./SharedHeaderContext";

export const navigationControlStyle = { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F3F5FD", alignItems: "center" as const, justifyContent: "center" as const };
const titles: Record<string, [string, string]> = {
  "/plan/task-details": ["تفاصيل النشاط", "Task Details"],
  "/plan/check-in": ["المتابعة اليومية", "Daily Check-In"],
  "/plan/progress": ["التقدم", "Progress"],
  "/resources/content-details": ["تفاصيل المحتوى", "Content Details"],
};
export function AppNavigationShell({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { isRTL } = useI18nLayout();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const backAction = useRef<(() => void) | null>(null);
  const minimal = pathname === "/welcome" || pathname === "/";
  const main = segments[0] === "(tabs)";
  const context = useMemo(() => ({ managed: !minimal, backAction }), [minimal]);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  const back = () => {
    if (backAction.current) { backAction.current(); return; }
    if (router.canGoBack()) router.back();
    else if (pathname !== "/home") router.replace("/(tabs)/home");
  };
  const title = titles[pathname]?.[isRTL ? 0 : 1];
  return <SharedHeaderContext.Provider value={context}>
    <View style={s.shell}>
      {!minimal && <View testID="app-header" style={[s.header, { paddingTop: insets.top, minHeight: 60 + insets.top }]}>
        <View style={[s.row, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {pathname !== "/home" ? <Pressable testID="app-header-back" accessibilityRole="button" accessibilityLabel={isRTL ? "رجوع" : "Back"} onPress={back} style={navigationControlStyle}><Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#152467" /></Pressable> : <View style={s.placeholder} />}
          <View style={s.title}>{title && <Text accessibilityRole="header" style={s.titleText}>{title}</Text>}</View>
          {main ? <Pressable testID="app-header-menu" accessibilityRole="button" accessibilityLabel={isRTL ? "القائمة" : "Menu"} onPress={() => setDrawerOpen(true)} style={navigationControlStyle}><Ionicons name="menu-outline" size={24} color="#152467" /></Pressable> : <View style={s.placeholder} />}
        </View>
      </View>}
      <SafeAreaProvider style={s.shell}>{children}</SafeAreaProvider>
      <HomeDrawer visible={drawerOpen && main} onClose={() => setDrawerOpen(false)} />
    </View>
  </SharedHeaderContext.Provider>;
}
const s = StyleSheet.create({ shell: { flex: 1, backgroundColor: "white" }, header: { backgroundColor: "white", paddingHorizontal: 18, zIndex: 20 }, row: { minHeight: 60, alignItems: "center", justifyContent: "space-between", gap: 12 }, title: { flex: 1 }, titleText: { fontSize: 17, fontWeight: "600", textAlign: "center", color: "#152467" }, placeholder: { width: 44, height: 44 } });
