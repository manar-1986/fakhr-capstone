import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../ui/AppText';
import { DoctorImage, DoctorLink, specialtyText, v } from './DoctorVisuals';
import InstitutionImage from './InstitutionImage';
import SchoolRecommendationCards from './SchoolRecommendationCards';
import { PUBLIC_DOCTORS } from '../../constants/approvedDoctors';
import { findInstitution, institutionDirectoryCategory, institutionMapUrl } from '../../utils/institutionDirectory';
import { educationProfile } from '../../utils/educationProfile';
import { directoryPhoneUrl } from '../../utils/directoryCall';
import { centerWebUrl } from '../../utils/centerPublicProfile';
import { recommendationName, recommendationCopy } from '../../utils/schoolRecommendationCopy';
import { providerDirectoryVersion } from '../../data/ai/providerDirectoryVersion';
import snapshot from '../../data/ai/providers.snapshot.json';
import { statusColors } from '../../theme/controls';
import { colors } from '../../theme/colors';
import { useI18nLayout } from '../../hooks/useI18nLayout';
import type { DirectoryRecommendation } from '../../types/recommendation';

const reasonLabels:Record<string,[string,string]>={female_availability_unknown:['تأكدوا من توفر أخصائية لدى الجهة','Confirm female-specialist availability'],male_availability_unknown:['تأكدوا من توفر أخصائي لدى الجهة','Confirm male-specialist availability'],provider_service_evidence:['الخدمة موثقة للجهة؛ مؤهلات مقدمها تحتاج تأكيداً','Provider service listing; confirm the treating professional’s qualifications'],clinic_service_only:['خدمة للعيادة، وليست مؤهلاً لصاحب الملف','Clinic service, not the named professional’s qualification'],qualification_unverified:['المؤهل المهني لهذه الخدمة غير موثق','Professional qualification for this service is undocumented'],stage_unknown:['المرحلة التعليمية تحتاج تأكيداً','Educational stage needs confirmation'],age_conflict:['مصادر العمر متعارضة','Age evidence conflicts'],age_unknown:['العمر يحتاج تأكيداً','Age eligibility needs confirmation'],disability_unknown:['دعم الإعاقة يحتاج تأكيداً','Disability support needs confirmation'],services_unknown:['الخدمة تحتاج تأكيداً','Service needs confirmation'],location_unknown:['الموقع يحتاج تأكيداً','Location needs confirmation'],source_unverified:['المعلومات تحتاج تحققاً مستقلاً','Information needs independent verification']};
export default function ProviderRecommendationCards({references,version,language}:{references:DirectoryRecommendation[];version?:string;language?:'ar'|'ar-KW'|'en'}){
 const router=useRouter();const {isRTL}=useI18nLayout();const ar=language?language!=='en':isRTL;
 const text={textAlign:ar?'right' as const:'left' as const,writingDirection:ar?'rtl' as const:'ltr' as const};
 if(references.every(r=>r.category==='school'))return <SchoolRecommendationCards references={references} version={version} language={language}/>;
 if(version!==providerDirectoryVersion)return <Text>{ar?'تم تحديث الدليل؛ يرجى تحديث التطبيق وإعادة البحث.':'Directory version changed; update the app and search again.'}</Text>;
 const seen=new Set<string>();
 return <View style={{gap:12,width:'100%'}}>{references.map(ref=>{
  const trusted=snapshot.records.find(r=>r.id===ref.id&&r.category===ref.category);
  if(!trusted||seen.has(ref.id))return null;seen.add(ref.id);
  const doctor=ref.category==='doctor'?PUBLIC_DOCTORS.find(d=>d.id===ref.id):undefined;
  const institution=ref.category==='doctor'?undefined:findInstitution(ref.id);
  if(!doctor&&(!institution||institutionDirectoryCategory(institution)!==ref.category))return null;
  const name=doctor?(ar?doctor.nameAr:doctor.englishVerified?doctor.nameEn:doctor.nameAr):recommendationName(institution!,ar).name;
  const missing=!ar&&(doctor?!doctor.englishVerified:recommendationName(institution!,ar).missing);
  return <View key={ref.id} style={{gap:12}}>{trusted.branches.filter(b=>ref.branchIds.includes(b.id)).map(b=>{
   const evidence=ref.evidence.filter(e=>e.branchId===b.id && (e.sourceId==='directory-profile'||b.observations.some(o=>o.sourceId===e.sourceId&&o.page===e.page)));
   if(!evidence.length)return null;
   const branch=institution?(institution.branches||[institution]).find(i=>i.id===b.id):undefined;
   const doctorBranch=doctor?.branches?.find(i=>i.id===b.id);
   const p=branch?educationProfile(branch).publicProfile:undefined;
   const info=branch?recommendationCopy(branch,branch.observations,ar):{info:doctor?specialtyText(doctor,ar):'',location:''};
   const nameBranch=doctorBranch?(ar?doctorBranch.nameAr:doctorBranch.nameEn):branch&&branch.id!==institution?.id?recommendationName(branch,ar).name:'';
   const contact=doctor?.clinic||p;
   const shared=institution?.publicProfile;
   const branchLocation=shared?.branchLocations?.find(location=>location.branchId===b.id);
   const phone=directoryPhoneUrl(contact?.phone);
   const sharedPhone=!!phone && (institution?.branches||[]).filter(item=>item.observations.some(o=>o.phones.some(value=>directoryPhoneUrl(value)===phone))).length>1;
   const map=centerWebUrl(doctorBranch?.mapUrl||branchLocation?.mapUrl||contact?.mapUrl,'maps')||(branch?institutionMapUrl(branch):undefined);
   const instagram=centerWebUrl(contact?.instagram||shared?.instagram,'instagram');const website=centerWebUrl(contact?.website||shared?.website);
   const links=[{url:phone,label:sharedPhone?(ar?'اتصال — تأكيد الفرع':'Call — confirm branch'):(ar?'اتصال':'Call'),icon:'call-outline' as const},{url:map,label:ar?'خرائط Google':'Google Maps',icon:'location-outline' as const},{url:instagram,label:ar?'إنستقرام':'Instagram',icon:'logo-instagram' as const},{url:website,label:ar?'الموقع الإلكتروني':'Website',icon:'globe-outline' as const}].filter(l=>!!l.url);
   // Status cannot be upgraded by arbitrary response text or a fabricated reference.
   const verified=b.sourceStatus==='verified'&&ref.verification==='verified'&&evidence.every(e=>e.verification==='verified'&&!e.reasons?.length);
   const reasons=[...new Set(evidence.flatMap(e=>e.reasons||[]))].filter(r=>reasonLabels[r]);
   return <View key={b.id} testID={`provider-card-${b.id}`} style={[v.card,{padding:16,gap:12,width:'100%'}]}>
    <Text accessibilityRole="header" style={[v.title,text]}>{name}</Text>
    {missing&&<Text style={[v.secondary,text]}>Official English name unavailable — original Arabic name shown.</Text>}
    {!!nameBranch&&<Text style={[v.secondary,text]}>{nameBranch}</Text>}
    <View style={{flexDirection:ar?'row-reverse':'row',gap:12,alignItems:'flex-start'}}>
     {doctor?<DoctorImage doctor={doctor} size={82}/>:branch?<InstitutionImage item={{...branch,mainImage:branch.mainImage||institution?.mainImage}} size={82}/>:null}
     <View style={{flex:1,minWidth:0}}>{!!info.location&&<Text style={[v.secondary,text]}>{info.location}</Text>}<Text numberOfLines={3} style={[v.secondary,text]}>{info.info|| (ar?'تفاصيل الخدمة في الملف الأصلي.':'See the original profile for service details.')}</Text></View>
    </View>
    <View style={{backgroundColor:verified?statusColors.suggested.background:statusColors.pending.background,borderRadius:12,padding:10}}><Text style={text}>{verified?(ar?'تطابق خدمة موثق — القبول يحتاج تأكيد الجهة':'Verified service match — confirm admission with provider'):(ar?'للاستفسار فقط — الأهلية تحتاج تأكيداً':'Inquiry only — eligibility needs confirmation')}</Text>{!!reasons.length&&<Text style={[v.secondary,text]}>{reasons.map(r=>reasonLabels[r][ar?0:1]).join(' · ')}</Text>}</View>
    <View style={{flexDirection:ar?'row-reverse':'row',flexWrap:'wrap',gap:8}}>
     <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={()=>router.push({pathname:doctor?'/(tabs)/directory/professional-details':'/(tabs)/directory/institution-details',params:{id:ref.id,origin:'ask-fakhr'}})} style={{backgroundColor:colors.primary,borderRadius:12,padding:12,minHeight:44}}><Text style={{color:"#0B093B"}}>{ar?'عرض التفاصيل':'View Details'}</Text></Pressable>
     {links.map(l=><DoctorLink key={l.icon} url={l.url!} label={l.label} icon={l.icon}/>)}
    </View>
   </View>;
  })}</View>;
 })}</View>;
}
