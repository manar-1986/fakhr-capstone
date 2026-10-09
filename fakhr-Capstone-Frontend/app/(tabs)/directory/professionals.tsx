import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { APPROVED_DOCTORS, DOCTOR_GROUPS, doctorReviewLabel, type ApprovedDoctor } from "../../../constants/approvedDoctors";
import { normalizeInstitutionSearch } from "../../../utils/institutionDirectory";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background, title: palette.text, subtitle: palette.textMuted,
  placeholder: palette.textLight, searchBorder: palette.border, star: palette.star,
  chevron: palette.chevron, button: palette.primary, avatarBg: palette.borderLight, white: palette.white,
};

export default function ProfessionalsScreen() {
  const { t } = useTranslation();
  const { align, isRTL, dir } = useI18nLayout();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width, 430);
  const ms = (n: number) => Math.round(n * contentW / 390);
  const [category, setCategory] = useState<"doctors" | "specialists">("doctors");
  const [search, setSearch] = useState("");
  const text = { textAlign: align, writingDirection: dir };
  const rows = useMemo(() => {
    const q = normalizeInstitutionSearch(search);
    return APPROVED_DOCTORS.filter(d => normalizeInstitutionSearch(d.nameAr + " " + d.nameEn).includes(q));
  }, [search]);
  const open = (doctor: ApprovedDoctor) => router.push({
    pathname: "/(tabs)/directory/professional-details", params: { id: doctor.id },
  });
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={[styles.column, { width: contentW, direction: "ltr" }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, {
        paddingHorizontal: ms(18), paddingTop: ms(6), paddingBottom: ms(108),
      }]} keyboardShouldPersistTaps="handled">
        <View style={[[styles.header, { minHeight: ms(48), marginBottom: ms(10) }], { height: undefined, minHeight: 56, paddingHorizontal: 44 }]}>
          <DisabilityAwareHeaderBackButton color={colors.title} />
          <Text style={[styles.title, { fontSize: typography.title, lineHeight: typography.cardTitleLineHeight, writingDirection: dir }]}>{t("ui.doctorsOneLine")}</Text>
        </View>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 18 }}>
          {(["doctors", "specialists"] as const).map(kind => <Pressable key={kind} accessibilityRole="tab"
            accessibilityState={{ selected: category === kind }} onPress={() => { setCategory(kind); setSearch(""); }}
            style={{ flex: 1, minHeight: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: category === kind ? palette.primary : palette.borderLight }}>
            <Text style={{ color: category === kind ? palette.white : palette.text, fontWeight: "700" }}>
              {kind === "doctors" ? (isRTL ? "الأطباء" : "Doctors") : (isRTL ? "الأخصائيون" : "Specialists")}
            </Text>
          </Pressable>)}
        </View>
        {category === "specialists" ? <View style={{ padding: 18, gap: 12 }}>
          <Text style={[styles.name, text, { fontSize: typography.menu }]}>{isRTL ? "الأخصائيون — المرحلة القادمة" : "Specialists — next stage"}</Text>
          <Text style={[styles.specialty, text, { lineHeight: typography.bodyLineHeight }]}>{isRTL ? "النطق واللغة · العلاج الوظيفي — لم تتم إضافة أخصائيين بعد." : "Speech and language therapy · Occupational therapy — No specialists have been added yet."}</Text>
        </View> : <>
          <View style={[styles.searchBar, { minHeight: ms(44), borderRadius: ms(22), paddingHorizontal: ms(14), marginBottom: ms(18), gap: ms(8) }]}>
            <TextInput value={search} onChangeText={setSearch} placeholder={t("ui.searchDoctor")} accessibilityLabel={t("ui.searchDoctor")}
              placeholderTextColor={colors.placeholder} style={[styles.searchInput, text, { fontSize: typography.body }]} returnKeyType="search" />
            <Ionicons name="search-outline" size={ms(20)} color={colors.placeholder} />
          </View>
          <Text style={[styles.specialty, text, { lineHeight: typography.bodyLineHeight, marginBottom: 14 }]}>{isRTL ? "قائمة هذه المرحلة فقط. التخصصات موثقة بالمصادر حيث تتوفر؛ بقية التفاصيل تحتاج مراجعة." : "Only the selected doctors for this stage. Specialties are sourced where available; other details require review."}</Text>
          {DOCTOR_GROUPS.map(group => {
            const doctors = rows.filter(d => d.group === group.key);
            return doctors.length ? <View key={group.key} style={{ gap: ms(18), marginBottom: ms(22) }}>
              <Text accessibilityRole="header" style={[styles.name, text, { fontSize: typography.h2, color: palette.primary }]}>{isRTL ? group.ar : group.en}</Text>
              {doctors.map(doctor => <Pressable key={doctor.id} onPress={() => open(doctor)} accessibilityRole="button"
                accessibilityLabel={isRTL ? doctor.nameAr : doctor.nameEn}
                style={({ pressed }) => [styles.row, { gap: ms(12), minHeight: ms(72), flexDirection: isRTL ? "row-reverse" : "row" }, pressed && styles.pressed]}>
                <View style={{ width: ms(72), height: ms(72), borderRadius: ms(36), backgroundColor: colors.avatarBg, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="person-outline" size={ms(32)} color={palette.textMuted} />
                </View>
                <View style={[styles.info, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                  <Text style={[styles.name, text, { fontSize: typography.menu, lineHeight: typography.cardTitleLineHeight }]}>{isRTL ? doctor.nameAr : doctor.nameEn}</Text>
                  <Text style={[styles.specialty, text, { fontSize: typography.caption, lineHeight: typography.captionLineHeight }]}>{doctorReviewLabel(isRTL)}</Text>
                  {!doctor.englishVerified && <Text style={[styles.specialty, text, { fontSize: typography.caption, lineHeight: typography.captionLineHeight }]}>{isRTL ? "التهجئة الإنجليزية قيد المراجعة" : "English spelling under review"}</Text>}
                </View>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={ms(16)} color={colors.chevron} />
              </Pressable>)}
            </View> : null;
          })}
          {!rows.length && <Text style={[styles.specialty, text]}>{isRTL ? "لا توجد نتائج مطابقة." : "No matching doctors."}</Text>}
        </>}
      </ScrollView>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  column: {
    flex: 1,
    maxWidth: 430,
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    width: "100%",
    alignItems: "stretch",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.searchBorder,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    color: colors.title,
    paddingVertical: 8,
    writingDirection: "rtl",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEF0F4",
    paddingBottom: 8,
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
  },
  name: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  specialty: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontWeight: "600",
    color: colors.title,
    writingDirection: "ltr",
  },
  moreBtn: {
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  moreBtnText: {
    color: colors.white,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
