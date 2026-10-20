import { ContactIcon, whatsappButtonSurface } from "../../../components/ui/ContactIcon";
import { controls as sharedControls } from "../../../theme/controls";
import DoctorProfileScreen from "../../../components/directory/DoctorProfileScreen";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Image, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getProfessionalDetails } from "../../../api/directory.api";
import { BILINGUAL_DOCTORS } from "../../../constants/professionalBilingual";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors, spacing } from "../../../theme";
import { doctorLocaleList, doctorLocaleText } from "../../../utils/professionalBilingual";
import { clinicContact } from "../../../utils/clinicContact";
import PersonalAppointment from "../../../components/directory/PersonalAppointment";
import { findApprovedDoctor } from "../../../constants/approvedDoctors";

const PHOTOS = [
  require("../../../assets/images/specialist-1.png"),
  require("../../../assets/images/specialist-2.png"),
  require("../../../assets/images/specialist-3.png"),
  require("../../../assets/images/specialist-4.png"),
];

export default function ProfessionalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const doctor = findApprovedDoctor(Array.isArray(id) ? id[0] : id);
  return doctor ? <DoctorProfileScreen key={doctor.id} doctor={doctor} /> : <ExistingProfessionalDetails />;
}

function ExistingProfessionalDetails() {
  const { t } = useTranslation();
  const { isRTL, align, dir } = useI18nLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [linkError, setLinkError] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);
  const { data: professional, isLoading, error } = useQuery({
    queryKey: ["professional", id],
    queryFn: () => getProfessionalDetails(id),
    enabled: !!id,
    retry: false,
  });
  const textStyle = { textAlign: align, writingDirection: dir };
  const loc = (ar?: string, en?: string, legacy?: string) => doctorLocaleText(isRTL, { ar, en, legacy }, t);
  const openLink = async (url: string) => {
    setLinkError("");
    try { await Linking.openURL(url); }
    catch { setLinkError(t("clinic.openError")); }
  };
  const contact = professional ? clinicContact(professional) : undefined;
  const ownClinicName = !!(professional?.clinicNameAr?.trim() || professional?.clinicNameEn?.trim());
  const photoIndex = BILINGUAL_DOCTORS.findIndex((doc) => doc.id === id);
  const photo = professional?.image ? { uri: professional.image } : photoIndex >= 0 ? PHOTOS[photoIndex % PHOTOS.length] : undefined;
  const field = (label: string, value: string | undefined, phone = false) => (
    <View style={styles.field}>
      <Text style={[styles.label, textStyle]}>{label}</Text>
      <Text selectable style={[styles.value, textStyle, phone && { writingDirection: "ltr" }]}>{value || t("clinic.unavailable")}</Text>
    </View>
  );
  const action = (label: string, icon: "call-outline" | "location-outline", url?: string) => (
    <Pressable
      accessibilityRole={url ? "link" : "button"}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !url }}
      disabled={!url}
      {...(Platform.OS === "web" && url ? { href: url, hrefAttrs: icon === "location-outline" ? { target: "_blank", rel: "noopener noreferrer" } : undefined } : {})}
      onPress={Platform.OS === "web" ? undefined : () => url && void openLink(url)}
      style={({ pressed }) => [styles.action, { flexDirection: isRTL ? "row-reverse" : "row" }, !url && styles.disabled, pressed && { opacity: 0.8 }]}
    >
      <ContactIcon name={icon} size={20} color={colors.white} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.column}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <HeaderBackButton />
          <Text style={[styles.title, textStyle]}>{t("clinic.details")}</Text>
        </View>
        {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : error || !professional || !contact ? (
          <Text style={[styles.value, styles.loading, textStyle]}>{t("copy.proNotFound")}</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.hero}>
              {photo && !photoFailed ? <Image source={photo} style={styles.photo} onError={() => setPhotoFailed(true)} accessibilityLabel={loc(professional.nameAr, professional.nameEn, professional.name)} /> : (
                <View style={[styles.photo, styles.placeholder]}><Ionicons name="person-outline" size={44} color={colors.textMuted} /></View>
              )}
              <Text style={[styles.name, textStyle]}>{loc(professional.nameAr, professional.nameEn, professional.name)}</Text>
              <Text style={[styles.specialty, textStyle]}>{loc(professional.specialtyAr, professional.specialtyEn, professional.specialtyLabel)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={[styles.sectionTitle, textStyle]}>{t("clinic.contact")}</Text>
              {field(t("clinic.name"), ownClinicName ? loc(professional.clinicNameAr, professional.clinicNameEn) : loc(professional.centerNameAr, professional.centerNameEn, professional.centerName))}
              {field(t("clinic.address"), loc(contact.addressAr, contact.addressEn, contact.address) || (contact.latitude != null ? contact.latitude + ", " + contact.longitude : contact.mapUrl ? t("clinic.mapAvailable") : undefined))}
              {field(t("clinic.phone"), contact.phone, true)}
              <View style={[styles.actions, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {action(t("clinic.call"), "call-outline", contact.telUrl)}
                {action(t("clinic.location"), "location-outline", contact.mapUrl)}
              </View>
              {!!linkError && <Text accessibilityRole="alert" style={[styles.label, textStyle]}>{linkError}</Text>}
              <PersonalAppointment key={id} identity={id} name={[loc(professional.nameAr, professional.nameEn, professional.name), loc(professional.clinicNameAr, professional.clinicNameEn)].filter((value,index,values) => !!value && values.indexOf(value) === index).join(" — ")} address={loc(contact.addressAr, contact.addressEn, contact.address)} phone={contact.phone} mapUrl={contact.mapUrl} />
            </View>
            {!!(professional.bioAr || professional.bioEn || professional.bio) && <View style={styles.card}>
              <Text style={[styles.sectionTitle, textStyle]}>{t("copy.about")}</Text>
              <Text style={[styles.value, textStyle]}>{loc(professional.bioAr, professional.bioEn, professional.bio)}</Text>
            </View>}
            {(["services", "education", "certifications", "languages"] as const).map((key) => {
              const items = doctorLocaleList(isRTL, professional[(key + "Ar") as "servicesAr"], professional[(key + "En") as "servicesEn"], t, professional[key]);
              return items.length ? <View key={key} style={styles.card}>
                <Text style={[styles.sectionTitle, textStyle]}>{t("clinic." + key)}</Text>
                {items.map((item, index) => <Text key={index} style={[styles.value, textStyle]}>{item}</Text>)}
              </View> : null;
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: "center" },
  column: { flex: 1, width: "100%", maxWidth: 430 },
  header: { alignItems: "center", gap: 12, padding: spacing.lg },
  back: { padding: 8, backgroundColor: colors.backgroundCard, borderRadius: 12 },
  title: { flex: 1, fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.text },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  hero: { alignItems: "center", gap: 10, paddingBottom: 8 },
  photo: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.borderLight },
  placeholder: { alignItems: "center", justifyContent: "center" },
  name: { fontSize: typography.cardTitle, fontWeight: typography.weightMedium, color: colors.text },
  specialty: { fontSize: typography.secondary, color: "#0B093B" },
  card: {    gap: 12 , ...sharedControls.card, backgroundColor: "#EBF1FD" },
  sectionTitle: { fontSize: typography.section, fontWeight: typography.weightSemibold, color: colors.text },
  field: { gap: 4 },
  label: { color: colors.textMuted, fontSize: typography.body },
  value: { color: colors.text, fontSize: typography.body, lineHeight: typography.bodyLineHeight },
  actions: { gap: 10, marginTop: 8 },
  action: { flex: 1, backgroundColor: colors.primary, borderRadius: 14, minHeight: 48, padding: 10, alignItems: "center", justifyContent: "center", gap: 8 },
  actionText: { color: "#0B093B", fontWeight: typography.weightMedium, fontSize: typography.button },
  disabled: { opacity: 0.4 },
  loading: { padding: 32 },
});
