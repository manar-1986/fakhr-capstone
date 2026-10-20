import {planActions} from '../../theme/planActions';
import { ContactIcon, whatsappButtonSurface } from "../ui/ContactIcon";
import { controls } from "../../theme/controls";
import { Image as ExpoImage } from "expo-image";
import { typography } from "../../theme/typography";
import React, { useState } from "react";
import { Image, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../ui/AppText";
import { colors } from "../../theme";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { doctorGroupLabel, type ApprovedDoctor } from "../../constants/approvedDoctors";
import InstitutionImage from "./InstitutionImage";

// Presentation category only; does not change credential verification metadata.
export const directorySpecialty = (doctor: ApprovedDoctor) => doctor.id === "doctor-fatima-al-awadhi" ? "developmental" : doctor.group;
export const specialtyText = (doctor: ApprovedDoctor, rtl: boolean) => doctor.suppliedSpecialty?.[rtl ? "ar" : "en"] || (doctor.group === "review" ? "" : doctorGroupLabel(doctor, rtl));
// Compatibility alias shared by directory actions and profile headers.
export const gradient = { backgroundColor: planActions.primary };
export function doctorImageAsset(doctor: ApprovedDoctor) {
  if (doctor.id === "specialist-nesma-al-aridi") return { source: require("../../assets/images/specialists/nesma-al-aridi-portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-sondos-al-hadhoud") return { source: require("../../assets/images/specialists/sondos-al-hadhoud-portrait.png"), fit: "cover" as const };
  if (doctor.id === "specialist-amal-ashour") return { source: require("../../assets/images/specialists/amal-ashour-portrait.png"), fit: "cover" as const };
  if (doctor.id === "specialist-noha-al-mufarreh") return { source: require("../../assets/images/specialists/noha-al-mufarreh-portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-ahmed-nabil-saad") return { source: require("../../assets/images/ahmed-nabil-saad/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-rawan-al-khuwaitem") return { source: require("../../assets/images/rawan-al-khuwaitem/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-anoud-al-jasser-al-rajhi") return { source: require("../../assets/images/anoud-al-jasser-al-rajhi/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-abdulaziz-al-thunayan") return { source: require("../../assets/images/abdulaziz-al-thunayan/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-salman-bin-nakhi") return { source: require("../../assets/images/salman-bin-nakhi/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-maitham-al-ali") return { source: require("../../assets/images/maitham-al-ali/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-ali-akbar") return { source: require("../../assets/images/ali-akbar/portrait.png"), fit: "cover" as const };
  if (doctor.id === "center-speech-plus") return { source: require("../../assets/images/specialists/doaa-al-malik-portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-hadeel-yassin-faras") return { source: require("../../assets/images/hadeel-clinic/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-fatima-al-awadhi") return { source: require("../../assets/images/fatma-clinic/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-dalal-sulaiman-al-shayji") return { source: require("../../assets/images/dalal-al-shayji/portrait.png"), fit: "cover" as const };
  if (doctor.id === "doctor-ali-adel-saleh") return { source: require("../../assets/images/ali-adel-saleh/portrait.png"), fit: "cover" as const };
  if (doctor.id === "specialist-nour-qahfarani") return { source: require("../../assets/images/specialists/nour-qahfarani-portrait.png"), fit: "cover" as const };
  if (doctor.id === "specialist-fajer-al-munaie") return { source: require("../../assets/images/specialists/fajer-al-munaie-portrait.png"), fit: "cover" as const };
  const isAhmed = doctor.id === "doctor-ahmed-al-tamimi";
  const isDalal = doctor.id === "doctor-dalal-alsubaie";
  const portrait = doctor.id === "doctor-essa-habib-al-mashmoum" || doctor.id === "doctor-reem-kanawati" || doctor.id === "doctor-mohammed-almuhtab" || isAhmed || isDalal;
  const isBlueWing = doctor.id === "doctor-dalal-sulaiman-al-shayji";
  const source = doctor.id === "doctor-essa-habib-al-mashmoum" ? require("../../assets/images/essa-al-mashmoum/portrait.png") : doctor.id === "doctor-reem-kanawati" ? require("../../assets/images/reem-kanawati/portrait.jpg") : isBlueWing ? require("../../assets/images/blue-wing/logo.png") : doctor.id === "doctor-hadeel-yassin-faras" ? require("../../assets/images/hadeel-clinic/hadeel-faras-logo.png")
    : doctor.id === "doctor-fatima-al-awadhi" ? require("../../assets/images/fatma-clinic/logo.jpg") : isAhmed ? require("../../assets/images/ahmed-al-tamimi/al-seef-original.png") : isDalal ? require("../../assets/images/dalal-al-subaie/portrait.png") : portrait ? require("../../assets/images/mohammed-al-muhtab/portrait.png") : undefined;
  return source ? {source,fit:portrait && !isAhmed ? "cover" as const : "contain" as const} : undefined;
}
export function DoctorImage({ doctor, size = 72, borderRadius }: { doctor: ApprovedDoctor; size?: number; borderRadius?: number }) {
  if (doctor.id === "specialist-nesma-al-aridi") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Nesma Al-Aridi portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-sondos-al-hadhoud") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="top center" accessibilityLabel="Dr. Sondos Al-Hadhoud portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "specialist-amal-ashour") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Amal Ashour portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "specialist-noha-al-mufarreh") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Noha Al-Mufarreh portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-ahmed-nabil-saad") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition={{left:"50%",top:"20%"}} accessibilityLabel="Dr. Ahmed Nabil Saad portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-rawan-al-khuwaitem") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Rawan Al-Khuwaitem portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-anoud-al-jasser-al-rajhi") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="top center" accessibilityLabel="Dr. Anoud Yousef Al-Jasser Al-Rajhi portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-abdulaziz-al-thunayan") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Abdulaziz Al-Thunayan portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-salman-bin-nakhi") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Salman Bin Nakhi portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-maitham-al-ali") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Maitham Al-Ali portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-ali-akbar") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Ali Akbar portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "center-speech-plus") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Doaa Al Malik portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-hadeel-yassin-faras") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Hadeel Faras portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-fatima-al-awadhi") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Fatma Al-Awadhi portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "doctor-dalal-sulaiman-al-shayji") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Dalal Sulaiman Al-Shayji portrait" style={{width:size,height:size,borderRadius:borderRadius ?? size / 2}}/>;
  if (doctor.id === "doctor-ali-adel-saleh") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Dr. Ali Adel Saleh portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18}}/>;
  if (doctor.id === "specialist-nour-qahfarani") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Nour Qahfarani portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18,backgroundColor:colors.white}}/>;
  if (doctor.id === "specialist-fajer-al-munaie") return <ExpoImage source={doctorImageAsset(doctor)!.source} contentFit="cover" contentPosition="center" accessibilityLabel="Fajer Al Munaie portrait" style={{width:size,height:size,borderRadius:borderRadius ?? 18,backgroundColor:colors.white}}/>;
  if (doctor.sourceInstitution?.mainImage) return <InstitutionImage item={doctor.sourceInstitution} size={size}/>;
  const isAhmed = doctor.id === "doctor-ahmed-al-tamimi";
  const isDalal = doctor.id === "doctor-dalal-alsubaie";
  const portrait = doctor.id === "doctor-essa-habib-al-mashmoum" || doctor.id === "doctor-reem-kanawati" || doctor.id === "doctor-mohammed-almuhtab" || isAhmed || isDalal;
  const isBlueWing = doctor.id === "doctor-dalal-sulaiman-al-shayji";
  const source = doctorImageAsset(doctor)?.source;
  return <View style={{ width: size, height: size, borderRadius: borderRadius ?? (isBlueWing ? size / 2 : 18), backgroundColor: colors.white, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
    {source ? <Image source={source} resizeMode={portrait ? "cover" : "contain"} accessibilityLabel={doctor.nameEn + (portrait ? " portrait" : " clinic logo")} style={isAhmed ? { position: "absolute", width: size * 2.4, height: size * 2.4, left: -size * 1.4, top: -size * 0.3 } : { width: size, height: size }} /> : <Ionicons name="person-outline" size={32} color={planActions.primary} />}
  </View>;
}
export function DoctorLink({ label, url, icon = "call-outline" }: { label: string; url: string; icon?: React.ComponentProps<typeof Ionicons>["name"] }) {
  const { isRTL } = useI18nLayout();
  const [error, setError] = useState(false);
  return <><Pressable accessibilityRole="link" accessibilityLabel={label}
    {...(Platform.OS === "web" ? { href: url, hrefAttrs: url.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : undefined } : {})}
    onPress={Platform.OS === "web" ? undefined : async () => { try { await Linking.openURL(url); } catch { setError(true); } }}
    style={[v.outline, icon === "logo-whatsapp" && whatsappButtonSurface, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
    <ContactIcon name={icon} size={20} color={planActions.primary} /><Text style={v.link}>{label}</Text>
  </Pressable>{error && <Text accessibilityRole="alert" style={v.secondary}>{isRTL ? "تعذر فتح الرابط" : "Could not open link"}</Text>}</>;
}
export const v = StyleSheet.create({
  card: { ...controls.card, backgroundColor: "#EBF1FD", gap: 10 },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: typography.weightMedium, lineHeight: typography.cardTitleLineHeight },
  secondary: { color: colors.textSecondary, fontSize: typography.secondary, lineHeight: typography.secondaryLineHeight },
  outline: { borderWidth: 1, borderColor: planActions.primary, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, paddingVertical: 6, alignItems: "center", justifyContent: "center", gap: 6 },
  link: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium, textAlign: "center" },
  primary: { backgroundColor: planActions.primary, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", justifyContent: "center" },
  white: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium, textAlign: "center" },
});
