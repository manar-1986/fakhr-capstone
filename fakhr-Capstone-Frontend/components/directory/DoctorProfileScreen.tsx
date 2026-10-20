import { typography } from "../../theme/typography";
import { ProfileHeader, ProfileTabs, profileStyles as s } from "./ProfileLayout";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, ScrollView } from "../ui/AppText";
import { colors } from "../../theme";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import type { ApprovedDoctor } from "../../constants/approvedDoctors";
import { DoctorImage, specialtyText, v, gradient } from "./DoctorVisuals";
import FatmaClinicContact from "./FatmaClinicContact";
import HadeelClinicContact from "./HadeelClinicContact";
import PersonalAppointment from "./PersonalAppointment";

// User-supplied biography; no independent credential verification is asserted.
const hadeelBiography = {
  ar: "استشاري طب أطفال تطوري – بورد كندي وأمريكي",
  en: "Consultant in Developmental Pediatrics – Canadian and American Board Certified",
  provenance: "user-provided",
  independentlyVerified: false,
} as const;

// User-provided profile text, not independently verified credentials.
const fatmaBiography = {
  ar: "د. فاطمة العوضي، استشارية طب الأطفال التطوري، متخصصة في طب الأطفال التطوري.",
  en: "Dr. Fatma Al-Awadhi is a Consultant Developmental Pediatrician specializing in developmental pediatrics.",
  provenance: "user-provided",
  independentlyVerified: false,
} as const;

