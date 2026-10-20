import { typography } from "../../theme/typography";
import InstitutionPhotoGallery from "./InstitutionPhotoGallery";
import EducationPhoneCard from "./EducationPhoneCard";
import SchoolBranchDetails from "./SchoolBranchDetails";
import { CONFIRMED_SCHOOL_GROUPS } from "../../utils/confirmedSchoolGroups";
import { maarifaBranchText } from "../../utils/maarifaSchool";
import React, { useContext, useState } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { tabBarContentHeight } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, ScrollView } from "../ui/AppText";
import { colors } from "../../theme";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import type { Institution } from "../../types/institution";
import type { ApprovedDoctor } from "../../constants/approvedDoctors";
import { BLUE_WING_CENTER_ID, BLUE_WING_DOCTOR } from "../../constants/blueWing";
import { institutionMapUrl, institutionPhoneUrl } from "../../utils/institutionDirectory";
import { centerPhone, centerWebUrl, centerWhatsApp, validCenterRating } from "../../utils/centerPublicProfile";
import { ProfileHeader, ProfileTabs, profileStyles as s } from "./ProfileLayout";
import { DoctorImage, DoctorLink, v } from "./DoctorVisuals";
import InstitutionImage from "./InstitutionImage";
import FatmaClinicContact from "./FatmaClinicContact";
import PersonalAppointment from "./PersonalAppointment";

