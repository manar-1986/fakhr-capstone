import React,{useRef,useState} from 'react';
import {Pressable,View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {Text,TextInput} from '../ui/AppText';
import {useI18nLayout} from '../../hooks/useI18nLayout';
import {ApprovedActivity,readApprovedActivities,recordParticipation} from '../../api/dailyCare.api';
export default function ApprovedActivityInteraction({accountId,childId}:{accountId?:string;childId?:string}){
 const {isRTL}=useI18nLayout(),tr=(ar:string,en:string)=>isRTL?ar:en;
 const local=(v:{ar:string;en:string})=>isRTL?v.ar:v.en;
 const [selected,setSelected]=useState(0),[details,setDetails]=useState(false),[notes,setNotes]=useState(''),[confirmed,setConfirmed]=useState(false),[result,setResult]=useState(''),[busy,setBusy]=useState(false);
 const attempt=useRef<{key:string;id:string}|undefined>(undefined),lock=useRef(false);
 const q=useQuery({queryKey:['approved-care-activities',accountId,childId],queryFn:()=>readApprovedActivities(childId!),enabled:!!accountId&&!!childId,retry:false,gcTime:0});
 const a=q.data?.activities[selected],txt={textAlign:isRTL?'right' as const:'left' as const};
 const button=(label:string,fn:()=>void,primary=false)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={fn} style={{minHeight:44,padding:12,borderRadius:13,backgroundColor:primary?'#607DCB':'#EFF3FC',borderWidth:1,borderColor:'#D8E2F5'}}><Text style={{color:primary?'white':'#243A70',textAlign:'center'}}>{label}</Text></Pressable>;
 const line=(value:string)=><Text style={[{fontSize:16,lineHeight:26,color:'#495875'},txt]}>{value}</Text>;
 const record=async(status:'completed'|'skipped'|'declined')=>{
  if(!a||!childId||(status==='completed'&&!confirmed)||lock.current)return;
  lock.current=true;setBusy(true);setResult('');
  const key=JSON.stringify([childId,a.activityId,a.catalogVersion,status,notes]);
  if(attempt.current?.key!==key)attempt.current={key,id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-participation'};
  try{await recordParticipation({childId,requestId:attempt.current.id,templateId:a.templateId,catalogVersion:a.catalogVersion,activityId:a.activityId,status,notes,accessibilityConfirmed:confirmed,safetyConfirmed:confirmed});setResult(tr('تم حفظ المشاركة. لا تعني تحسناً نمائياً.','Participation saved. This does not demonstrate developmental improvement.'))}
  catch{setResult(tr('تعذر التأكد من الحفظ. تحقق قبل إعادة المحاولة.','Save could not be confirmed. Verify before retrying.'))}
  finally{lock.current=false;setBusy(false)}
 };
 return <View style={{backgroundColor:'#FFF',borderRadius:20,borderWidth:1,borderColor:'#DFE6F6',padding:14,gap:12}}>
  <Text accessibilityRole="header" style={[{fontSize:21,fontWeight:'700',color:'#17264B'},txt]}>{tr('نشاط مقترح لطفلك','Suggested Activity for Your Child')}</Text>
  {q.isError?line(tr('تعذر تحميل الأنشطة.','Activities could not be loaded.')):!a?line(tr('لا يوجد محتوى معتمد كامل يطابق العمر والأهداف المختارة حالياً.','No complete approved content currently matches the selected age and goals.')):<>
   <Text style={[{fontSize:17,fontWeight:'600',color:'#17264B'},txt]}>{local(a.title)}</Text>
   {line(local(a.goal))}{line(local(a.description))}{line(local(a.duration))}
   {button(tr('عرض التفاصيل','View Details'),()=>setDetails(!details),true)}
   {button(tr('اختيار نشاط آخر','Choose another activity'),()=>{setSelected((selected+1)%(q.data?.activities.length||1));setDetails(false);setConfirmed(false);setNotes('');setResult('')})}
   {details&&<>{a.steps.map((v,i)=><View key={i}>{line((i+1)+'. '+local(v))}</View>)}{a.adaptations.map((v,i)=><View key={i}>{line(local(v))}</View>)}{line(local(a.safety))}{line(local(a.participationObservation))}
   {button(confirmed?tr('تم تأكيد الملاءمة والسلامة','Suitability and safety confirmed'):tr('أؤكد ملاءمة التعديلات والبيئة ورغبة الطفل','Confirm adaptations, safe setting, and child willingness'),()=>setConfirmed(!confirmed))}
   <TextInput accessibilityLabel={tr('ملاحظات المشاركة','Participation notes')} value={notes} onChangeText={setNotes} maxLength={2000} multiline style={{minHeight:80,borderWidth:1,borderColor:'#D8E2F5',borderRadius:12,padding:12,...txt}}/>
   <View style={{gap:8}}>{confirmed&&button(tr('مكتمل','Completed'),()=>void record('completed'),true)}{button(tr('تخطي','Skip'),()=>void record('skipped'))}{button(tr('رفض','Decline'),()=>void record('declined'))}</View></>}
  </>}
  {!!result&&<Text accessibilityLiveRegion="polite" style={txt}>{result}</Text>}
 </View>;
}
