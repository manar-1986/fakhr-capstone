import { ContactIcon, whatsappButtonSurface } from "../ui/ContactIcon";
import { controls as sharedControls } from "../../theme/controls";
import EducationProfileScreen from "./EducationProfileScreen";
import { isPublicCenter } from "../../utils/centerVisibility";
import { isSpeechPlus, SPEECH_PLUS_DOCTOR } from "../../constants/speechPlus";
import DoctorProfileScreen from "./DoctorProfileScreen";
import InstitutionImage from "./InstitutionImage";
import CenterProfileScreen from "./CenterProfileScreen";
import BlueWingCenterScreen from "./BlueWingCenterScreen";
import { BLUE_WING_CENTER_ID } from "../../constants/blueWing";
import { Text, ScrollView } from "../ui/AppText";
import { typography } from "../../theme/typography";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getCenterDetails } from "../../api/directory.api";
import { HeaderBackButton } from "../navigation/HeaderBackButton";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";
import { institutionText, type InstitutionLabel } from "../../constants/institutionLabels";
import { backendInstitution, findInstitution, hasSourceDifferences, INSTITUTION_SOURCES, institutionDirectoryCategory, institutionMapUrl, institutionPhoneUrl } from "../../utils/institutionDirectory";
import type { InstitutionObservation } from "../../types/institution";

const fields: [InstitutionLabel, keyof InstitutionObservation][] = [
  ["governorate", "governorateAr"], ["area", "areaAr"], ["address", "addressAr"],
  ["needs", "needsAr"], ["ages", "agesAr"], ["stages", "stagesAr"],
  ["classroom", "classroomAr"], ["capacity", "capacityAr"],
];

