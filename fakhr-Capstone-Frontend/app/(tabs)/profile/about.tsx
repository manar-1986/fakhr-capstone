import { colors } from "../../../theme/colors";
import { controls as sharedControls } from "../../../theme/controls";
import React, { useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Stethoscope, School, ClipboardCheck, ShoppingBag, Lightbulb, Headset, Eye, Target, Mail } from "lucide-react-native";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { typographyStyles } from "../../../theme/typography";

const services = [
  { icon: Stethoscope, ar: "دليل المراكز والمختصين", en: "Centers & Specialists Directory", bodyAr: "الوصول إلى المراكز التأهيلية والأطباء والمختصين في مختلف التخصصات.", bodyEn: "Find rehabilitation centers, doctors, and specialists across a range of disciplines." },
  { icon: School, ar: "المدارس والحضانات", en: "Schools & Nurseries", bodyAr: "استكشاف المؤسسات التعليمية والحضانات المتخصصة.", bodyEn: "Explore educational institutions and specialized nurseries." },
  { icon: ClipboardCheck, ar: "الخطة الفردية للطفل", en: "Individual Child Plan", bodyAr: "تنظيم الأهداف والأنشطة ومتابعة التقدم بما يتناسب مع احتياجات الطفل.", bodyEn: "Organize goals and activities and track progress according to your child's needs." },
  { icon: ShoppingBag, ar: "المنتجات والخدمات", en: "Products & Services", bodyAr: "تسهيل الوصول إلى المنتجات الطبية والتأهيلية والتعليمية والخدمات الداعمة.", bodyEn: "Access medical, rehabilitation, and educational products and support services more easily." },
  { icon: Lightbulb, ar: "التوعية والمعرفة", en: "Awareness & Knowledge", bodyAr: "محتوى توعوي وأنشطة تعليمية تساعد الأسر على اكتساب المعرفة.", bodyEn: "Informative content and educational activities that help families build their knowledge." },
  { icon: Headset, ar: "المساعدة والدعم", en: "Help & Support", bodyAr: "معلومات وإرشادات عامة لدعم الأسر في رحلتهم.", bodyEn: "General information and guidance to support families on their journey." },
];
const email = "mailto:info@fakhrkw.com";
export default function AboutFakhrScreen() {
  const { isRTL, align, dir } = useI18nLayout();
  const { width, fontScale } = useWindowDimensions();
  const [mailError, setMailError] = useState(false);
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const [availableWidth, setAvailableWidth] = useState(Math.min(width, 430));
  const contentWidth = Math.min(availableWidth, 1000);
  const columns = contentWidth / fontScale >= 780 ? 3 : contentWidth / fontScale >= 360 ? 2 : 1;
  const cardWidth = (contentWidth - 40 - (columns - 1) * 12) / columns;
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const text = { textAlign: align, writingDirection: dir };
  return <SafeAreaView style={styles.safe} edges={["top"]} onLayout={event => setAvailableWidth(event.nativeEvent.layout.width)}>
    <View style={[styles.header, row]}><HeaderBackButton fallbackHref="/(tabs)/profile" /></View>
    <ScrollView contentContainerStyle={[styles.content, { width: contentWidth }]}>
      <View style={styles.hero}>
        <Image source={require("../../../assets/images/fakhr-wordmark-blue.png")} contentFit="contain" style={styles.logo} accessibilityLabel={tr("شعار فخر", "Fakhr logo")} />
        <Text accessibilityRole="header" style={styles.title}>{tr("عن فخر", "About Fakhr")}</Text>
        <Text style={[styles.tagline, { writingDirection: dir }]}>{tr("لأن لكل قدرة قيمة، ولكل خطوة إنجاز.", "Because every ability has value, and every step is an achievement.")}</Text>
        <Text style={[styles.intro, { writingDirection: dir }]}>{tr("فخر منصة رقمية كويتية متخصصة في دعم الأشخاص ذوي الإعاقة وأسرهم، تهدف إلى تسهيل الوصول إلى الخدمات التعليمية والتأهيلية والصحية، وتوفير تجربة متكاملة تساعد الأسر على متابعة تطور أبنائها وتعزيز استقلاليتهم وجودة حياتهم.", "Fakhr is a Kuwaiti digital platform dedicated to supporting people with disabilities and their families. It aims to make educational, rehabilitation, and healthcare services easier to access, offering an integrated experience that helps families follow their children's development and foster their independence and quality of life.")}</Text>
      </View>
      <Text accessibilityRole="header" style={[styles.section, text]}>{tr("ماذا يقدم تطبيق فخر؟", "What does Fakhr offer?")}</Text>
      <View style={[styles.grid, row]}>
        {services.map(({ icon: Icon, ...service }) => <View key={service.en} testID="about-service-card" style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.icon, { alignSelf: isRTL ? "flex-end" : "flex-start" }]} accessible={false}><Icon size={28} strokeWidth={1.7} color={colors.primary} /></View>
          <Text style={[styles.cardTitle, text]}>{isRTL ? service.ar : service.en}</Text>
          <Text style={[styles.body, text]}>{isRTL ? service.bodyAr : service.bodyEn}</Text>
        </View>)}
      </View>
      <View style={[styles.grid, row]}>
        {[
          { Icon: Eye, ar: "رؤيتنا", en: "Our Vision", bodyAr: "أن يكون فخر منصة رقمية رائدة في الكويت لدعم وتمكين الأشخاص ذوي الإعاقة وأسرهم.", bodyEn: "To be a leading digital platform in Kuwait that supports and empowers people with disabilities and their families." },
          { Icon: Target, ar: "رسالتنا", en: "Our Mission", bodyAr: "توظيف التكنولوجيا لتسهيل رحلة الأسرة وتعزيز فرص التعلم والتأهيل والدمج المجتمعي.", bodyEn: "To use technology to make families' journeys easier and expand opportunities for learning, rehabilitation, and community inclusion." },
        ].map(({ Icon, ...item }) => <View key={item.en} style={[styles.card, { width: columns > 1 ? (contentWidth - 52) / 2 : contentWidth - 40 }]}>
          <View style={[styles.row, row]}><View style={styles.icon} accessible={false}><Icon size={28} strokeWidth={1.7} color={colors.primary} /></View><Text accessibilityRole="header" style={[styles.cardTitle, text, { flex: 1 }]}>{isRTL ? item.ar : item.en}</Text></View>
          <Text style={[styles.body, text]}>{isRTL ? item.bodyAr : item.bodyEn}</Text>
        </View>)}
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel={tr("تواصل معنا عبر البريد الإلكتروني info@fakhrkw.com", "Email us at info@fakhrkw.com")}
        {...(Platform.OS === "web" ? { href: email } : {})} onPress={Platform.OS === "web" ? undefined : () => { setMailError(false); void Linking.openURL(email).catch(() => setMailError(true)); }} style={[styles.card, styles.row, row]}>
        <View style={styles.icon} accessible={false}><Mail size={28} strokeWidth={1.7} color={colors.primary} /></View>
        <View style={{ flex: 1, gap: 4 }}><Text accessibilityRole="header" style={[styles.cardTitle, text]}>{tr("تواصل معنا", "Contact Us")}</Text><Text style={[styles.body, { writingDirection: "ltr", textAlign: align }]}>info@fakhrkw.com</Text></View>
      </Pressable>
      {mailError && <Text accessibilityRole="alert" style={[styles.body, text]}>{tr("تعذر فتح تطبيق البريد. يمكنك مراسلتنا على info@fakhrkw.com.", "Unable to open your email app. You can email info@fakhrkw.com.")}</Text>}
      <Text style={styles.footer}>{tr("© 2026 فخر — جميع الحقوق محفوظة.", "© 2026 Fakhr — All Rights Reserved.")}</Text>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: 20, paddingVertical: 8 },
  content: { alignSelf: "center", paddingHorizontal: 20, paddingBottom: 120, gap: 16 },
  hero: { alignItems: "center", gap: 12, paddingBottom: 10 },
  logo: { width: 116, height: 160 },
  title: { ...typographyStyles.title, color: "#0B093B", textAlign: "center" },
  tagline: { ...typographyStyles.section, color: "#0B093B", textAlign: "center" },
  intro: { ...typographyStyles.body, color: colors.textMuted, textAlign: "center", maxWidth: 850 },
  section: { ...typographyStyles.section, color: "#0B093B" },
  grid: { flexWrap: "wrap", gap: 12, alignItems: "stretch" },
  card: {  gap: 10,          ...sharedControls.card },
  row: { alignItems: "center", gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.backgroundSecondary, alignItems: "center", justifyContent: "center" },
  cardTitle: { ...typographyStyles.cardTitle, color: "#0B093B" },
  body: { ...typographyStyles.body, color: colors.textMuted },
  footer: { ...typographyStyles.helper, color: colors.textMuted, textAlign: "center", paddingVertical: 4 },
});
