import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { ScrollView, Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { BLUE_WING_CENTER_ID, BLUE_WING_DOCTOR } from "../../constants/blueWing";
import { DoctorImage, v } from "./DoctorVisuals";
import FatmaClinicContact from "./FatmaClinicContact";
import PersonalAppointment from "./PersonalAppointment";
export default function BlueWingCenterScreen() {
  const {isRTL,align,dir}=useI18nLayout();const router=useRouter();
  const doctor=BLUE_WING_DOCTOR;const clinic=doctor.clinic!;
  const text={textAlign:align,writingDirection:dir};
  return <ScrollView style={{flex:1,width:"100%",maxWidth:520,alignSelf:"center",backgroundColor:"white"}} contentContainerStyle={{padding:16,paddingBottom:120,gap:14}}>
    <View style={[v.card,{alignItems:"center"}]}><DoctorImage doctor={doctor} size={96}/><Text accessibilityRole="header" style={[v.title,text]}>{isRTL?clinic.nameAr:clinic.nameEn}</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel={isRTL?doctor.nameAr:doctor.nameEn} onPress={()=>router.push({pathname:"/(tabs)/directory/professional-details",params:{id:doctor.id}})} style={v.card}>
      <Text style={[v.title,text]}>{isRTL?doctor.nameAr:doctor.nameEn}</Text><Text style={[v.secondary,text]}>{doctor.suppliedSpecialty![isRTL?"ar":"en"]}</Text><Text style={[v.link,text]}>{isRTL?"عرض الملف":"View Profile"}</Text>
    </Pressable>
    <FatmaClinicContact doctor={doctor} mode="contact" hideCalendar/>
    <View style={v.card}><PersonalAppointment identity={BLUE_WING_CENTER_ID} name={isRTL?clinic.nameAr:clinic.nameEn} mapUrl={clinic.mapUrl}/></View>
  </ScrollView>;
}
