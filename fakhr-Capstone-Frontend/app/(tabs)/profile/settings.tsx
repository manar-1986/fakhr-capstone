import { typography } from "../../../theme/typography";
import { colors as fakhrColors } from "../../../theme/colors";
import HomeDrawer from "../../../components/home/HomeDrawer";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, type ComponentProps, type ReactNode } from "react";
import { Image, Linking, Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "../../../context/LanguageContext";
import type { AppLanguage } from "../../../i18n";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { homeTheme as c } from "../../../theme/home";
import { tabBarContentHeight } from "../../../theme/typography";

type Row = { id: string; ar: string; en: string; icon: ComponentProps<typeof Ionicons>["name"]; subtitle?: string; tint?: string; color?: string };
export default function SettingsScreen({ children }: { children?: ReactNode } = {}) {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const { isRTL } = useI18nLayout();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState(false);
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const direction = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const textDirection = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  const sections: { ar: string; en: string; rows: Row[] }[] = [
    { ar: "تفضيلات التطبيق", en: "Application preferences", rows: [
      { id: "language", ar: "اللغة", en: "Language", icon: "globe-outline", subtitle: locale === "ar" ? "العربية" : "English", color: "#0B093B" },
      { id: "notifications", ar: "الإشعارات", en: "Notifications", icon: "notifications-outline", tint: "#F5EFFF", color: "#8960D1" },
      { id: "accessibility", ar: "إمكانية الوصول", en: "Accessibility", icon: "accessibility-outline", subtitle: tr("حجم الخط والتباين", "Font size and contrast") },
    ] },
    { ar: "الأمان والخصوصية", en: "Security & privacy", rows: [
      { id: "password", ar: "تغيير كلمة المرور", en: "Change password", icon: "lock-closed-outline" },
      { id: "permissions", ar: "أذونات التطبيق", en: "App permissions", icon: "shield-outline", color: "#0B093B" },
      { id: "sharing", ar: "بيانات الطفل ومشاركتها", en: "Child data & sharing", icon: "person-outline", color: "#0B093B" },
      { id: "privacy", ar: "سياسة الخصوصية", en: "Privacy policy", icon: "document-text-outline" },
      { id: "terms", ar: "الشروط والأحكام", en: "Terms & Conditions", icon: "document-outline" },
    ] },
    { ar: "إدارة الحساب", en: "Account management", rows: [
      { id: "export", ar: "تنزيل بياناتي", en: "Download my data", icon: "download-outline", color: "#0B093B" },
      { id: "delete", ar: "حذف الحساب", en: "Delete account", icon: "trash-outline", subtitle: tr("غير مفعّل — بانتظار اعتماد سياسة الحذف", "Inactive — deletion policy pending"), tint: "#FFF0F4", color: "#D95B73" },
    ] },
  ];
  const row = sections.flatMap(section => section.rows).find(item => item.id === panel);
  const descriptions: Record<string, string> = {
    notifications: tr("لا تتوفر تفضيلات إشعارات داخل التطبيق حالياً. يمكنك مراجعة إشعارات فخر في إعدادات الجهاز إن كانت متاحة. على الويب، افتح إعدادات الموقع في المتصفح ثم الإشعارات.", "In-app notification preferences are not implemented yet. Review Fakhr notifications in device settings if available. On Web, use your browser’s site settings, then Notifications."),
    accessibility: tr("يستخدم فخر حجم الخط المحدد في إعدادات جهازك. على iOS: الإعدادات ← تسهيلات الاستخدام ← الشاشة وحجم النص لزيادة حجم النص والتباين. على Android: الإعدادات ← إمكانية الوصول ← حجم العرض والنص وتصحيح الألوان. على الويب: استخدم تكبير المتصفح وإعدادات التباين في نظام التشغيل. لا توجد إعدادات مستقلة لحجم الخط والتباين داخل فخر حالياً.", "Fakhr follows your device’s text size. On iOS: Settings → Accessibility → Display & Text Size for larger text and increased contrast. On Android: Settings → Accessibility → Display size and text / color correction. On Web: use browser zoom and operating-system contrast settings. Separate in-app font-size and contrast controls are not implemented yet."),
    permissions: tr("إذن التقويم مهيأ لإضافة المواعيد عند اختيار إضافة إلى التقويم. لا تعني تهيئته أنك منحت الإذن. راجع الأذونات الممنوحة من إعدادات جهازك. على الويب، افتح إعدادات الموقع من شريط العنوان. لا يطلب هذا العرض أي إذن جديد.", "Calendar permission is configured for adding appointments when you choose Add to Calendar. Configuration does not mean permission has been granted. Review actual grants in device settings. On Web, open site settings from the address bar. This screen requests no new permissions."),
    sharing: tr("لا توجد حالياً أدوات لإدارة مشاركة بيانات الطفل في التطبيق. لا يمكن تغيير أذونات المشاركة من هذه الشاشة، ولم يتم عرض أو مشاركة أي بيانات طفل.", "Child-data sharing controls are not implemented in the app. Sharing permissions cannot be changed here. No child data is displayed or shared by this screen."),
    privacy: tr("لم يتم إعداد رابط لسياسة خصوصية رسمية معتمدة لفخر. يجب توفير الرابط المعتمد قبل تفعيل هذه الميزة.", "An approved official Fakhr privacy-policy link has not been configured. An approved link is required before this feature can be enabled."),
    export: tr("لا تتوفر حالياً وظيفة آمنة لتنزيل بيانات الحساب. لم يتم إنشاء أي ملف أو إرسال أي بيانات.", "A secure account-data export is not implemented yet. No file has been created and no data has been sent."),
    delete: tr("حذف الحساب غير مفعّل إلى حين اعتماد سياسة الاحتفاظ بالبيانات وسلوك الحذف الآمن. لم يتم حذف الحساب أو أي بيانات.", "Account deletion remains inactive pending approval of the data-retention policy and safe deletion behavior. No account or data has been deleted."),
  };
  const open = (id: string) => {
    setDeviceError(false);
    if (id === "password") router.push("/(auth)/forgot-password");
    else if (id === "privacy") router.push("/(auth)/privacy-policy");
    else if (id === "terms") router.push("/(auth)/terms-conditions");
    else setPanel(id);
  };
  const selectLanguage = (next: AppLanguage) => { setPanel(null); if (next !== locale) setLocale(next); };
  const openDevice = async () => {
    try {
      if (panel === "accessibility" && Platform.OS === "android") await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
      else await Linking.openSettings();
    } catch { setDeviceError(true); }
  };
  return <SafeAreaView style={s.safe} edges={["top"]}>
    <View style={{ width: Math.min(width, 430), flex: 1 }}>
      <ScrollView contentContainerStyle={[s.content, { paddingBottom: tabBarContentHeight(fontScale) + Math.max(insets.bottom, 8) + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Image source={require("../../../assets/images/fakhr-wordmark-blue.png")} resizeMode="contain" style={s.logo} accessibilityLabel="Fakhr" />
          <HeaderBackButton testID="settings-back" />
          <Pressable testID="settings-menu" accessibilityRole="button" accessibilityLabel={tr("القائمة", "Menu")} onPress={() => setDrawerOpen(true)} style={[s.menuButton, isRTL ? { left: 0 } : { right: 0 }]}><Ionicons name="menu-outline" size={24} color={fakhrColors.text} /></Pressable>
        </View>
        <Text accessibilityRole="header" style={s.title}>{tr("الإعدادات والخصوصية", "Settings & Privacy")}</Text>
        <Text style={s.subtitle}>{tr("إدارة حسابك وتخصيص تجربتك في فخر", "Manage your account and personalize your Fakhr experience")}</Text>
        {sections.map(section => <View key={section.en} style={s.section}>
          <Text accessibilityRole="header" style={[s.sectionTitle, textDirection]}>{tr(section.ar, section.en)}</Text>
          {section.rows.map(item => <Pressable key={item.id} testID={`settings-${item.id}`} accessibilityRole="button" accessibilityLabel={tr(item.ar, item.en)} onPress={() => open(item.id)} style={({ pressed }) => [s.row, direction, pressed && { backgroundColor: c.surface }]}>
            <View style={[s.icon, { backgroundColor: item.tint || "#EBF1FD" }]}><Ionicons name={item.icon} size={26} color={item.color || "#607DCB"} /></View>
            <View style={s.flex}><Text style={[s.label, textDirection, item.id === "delete" && { color: "#BE4056" }]}>{tr(item.ar, item.en)}</Text>{item.subtitle && <Text style={[s.secondary, textDirection]}>{item.subtitle}</Text>}</View>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={c.ink} />
          </Pressable>)}
        </View>)}
        {children}
      </ScrollView>
    </View>
    {drawerOpen && <HomeDrawer visible onClose={() => setDrawerOpen(false)} />}
    <Modal visible={!!panel} transparent animationType="fade" onRequestClose={() => setPanel(null)}>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setPanel(null)} accessibilityRole="button" accessibilityLabel={tr("إغلاق", "Close")} />
        <View style={s.sheet} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ padding: 22 }}>
            <Text accessibilityRole="header" style={s.sheetTitle}>{row ? tr(row.ar, row.en) : ""}</Text>
            {panel === "language" ? (["ar", "en"] as AppLanguage[]).map(language => <Pressable key={language} testID={`settings-locale-${language}`} accessibilityRole="button" accessibilityState={{ selected: locale === language }} onPress={() => selectLanguage(language)} style={[s.option, direction]}><Text style={[s.label, s.flex, textDirection]}>{language === "ar" ? "العربية" : "English"}</Text>{locale === language && <Ionicons name="checkmark" size={22} color={c.blue} />}</Pressable>) : <Text testID="settings-panel-description" style={[s.description, textDirection]}>{panel && descriptions[panel]}</Text>}
            {Platform.OS !== "web" && ["accessibility", "permissions", "notifications"].includes(panel || "") && <Pressable accessibilityRole="button" onPress={openDevice} style={s.primary}><Text style={s.primaryLabel}>{tr("فتح إعدادات الجهاز", "Open device settings")}</Text></Pressable>}
            {deviceError && <Text accessibilityRole="alert" style={s.secondary}>{tr("تعذر فتح الإعدادات. افتحها يدوياً من جهازك.", "Unable to open settings. Please open them manually on your device.")}</Text>}
            <Pressable testID="settings-panel-close" accessibilityRole="button" style={s.option} onPress={() => setPanel(null)}><Text style={[s.label, { color: "#0B093B" }]}>{tr("إغلاق", "Close")}</Text></Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  menuButton: { position: "absolute", top: 0, width: 44, height: 44, borderRadius: 14, backgroundColor: fakhrColors.backgroundWash, alignItems: "center", justifyContent: "center" },
  safe: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center" }, content: { paddingHorizontal: 16, paddingTop: 16 },
  header: { alignItems: "center", justifyContent: "center", minHeight: 54 }, logo: { width: 40, height: 54 }, back: { position: "absolute", top: 12, width: 42, height: 42, borderRadius: 14, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, lineHeight: 30, fontWeight: typography.weightSemibold, color: "#0B093B", textAlign: "center", marginTop: 8 }, subtitle: { fontSize: 14, lineHeight: 23, color: "#5E6486", textAlign: "center", marginTop: 5, marginBottom: 6 },
  section: { marginTop: 20 }, sectionTitle: { fontSize: 16, lineHeight: 25, fontWeight: typography.weightMedium, color: "#5E6486", marginBottom: 10 },
  row: { minHeight: 54, padding: 6, paddingHorizontal: 7, gap: 10, alignItems: "center", borderWidth: 1, borderColor: "#EDEFF9", borderRadius: 12, backgroundColor: "white", marginBottom: 7 }, icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }, flex: { flex: 1 }, label: { fontSize: 15, lineHeight: 24, fontWeight: typography.weightMedium, color: "#0B093B" }, secondary: { fontSize: 12, lineHeight: 19, color: "#5E6486" },
  overlay: { flex: 1, backgroundColor: "rgba(16,24,49,.45)", alignItems: "center", justifyContent: "center", padding: 20 }, sheet: { backgroundColor: "white", borderRadius: 22, width: "100%", maxWidth: 390, maxHeight: "85%" }, sheetTitle: { color: c.ink, fontSize: typography.section, fontWeight: typography.weightSemibold, textAlign: "center", marginBottom: 14 }, description: { color: c.ink, fontSize: typography.body }, option: { minHeight: 48, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderColor: c.border }, primary: { marginTop: 16, borderRadius: 12, backgroundColor: c.blue, padding: 12, alignItems: "center" }, primaryLabel: { fontSize: typography.cardTitle, color: "#0B093B", fontWeight: typography.weightMedium },
});