export default function InstitutionDetailsScreen({ institutionId }: { institutionId?: string }) {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = institutionId ?? (Array.isArray(params.id) ? params.id[0] : params.id);
  const { isRTL, align, dir } = useI18nLayout();
  const { bottom } = useSafeAreaInsets();
  const [linkError, setLinkError] = useState(false);
  const t = (key: InstitutionLabel) => institutionText(key, isRTL);
  const local = findInstitution(id);
  const backendId = id?.startsWith("backend:") ? id.slice(8) : undefined;
  const validBackendId = !!backendId && /^[a-f\d]{24}$/i.test(backendId);
  const backend = useQuery({ queryKey: ["center", backendId], queryFn: () => getCenterDetails(backendId!), enabled: validBackendId, retry: 1 });
  const item = local ?? (validBackendId && backend.data && isPublicCenter(backend.data) ? backendInstitution(backend.data) : undefined);
  const category = item ? institutionDirectoryCategory(item) : validBackendId ? "rehabilitation" : "school";
  const fallbackHref = category === "sports" ? "/(tabs)/directory/sports-clubs" : category === "rehabilitation" ? "/(tabs)/directory/professionals?tab=centers" : category === "nursery" ? "/(tabs)/directory/nurseries" : "/(tabs)/directory/schools";
  const text = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const openLink = async (url: string) => { setLinkError(false); try { await Linking.openURL(url); } catch { setLinkError(true); } };
  const action = (label: string, url: string, icon: "call-outline" | "location-outline" | "logo-instagram") => <Pressable
    key={url} accessibilityRole="link" accessibilityLabel={label}
    {...(Platform.OS === "web" ? { href: url, ...(icon !== "call-outline" ? { hrefAttrs: { target: "_blank", rel: "noopener noreferrer" } } : {}) } : {})}
    onPress={Platform.OS === "web" ? undefined : () => void openLink(url)} style={[styles.action, row]}>
    <ContactIcon name={icon} size={20} color={colors.white} /><Text style={styles.actionText}>{label}</Text>
  </Pressable>;
  const map = (item?.id === "kw-s-noor" ? item.publicProfile?.mapUrl : undefined) || item?.publicContact?.mapUrl || (item ? institutionMapUrl(item) : undefined);

  if (item && (category === "school" || category === "nursery")) return <EducationProfileScreen key={item.id} item={item}/>;
  if (item && isSpeechPlus(item)) return <DoctorProfileScreen doctor={SPEECH_PLUS_DOCTOR}/>;
  if (item && (item.categories.includes("sports") || item.categories.includes("rehabilitation") || item.id === "kw-s-child" || item.id === "kw-s-hope" || item.id === "kw-s-dasman-1" || item.id === "kw-s-maarifa" || item.id === "kw-s-resala" || item.id === "kw-s-umm-qura" || item.id === "kw-s-future")) return <CenterProfileScreen key={item.id} item={item}/>;
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={styles.column}>
      <View style={[styles.header, row]}><HeaderBackButton variant="inline" fallbackHref={fallbackHref} />
        <Text style={[styles.headerTitle, text]}>{t(category === "rehabilitation" ? "centers" : "title")}</Text>
      </View>
      {validBackendId && backend.isPending ? <ActivityIndicator accessibilityLabel={t("loading")} color={colors.primary} /> : !item ?
        <View style={styles.card}><Text style={[styles.body, text]}>{t("notFound")}</Text>
          {backend.isError && <Pressable accessibilityRole="button" onPress={() => void backend.refetch()} style={styles.action}><Text style={styles.actionText}>{t("retry")}</Text></Pressable>}
        </View> : <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 96 + bottom }]}>
          {!!item.mainImage && <View style={{alignItems:"center"}}><InstitutionImage item={item} size={240}/></View>}
          {!!item.publicContact && action(`${t("call")} ${item.publicContact.phone}`, `tel:${item.publicContact.phone}`, "call-outline")}
          <Text style={[styles.kicker, text]}>{item.origin ? t(item.origin) : t(category)}</Text>
          <Text accessibilityRole="header" style={[styles.name, { textAlign: align, writingDirection: dir }]}>{!isRTL && item.nameEn ? item.nameEn : item.nameAr}</Text>
          {item.id === "kw-s-help" && item.publicProfile?.supportedConditions && <View style={{ gap: 12 }}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, text]}>{isRTL ? "نبذة" : "About"}</Text>
            <Text accessibilityRole="header" style={[styles.fieldLabel, text]}>{isRTL ? "الإعاقات والاحتياجات المدعومة" : "Supported Disabilities and Educational Needs"}</Text>
            <Text style={[styles.body, text]}>{item.publicProfile.supportedConditions[isRTL ? "ar" : "en"].join(" ")}</Text>
          </View>}
          <View style={styles.notice}>
            <Text style={[styles.sectionTitle, text]}>{t("reference")}</Text>
            <Text style={[styles.body, text]}>{t("warning")}</Text>
            {!isRTL && <Text style={[styles.body, text]}>{t("arabicSource")}</Text>}
          </View>
          {(hasSourceDifferences(item) || item.reviewNotesAr.length > 0) && <View style={styles.card}>
            <Text style={[styles.sectionTitle, text]}>{t("review")}</Text>
            {hasSourceDifferences(item) && <Text style={[styles.body, text]}>{t("differs")}</Text>}
            {item.reviewNotesAr.map(note => <Text key={note} style={[styles.body, styles.arabic]}>{note}</Text>)}
          </View>}
          {map ? action(item.id === "kw-s-noor" ? (isRTL ? "فتح الموقع في Google Maps" : "Open in Google Maps") : t("map"), map, "location-outline") : <Text style={[styles.muted, text]}>{t("noMap")}</Text>}
          {item.id === "kw-s-noor" && item.publicProfile?.instagram && action(isRTL ? "إنستقرام" : "Instagram", item.publicProfile.instagram, "logo-instagram")}
          {linkError && <Text accessibilityRole="alert" style={[styles.body, text]}>{t("failedLink")}</Text>}
          <Text accessibilityRole="header" style={[styles.sectionTitle, text]}>{t("evidence")}</Text>
          {item.observations.map((o, index) => {
            const source = INSTITUTION_SOURCES.find(s => s.id === o.sourceId);
            return <View key={`${o.sourceId}-${o.page}-${o.row}-${index}`} style={styles.card}>
              <Text style={[styles.sourceTitle, text]}>{source ? `${source.files.join(" / ")} · ${source.date || t("noDate")}` : t(o.sourceId === "backend" ? "backend" : "legacy")}</Text>
              {source && <Text style={[styles.muted, text]}>{t("page")} {o.page} · {t("row")} {o.row}</Text>}
              <Text selectable style={[styles.observedName, styles.arabic]}>{o.nameAr}</Text>
              {fields.map(([label, field]) => <View key={field} style={styles.field}>
                <Text style={[styles.fieldLabel, text]}>{t(label)}</Text>
                <Text selectable style={[styles.body, o[field] ? styles.arabic : text]}>{String(o[field] || t("missing"))}</Text>
              </View>)}
              <Text style={[styles.fieldLabel, text]}>{t("phones")}</Text>
              {o.phones.length ? o.phones.map(phone => {
                const url = institutionPhoneUrl(phone);
                return url ? action(`${t("call")} ${phone}`, url, "call-outline") : <Text selectable key={phone} style={[styles.body, { writingDirection: "ltr" }]}>{phone} · {t("review")}</Text>;
              }) : <Text style={[styles.body, text]}>{t("missing")}</Text>}
            </View>;
          })}
          {item.sourceExtras && <View style={styles.card}>
            <Text style={[styles.sectionTitle, text]}>{t("extras")}</Text>
            {Object.entries(item.sourceExtras).map(([key, value]) => <Text selectable key={key} style={[styles.body, /[\u0600-\u06ff]/.test(value) ? styles.arabic : { writingDirection: "ltr" }]}>{value}</Text>)}
          </View>}
        </ScrollView>}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, column: { width: "100%", maxWidth: 430, alignSelf: "center", flex: 1, direction: "ltr" },
  header: { alignItems: "center", padding: 12, gap: 8 }, headerTitle: { flex: 1, fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.text }, content: { padding: 20, gap: 16 },
  name: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, fontWeight: typography.weightMedium, color: colors.text }, kicker: { fontSize: typography.helper, color: colors.textSecondary },
  notice: { backgroundColor: colors.brandPale, borderRadius: 16, padding: 16, gap: 8 }, card: {     gap: 10 , ...sharedControls.card, backgroundColor: "#EBF1FD" },
  sectionTitle: { fontSize: typography.section, lineHeight: typography.sectionLineHeight, fontWeight: typography.weightSemibold, color: colors.text }, body: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.text }, muted: { fontSize: typography.secondary, lineHeight: typography.secondaryLineHeight, color: colors.textSecondary },
  arabic: { writingDirection: "rtl", textAlign: "right" }, sourceTitle: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, fontWeight: typography.weightMedium, color: colors.textSecondary }, observedName: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, color: colors.text, fontWeight: typography.weightMedium },
  field: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 10, gap: 3 }, fieldLabel: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.textSecondary, fontWeight: typography.weightRegular },
  action: { minHeight: 48, padding: 12, backgroundColor: colors.primary, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 8 }, actionText: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium, writingDirection: "ltr" },
});
