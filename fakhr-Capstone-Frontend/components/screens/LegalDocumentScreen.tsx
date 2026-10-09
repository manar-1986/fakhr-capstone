import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, ScrollView } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { homeTheme as c } from "../../theme/home";
import { legalDrafts } from "../../constants/legalDocuments";

export function LegalDocumentScreen({ kind }: { kind: "privacy" | "terms" }) {
  const router = useRouter();
  const { fromRegistration } = useLocalSearchParams<{ fromRegistration?: string }>();
  const { isRTL } = useI18nLayout();
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const title = kind === "privacy" ? tr("سياسة الخصوصية", "Privacy Policy") : tr("الشروط والأحكام", "Terms & Conditions");
  const back = () => router.canGoBack() ? router.back() : router.replace("/(auth)/register");
  const returnToRegistration = () => fromRegistration === "1" && router.canGoBack() ? router.back() : router.navigate("/(auth)/register");
  return <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.header}>
        <Image source={require("../../assets/images/fakhr-wordmark-blue.png")} style={s.logo} resizeMode="contain" accessibilityLabel="Fakhr" />
        <Pressable accessibilityRole="button" accessibilityLabel={tr("رجوع", "Back")} testID="legal-back" onPress={back} style={s.back}><Ionicons name="arrow-back" size={24} color={c.blue} /></Pressable>
      </View>
      <Text accessibilityRole="header" style={s.title}>{title}</Text>
      <Text testID="legal-draft-notice" style={s.badge}>{tr("مسودة للمراجعة قبل النشر", "Draft for review before publication")}</Text>
      {!isRTL && <Text style={s.translationNote}>The supplied draft is in Arabic and is reproduced below in full. An approved English translation is not available.</Text>}
      {legalDrafts[kind].map(([heading, body], index) => <View testID={`legal-section-${index}`} key={heading} style={s.card}>
        <View style={s.number}>{index < 9 ? <Text style={s.numberText}>{(index + 1).toLocaleString("ar-KW")}</Text> : <Ionicons name="document-text-outline" size={19} color={c.ink} />}</View>
        <View style={s.copy}><Text accessibilityRole="header" style={s.label}>{heading}</Text><Text testID={`legal-content-${index}`} style={s.body}>{body}</Text></View>
      </View>)}
      <Pressable testID="legal-return-register" accessibilityRole="button" onPress={returnToRegistration} style={({ pressed }) => [s.button, pressed && { opacity: 0.85 }]}><Text style={s.buttonText}>{tr("العودة إلى إنشاء الحساب", "Return to Create Account")}</Text></Pressable>
      <Text style={s.footer}>{tr("تُستكمل التفاصيل التشغيلية قبل اعتماد النص", "Operational details must be completed before the text is approved")}</Text>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 16, paddingBottom: 28 },
  header: { height: 62, alignItems: "flex-end" }, logo: { width: 48, height: 54 }, back: { position: "absolute", left: 0, top: 4, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 25, fontWeight: "700", color: "#101C42", textAlign: "center", marginVertical: 10 }, badge: { alignSelf: "center", fontSize: 14, color: c.ink, backgroundColor: "#E0E6FC", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 24, marginBottom: 18 },
  translationNote: { color: c.muted, fontSize: 14, marginBottom: 14, textAlign: "left" },
  card: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 9, backgroundColor: "#F5F6FC", borderRadius: 13, padding: 12, marginBottom: 8 }, number: { width: 27, height: 27, borderRadius: 14, backgroundColor: "#E5EAF7", justifyContent: "center", alignItems: "center" }, numberText: { fontSize: 16, color: c.ink, fontWeight: "600" }, copy: { flex: 1, minWidth: 0 },
  label: { fontSize: 18, fontWeight: "600", color: "#101C42", textAlign: "right", writingDirection: "rtl", marginBottom: 2 }, body: { fontSize: 16, lineHeight: 25, color: "#4E5365", textAlign: "right", writingDirection: "rtl" },
  button: { backgroundColor: "#6E7CAF", borderRadius: 12, minHeight: 46, justifyContent: "center", alignItems: "center", padding: 10 }, buttonText: { fontSize: 16, fontWeight: "600", color: "white", textAlign: "center" }, footer: { color: "#777B89", fontSize: 12, textAlign: "center", marginTop: 4 },
});
