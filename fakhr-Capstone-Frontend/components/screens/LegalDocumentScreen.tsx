import { controls as sharedControls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
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
  safe: { flex: 1, backgroundColor: fakhrColors.background }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 16, paddingBottom: 28 },
  header: { height: 62, alignItems: "flex-end" }, logo: { width: 48, height: 54 }, back: { position: "absolute", left: 0, top: 4, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: fakhrColors.text, textAlign: "center", marginVertical: 10 }, badge: { alignSelf: "center", fontSize: typography.helper, color: c.ink, backgroundColor: fakhrColors.backgroundSecondary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 24, marginBottom: 18 },
  translationNote: { color: c.muted, fontSize: typography.helper, marginBottom: 14, textAlign: "left" },
  card: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 9,    marginBottom: 8 , ...sharedControls.card }, number: { width: 27, height: 27, borderRadius: 14, backgroundColor: fakhrColors.backgroundSecondary, justifyContent: "center", alignItems: "center" }, numberText: { fontSize: typography.cardTitle, color: c.ink, fontWeight: typography.weightMedium }, copy: { flex: 1, minWidth: 0 },
  label: { fontSize: typography.section, fontWeight: typography.weightSemibold, color: fakhrColors.text, textAlign: "right", writingDirection: "rtl", marginBottom: 2 }, body: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, color: fakhrColors.textSecondary, textAlign: "right", writingDirection: "rtl" },
  button: { backgroundColor: fakhrColors.primary,     padding: 10 , ...sharedControls.button }, buttonText: { fontSize: typography.button, fontWeight: typography.weightMedium, color: "#0B093B", textAlign: "center" }, footer: { color: fakhrColors.textMuted, fontSize: typography.helper, textAlign: "center", marginTop: 4 },
});
