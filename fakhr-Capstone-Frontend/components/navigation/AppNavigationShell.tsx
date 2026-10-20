import FavoriteButton from "../FavoriteButton";
import { detailFavorite } from "../../utils/favoriteNavigation";
import { clearCancelledAuthDestination } from "../../utils/authRedirect";
import { useAuth } from "../../context/AuthContext";
import { syncAssistantAccount } from "../../utils/assistantSession";
import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
import { findInstitution, institutionDirectoryCategory } from "../../utils/institutionDirectory";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, usePathname, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { Text } from "../ui/AppText";
import HomeDrawer from "../home/HomeDrawer";
import { SharedHeaderContext } from "./SharedHeaderContext";

export const navigationControlStyle = { width: 44, height: 44, borderRadius: 14, backgroundColor: fakhrColors.backgroundWash, alignItems: "center" as const, justifyContent: "center" as const };
const titles: Record<string, [string, string]> = {
  "/plan/task-details": ["تفاصيل النشاط", "Task Details"],
  "/plan/check-in": ["المتابعة اليومية", "Daily Check-In"],
  "/plan/progress": ["التقدم", "Progress"],
  "/resources/content-details": ["تفاصيل المحتوى", "Content Details"],
};
export function AppNavigationShell({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const previousAuthPath = useRef(pathname);
  useEffect(() => {
    clearCancelledAuthDestination(previousAuthPath.current, pathname);
    previousAuthPath.current = pathname;
  }, [pathname]);
  const { id, origin } = useGlobalSearchParams<{ id?: string | string[]; origin?: string }>();
  const { user } = useAuth();
  useEffect(() => { syncAssistantAccount(user?.id); }, [user?.id]);
  const institutionId = Array.isArray(id) ? id[0] : id;
  const institution = findInstitution(institutionId);
  const favorite = detailFavorite(pathname, institutionId);
  const segments = useSegments();
  const { isRTL } = useI18nLayout();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const backAction = useRef<(() => void) | null>(null);
  const minimal = pathname === "/welcome" || pathname === "/";
  // Home owns its branded header and drawer; never stack shared chrome above it.
  const showSharedHeader = !minimal && pathname !== "/home" && pathname !== "/directory/helpCenter" && pathname !== "/resources" && pathname !== "/profile" && pathname !== "/profile/settings";
  const main = segments[0] === "(tabs)";
  const context = useMemo(() => ({ managed: showSharedHeader, backAction }), [showSharedHeader]);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  const back = () => {
    if (backAction.current) { backAction.current(); return; }
    if (origin === "ask-fakhr" && ["/directory/institution-details", "/directory/professional-details"].includes(pathname)) {
      router.dismissTo("/(tabs)/directory/helpCenter"); return;
    }
    if (router.canGoBack()) router.back();
    else if (pathname !== "/home") router.replace("/(tabs)/home");
  };
  const title = titles[pathname]?.[isRTL ? 0 : 1];
  const clinicDetails = pathname === "/directory/professional-details" || (pathname === "/directory/institution-details" && (institutionId?.startsWith("backend:") || institution?.categories.includes("rehabilitation")));
  return <SharedHeaderContext.Provider value={context}>
    <View style={s.shell}>
      {showSharedHeader && <View testID="app-header" style={[s.header, clinicDetails && { backgroundColor: fakhrColors.secondary }, { paddingTop: insets.top, minHeight: 60 + insets.top }, pathname === "/plan" && { flexShrink: 0 }]}>
        {/* Plan uses physical left/right slots; avoid a second reversal from inherited RTL. */}
        <View testID="app-header-row" style={[s.row, { flexDirection: isRTL ? "row-reverse" : "row" }, pathname === "/plan" && { direction: "ltr" }]}>
          {pathname !== "/home" ? <Pressable testID="app-header-back" accessibilityRole="button" accessibilityLabel={isRTL ? "رجوع" : "Back"} onPress={back} style={navigationControlStyle}><Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={fakhrColors.text} /></Pressable> : <View style={s.placeholder} />}
          <View style={s.title}>{title && <Text accessibilityRole="header" style={s.titleText}>{title}</Text>}</View>
          {favorite && <FavoriteButton item={favorite} />}
          {main ? <Pressable testID="app-header-menu" accessibilityRole="button" accessibilityLabel={isRTL ? "القائمة" : "Menu"} onPress={() => setDrawerOpen(true)} style={navigationControlStyle}><Ionicons name="menu-outline" size={24} color={fakhrColors.text} /></Pressable> : <View style={s.placeholder} />}
        </View>
      </View>}
      <SafeAreaProvider style={s.shell}>{children}</SafeAreaProvider>
      {showSharedHeader && main && <HomeDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />}
    </View>
  </SharedHeaderContext.Provider>;
}
const s = StyleSheet.create({ shell: { flex: 1, backgroundColor: fakhrColors.background }, header: { backgroundColor: "white", paddingHorizontal: 18, zIndex: 20 }, row: { minHeight: 60, alignItems: "center", justifyContent: "space-between", gap: 12 }, title: { flex: 1 }, titleText: { fontSize: typography.title, fontWeight: typography.weightSemibold, textAlign: "center", color: fakhrColors.text }, placeholder: { width: 44, height: 44 } });

