import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, ActivityIndicator, type PointerEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../ui/AppText";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { getChildren } from "../../api/children.api";
import { homeTheme as c } from "../../theme/home";

export default function HomeDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { isRTL } = useI18nLayout();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const frameWidth = Platform.OS === "web" ? Math.min(width, 430) : width;
  const drawerWidth = frameWidth * .75;
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const [selection, setSelection] = useState<{ account: string; child: string }>();
  const [expanded, setExpanded] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const webGesture = Platform.OS === "web" ? {
    onPointerDown: (event: PointerEvent) => { pointerStart.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }; },
    onPointerUp: (event: PointerEvent) => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (start && event.nativeEvent.clientX - start.x < -drawerWidth * .22 && Math.abs(event.nativeEvent.clientY - start.y) < Math.abs(event.nativeEvent.clientX - start.x) / 1.5) close();
    },
    onPointerCancel: () => { pointerStart.current = null; },
  } : {};
  const children = useQuery({ queryKey: ["drawer-children", user?.id], queryFn: getChildren, enabled: visible && !!user, retry: false });
  const child = children.data?.find(item => selection?.account === user?.id && item.id === selection?.child) || children.data?.[0];
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const direction = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const textDirection = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  useEffect(() => {
    if (visible) {
      translateX.setValue(-drawerWidth);
      Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    } else setExpanded(false);
  }, [visible, drawerWidth, translateX]);
  const close = () => Animated.timing(translateX, { toValue: -drawerWidth, duration: 180, useNativeDriver: true }).start(() => onClose());
  const gesture = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => g.dx < -12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onMoveShouldSetPanResponder: (_, g) => g.dx < -12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderMove: (_, g) => translateX.setValue(Math.min(0, g.dx)),
    onPanResponderRelease: (_, g) => {
      if (g.dx < -drawerWidth * .22 || g.vx < -.5) close();
      else Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start(),
  });
  const navigate = (href: Href, protectedRoute = false) => {
    onClose();
    if (!protectedRoute || requireAuth(href)) router.push(href);
  };
  const items: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; href?: Href }[] = [
    { id: "bookings", label: tr("الحجوزات والطلبات", "Bookings & orders"), icon: "calendar-outline" },
    { id: "favorites", label: tr("المفضلة", "Favorites"), icon: "heart-outline" },
    { id: "messages", label: tr("الرسائل", "Messages"), icon: "chatbubble-ellipses-outline" },
    { id: "settings", label: tr("الإعدادات والخصوصية", "Settings & privacy"), icon: "shield-checkmark-outline", href: "/(tabs)/profile/settings" },
    { id: "help", label: tr("المساعدة والدعم", "Help & support"), icon: "headset-outline", href: "/(tabs)/profile/help-support" },
    { id: "about", label: tr("عن فخر", "About Fakhr"), icon: "information-circle-outline" },
  ];
  return <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
    <View style={s.modal}>
      <Pressable testID="drawer-overlay" accessibilityRole="button" accessibilityLabel={tr("إغلاق القائمة", "Close menu")} style={StyleSheet.absoluteFill} onPress={close} />
      <View pointerEvents="box-none" style={{ width: frameWidth, flex: 1, alignSelf: "center", direction: "ltr" }}>
        <Animated.View testID="home-drawer" accessibilityViewIsModal style={[s.drawer, { width: drawerWidth, paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12), transform: [{ translateX }] }]} {...(Platform.OS === "web" ? webGesture : gesture.panHandlers)}>
          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={s.header}>
              <Image source={require("../../assets/images/fakhr-wordmark-blue.png")} style={s.logo} resizeMode="contain" accessibilityLabel="Fakhr" />
              <Pressable testID="drawer-close" accessibilityRole="button" accessibilityLabel={tr("إغلاق", "Close")} onPress={close} style={s.close}><Ionicons name="close-outline" size={28} color={c.blue} /></Pressable>
            </View>
            <View style={[s.profile, direction]}>
              <Image source={require("../../assets/images/profile-avatar.png")} style={s.avatar} />
              <View style={s.flex}><Text style={[s.heading, textDirection]}>{tr("ولي الأمر", "Parent")}</Text><Text style={[s.secondary, textDirection]}>{tr("إدارة الحساب وأطفالك", "Manage your account and children")}</Text></View>
            </View>
            <View style={s.childCard}>
              <View style={[s.childRow, direction]}>
                <Pressable testID="drawer-child-selector" accessibilityRole="button" accessibilityState={{ expanded, disabled: !children.data?.length }} disabled={!children.data?.length} onPress={() => setExpanded(!expanded)} style={[s.childSelect, direction]}>
                  {child?.photoUrl ? <Image source={{ uri: child.photoUrl }} style={s.childAvatar} /> : <View style={[s.childAvatar, s.center]}><Ionicons name="person-outline" size={24} color={c.blue} /></View>}
                  <View style={s.flex}><Text style={[s.secondary, textDirection]}>{tr("الطفل الحالي", "Current child")}</Text><Text style={[s.childName, textDirection]}>{child ? (isRTL ? child.nameAr : child.nameEn) || child.name : tr("لا يوجد طفل", "No child selected")}</Text></View>
                  <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={c.ink} />
                </Pressable>
                <Pressable testID="drawer-add-child" accessibilityRole="button" onPress={() => navigate("/(tabs)/profile/add-child", true)} style={s.add}><Ionicons name="add-circle-outline" size={24} color={c.blue} /><Text style={s.addLabel}>{tr("إضافة طفل", "Add child")}</Text></Pressable>
              </View>
              {children.isFetching && <ActivityIndicator color={c.blue} />}
              {!user && <Text style={s.secondary}>{tr("سجل الدخول لعرض أطفالك", "Sign in to see your children")}</Text>}
              {children.isError && <Pressable accessibilityRole="button" onPress={() => children.refetch()}><Text style={s.secondary}>{tr("تعذر تحميل الأطفال · إعادة المحاولة", "Unable to load children · Retry")}</Text></Pressable>}
              {expanded && children.data?.map(item => <Pressable key={item.id} testID={`drawer-child-${item.id}`} accessibilityRole="button" accessibilityState={{ selected: item.id === child?.id }} onPress={() => { setSelection({ account: user!.id, child: item.id }); setExpanded(false); }} style={[s.childOption, direction]}><Text style={[s.childName, s.flex, textDirection]}>{(isRTL ? item.nameAr : item.nameEn) || item.name}</Text>{item.id === child?.id && <Ionicons name="checkmark" size={20} color={c.blue} />}</Pressable>)}
            </View>
            <View style={s.menu}>{items.map(item => <Pressable key={item.id} testID={`drawer-${item.id}`} accessibilityRole="button" accessibilityState={{ disabled: !item.href }} disabled={!item.href} onPress={() => item.href && navigate(item.href)} style={[s.row, direction]}>
              <View style={s.icon}><Ionicons name={item.icon} size={24} color={c.ink} /></View>
              <View style={s.flex}><Text style={[s.label, textDirection]}>{item.label}</Text>{!item.href && <Text style={[s.unavailable, textDirection]}>{tr("غير متاح حالياً", "Not available yet")}</Text>}</View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={19} color={c.muted} />
            </Pressable>)}</View>
            <View style={s.spacer} />
            <Pressable testID="drawer-logout" accessibilityRole="button" onPress={() => navigate(user ? "/(tabs)/profile/logout" : "/(auth)/login")} style={[s.logout, direction]}><View style={s.icon}><Ionicons name={user ? "log-out-outline" : "log-in-outline"} size={25} color={c.blue} /></View><Text style={[s.label, { color: c.muted }, textDirection]}>{user ? tr("تسجيل الخروج", "Log out") : tr("تسجيل الدخول", "Sign in")}</Text></Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  modal: { flex: 1, backgroundColor: "rgba(16,24,49,.58)" },
  drawer: { flex: 1, backgroundColor: "white", borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: "hidden", alignSelf: "flex-start", ...(Platform.OS === "web" ? { userSelect: "none" as const } : {}) },
  content: { flexGrow: 1, paddingHorizontal: 16 }, flex: { flex: 1 }, center: { alignItems: "center", justifyContent: "center" },
  header: { height: 82, alignItems: "center", justifyContent: "center" }, logo: { width: 50, height: 66 }, close: { position: "absolute", left: 0, top: 12, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  profile: { alignItems: "center", gap: 10, marginVertical: 16 }, avatar: { width: 56, height: 56, borderRadius: 28 }, heading: { color: c.ink, fontSize: 21, fontWeight: "700" }, secondary: { color: c.muted, fontSize: 13 },
  childCard: { borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.surface, padding: 10, marginBottom: 12 }, childRow: { alignItems: "center", gap: 8 }, childSelect: { flex: 1, alignItems: "center", gap: 6, minHeight: 54 }, childAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#E7EDFC" }, childName: { color: c.ink, fontSize: 15, fontWeight: "600" }, add: { alignItems: "center", paddingHorizontal: 3, gap: 3 }, addLabel: { fontSize: 12, color: c.blue }, childOption: { paddingVertical: 10, borderTopWidth: 1, borderColor: c.border, alignItems: "center" },
  menu: { marginTop: 4 }, row: { alignItems: "center", gap: 10, minHeight: 68, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border }, icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F0F4FC", alignItems: "center", justifyContent: "center" }, label: { color: c.ink, fontSize: 16, fontWeight: "600" }, unavailable: { fontSize: 11, color: c.muted }, spacer: { flex: 1, minHeight: 28 }, logout: { borderTopWidth: 1, borderColor: c.border, paddingVertical: 14, alignItems: "center", gap: 12 },
});

