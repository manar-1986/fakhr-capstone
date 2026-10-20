import { phoneIconColor } from "../ui/ContactIcon";
import { ContactIcon, whatsappButtonSurface } from "../ui/ContactIcon";
import { controls as sharedControls } from "../../theme/controls";
import EducationPhoneCard from "./EducationPhoneCard";
import React, { useRef, useState } from "react";
import { Image, Linking, Modal, Platform, Pressable, ScrollView as NativeScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PersonalAppointment from "./PersonalAppointment";
import { Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";
import { typography } from "../../theme/typography";
import type { ApprovedDoctor } from "../../constants/approvedDoctors";

const fatmaPhotos = [
  { source: require("../../assets/images/fatma-clinic/exterior.png"), ar: "مبنى العيادة", en: "Clinic exterior" },
  { source: require("../../assets/images/fatma-clinic/playroom.png"), ar: "غرفة اللعب والعلاج للأطفال", en: "Children’s therapy/playroom" },
  { source: require("../../assets/images/fatma-clinic/sensory.png"), ar: "الغرفة الحسية بإضاءة السحب", en: "Sensory room with cloud lighting" },
];
export default function FatmaClinicContact({ doctor, photos = doctor.id === "doctor-fatima-al-awadhi" ? fatmaPhotos : [], mode = "all", hideCalendar = false, website, additionalUrl, instagramLabel, additionalUrlLabel, additionalPhoneLabel, extraPhones = [], email, phoneExtension, kind = "clinic" }: { doctor: ApprovedDoctor; photos?: typeof fatmaPhotos; mode?: "all" | "gallery" | "contact"; hideCalendar?: boolean; website?: string; additionalUrl?: string; instagramLabel?: string; additionalUrlLabel?: string; additionalPhoneLabel?: string; extraPhones?: { phone: string; label: string }[]; email?: string; phoneExtension?: string; kind?: "clinic" | "center" | "school" | "nursery" }) {
  const clinic = doctor.clinic!;
  const isDalal = doctor.id === "doctor-dalal-alsubaie";
  const { isRTL, align, dir } = useI18nLayout();
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const text = { textAlign: align, writingDirection: dir };
  const [width, setWidth] = useState(300); const [photo, setPhoto] = useState(0); const [zoom, setZoom] = useState<number | null>(null);
  const gallery = useRef<NativeScrollView>(null);
  const [error, setError] = useState("");
  const open = async (url: string) => { try { await Linking.openURL(url); } catch { setError(tr("تعذر فتح الرابط", "Could not open link")); } };
  const link = (label: string, url: string, icon: React.ComponentProps<typeof Ionicons>["name"]) => <Pressable accessibilityRole="link" accessibilityLabel={label}
    {...(Platform.OS === "web" ? { href: url, hrefAttrs: url.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : undefined } : {})}
    onPress={Platform.OS === "web" ? undefined : () => void open(url)} style={[s.contactButton, icon === "logo-whatsapp" && whatsappButtonSurface, { flexDirection: isRTL ? "row-reverse" : "row" }]}><ContactIcon name={icon} size={20} color={colors.primary} /><Text style={s.contactButtonText}>{label}</Text></Pressable>;
  return <>
    <View style={s.card}>
      <Text accessibilityRole="header" style={[s.title, text]}>{isRTL ? clinic.nameAr : clinic.nameEn}</Text>
      {mode !== "contact" && photos.length > 0 && <>
      <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ borderRadius: 16, overflow: "hidden", direction: "ltr" }}>
        <NativeScrollView ref={gallery} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={e => setPhoto(Math.max(0, Math.min(photos.length - 1, Math.round(e.nativeEvent.contentOffset.x / width))))} scrollEventThrottle={32}>
          {photos.map((p, i) => <Pressable key={p.en} accessibilityRole="button" accessibilityLabel={tr("تكبير: " + p.ar, "Enlarge: " + p.en)} onPress={() => setZoom(i)} style={{ width, height: 250 }}><Image source={p.source} resizeMode="contain" style={{ width: "100%", height: "100%", backgroundColor: colors.borderLight }} /></Pressable>)}
        </NativeScrollView>
      </View>
      <View style={s.dots}>{photos.map((p, i) => <Pressable key={p.en} accessibilityRole="button" accessibilityLabel={tr(p.ar, p.en)} accessibilityState={{ selected: i === photo }} onPress={() => { gallery.current?.scrollTo({ x: width * i, animated: true }); setPhoto(i); }} style={s.dotTouch}><View style={[s.dot, { backgroundColor: photo === i ? colors.primary : colors.border }]} /></Pressable>)}</View>
      <Text style={[s.body, text]}>{tr(photos[photo].ar, photos[photo].en)}</Text>
      </>}
      {mode !== "gallery" && <>
      {kind === "school" || kind === "nursery" ? <EducationPhoneCard contacts={[
        ...(clinic.phone ? [{phone:clinic.phone,label:doctor.id === "kw-n-maha" ? tr("قطعة 4 — حسب المصادر","Block 4 — source record") : doctor.id === "kw-n-heba" ? tr("عبد الله المبارك","Abdullah Al Mubarak") : doctor.id === "kw-n-nasser" ? tr("رقم مشترك بين السجلات الثلاثة","Shared by all three records") : undefined}] : []),
        ...(clinic.additionalPhone ? [{phone:clinic.additionalPhone,label:additionalPhoneLabel}] : []),
        ...extraPhones,
      ]} extension={phoneExtension}/> : <>
      {clinic.phone && <View style={s.contactCard}>
        <View style={[s.contactRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Ionicons name="call-outline" size={19} color={phoneIconColor}/>
          <Text style={[s.contactLabel, text]}>{kind === "center" ? tr("رقم المركز", "Center phone") : isDalal ? tr("رقم المستشفى", "Hospital phone") : clinic.whatsapp ? tr("رقم العيادة", "Clinic phone") : tr("رقم الهاتف", "Phone number")}</Text>
          <Text selectable style={s.contactNumber}>{clinic.phone}</Text>
        </View>
        {link(kind === "center" ? tr("اتصال بالمركز", "Call Center") : isDalal ? tr("اتصال بالمستشفى", "Call Hospital") : clinic.whatsapp ? tr("اتصال بالعيادة", "Call Clinic") : tr("اتصال", "Call"), `tel:${clinic.phone}`, "call-outline")}
      </View>}
      {!!phoneExtension && <Text style={[s.body,text]}>{tr("الرقم الداخلي: ", "Extension: ")}{phoneExtension}</Text>}
      {clinic.additionalPhone && <View style={s.contactCard}>
        <View style={[s.contactRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Ionicons name="call-outline" size={19} color={phoneIconColor}/>
          <Text style={[s.contactLabel, text]}>{additionalPhoneLabel || tr("رقم إضافي", "Additional contact")}</Text>
          <Text selectable style={s.contactNumber}>{clinic.additionalPhone}</Text>
        </View>
        {link(additionalPhoneLabel || tr("اتصال بالرقم الإضافي", "Call Additional Number"), `tel:${clinic.additionalPhone}`, "call-outline")}
      </View>}
      {extraPhones.map(contact=><View key={contact.phone} style={s.contactCard}>
        <View style={[s.contactRow,{flexDirection:isRTL?"row-reverse":"row"}]}><Ionicons name="call-outline" size={19} color={phoneIconColor}/><Text style={[s.contactLabel,text]}>{contact.label}</Text><Text selectable style={s.contactNumber}>{contact.phone}</Text></View>
        {link(contact.label, "tel:" + contact.phone, "call-outline")}
      </View>)}
      </>}
      {email && link(tr("البريد الإلكتروني", "Email"), "mailto:" + email, "mail-outline")}
      {clinic.whatsapp && <View style={s.contactCard}>
        <View style={[s.contactRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <ContactIcon name="logo-whatsapp" size={20} />
          <Text style={[s.contactLabel, text]}>{tr("واتساب", "WhatsApp")}</Text>
          {!!clinic.whatsapp.phone && <Text selectable style={s.contactNumber}>{clinic.whatsapp.phone}</Text>}
        </View>
        {link(tr(kind === "center" || doctor.id === "kw-s-khalifa" || doctor.id === "kw-r-21" || doctor.id === "kw-r-ekhlas" || doctor.id === "kw-n-nada" || doctor.id === "kw-n-children" || doctor.id === "kw-n-nuwair" || doctor.id === "kw-n-abdullah" || doctor.id === "kw-n-yanmo" ? "تواصل عبر الواتساب" : "تواصل عبر واتساب", "Contact via WhatsApp"), clinic.whatsapp.url, "logo-whatsapp")}
      </View>}
      {(clinic.address || clinic.mapUrl) && <Text style={[s.title, text]}>{tr("الموقع", "Location")}</Text>}
      {!!clinic.address && <Text style={[s.body, { textAlign: align, writingDirection: kind === "center" && /[\u0600-\u06ff]/.test(clinic.address) ? "rtl" : "ltr" }]}>{clinic.address}</Text>}
      {!!clinic.mapUrl && link((doctor.id === "home-provider-lets-speech" || doctor.id === "kw-n-bustan" || doctor.id === "kw-n-dream" || doctor.id === "kw-n-nada" || doctor.id === "kw-n-ghad" || doctor.id === "kw-n-children" || doctor.id === "kw-n-basma" || doctor.id === "kw-n-maharat" || doctor.id === "kw-n-milestone" || doctor.id === "kw-n-shams" || doctor.id === "kw-n-smart" || doctor.id === "kw-n-yanmo" || doctor.id === "kw-n-abdullah" || doctor.id === "kw-n-dima" || doctor.id === "kw-n-sumaya" || doctor.id === "kw-n-little" || doctor.id === "kw-n-ghali" || doctor.id === "kw-n-energy" || doctor.id === "kw-n-best" || doctor.id === "kw-n-jack" || doctor.id === "kw-n-amal") ? tr("الموقع", "Location") : kind === "center" || doctor.id === "kw-r-integrated" || doctor.id === "kw-r-irshad" || doctor.id === "kw-r-idad" || doctor.id === "kw-s-manarat" || doctor.id === "kw-s-bayan" || doctor.id === "kw-s-creative" || doctor.id === "kw-s-national" || doctor.id === "kw-s-hadarat" || doctor.id === "kw-s-kes" || doctor.id === "kw-s-safwa" || doctor.id === "kw-s-ajyal" || doctor.id === "kw-s-huda" || doctor.id === "kw-s-umm-hani" || doctor.id === "kw-s-resala" || doctor.id === "kw-s-riyada-boys" ? tr("فتح الموقع في Google Maps", "Open in Google Maps") : doctor.id === "doctor-ahmed-al-tamimi" ? tr("فتح الموقع", "Open Location") : (clinic.whatsapp || clinic.additionalPhone || isDalal) ? tr("فتح الموقع في Google Maps", "Open in Google Maps") : tr("فتح في خرائط Google", "Open in Google Maps"), clinic.mapUrl, "location-outline")}
      {website && link(tr("الموقع الإلكتروني", (doctor.id === "kw-n-amal" || doctor.id === "kw-n-royal" || doctor.id === "kw-r-dyslexia" || doctor.id === "kw-r-irshad" || doctor.id === "kw-s-bayan" || doctor.id === "kw-s-manarat" || doctor.id === "kw-s-khalifa" || doctor.id === "kw-s-creative") ? "Official Website" : "Website"), website, "globe-outline")}
      {additionalUrl && link(additionalUrlLabel || tr("روابط المركز", "Center Links"), additionalUrl, "link-outline")}
      {clinic.instagram && link(instagramLabel || "@" + clinic.instagram.split("/").filter(Boolean).pop(), clinic.instagram, "logo-instagram")}
      {!hideCalendar && <PersonalAppointment identity={doctor.id} name={[(isRTL ? doctor.nameAr : doctor.nameEn), (isRTL ? clinic.nameAr : clinic.nameEn)].filter((value,index,values) => !!value && values.indexOf(value) === index).join(" — ")} address={clinic.address} phone={clinic.phone} mapUrl={clinic.mapUrl} />}
      </>}
      {!!error && <Text accessibilityRole="alert" style={[s.body, text]}>{error}</Text>}
    </View>
    <Modal visible={zoom !== null} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
      <View style={s.modal}><Pressable accessibilityRole="button" accessibilityLabel={tr("إغلاق الصورة", "Close image")} onPress={() => setZoom(null)} style={s.button}><Text style={s.buttonText}>{tr("إغلاق", "Close")}</Text></Pressable>{zoom !== null && <Image source={photos[zoom].source} resizeMode="contain" style={{ flex: 1, width: "100%" }} />}</View>
    </Modal>
  </>;
}
const s = StyleSheet.create({
  contactCard: { backgroundColor: `${colors.primaryLight}20`, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 10, gap: 7 },
  contactRow: { alignItems: "center", gap: 7, flexWrap: "wrap" },
  contactLabel: { flex: 1, color: colors.textSecondary, fontSize: typography.helper, fontWeight: typography.weightRegular, minWidth: 64 },
  contactNumber: { color: "#0B093B", fontSize: typography.section, fontWeight: typography.weightSemibold, writingDirection: "ltr", lineHeight: typography.sectionLineHeight },
  contactButton: { backgroundColor: `${colors.primaryLight}30`, borderWidth: 1, borderColor: colors.primaryLight, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 8, minHeight: 44, alignItems: "center", justifyContent: "center", gap: 7 },
  contactButtonText: { flexShrink: 1, color: colors.textSecondary, fontSize: typography.button, lineHeight: typography.buttonLineHeight, fontWeight: typography.weightMedium, textAlign: "center" },
  card: {      gap: 12 , ...sharedControls.card },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: typography.weightMedium }, body: { color: colors.textSecondary, fontSize: typography.helper, lineHeight: typography.helperLineHeight },
  button: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary,  padding: 12,    flexDirection: "row", gap: 8 , ...sharedControls.button }, buttonText: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium, textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "center", direction: "ltr" }, dotTouch: { width: 44, height: 36, alignItems: "center", justifyContent: "center" }, dot: { width: 8, height: 8, borderRadius: 4 },
  input: { borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 12, color: colors.text, direction: "ltr" }, choice: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, padding: 12 },
  modal: { flex: 1, padding: 30, paddingTop: 60, paddingBottom: 40, backgroundColor: "rgba(0,0,0,0.92)", gap: 12 },
});
