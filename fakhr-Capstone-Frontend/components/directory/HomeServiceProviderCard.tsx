import { phoneIconColor } from "../ui/ContactIcon";
import { ContactIcon, whatsappButtonSurface } from "../ui/ContactIcon";
import { controls as sharedControls } from "../../theme/controls";
import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { HOME_SERVICE_CATEGORIES, homeProviderPhoneUrl, homeServiceText, type HomeServiceProvider } from "../../constants/homeServiceProviders";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";

export const providerImages = {speakclinic: require("../../assets/images/home-services/speak-clinic.png"),humanTouch: require("../../assets/images/verified-centers/human-touch.png"),therapyKw: require("../../assets/images/verified-centers/therapy-kw-pediatric.png")};

export default function HomeServiceProviderCard({ provider, onDetails, showSources = false }: { provider: HomeServiceProvider; onDetails?: () => void; showSources?: boolean }) {
  const { isRTL, align, dir } = useI18nLayout();
  const [error, setError] = useState(false);
  const lang = isRTL ? "ar" : "en";
  const text = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const name = provider.name[lang];
  const tel = homeProviderPhoneUrl(provider.phone);
  const open = async (url: string) => { setError(false); try { await Linking.openURL(url); } catch { setError(true); } };
  return <View style={styles.card}>
    <View style={[styles.heading, row]}>
      {provider.image === "humanTouch" ? <Image source={providerImages.humanTouch} accessibilityLabel={name} resizeMode="contain" style={{width:56,height:56}}/> : <View style={styles.icon}><Ionicons name={HOME_SERVICE_CATEGORIES.find(c => c.id === provider.categories[0])!.icon} size={28} color={colors.primary} /></View>}
      <View style={{ flex: 1, gap: 6 }}>
        <Text accessibilityRole="header" style={[styles.name, text]}>{name}</Text>
        <Text style={[styles.service, text]}>{provider.service[lang]}</Text>
      </View>
    </View>
    {provider.providerName && <Text style={[styles.name,text]}>{provider.providerName}</Text>}
    {showSources && provider.image && <Image source={providerImages[provider.image]} accessibilityLabel={provider.image === "therapyKw" ? "THERAPY KW pediatric physiotherapy" : name} resizeMode="contain" style={provider.image === "humanTouch" ? {width:"100%",height:280} : {width:"100%",aspectRatio:1}}/>}
    {provider.sections ? provider.sections.map(section=><View key={section.title.en} style={{gap:6}}><Text style={[styles.service,text]}>{section.title[lang]}</Text>{section.items?.[lang].map(value=><Text key={value} style={[styles.body,text]}>{value}</Text>)}{section.description && <Text style={[styles.body,text]}>{section.description[lang]}</Text>}</View>) : <Text style={[styles.body, text]}>{provider.description[lang]}</Text>}
    {!!provider.verification[lang] && <View style={styles.notice}>
      <Text style={[styles.status, text]}>{homeServiceText.review[lang]}</Text>
      <Text style={[styles.body, text]}>{provider.verification[lang]}</Text>
    </View>}
    <View style={[styles.actions, row]}>
      {!!tel && <Pressable accessibilityRole="link" accessibilityLabel={`${homeServiceText.call[lang]} ${provider.phone}`} disabled={!tel}
        {...(Platform.OS === "web" && tel ? { href: tel } : {})}
        onPress={Platform.OS === "web" ? undefined : () => tel && void open(tel)} style={[styles.call, row]}>
        <Ionicons name="call-outline" size={20} color={phoneIconColor} /><Text style={styles.callText}>{homeServiceText.call[lang]}</Text>
        <Text style={[styles.callText, { writingDirection: "ltr" }]}>{provider.phone}</Text>
      </Pressable>}
      {provider.whatsapp && <Pressable accessibilityRole="link" accessibilityLabel={isRTL ? "تواصل عبر الواتساب" : "Contact via WhatsApp"} {...(Platform.OS === "web" ? {href:provider.whatsapp.url,hrefAttrs:{target:"_blank",rel:"noopener noreferrer"}} : {})} onPress={Platform.OS === "web" ? undefined : ()=>void open(provider.whatsapp!.url)} style={[styles.call,row,whatsappButtonSurface]}><ContactIcon name="logo-whatsapp" size={20} /><Text style={[styles.callText,{color:"#0B093B"}]}>{isRTL ? "تواصل عبر الواتساب" : "Contact via WhatsApp"}</Text></Pressable>}
      {onDetails && <Pressable accessibilityRole="button" accessibilityLabel={`${homeServiceText.details[lang]}: ${name}`} onPress={onDetails} style={[styles.details, row]}>
        <Text style={styles.detailText}>{homeServiceText.details[lang]}</Text><Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.primary} />
      </Pressable>}
    </View>
    {showSources && <View style={{ gap: 6 }}>
      <Text style={[styles.status, text]}>{(provider.providerName || provider.officialWebsite) ? (isRTL ? "الموقع الإلكتروني" : "Official Website") : homeServiceText.sources[lang]}</Text>
      {provider.sources.map(source => <Pressable key={source.url} accessibilityRole="link" accessibilityLabel={(provider.providerName || provider.officialWebsite) ? (isRTL ? "الموقع الإلكتروني" : "Official Website") : source.title}
        {...(Platform.OS === "web" ? { href: source.url, hrefAttrs: { target: "_blank", rel: "noopener noreferrer" } } : {})}
        onPress={Platform.OS === "web" ? undefined : () => void open(source.url)} style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={[styles.detailText, text, { textDecorationLine: "underline" }]}>{source.title}</Text>
      </Pressable>)}
    </View>}
    {error && <Text accessibilityRole="alert" style={[styles.body, text]}>{homeServiceText.error[lang]}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: {      gap: 14, direction: "ltr" , ...sharedControls.card, backgroundColor: "#EBF1FD" },
  heading: { alignItems: "center", gap: 12 }, icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.borderLight, alignItems: "center", justifyContent: "center" },
  name: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, color: colors.text, fontWeight: typography.weightMedium }, service: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.textSecondary, fontWeight: typography.weightRegular },
  body: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.textSecondary }, notice: { backgroundColor: colors.borderLight, padding: 12, borderRadius: 12, gap: 6 }, status: { fontSize: typography.helper, lineHeight: typography.helperLineHeight, fontWeight: typography.weightRegular, color: colors.text },
  phone: { fontSize: typography.cardTitle, color: colors.text, writingDirection: "ltr" }, actions: { flexWrap: "wrap", gap: 10 },
  call: { minHeight: 48, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", gap: 8 }, callText: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium },
  details: { minHeight: 48, paddingHorizontal: 8, alignItems: "center", gap: 6 }, detailText: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium },
});