export default function DoctorProfileScreen({ doctor }: { doctor: ApprovedDoctor }) {
  const { isRTL, align, dir } = useI18nLayout();
  const isEssa = doctor.id === "doctor-essa-habib-al-mashmoum";
  const isReem = doctor.id === "doctor-reem-kanawati";
  const source = doctor.sourceInstitution?.publicProfile;
  const isHadeel = doctor.id === "doctor-hadeel-yassin-faras";
  const isFatma = doctor.id === "doctor-fatima-al-awadhi";
  const isMohammed = doctor.id === "doctor-mohammed-almuhtab";
  const isAhmed = doctor.id === "doctor-ahmed-al-tamimi";
  const isDalal = doctor.id === "doctor-dalal-alsubaie";
  const isBlueWing = doctor.id === "doctor-dalal-sulaiman-al-shayji";
  const hideQualificationsAndServices = !!doctor.suppliedSpecializations || isHadeel || isFatma || isMohammed || isAhmed || isDalal || isBlueWing || !!source || isReem || isEssa;
  const [tab, setTab] = useState("overview");
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const text = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const localizedDoctor = source?.address ? { ...doctor, clinic: { ...doctor.clinic!, address: source.address[isRTL ? "ar" : "en"] } } : !isRTL && doctor.clinic?.addressEn ? { ...doctor, clinic: { ...doctor.clinic, address: doctor.clinic.addressEn } } : doctor;
  const Contact = doctor.id === "doctor-hadeel-yassin-faras" ? HadeelClinicContact : FatmaClinicContact;
  const section = (title: string, icon: React.ComponentProps<typeof Ionicons>["name"], body: string) => <View style={v.card}>
    <View style={[row,{alignItems:"center",gap:8}]}><View style={s.icon}><Ionicons name={icon} size={21} color={colors.primary}/></View><Text accessibilityRole="header" style={[v.title,text,{flex:1}]}>{title}</Text></View>
    <Text style={[v.secondary,text]}>{body}</Text>
  </View>;
  // These curated records have no approved biographies, qualifications or service lists.
  // Do not infer procedures or credentials from a specialty or from the design reference.
  const services = section(tr("الخدمات","Services"),"list-outline",tr("لم تُضف قائمة خدمات لهذه العيادة بعد. يمكنك التواصل مع العيادة للاستفسار.","No service list is available for this clinic yet. Contact the clinic for details."));
  return <View style={s.screen}><ScrollView contentContainerStyle={{paddingBottom:120}}>
    <ProfileHeader title={tr("تفاصيل العيادة","Clinic Details")}/>
    <View style={s.content}>
      <View style={[v.card,row,s.profile]}><DoctorImage doctor={doctor} size={96} borderRadius={18}/><View style={{flex:1,gap:7}}>
        <Text style={[v.title,text,{fontSize:typography.section,lineHeight:typography.sectionLineHeight}]}>{isRTL?doctor.nameAr:doctor.nameEn}</Text>
        {!!specialtyText(doctor,isRTL) && <Text style={[v.secondary,text]}>{specialtyText(doctor,isRTL)}</Text>}
        {!!doctor.clinic && <Text style={[v.secondary,text]}>{isRTL?doctor.clinic.nameAr:doctor.clinic.nameEn}</Text>}
        {!!doctor.clinic?.address && <Text style={[v.secondary,text,{fontSize:typography.helper}]}>{localizedDoctor.clinic?.address}</Text>}
      </View></View>
      <ProfileTabs items={[{id:"overview",ar:"نبذة",en:"Overview",icon:"person-outline"},{id:"services",ar:"الخدمات",en:"Services",icon:"list-outline"},{id:"location",ar:"الموقع",en:"Location",icon:"location-outline"}].filter(item => !hideQualificationsAndServices || item.id !== "services")} tab={tab} setTab={setTab}/>
      {tab === "overview" && <>
        {isDalal && doctor.suppliedAboutItems ? <View style={v.card}>
          <View style={[row,{alignItems:"center",gap:8}]}><View style={s.icon}><Ionicons name="person-outline" size={21} color={colors.primary}/></View><Text accessibilityRole="header" style={[v.title,text,{flex:1}]}>{tr("عن الطبيب","About the Doctor")}</Text></View>
          <Text style={[v.secondary,text,{fontWeight:typography.weightRegular}]}>{specialtyText(doctor,isRTL)}</Text>
          {doctor.suppliedAboutItems[isRTL ? "ar" : "en"].map(item=><Text key={item} style={[v.secondary,text]}>{"• " + item}</Text>)}
        </View> : isAhmed && doctor.suppliedQualifications ? <View style={v.card}>
          <View style={[row,{alignItems:"center",gap:8}]}><View style={s.icon}><Ionicons name="person-outline" size={21} color={colors.primary}/></View><Text accessibilityRole="header" style={[v.title,text,{flex:1}]}>{tr("عن الطبيب","About the Doctor")}</Text></View>
          {doctor.suppliedQualifications[isRTL ? "ar" : "en"].map(item=><Text key={item} style={[v.secondary,text]}>{item}</Text>)}
          <Text style={[v.secondary,{writingDirection:"ltr",textAlign:"left"}]}>{doctor.suppliedQualifications.abbreviations + "."}</Text>
        </View> : section(tr("عن الطبيب","About the Doctor"),"person-outline",doctor.suppliedBiography ? doctor.suppliedBiography[isRTL ? "ar" : "en"] : isHadeel ? hadeelBiography[isRTL ? "ar" : "en"] : isFatma ? fatmaBiography[isRTL ? "ar" : "en"] : tr("لا تتوفر نبذة مهنية معتمدة في الملف حاليًا.","A professional biography is not currently available in this profile."))}
        {!isAhmed && doctor.suppliedQualifications ? <View style={v.card}>
          <View style={[row,{alignItems:"center",gap:8}]}><View style={s.icon}><Ionicons name="school-outline" size={21} color={colors.primary}/></View><Text accessibilityRole="header" style={[v.title,text,{flex:1}]}>{tr("المؤهلات","Qualifications")}</Text></View>
          {doctor.suppliedQualifications[isRTL ? "ar" : "en"].map(item=><Text key={item} style={[v.secondary,text]}>{item}</Text>)}
          <Text style={[v.secondary,{writingDirection:"ltr",textAlign:"left"}]}>{doctor.suppliedQualifications.abbreviations}</Text>
        </View> : !hideQualificationsAndServices && section(tr("المؤهلات","Qualifications"),"school-outline",tr("لم تُضف مؤهلات موثقة إلى هذا الملف بعد.","No documented qualifications have been added to this profile yet."))}
      </>}
      {doctor.suppliedSpecializations && tab === "overview" && section(tr("التخصصات", "Specializations"), "list-outline", doctor.suppliedSpecializations[isRTL ? "ar" : "en"].map(item => "• " + item).join("\n"))}
      {doctor.suppliedDiagnosticServices && tab === "overview" && section(tr("الخدمات التشخيصية", "Diagnostic Services"), "list-outline", doctor.suppliedDiagnosticServices[isRTL ? "ar" : "en"].map(item => "• " + item).join("\n"))}
      {source && tab === "overview" && <>
        {source.description && section(tr("عن العيادة","About the Clinic"),"business-outline",source.description[isRTL ? "ar" : "en"])}
        {source.classification && section(tr("تخصص العيادة","Clinic Specialization"),"list-outline",source.classification[isRTL ? "ar" : "en"])}
        {!!source.services?.[isRTL ? "ar" : "en"].length && section(tr("الخدمات","Services"),"list-outline",source.services![isRTL ? "ar" : "en"].join("\n"))}
      </>}
      {!hideQualificationsAndServices && tab !== "location" && services}
      {tab !== "services" && <>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("الموقع والتواصل","Location & Contact")}</Text>
        {doctor.branches?.length ? doctor.branches.map(branch => <View key={branch.id} testID={`doctor-branch-${branch.id}`}><Contact doctor={{...doctor, clinic: branch}} mode="contact" hideCalendar/></View>) : doctor.id === "specialist-noha-al-mufarreh" ? <FatmaClinicContact doctor={doctor} mode="contact" kind="center" website={doctor.clinic?.website} hideCalendar/> : doctor.clinic ? <Contact doctor={localizedDoctor} mode="contact" website={source?.website || doctor.clinic?.website} hideCalendar/> : section(tr("بيانات التواصل","Contact Information"),"location-outline",tr("بيانات التواصل غير متاحة حاليًا.","Contact information is not currently available."))}
        {(isHadeel || isFatma) && doctor.clinic && <Contact doctor={doctor} mode="gallery" hideCalendar/>}
      </>}
      <View style={v.card}><PersonalAppointment nativeEditor={isReem || isEssa} identity={doctor.id} name={isReem ? ((isRTL ? doctor.nameAr : doctor.nameEn) + " — Medica Physio") : doctor.clinic ? [(isRTL?doctor.nameAr:doctor.nameEn),(isRTL?doctor.clinic.nameAr:doctor.clinic.nameEn)].filter((value,index,values) => !!value && values.indexOf(value) === index).join(" — ") : (isRTL?doctor.nameAr:doctor.nameEn)} address={localizedDoctor.clinic?.address} phone={doctor.clinic?.phone} mapUrl={doctor.clinic?.mapUrl}/></View>
    </View>
  </ScrollView></View>;
}
