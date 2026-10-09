import { Text, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { findApprovedDoctor, doctorGroupLabel, doctorReviewLabel, doctorMissingDetails, englishNameReviewLabel, DOCTOR_REVIEW_DATE, type ApprovedDoctor } from "../../../constants/approvedDoctors";

const PHOTOS = [
  require("../../../assets/images/specialist-1.png"),
  require("../../../assets/images/specialist-2.png"),
  require("../../../assets/images/specialist-3.png"),
  require("../../../assets/images/specialist-4.png"),
];

export default function ProfessionalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const doctor = findApprovedDoctor(Array.isArray(id) ? id[0] : id);
  return doctor ? <ApprovedDoctorDetails doctor={doctor} /> : <ExistingProfessionalDetails />;
}

/** Local curated identities never enter API lookup or booking with a substituted ID. */
function ApprovedDoctorDetails({ doctor }: { doctor: ApprovedDoctor }) {
  const { isRTL, align, dir } = useI18nLayout();
  const { t } = useTranslation();
  const router = useRouter();
  const [linkError, setLinkError] = useState(false);
  const text = { textAlign: align, writingDirection: dir };
  const back = () => router.canGoBack() ? router.back() : router.replace("/(tabs)/directory/professionals");
  const openSource = async (url: string) => {
    setLinkError(false);
    try { await Linking.openURL(url); } catch { setLinkError(true); }
  };
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={[styles.column, { direction: "ltr" }]}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel={t("copy.goBack")} style={styles.back}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, text]}>{t("clinic.details")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.photo, styles.placeholder]}><Ionicons name="person-outline" size={44} color={colors.textMuted} /></View>
          <Text style={[styles.name, text]}>{isRTL ? doctor.nameAr : doctor.nameEn}</Text>
          <Text style={[styles.value, { writingDirection: isRTL ? "ltr" : "rtl" }]}>{isRTL ? doctor.nameEn : doctor.nameAr}</Text>
          <Text style={[styles.specialty, text]}>{doctorGroupLabel(doctor, isRTL)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, text]}>{doctorReviewLabel(isRTL)}</Text>
          {!doctor.englishVerified && <Text style={[styles.value, text]}>{englishNameReviewLabel(isRTL)}</Text>}
          {!!doctor.noteAr && <Text style={[styles.value, text]}>{isRTL ? doctor.noteAr : doctor.noteEn}</Text>}
          <Text style={[styles.value, text]}>{doctorMissingDetails(isRTL)}</Text>
          <Text style={[styles.value, text]}>{isRTL ? "الحجز داخل التطبيق غير متاح لهذا السجل حالياً؛ لا يوجد ربط موثّق بحساب الطبيب." : "In-app booking is not available for this record yet; no verified doctor-account connection exists."}</Text>
        </View>
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, text]}>{isRTL ? "مصادر المراجعة" : "Review sources"}</Text>
          <Text style={[styles.label, text]}>{isRTL ? "تاريخ المراجعة: " : "Reviewed: "}{DOCTOR_REVIEW_DATE}</Text>
          <Text style={[styles.label, text]}>{isRTL ? "المصادر تثبت المعلومات المذكورة فقط، ولا تثبت التوفر للحجز أو جميع بيانات السجل." : "Sources support only the stated information, not booking availability or every profile detail."}</Text>
          {!doctor.sources.length && <Text style={[styles.value, text]}>{isRTL ? "الاسم مقدم من المستخدم؛ المصدر المهني قيد التحقق." : "User-supplied name; professional source pending verification."}</Text>}
          {doctor.sources.map(source => <Pressable key={source.url} accessibilityRole="link" accessibilityLabel={source.title}
            {...(Platform.OS === "web" ? { href: source.url, hrefAttrs: { target: "_blank", rel: "noopener noreferrer" } } : {})}
            onPress={Platform.OS === "web" ? undefined : () => void openSource(source.url)} style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={[styles.value, text, { color: colors.primary, textDecorationLine: "underline" }]}>{source.title}</Text>
          </Pressable>)}
          {linkError && <Text accessibilityRole="alert" style={[styles.value, text]}>{t("clinic.openError")}</Text>}
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>;
}

function ExistingProfessionalDetails() {
  const { t } = useTranslation();
  const { isRTL, align, dir } = useI18nLayout();
  const router = useRouter();
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
  const back = () => router.canGoBack() ? router.back() : router.replace("/(tabs)/directory/professionals");
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
      <Ionicons name={icon} size={20} color={colors.white} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.column}>
        <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel={t("copy.goBack")} style={styles.back}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.text} />
          </Pressable>
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
  title: { flex: 1, fontSize: typography.cardTitle, fontWeight: "700", color: colors.text },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  hero: { alignItems: "center", gap: 10, paddingBottom: 8 },
  photo: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.borderLight },
  placeholder: { alignItems: "center", justifyContent: "center" },
  name: { fontSize: typography.menu, fontWeight: "700", color: colors.text },
  specialty: { fontSize: typography.body, color: colors.primary },
  card: { backgroundColor: colors.backgroundCard, padding: spacing.lg, borderRadius: 18, gap: 12 },
  sectionTitle: { fontSize: typography.cardTitle, fontWeight: "700", color: colors.text },
  field: { gap: 4 },
  label: { color: colors.textMuted, fontSize: typography.label },
  value: { color: colors.text, fontSize: typography.body, lineHeight: typography.bodyLineHeight },
  actions: { gap: 10, marginTop: 8 },
  action: { flex: 1, backgroundColor: colors.primary, borderRadius: 14, minHeight: 48, padding: 10, alignItems: "center", justifyContent: "center", gap: 8 },
  actionText: { color: colors.white, fontWeight: "700", fontSize: typography.button },
  disabled: { opacity: 0.4 },
  loading: { padding: 32 },
});
