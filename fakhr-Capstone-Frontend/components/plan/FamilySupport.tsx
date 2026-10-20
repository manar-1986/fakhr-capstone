import React, { useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors, typography } from "../../theme";

/** Public resources only. Personal child state stays in the owning Plan screen. */
export default function FamilySupport() {
  const router = useRouter();
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const { width, fontScale } = useWindowDimensions();
  const [information, setInformation] = useState<"workshops" | "school" | null>(null);
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  const fourColumns = width >= (isRTL ? 375 : 430) && fontScale <= 1.2;
  const options = [
    { id: "guidance", ar: "إرشاد ولي الأمر", en: "Parent Guidance", icon: "person-outline" as const, open: () => router.push("/(tabs)/resources") },
    { id: "workshops", ar: "ورش ودورات", en: "Workshops & Courses", icon: "people-outline" as const, open: () => setInformation("workshops") },
    { id: "home", ar: "موارد منزلية", en: "Home Resources", icon: "home-outline" as const, open: () => router.push("/(tabs)/activity-library") },
    { id: "school", ar: "التواصل مع المدرسة", en: "School Communication", icon: "school-outline" as const, open: () => setInformation("school") },
  ];
  return <View testID="family-support" style={s.section}>
    <View style={[s.headingRow, { flexDirection: tabRow }]}>
      <Ionicons name="people-outline" size={22} color={colors.primary} />
      <Text accessibilityRole="header" style={[s.heading, txt]}>{text("دعم الأسرة", "Family Support")}</Text>
    </View>
    <View style={[s.grid, { flexDirection: tabRow }]}>
      {options.map(option => <Pressable key={option.id} testID={`family-support-${option.id}`} accessibilityRole="button" accessibilityLabel={text(option.ar, option.en)} onPress={option.open} style={({ pressed }) => [s.option, { width: fourColumns ? "23%" : "48%" }, pressed && { opacity: 0.7 }]}>
        <View style={s.icon}><Ionicons name={option.icon} size={28} color="#607DCB" /></View>
        <Text style={[s.label, { writingDirection: dir }]}>{text(option.ar, option.en)}</Text>
      </Pressable>)}
    </View>
    {information && <View accessibilityLiveRegion="polite" style={s.information}>
      <Text style={[s.heading, txt]}>{information === "workshops" ? text("ورش ودورات", "Workshops & Courses") : text("التواصل مع المدرسة", "School Communication")}</Text>
      <Text style={[s.body, txt]}>{information === "workshops"
        ? text("لا تتوفر حالياً قائمة ورش ودورات منشورة في فخر. يمكنك تصفح الموارد المنزلية المتاحة إلى حين إضافة محتوى موثّق.", "Fakhr does not currently have a published workshops and courses directory. You can browse the available home resources while verified content is added.")
        : text("المراسلة المباشرة مع المدرسة غير متاحة حالياً. يمكنك الاطلاع على بيانات المدارس المتوفرة في الدليل والتواصل معها عبر معلومات الاتصال المسجلة. لن تتم مشاركة معلومات طفلك.", "Direct school messaging is not available yet. Browse existing school listings and use their recorded contact information. Your child's information will not be shared.")}</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push(information === "school" ? "/(tabs)/directory/schools" : "/(tabs)/activity-library")} style={s.action}>
        <Text style={s.actionText}>{information === "school" ? text("عرض دليل المدارس", "View school directory") : text("عرض الموارد المنزلية", "View home resources")}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={text("إغلاق المعلومات", "Close information")} onPress={() => setInformation(null)} style={s.close}><Text style={s.actionText}>{text("إغلاق", "Close")}</Text></Pressable>
    </View>}
  </View>;
}

const s = StyleSheet.create({
  section: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight, padding: 14, gap: 12 },
  headingRow: { alignItems: "center", gap: 8 },
  heading: { color: colors.text, fontSize: typography.section, fontWeight: typography.weightSemibold, flexShrink: 1 },
  grid: { flexWrap: "wrap", justifyContent: "space-between", rowGap: 8 },
  option: { borderWidth: 1, borderColor: colors.borderLight, backgroundColor: "#EBF1FD", borderRadius: 14, paddingHorizontal: 4, paddingVertical: 10, alignItems: "center", gap: 6, minHeight: 84 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#EBF1FD", alignItems: "center", justifyContent: "center" },
  label: { color: colors.text, fontSize: typography.helper, fontWeight: typography.weightRegular, textAlign: "center", lineHeight: typography.helperLineHeight },
  information: { borderRadius: 12, padding: 12, gap: 10, backgroundColor: colors.borderLight },
  body: { color: colors.textSecondary, fontSize: typography.helper, lineHeight: typography.helperLineHeight },
  action: { minHeight: 44, borderRadius: 10, padding: 8, justifyContent: "center", backgroundColor: colors.white },
  actionText: { color: "#0B093B", textAlign: "center", fontSize: typography.button, fontWeight: typography.weightMedium },
  close: { minHeight: 44, justifyContent: "center" },
});
