import PlanActionPressable from '../../../components/ui/PlanActionPressable';
import {planActions} from '../../../theme/planActions';
import { directoryListing } from "../../../theme/directoryListing";
import { categoryColors } from "../../../theme/categories";
import { colors as fakhrColors } from "../../../theme/colors";
import DirectoryCard from "../../../components/directory/DirectoryCard";
import { DoctorImage, DoctorLink, directorySpecialty, specialtyText, gradient, v } from "../../../components/directory/DoctorVisuals";
import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { PUBLIC_DOCTORS, type ApprovedDoctor } from "../../../constants/approvedDoctors";
import { doctorSpecialtyOptions, doctorVisibleSpecialtyOptions, filterDirectoryDoctors } from "../../../utils/doctorSpecialtyFilters";
import { colors as palette } from "../../../theme";

import InstitutionDirectoryScreen from "../../../components/directory/InstitutionDirectoryScreen";

const colors = {
  bg: palette.background, title: palette.text, subtitle: palette.textMuted,
  placeholder: palette.textLight, searchBorder: palette.border, star: palette.star,
  chevron: palette.chevron, button: planActions.primary, avatarBg: palette.borderLight, white: palette.white,
};

export default function ProfessionalsScreen() {
  const { t } = useTranslation();
  const { align, isRTL, dir } = useI18nLayout();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width, 430);
  const ms = (n: number) => Math.round(n * contentW / 390);
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const selectedTab = tab === "centers" ? "centers" : "doctors";
  const [category, setCategory] = useState<"doctors" | "centers">(selectedTab);
  useEffect(() => { setCategory(selectedTab); setSearch(""); }, [selectedTab]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const text = { textAlign: align, writingDirection: dir };
  const specialties = useMemo(() => doctorSpecialtyOptions(PUBLIC_DOCTORS), []);
  const visibleSpecialties = useMemo(() => doctorVisibleSpecialtyOptions(PUBLIC_DOCTORS), []);
  const rows = useMemo(() => filterDirectoryDoctors(PUBLIC_DOCTORS, specialty, search), [search, specialty]);
  const open = (doctor: ApprovedDoctor) => router.push({
    pathname: "/(tabs)/directory/professional-details", params: { id: doctor.id },
  });
  const header = <View>
        <View style={[[styles.header, { minHeight: ms(48), marginBottom: ms(10) }], { height: undefined, minHeight: 56, paddingHorizontal: 44 }]}>
          <DisabilityAwareHeaderBackButton color={colors.title} />
          <Text style={[styles.title, { fontSize: typography.title, lineHeight: typography.titleLineHeight, writingDirection: dir }]}>{t("ui.doctorsOneLine")}</Text>
        </View>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 6, marginBottom: 18 }}>
          {(["doctors", "centers"] as const).map(kind => <PlanActionPressable key={kind} active={category===kind} accessibilityRole="tab"
            aria-selected={category === kind}
            accessibilityState={{ selected: category === kind }} onPress={() => { setCategory(kind); setSearch(""); router.setParams({ tab: kind }); }}
            style={{ flex: 1, minHeight: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: category === kind ? planActions.primary : palette.borderLight }}>
            <Text style={{ color: category === kind ? palette.white : palette.text, fontWeight: typography.weightMedium, fontSize: typography.button, textAlign: "center", writingDirection: dir }}>
              {kind === "doctors" ? (isRTL ? "الأطباء" : "Doctors")  : (isRTL ? "المراكز" : "Centers")}
            </Text>
          </PlanActionPressable>)}
        </View>
  </View>;
  if (category === "centers") return <InstitutionDirectoryScreen initialCategory="rehabilitation" includeAllCenters header={<View style={{ paddingHorizontal: ms(18), paddingTop: ms(6) }}>{header}</View>} />;
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={[styles.column, { width: contentW, direction: "ltr" }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, {
        paddingHorizontal: ms(18), paddingTop: ms(6), paddingBottom: ms(108),
      }]} keyboardShouldPersistTaps="handled">
        {header}
          <View style={[styles.searchBar, { minHeight: ms(44), borderRadius: ms(22), paddingHorizontal: ms(14), marginBottom: ms(18), gap: ms(8) }]}>
            <TextInput value={search} onChangeText={setSearch} placeholder={t("ui.searchDoctor")} accessibilityLabel={t("ui.searchDoctor")}
              placeholderTextColor={colors.placeholder} style={[styles.searchInput, text, { fontSize: typography.body }]} returnKeyType="search" />
            <Ionicons name="search-outline" size={ms(20)} color={colors.placeholder} />
          </View>
          <ScrollView key={isRTL ? "rtl" : "ltr"} testID="doctor-specialty-filters" horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled"
            style={{ marginBottom: 14, flexGrow: 0, direction: isRTL ? "rtl" : "ltr" }} contentContainerStyle={{ flexDirection: "row", gap: 6 }}>
            {[{key:"all",ar:"الكل",en:"All"}, ...visibleSpecialties].map(item => <PlanActionPressable key={item.key} active={specialty===item.key} accessibilityRole="tab" accessibilityLabel={isRTL ? item.ar : item.en} aria-selected={specialty===item.key} accessibilityState={{selected:specialty===item.key}} onPress={()=>setSpecialty(item.key)} style={[{flexShrink:0, borderRadius:18, borderWidth:1, borderColor:palette.border, minHeight:44, paddingHorizontal:16, paddingVertical:10, justifyContent:"center",backgroundColor:palette.borderLight},specialty===item.key && {backgroundColor:planActions.primary}]}><Text style={{fontSize:typography.button,fontWeight:typography.weightMedium,textAlign:"center",writingDirection:dir,color:specialty===item.key ? palette.white : palette.textSecondary}}>{isRTL ? item.ar : item.en}</Text></PlanActionPressable>)}
          </ScrollView>
          {specialties.map(group => {
            const doctors = rows.filter(d => directorySpecialty(d) === group.key);
            return doctors.length ? <View key={group.key} style={{backgroundColor:directoryListing.section.backgroundColor,borderRadius:20,padding:5,gap:8,marginBottom:14}}>
              <View style={{flexDirection:isRTL?"row-reverse":"row",alignItems:"center",gap:8,padding:10}}><Ionicons name={({"clinical-nutrition":"nutrition-outline","pediatric-cardiology":"heart-outline","fetal-cardiology":"heart-outline","learning-difficulties":"school-outline","child-adolescent-mental-health":"people-outline",ophthalmology:"eye-outline","pediatric-dentistry":"medical-outline","special-needs-dentistry":"medical-outline","pediatric-orthopedics":"medical-outline","orthopedic-surgery":"medical-outline",aba:"people-outline",developmental:"person-outline",psychology:"people-outline",dentistry:"medical-outline",education:"school-outline",pediatrics:"person-outline",neurology:"medical-outline",review:"person-outline"} as const)[group.key]} size={22} color={categoryColors.sessions.foreground}/><Text accessibilityRole="header" style={[v.title,text,{flex:1,fontSize:typography.section,fontWeight:typography.weightSemibold}]}>{isRTL?group.ar:group.en}</Text></View>
              {doctors.map(doctor=><DirectoryCard key={doctor.id} name={isRTL?doctor.nameAr:doctor.nameEn} image={<DoctorImage doctor={doctor} size={58}/>} specialty={specialtyText(doctor,isRTL)} organization={doctor.clinic ? (isRTL?doctor.clinic.nameAr:doctor.clinic.nameEn) : undefined} location={!isRTL && doctor.clinic?.addressEn ? doctor.clinic.addressEn : doctor.clinic?.address} phone={doctor.clinic?.phone} whatsappUrl={doctor.id === "doctor-ali-adel-saleh" ? doctor.clinic?.whatsapp?.url : undefined} onOpen={()=>open(doctor)}/>)}
            </View>:null;
          })}
          {!rows.length && <Text style={[styles.specialty, text]}>{isRTL ? "لا توجد نتائج مطابقة." : "No matching doctors."}</Text>}
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
    fontWeight: typography.weightSemibold,
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
    borderBottomColor: fakhrColors.backgroundWash,
    paddingBottom: 8,
  },
  info: {
    flex: 1,
    alignItems: "flex-end",
  },
  name: {
    fontWeight: typography.weightMedium,
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  specialty: {
    fontWeight: typography.weightRegular,
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontWeight: typography.weightRegular,
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
    color: "#0B093B",
    fontWeight: typography.weightMedium,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
