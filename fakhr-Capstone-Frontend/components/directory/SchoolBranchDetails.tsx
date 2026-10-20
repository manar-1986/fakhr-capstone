import EducationPhoneCard from "./EducationPhoneCard";
import React from "react";
import {View} from "react-native";
import {Text} from "../ui/AppText";
import type {Institution} from "../../types/institution";
import {useI18nLayout} from "../../hooks/useI18nLayout";
import {educationProfile} from "../../utils/educationProfile";
import {institutionMapUrl,institutionPhoneUrl} from "../../utils/institutionDirectory";
import {centerWebUrl,centerWhatsApp} from "../../utils/centerPublicProfile";
import {DoctorLink,v} from "./DoctorVisuals";
import InstitutionImage from "./InstitutionImage";
export default function SchoolBranchDetails({branch,hidePhones=false,location}:{branch:Institution;hidePhones?:boolean;location?:NonNullable<NonNullable<Institution["publicProfile"]>["branchLocations"]>[number]}){
 const {isRTL,align,dir}=useI18nLayout();const locale=isRTL?"ar":"en";const tr=(ar:string,en:string)=>isRTL?ar:en;
 const profile=educationProfile(branch).publicProfile;const text={textAlign:align,writingDirection:dir};
 const phones=[...new Set([...(branch.id === "kw-n-insan-1" ? ["65779046"] : []),profile?.phone,branch.publicContact?.phone,profile?.additionalPhone,...(profile?.extraPhones||[]).map(p=>p.phone),...branch.observations.flatMap(o=>o.phones)].filter((p):p is string=>!!p))];
 const maps=[...new Set([profile?.mapUrl,branch.publicContact?.mapUrl,institutionMapUrl(branch)].map(url=>centerWebUrl(url,"maps")).filter((url):url is string=>!!url))];
 const whatsapp=centerWhatsApp(profile?.whatsapp);const instagram=centerWebUrl(profile?.instagram,"instagram");const website=centerWebUrl(profile?.website);
 return <View style={v.card}>
  <Text accessibilityRole="header" style={[v.title,text]}>{location ? location.name[locale] : branch.id.startsWith("kw-n-insan") ? tr(branch.id === "kw-n-insan-1" ? "الفنطاس" : "صباح الأحمد",branch.id === "kw-n-insan-1" ? "Fintas" : "Sabah Al Ahmad") : branch.id.startsWith("kw-n-heba") ? tr(branch.nameAr,branch.id === "kw-n-heba" ? "Abdullah Al Mubarak" : "Andalus") : branch.id.startsWith("kw-n-nasser") ? tr(branch.nameAr, branch.id === "kw-n-nasser" ? "Bait Nasser Nursery – Al Naseem" : branch.id === "kw-n-nasser-2" ? "Bait Nasser Nursery 2 – Jaber Al Ahmad" : "Bait Nasser Nursery 3 – West Abdullah Al Mubarak") : branch.id === "kw-r-integrated" ? tr("فرع غرناطة","Granada branch") : branch.id === "kw-r-integrated-2" ? tr("فرع المهبولة","Mahboula branch") : branch.id.endsWith("boys")?tr("قسم البنين","Boys’ Branch"):tr("قسم البنات","Girls’ Branch")}</Text>
  {location && <View testID={"branch-location-"+branch.id} style={{gap:8}}>
   {location.address && <Text style={[v.secondary,text]}>{location.address[locale]}</Text>}
   {location.verificationNote && <Text style={[v.secondary,text]}>{location.verificationNote[locale]}</Text>}
   {location.whatsapp && <DoctorLink url={location.whatsapp.url} label={tr("تواصل عبر الواتساب","Contact via WhatsApp")} icon="logo-whatsapp"/>}
   <Text style={[v.secondary,text]}>{tr("بيانات المصدر المحفوظة:","Preserved source details:")}</Text>
   {[...new Set(branch.observations.map(o=>o.capacityAr).filter(Boolean))].map(capacity=><Text key={capacity} style={[v.secondary,text]}>{tr("السعة المسجلة: ","Recorded capacity: ")}{capacity}</Text>)}
  </View>}
  {!!branch.mainImage&&<InstitutionImage item={branch} size={96}/>}
  {profile?.description&&<Text style={[v.secondary,text]}>{profile.description[locale]}</Text>}
  {profile?.address&&<Text style={[v.secondary,text]}>{profile.address[locale]}</Text>}
  {profile?.services?.[locale].map(value=><Text key={value} style={[v.secondary,text]}>{value}</Text>)}
  {profile?.supportedConditions?.[locale].map(value=><Text key={value} style={[v.secondary,text]}>{value}</Text>)}
  {profile?.ages&&<Text style={[v.secondary,text]}>{profile.ages[locale]}</Text>}
  {branch.id.startsWith("kw-n-nasser") && <>
   {branch.reviewNotesAr.map(note=><Text key={note} style={[v.secondary,text]}>{tr(note,"The source addresses and phone numbers differ; a move or unconfirmed branch may explain this. Verification is needed.")}</Text>)}
   {[...new Set(branch.observations.map(o=>o.capacityAr).filter(Boolean))].map(capacity=><Text key={capacity} style={[v.secondary,text]}>{tr("السعة المسجلة: ","Recorded capacity: ")}{capacity}</Text>)}
  </>}
  {branch.id.startsWith("kw-n-heba") && <>
   {branch.reviewNotesAr.map(note=><Text key={note} style={[v.secondary,text]}>{tr(note,"Source address conflict: plot 22 in the directory; plot 409 / blue sign 3 in the 2023 list. Verification is needed.")}</Text>)}
   {[...new Set(branch.observations.map(o=>o.capacityAr).filter(Boolean))].map(capacity=><Text key={capacity} style={[v.secondary,text]}>{tr("السعة المسجلة: ","Recorded capacity: ")}{capacity}</Text>)}
   {!!branch.sourceExtras?.email && <DoctorLink url={"mailto:"+branch.sourceExtras.email} label={tr("البريد الإلكتروني: ","Email: ")+branch.sourceExtras.email} icon="mail-outline"/>}
  </>}
  {branch.id.startsWith("kw-n-insan") && <>
   <Text style={[v.secondary,text]}>{tr("الأرقام محفوظة حسب سجل كل فرع. المصدر يضع 60041147 و60031132 و65502770 في خلية مشتركة للفرعين؛ تعيينها للفرع يحتاج إلى تأكيد. المرجع المقدم يربط أول رقمين بصباح الأحمد و65502770 بالفنطاس.","Numbers are preserved under their source branch. The catalog shares 60041147, 60031132 and 65502770 across both branches; their branch assignment needs confirmation. The supplied reference associates the first two with Sabah Al Ahmad and 65502770 with Fintas.")}</Text>
   {branch.id === "kw-n-insan-1" && <><Text style={[v.secondary,text]}>{tr("65779046 و65502770 و52226632 مؤكدة لفرع الفنطاس في الموقع الرسمي. 23908080 و99721356 محفوظة من مصدر 2023؛ حداثتها غير مؤكدة.","65779046, 65502770 and 52226632 are confirmed for Fintas on the official website. 23908080 and 99721356 are retained from the 2023 source; current status is unconfirmed.")}</Text><DoctorLink url="https://nwafithgroup.com/ar/insan-first" label={tr("مصدر أرقام الفنطاس","Fintas phone source")} icon="globe-outline"/></>}
   {[...new Set(branch.observations.map(o=>o.capacityAr).filter(Boolean))].map(capacity=><Text key={capacity} style={[v.secondary,text]}>{tr("السعة المسجلة: ","Recorded capacity: ")}{capacity}</Text>)}
  </>}
  {!hidePhones && <EducationPhoneCard contacts={phones.map(phone=>({phone}))}/>}
  {maps.map(url=><DoctorLink key={url} url={url} label={tr("فتح الموقع في Google Maps","Open in Google Maps")} icon="location-outline"/>)}
  {whatsapp&&<DoctorLink url={whatsapp.url} label={tr("واتساب","WhatsApp")} icon="logo-whatsapp"/>}
  {instagram&&<DoctorLink url={instagram} label={tr("إنستقرام","Instagram")} icon="logo-instagram"/>}
  {website&&<DoctorLink url={website} label={tr("الموقع الإلكتروني","Website")} icon="globe-outline"/>}
 </View>;
}