export default function CenterProfileScreen({ item, educationKind }: { item: Institution; educationKind?: "school" | "nursery" }) {
  const { isRTL, align, dir } = useI18nLayout();
  const router = useRouter();
  const bottom = useContext(SafeAreaInsetsContext)?.bottom || 0;
  const { fontScale } = useWindowDimensions();
  const [tab, setTab] = useState("overview");
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const text = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const blueWing = item.id === BLUE_WING_CENTER_ID;
  const nursery = educationKind === "nursery";
  // Keep recorded values verbatim; never sum capacities across sources or branches.
  const capacities = nursery && !item.branches?.length
    ? [...new Set(item.observations.map(observation => observation.capacityAr?.trim()).filter((value): value is string => !!value))]
    : [];
  const school = educationKind === "school" || item.id === "kw-s-hope" || item.id === "kw-s-dasman-1" || item.id === "kw-s-maarifa" || item.id === "kw-s-resala" || item.id === "kw-s-umm-qura" || item.id === "kw-s-future";
  const extraPhones = (item.publicProfile?.extraPhones || []).filter(contact=>!!centerPhone(contact.phone)).map(contact=>({phone:centerPhone(contact.phone)!,label:contact.label[isRTL?"ar":"en"]}));
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.publicProfile?.email || "") ? item.publicProfile?.email : undefined;
  const name = !isRTL && item.nameEn ? item.nameEn : item.nameAr;
  const profile = item.publicProfile;
  const locale = isRTL ? "ar" : "en";
  const mapUrl = centerWebUrl(profile?.mapUrl, "maps") || centerWebUrl(item.publicContact?.mapUrl, "maps") || institutionMapUrl(item);
  const additionalUrl = centerWebUrl(profile?.additionalUrl);
  const website = centerWebUrl(profile?.localizedWebsite?.[locale]) || centerWebUrl(profile?.website);
  const rating = validCenterRating(profile?.rating);
  // Presentation adapter only; it does not create or persist a doctor record.
  const contact: ApprovedDoctor = { id: item.id, nameAr: item.nameAr, nameEn: item.nameEn || item.nameAr,
    group: "review", englishVerified: false, sources: [],
    clinic: blueWing ? BLUE_WING_DOCTOR.clinic : { nameAr: item.nameAr, nameEn: item.nameEn || item.nameAr,
      phone: centerPhone(profile?.phone) || centerPhone(item.publicContact?.phone), additionalPhone: centerPhone(profile?.additionalPhone),
      address: profile?.address?.[locale]?.trim(), whatsapp: centerWhatsApp(profile?.whatsapp), instagram: centerWebUrl(profile?.instagram, "instagram"), mapUrl: mapUrl || "" } };
  const hasContact = !![contact.clinic?.phone, contact.clinic?.additionalPhone, contact.clinic?.address,
    contact.clinic?.whatsapp, contact.clinic?.mapUrl, contact.clinic?.instagram, website, additionalUrl, email, extraPhones.length].some(Boolean);
  return <View style={s.screen}><ScrollView contentContainerStyle={{ paddingBottom: Math.max(120, tabBarContentHeight(fontScale) + bottom + 24) }}>
    <ProfileHeader title={item.categories.includes("sports") ? tr("تفاصيل النادي الرياضي", "Sports Club Details") : nursery ? tr("تفاصيل الحضانة", "Nursery Details") : school ? tr("تفاصيل المدرسة", "School Details") : tr("تفاصيل المركز", "Center Details")}/>
    <View style={s.content}>
      <View style={[v.card, row, s.profile]}>
        {item.mainImage ? <InstitutionImage item={item} size={96}/> : blueWing ? <DoctorImage doctor={BLUE_WING_DOCTOR} size={96} borderRadius={18}/> : <View style={{width:96,height:96,alignItems:"center",justifyContent:"center"}}><Ionicons name="business-outline" size={32} color={colors.primary}/></View>}
        <View style={{flex:1,gap:7}}><Text style={[v.title,text,{fontSize:typography.section,lineHeight:typography.sectionLineHeight}]}>{name}</Text>
          {educationKind && profile?.specialization && <Text style={[v.secondary,text]}>{profile.specialization[locale]}</Text>}
          {profile?.classification && <Text style={[v.secondary,text]}>{profile.classification[locale]}</Text>}
          {profile?.area && <Text style={[v.secondary,text]}>{profile.area[locale]}</Text>}
        </View>
      </View>
      {educationKind && <InstitutionPhotoGallery item={item}/>}
      <ProfileTabs items={[{id:"overview",ar:"نبذة",en:"About",icon:"person-outline"},{id:"location",ar:"الموقع",en:"Location",icon:"location-outline"}]} tab={tab} setTab={setTab}/>
      {/* Source observations have no verified public biography, services or ages.
          Keep those records intact, but never promote their contents into public claims. */}
      {tab === "overview" && blueWing && <View style={v.card}>
        <View style={[row,{alignItems:"center",gap:8}]}><View style={s.icon}><Ionicons name="person-outline" size={21} color={colors.primary}/></View><Text accessibilityRole="header" style={[v.title,text,{flex:1}]}>{nursery ? tr("نبذة عن الحضانة", "About the Nursery") : school ? tr("نبذة عن المدرسة", "About the School") : tr("نبذة عن المركز", "About the Center")}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={tr(BLUE_WING_DOCTOR.nameAr,BLUE_WING_DOCTOR.nameEn)} onPress={()=>router.push({pathname:"/(tabs)/directory/professional-details",params:{id:BLUE_WING_DOCTOR.id}})}>
          <Text style={[v.title,text]}>{tr(BLUE_WING_DOCTOR.nameAr,BLUE_WING_DOCTOR.nameEn)}</Text>
          <Text style={[v.secondary,text]}>{BLUE_WING_DOCTOR.suppliedSpecialty?.[isRTL?"ar":"en"]}</Text>
          <Text style={[v.link,text]}>{tr("عرض الملف","View Profile")}</Text>
        </Pressable>
      </View>}
      {tab === "overview" && profile?.description && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{school ? tr("نبذة عن المدرسة", "About the School") : tr("نبذة عن المركز", "About the Center")}</Text>
        <Text style={[v.secondary,text]}>{profile.description[locale]}</Text>
        {!!profile.established && <Text style={[v.secondary,text]}>{tr("تأسس عام ", "Established in ")}{profile.established}</Text>}
      </View>}
      {tab === "overview" && !!profile?.services?.[locale].length && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("الخدمات والتخصصات", "Services & Specializations")}</Text>
        {profile.services[locale].map(service=><Text key={service} style={[v.secondary,text]}>{service}</Text>)}
      </View>}
      {tab === "overview" && !!profile?.supervisors?.[locale].length && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("بإشراف", "Supervised by")}</Text>
        {profile.supervisors[locale].map(name => <Text key={name} style={[v.secondary,text]}>{name}</Text>)}
      </View>}
      {tab === "overview" && profile?.ages && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("الفئات العمرية", "Age Groups")}</Text>
        <Text style={[v.secondary,text]}>{profile.ages[locale]}</Text>
      </View>}
      {tab === "overview" && capacities.length > 0 && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("السعة الاستيعابية", "Capacity")}</Text>
        {capacities.map(value => <Text key={value} style={[v.secondary,text]}>{value}</Text>)}
      </View>}
      {tab === "overview" && !!profile?.associatedSpecialists?.[locale].length && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("الأخصائي المرتبط بالعيادة", "Associated Specialist")}</Text>
        {profile.associatedSpecialists[locale].map(name=><Text key={name} style={[v.secondary,text]}>{name}</Text>)}
      </View>}
      {tab === "overview" && !!profile?.supportedConditions?.[locale].length && <View style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{educationKind ? tr("الإعاقات والاحتياجات المدعومة", "Supported Disabilities and Educational Needs") : (item.id === "kw-s-resala" || item.id === "kw-s-umm-qura" || item.id === "kw-s-future") ? tr("الإعاقات والاحتياجات المدعومة", "Supported Disabilities & Educational Needs") : tr("الفئات المدعومة", "Supported Conditions")}</Text>
        {profile.supportedConditions[locale].map(condition=><Text key={condition} style={[v.secondary,text]}>{condition}</Text>)}
      </View>}
      {item.id !== "kw-n-maha" && !!profile?.branchLocations?.length && <View testID="branch-locations" style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("مواقع الفروع","Branch Locations")}</Text>
        {profile.branchLocations.map(location=><View key={location.branchId} testID={"branch-location-"+location.branchId} style={{gap:8}}>
          <Text style={[v.secondary,text]}>{location.name[locale]}</Text>
          {item.id === "kw-n-insan-1" && location.address && <Text style={[v.secondary,text]}>{location.address[locale]}</Text>}
          {location.mapUrl && <DoctorLink label={tr("الموقع","Location")} url={location.mapUrl} icon="location-outline"/>}
          {location.whatsapp && <DoctorLink label={tr("تواصل عبر الواتساب","Contact via WhatsApp")} url={location.whatsapp.url} icon="logo-whatsapp"/>}
        </View>)}
      </View>}
      {item.id === "kw-n-heba" && <View style={v.card}><Text accessibilityRole="header" style={[v.title,text]}>{tr("بيانات المصادر السابقة","Previous source details")}</Text><Text style={[v.secondary,text]}>{tr("الموقع الجديد المقدم للفرع الأول هو مبارك الكبير. المصادر السابقة تسجل عبد الله المبارك؛ تم الاحتفاظ بها للمراجعة.","The newly supplied first branch is Mubarak Al-Kabeer. Earlier sources record Abdullah Al Mubarak; those details are retained for review.")}</Text></View>}
      {item.branches?.map((branch,index)=>CONFIRMED_SCHOOL_GROUPS.some(group=>group.ids[0]===item.id) ? <SchoolBranchDetails key={branch.id} branch={branch} location={item.id === "kw-n-maha" ? profile?.branchLocations?.find(location=>location.branchId===branch.id) : undefined} hidePhones={item.id === "kw-r-integrated" || item.id === "kw-n-nasser" || item.id === "kw-n-heba" || item.id === "kw-n-maha"}/> : <View key={branch.id} style={v.card}>
        <Text accessibilityRole="header" style={[v.title,text]}>{tr("الفرع ", "Branch ")}{index+1}</Text>
        {Array.from(new Set(branch.observations.map(o=>o.addressAr).filter((value): value is string => !!value))).map(address=><Text key={address} style={[v.secondary,text]}>{tr("العنوان المسجل: ", "Recorded address: ")}{maarifaBranchText(address, isRTL)}</Text>)}
        {Array.from(new Set(branch.observations.map(o=>o.stagesAr).filter((value): value is string => !!value))).map(stage=><Text key={stage} style={[v.secondary,text]}>{maarifaBranchText(stage, isRTL)}</Text>)}
        {Array.from(new Set(branch.observations.map(o=>o.classroomAr).filter((value): value is string => !!value))).map(value=><Text key={value} style={[v.secondary,text]}>{maarifaBranchText(value, isRTL)}</Text>)}
        {centerWebUrl(branch.publicProfile?.mapUrl, "maps") && <DoctorLink label={tr("فتح الموقع في Google Maps", "Open location in Google Maps")} url={branch.publicProfile!.mapUrl!} icon="location-outline"/>}
        {educationKind ? <EducationPhoneCard contacts={Array.from(new Set(branch.observations.flatMap(o=>o.phones))).map(phone=>({phone}))}/> : Array.from(new Set(branch.observations.flatMap(o=>o.phones))).map(phone=>{const url=institutionPhoneUrl(phone);return url?<DoctorLink key={phone} label={tr("اتصال ","Call ")+phone} url={url}/>:null;})}
      </View>)}
      {hasContact && <><Text accessibilityRole="header" style={[v.title,text]}>{tr("الموقع والتواصل","Location & Contact")}</Text><FatmaClinicContact doctor={contact} mode="contact" kind={nursery ? "nursery" : school ? "school" : "center"} extraPhones={extraPhones} email={email} phoneExtension={profile?.phoneExtension} website={website} additionalUrl={additionalUrl} instagramLabel={profile?.instagramLabel?.[locale]} additionalUrlLabel={profile?.additionalUrlLabel?.[locale]} additionalPhoneLabel={profile?.additionalPhoneLabel?.[locale]} hideCalendar/></>}
      {tab === "overview" && rating && <View style={v.card}>
        <View style={[row,{alignItems:"center",gap:8}]}><View style={s.icon}><Ionicons name="star-outline" size={21} color={colors.primary}/></View><Text accessibilityRole="header" style={[v.title,text]}>{tr("التقييم", "Rating")}</Text></View>
        <Text style={[v.title,text]}>{rating.value} / 5</Text>
        {rating.count !== undefined && <Text style={[v.secondary,text]}>{tr("عدد التقييمات: ", "Reviews: ")}{rating.count}</Text>}
      </View>}
      <View style={v.card}><PersonalAppointment key={item.id} center identity={item.id} name={name} address={contact.clinic?.address} phone={contact.clinic?.phone} mapUrl={contact.clinic?.mapUrl}/></View>
    </View>
  </ScrollView></View>;
}
