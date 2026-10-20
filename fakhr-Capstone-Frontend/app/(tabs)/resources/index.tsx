import { typography } from "../../../theme/typography";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
type Category = { id: string; ar: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; color: string; bg: string };
const categories: Category[] = [
  { id: "autism", ar: "اضطراب طيف التوحد", icon: "infinity", color: "#4666D6", bg: "#EDF5FF" },
  { id: "adhd", ar: "تشتت الانتباه وفرط الحركة", icon: "head-lightbulb-outline", color: "#F4A329", bg: "#FFF3E3" },
  { id: "intellectual", ar: "الإعاقة الذهنية", icon: "sprout-outline", color: "#29A080", bg: "#E6FAF2" },
  { id: "learning", ar: "صعوبات التعلم", icon: "book-open-outline", color: "#A267C8", bg: "#F4ECFC" },
  { id: "motor", ar: "الإعاقة الحركية", icon: "wheelchair-accessibility", color: "#4569DC", bg: "#EDF0FF" },
  { id: "hearing", ar: "الإعاقة السمعية", icon: "ear-hearing", color: "#E8658F", bg: "#FFEDF3" },
  { id: "vision", ar: "الإعاقة البصرية", icon: "eye-outline", color: "#287E8F", bg: "#E7FAF6" },
  { id: "speech", ar: "اضطرابات النطق والتواصل", icon: "comment-multiple-outline", color: "#9564C7", bg: "#F3ECFF" },
  { id: "multiple", ar: "إعاقات متعددة", icon: "vector-intersection", color: "#5879DC", bg: "#EDF1FF" },
];
// Preserve the other existing categories and their original IDs and routes.
const additional: Category[] = [
  { id: "down", ar: "متلازمة داون", icon: "account-group-outline", color: "#D4A24A", bg: "#FEF6E9" },
  { id: "developmental", ar: "التأخر النمائي", icon: "sprout-outline", color: "#4EA077", bg: "#E6F9F1" },
  { id: "mental", ar: "الصحة النفسية والسلوكية", icon: "flower-outline", color: "#7B6AA8", bg: "#EEEAF8" },
];
const normalize = (value: string) => value.normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
const c = { ink: "#0B093B", muted: "#5E6486", blue: "#607DCB", border: "#EDEFF9", soft: "#EBF1FD" };
export default function DisabilityCategoriesScreen() {
  const { t } = useTranslation(); const router = useRouter();
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const [query, setQuery] = useState(""); const [more, setMore] = useState(false);
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  const label = (item: Category) => isRTL ? item.ar : t(`disabilities.${item.id}`, { lng: "en" }).replace(/\n/g, " ").replace(/\s*\(ADHD\)/, "");
  const search = normalize(query);
  const visible = (search ? [...categories, ...additional] : categories).filter(item => normalize(item.ar + " " + t(`disabilities.${item.id}`, { lng: "en" }) + " " + item.id).includes(search));
  const card = (item: Category) => <Pressable key={item.id} testID={`disability-category-${item.id}`} accessibilityRole="button" accessibilityLabel={label(item)} onPress={() => router.push({ pathname: "/(tabs)/resources/disability-services", params: { id: item.id, name: label(item) } })} style={({ pressed }) => [s.card, { flexDirection: tabRow }, pressed && { opacity: .8 }]}>
    <View testID={`category-icon-${item.id}`} style={[s.icon, { backgroundColor: item.bg }]} accessible={false}>{item.id === "multiple" ? <View style={s.circles}>{[{ left: 8, top: 0 }, { left: 0, top: 12 }, { left: 16, top: 12 }].map((position, i) => <View key={i} style={[s.circle, position, { borderColor: item.color }]} />)}</View> : item.id === "learning" || item.id === "speech" ? <Ionicons name={item.id === "learning" ? "book-outline" : "chatbubbles-outline"} size={29} color={item.color} allowFontScaling={false} /> : <MaterialCommunityIcons name={item.icon} size={29} color={item.color} allowFontScaling={false} />}</View>
    <View style={{ flex: 1 }}><Text style={[s.cardLabel, txt]}>{label(item)}</Text>{item.id === "adhd" && <Text style={[s.secondary, txt]}>(ADHD)</Text>}</View>
    <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={22} color={c.ink} allowFontScaling={false} />
  </Pressable>;
  return <SafeAreaView style={s.safe} edges={["top"]}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
      <View style={s.header}><Image source={require("../../../assets/images/fakhr-wordmark-blue.png")} style={s.logo} resizeMode="contain" accessibilityLabel={text("فخر", "Fakhr")} /><HeaderBackButton testID="categories-back" /><Text accessibilityRole="header" style={s.title}>{text("الفئات", "Categories")}</Text></View>
      <Text style={s.subtitle}>{text("اختر الفئة لاستكشاف الخدمات والدعم المناسب", "Choose a category to explore suitable services and support")}</Text>
      <View style={[s.search, { flexDirection: tabRow }]}><Ionicons name="search-outline" size={24} color={c.muted} /><TextInput testID="category-search" accessibilityLabel={text("ابحث عن فئة", "Search categories")} placeholder={text("ابحث عن فئة...", "Search for a category...")} placeholderTextColor={c.muted} value={query} onChangeText={setQuery} style={[s.input, txt]} autoCorrect={false} />{!!query && <Pressable accessibilityRole="button" accessibilityLabel={text("مسح البحث", "Clear search")} onPress={() => setQuery("")} style={s.clear}><Ionicons name="close-circle" size={22} color={c.muted} /></Pressable>}</View>
      <View style={s.list}>{visible.map(card)}</View>
      {!visible.length && <Text accessibilityLiveRegion="polite" style={s.subtitle}>{text("لم نعثر على فئة مطابقة. جرّب كلمة أخرى.", "No matching categories. Try another search.")}</Text>}
      <View testID="categories-support" style={[s.help, { flexDirection: tabRow }]}><View style={[s.helpRow, { flexDirection: tabRow }]}><View style={s.helpIcon}><Ionicons name="bulb-outline" size={32} color={c.blue} /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={[s.helpTitle, txt]}>{text("مو متأكد من الفئة؟", "Not sure which category?")}</Text><Text style={[s.secondary, txt]}>{text("تصفح الخدمات حسب احتياجك", "Browse services based on your needs")}</Text></View></View><Pressable testID="explore-services" accessibilityRole="button" onPress={() => router.push("/(tabs)/services")} style={[s.explore, { flexDirection: tabRow }]}><Text style={s.exploreLabel}>{text("استكشف الخدمات", "Explore services")}</Text><Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="white" /></Pressable></View>
      {!search && <><Pressable accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore(value => !value)} style={[s.more, { flexDirection: tabRow }]}><Text style={s.secondary}>{text("فئات أخرى", "More categories")}</Text><Ionicons name={more ? "chevron-up" : "chevron-down"} size={18} color={c.muted} /></Pressable>{more && <View style={s.list}>{additional.map(card)}</View>}</>}
    </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" }, content: { width: "100%", maxWidth: 430, alignSelf: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96, gap: 10 },
  header: { alignItems: "center", justifyContent: "center", direction: "ltr" }, logo: { width: 40, height: 54 }, title: { fontSize: 20, lineHeight: 28, fontWeight: typography.weightSemibold, color: c.ink, textAlign: "center" }, back: { position: "absolute", top: 10, width: 44, height: 44, borderRadius: 14, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" }, subtitle: { fontSize: 14, lineHeight: 20, color: c.muted, textAlign: "center" },
  search: { direction: "ltr", minHeight: 40, gap: 8, alignItems: "center", borderRadius: 12, paddingHorizontal: 10, backgroundColor: c.soft, borderWidth: 1, borderColor: c.border, marginVertical: 2 }, input: { flex: 1, minWidth: 0, fontSize: typography.body, paddingVertical: 6, color: c.ink }, clear: { minWidth: 36, minHeight: 44, alignItems: "center", justifyContent: "center" },
  list: { gap: 6 }, card: { direction: "ltr", minHeight: 50, padding: 4, paddingHorizontal: 7, gap: 10, alignItems: "center", backgroundColor: "white", borderWidth: 1, borderColor: c.border, borderRadius: 12 }, icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }, cardLabel: { fontSize: 15, lineHeight: 24, fontWeight: typography.weightSemibold, color: c.ink }, secondary: { fontSize: 12, color: c.muted }, circles: { width: 38, height: 34 }, circle: { position: "absolute", width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  help: { direction: "ltr", flexWrap: "wrap", alignItems: "center", backgroundColor: "#EBF1FD", borderRadius: 14, padding: 10, gap: 8, marginTop: 2 }, helpRow: { flex: 1, minWidth: 150, direction: "ltr", alignItems: "center", gap: 6 }, helpIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EBF1FD", alignItems: "center", justifyContent: "center" }, helpTitle: { fontSize: 14, lineHeight: 22, color: c.ink, fontWeight: typography.weightSemibold }, explore: { minHeight: 40, backgroundColor: c.blue, borderRadius: 10, justifyContent: "center", alignItems: "center", gap: 3, padding: 7 }, exploreLabel: { fontSize: 12, fontWeight: typography.weightMedium, color: "#0B093B" }, more: { minHeight: 44, alignItems: "center", justifyContent: "center", gap: 8 },
});
