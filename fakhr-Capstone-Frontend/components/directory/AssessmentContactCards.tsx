import React, {useState} from 'react';
import {View, Pressable, Linking, StyleSheet} from 'react-native';
import {Text} from '../ui/AppText';
import {typography} from '../../theme/typography';
import type {AssessmentPresentation} from '../../types/assessment';
export default function AssessmentContactCards({data,language}:{data:AssessmentPresentation;language?:string}) {
 const ar=language!=='en';const tr=(a:string,e:string)=>ar?a:e;
 const [expanded,setExpanded]=useState<string[]>([]);
 const text={textAlign:ar?'right' as const:'left' as const,writingDirection:ar?'rtl' as const:'ltr' as const};
 const status=(s:string)=>s==='unverified'?tr('يحتاج إلى تأكيد','Requires confirmation'):tr('حالة غير معروفة','Unknown status');
 const source=(url:string,key:string)=> /^https:\/\//.test(url)?<Pressable key={key} accessibilityRole="link" accessibilityLabel={tr('المصدر الرسمي','Official source')} onPress={()=>void Linking.openURL(url)} style={s.action}><Text style={[s.link,text]}>{tr('المصدر الرسمي ↗','Official source ↗')}</Text></Pressable>:null;
 return <View testID="assessment-contacts" style={s.list}>
  <Text testID="assessment-verification-notice" style={[s.notice,text]}>{data.verificationNotice}</Text>
  {data.organizations.map(o=>{
   const open=expanded.includes(o.id);const general=o.contactEvidence.status==='verified-general-contact';const hospital=o.contactEvidence.status==='verified-hospital-contact';
   return <View key={o.id} testID={'assessment-card-'+o.id} style={s.card}>
    <Text accessibilityRole="header" style={[s.name,text]}>{o.name[ar?'ar':'en']}</Text>
    <View style={[s.phoneRow,{flexDirection:ar?'row-reverse':'row'}]}>
     <Text style={s.phone}>{o.candidatePhone||tr('لم يُزود رقم محدد','No specific number supplied')}</Text>
     {!!o.candidatePhone&&/^\d+$/.test(o.candidatePhone)&&<Pressable testID={'assessment-call-'+o.id} accessibilityRole="link" accessibilityLabel={tr('اتصال','Call')+' '+o.candidatePhone} style={s.action} onPress={()=>void Linking.openURL('tel:'+o.candidatePhone)}><Text style={s.link}>{tr('اتصال','Call')}</Text></Pressable>}
    </View>
    <Text style={[s.meta,text]}>{!o.candidatePhone?tr('جهة عامة للاستفسار','General inquiry candidate'):general?tr('رقم عام موثق للهيئة','Verified general authority number'):hospital?tr('رقم مستشفى موثق','Verified hospital number'):tr('رقم غير متحقق منه بصورة مستقلة','Number not independently verified')}</Text>
    <Pressable testID={'assessment-toggle-'+o.id} accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setExpanded(old=>open?old.filter(id=>id!==o.id):[...old,o.id])} style={s.action}><Text style={[s.link,text]}>{tr('تفاصيل التحقق','Verification details')} {open?'−':'+'}</Text></Pressable>
    {open&&<View testID={'assessment-verification-'+o.id} style={s.details}>
     <Text style={[s.meta,text]}>{general?tr('التوثيق للرقم العام فقط، وليس لرقم وحدة الاختبارات.','Verification covers the general number only, not the testing unit.'):hospital?tr('الدليل الحكومي يسجل مستشفى الطب النفسي؛ هوية القسم المذكور وخدماته غير مثبتة.','The government directory lists Psychiatric Hospital; the supplied department identity and its services are not established.'):tr('لم يُعثر على تأكيد رسمي في المراجعة الحالية.','No authoritative confirmation was found in the current review.')}</Text>
     {[[tr('القسم','Department'),o.departmentStatus],[tr('توفر التقييم','Assessment availability'),o.serviceStatus],[tr('متطلبات الإحالة','Referral requirements'),o.referralStatus],[tr('قبول التقرير رسمياً','Official report acceptance'),o.acceptanceStatus]].map(([label,value])=><Text key={label} style={[s.meta,text]}>{label}: {status(value)}</Text>)}
     {!!o.contactEvidence.source&&source(o.contactEvidence.source,o.id)}
    </View>}
   </View>;
  })}
  <View style={s.details}><Text style={[s.meta,text]}>{tr('مصادر الإجابة','Answer sources')}</Text>{[...new Set(data.sources)].map(url=>source(url,url))}</View>
 </View>;
}
const s=StyleSheet.create({list:{gap:10,width:'100%'},card:{padding:14,gap:6,borderWidth:1,borderColor:'#E5E9F8',borderRadius:18,backgroundColor:'#EBF1FD'},name:{fontSize:15,lineHeight:23,fontWeight:typography.weightMedium,color:'#0B093B'},phoneRow:{alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},phone:{fontSize:16,lineHeight:24,color:'#0B093B',writingDirection:'ltr'},action:{minHeight:44,justifyContent:'center',paddingHorizontal:8},link:{fontSize:14,lineHeight:22,color:"#0B093B"},meta:{fontSize:13,lineHeight:21,color:'#5E6486'},notice:{fontSize:13,lineHeight:22,color:'#5E6486',padding:10},details:{gap:5,paddingTop:6}});

