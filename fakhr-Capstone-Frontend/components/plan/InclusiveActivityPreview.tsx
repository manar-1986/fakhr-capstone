import React, {useState} from 'react';
import {dailyCareEnabled} from '../../api/dailyCare.api';
import ApprovedActivityInteraction from './ApprovedActivityInteraction';
import {View, Pressable, Modal, ScrollView, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Text, TextInput} from '../ui/AppText';
import {useI18nLayout} from '../../hooks/useI18nLayout';
import {localCarePreview} from './DailyCarePreview';
import {draftCatalog as catalog, eligibleDraftActivities, initialSyntheticProfile, SyntheticActivityProfile, DraftActivity} from '../../utils/inclusivePlanPreview';

const familyIcons:Record<string,React.ComponentProps<typeof Ionicons>['name']>={communication:'chatbubbles-outline',routines:'clipboard-outline',sensory:'hand-left-outline',social:'people-outline',movement:'walk-outline'};
const accessLabels:Record<string,[string,string]>={speech:['الكلام','Speech'],aac:['التواصل البديل','AAC'],hearing:['السمع','Hearing'],vision:['البصر','Vision'],sensory:['حسي','Sensory'],cognitive:['الفهم','Cognitive'],mobility:['الحركة','Mobility']};
const shades:Record<string,string>={communication:'#EDF3FF',routines:'#EDF7F1',sensory:'#F3EEFC',social:'#FFF0F5',movement:'#FFF5E8'};
type Action = {status:'participated'|'completed'|'skipped'|'declined';note:string};
export default function InclusiveActivityPreview({accountId,childId}:{accountId?:string;childId?:string}){
 if(dailyCareEnabled())return <ApprovedActivityInteraction key={JSON.stringify([accountId,childId])} accountId={accountId} childId={childId}/>;
 // Gate the entire interactive subtree. Remount on account/child change to erase notes.
 if(!__DEV__ || !localCarePreview())return null;
 return <ActivitySession key={JSON.stringify([accountId??'guest',childId??'none'])}/>;
}
function ActivitySession(){
 const {isRTL,align,dir,tabRow}=useI18nLayout();
 const tr=(ar:string,en:string)=>isRTL?ar:en;
 const local=(x:{ar:string;en:string})=>isRTL?x.ar:x.en;
 const txt={textAlign:align,writingDirection:dir};
 const row={flexDirection:tabRow};
 const [profile,setProfile]=useState<SyntheticActivityProfile>({...initialSyntheticProfile});
 const [settings,setSettings]=useState(false),[browse,setBrowse]=useState(false);
 const [selected,setSelected]=useState<string>();
 const [details,setDetails]=useState<DraftActivity>();
 const [notes,setNotes]=useState<Record<string,string>>({});
 const [actions,setActions]=useState<Record<string,Action>>({});
 const matches=eligibleDraftActivities(profile);
 const suggestion=matches.find(a=>a.id===selected)??matches[0];
 const noteKey=(id:string)=>profile.age+':'+id;
 const update=(patch:Partial<SyntheticActivityProfile>)=>{setProfile(p=>({...p,...patch}));setSelected(undefined);setDetails(undefined);};
 const toggle=(key:'goalIds'|'preferredIds'|'accessIds',id:string)=>{
  update({[key]:profile[key].includes(id)?profile[key].filter(x=>x!==id):[...profile[key],id],...(key==='accessIds'?{accessConfirmed:false}:{})});
 };
 const button=(label:string,onPress:()=>void,primary=false,checked?:boolean)=><Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={checked===undefined?{}:{selected:checked}} onPress={onPress} style={[s.button,(primary||checked)&&s.primary]}><Text style={[s.buttonText,(primary||checked)&&s.white]}>{label}</Text></Pressable>;
 const line=(text:string)=> <Text style={[s.body,txt]}>{text}</Text>;
 const section=(title:string,body:React.ReactNode)=><View style={s.section}><Text accessibilityRole="header" style={[s.title,txt]}>{title}</Text>{body}</View>;
 const record=(status:Action['status'])=>{if(details){const key=noteKey(details.id);setActions(a=>({...a,[key]:{status,note:notes[key]||''}}));}};
 const statusLabels:Record<Action['status'],[string,string]>={participated:['تم تسجيل المشاركة تجريبيًا','Participation recorded — demo'],completed:['تم تسجيل الاكتمال تجريبيًا','Completion recorded — demo'],skipped:['تم تسجيل التخطي تجريبيًا','Skip recorded — demo'],declined:['تم تسجيل الرفض تجريبيًا','Decline recorded — demo']};
 const card=(a:DraftActivity)=><View key={a.id} style={s.card}>
  <View style={[s.row,row]}><View style={[s.icon,{backgroundColor:shades[a.familyId]}]}><Ionicons name={familyIcons[a.familyId]} size={24} color="#607DCB"/></View><Text style={s.badge}>{tr('مسودة للمراجعة','Draft for Review')}</Text></View>
  <Text style={[s.title,txt]}>{local(a.title)}</Text>
  <Text numberOfLines={1} accessibilityLabel={local(a.goal)} style={[s.body,txt]}>{local(a.goal)}</Text>
  <Text numberOfLines={2} accessibilityLabel={local(catalog.timingPolicy.duration)} style={[s.caption,txt]}>{local(catalog.timingPolicy.duration)}</Text>
  <View style={[s.row,row]}>{a.accessibilityOptionRefs.map(id=><Text key={id} style={s.tag}>{tr(...accessLabels[id])}</Text>)}</View>
  {button(tr('عرض التفاصيل','View Details'),()=>setDetails(a),true)}
  {browse&&button(selected===a.id?tr('مختار في المعاينة','Selected in preview'):tr('اختيار هذا النشاط','Choose this activity'),()=>{setSelected(a.id);setBrowse(false);})}
 </View>;
 return <View testID="inclusive-activity-preview" style={s.outer}>
  <Text accessibilityRole="header" style={[s.heading,txt]}>{tr('نشاط مقترح لطفلك','Suggested Activity for Your Child')}</Text>
  <Text style={[s.caption,txt]}>{tr('ملف اصطناعي فقط — لا يستخدم بيانات الطفل الحقيقي. جميع الأنشطة مسودات، والملاحظات في الذاكرة فقط وتُمسح عند تغيير الحساب أو الطفل أو إعادة التحميل.','Synthetic profile only — no real child data used. All activities are drafts; notes remain in memory and clear on account/child change or reload.')}</Text>
  <View style={[s.row,row]}>{button(tr('تخصيص الملف التجريبي','Customize synthetic profile'),()=>setSettings(!settings))}{button(tr('تصفح البدائل','Browse alternatives'),()=>setBrowse(!browse))}</View>
  {settings&&<View style={s.settings}>
   {section(tr('عمر الملف الاصطناعي','Synthetic profile age'),<View style={[s.row,row]}>{[[5,'3–5'],[7,'6–9'],[11,'10–13'],[15,'14–17']].map(([n,label])=><React.Fragment key={n}>{button(String(label),()=>update({age:Number(n)}),false,profile.age===n)}</React.Fragment>)}</View>)}
   {section(tr('الأهداف المختارة','Parent-selected goals'),<View style={[s.row,row]}>{catalog.groups.map(g=><React.Fragment key={g.id}>{button(local(g.title),()=>toggle('goalIds',g.id),false,profile.goalIds.includes(g.id))}</React.Fragment>)}</View>)}
   {section(tr('نقاط القوة وطريقة المشاركة','Strengths and participation'),<View style={[s.row,row]}>{button(tr('يشارك بالفعل مباشرة','Participates directly'),()=>update({participation:'direct'}),false,profile.participation==='direct')}{button(tr('يختار ويوجّه شريكًا','Chooses and directs a partner'),()=>update({participation:'partner'}),false,profile.participation==='partner')}{button(tr('غير معروف بعد','Not known yet'),()=>update({participation:'unknown'}),false,profile.participation==='unknown')}</View>)}
   {section(tr('وسيلة التواصل المعتادة','Established communication method'),<View style={[s.row,row]}>{[['speech','الكلام','Speech'],['aac','التواصل البديل','AAC'],['sign','لغة إشارة مألوفة','Known sign language'],['gesture','إشارة أو نظر معتاد','Established gesture or gaze'],['writing','الكتابة','Writing'],['','غير معروف','Unknown']].map(([id,ar,en])=><React.Fragment key={id}>{button(tr(ar,en),()=>update({communication:id}),false,profile.communication===id)}</React.Fragment>)}</View>)}
   {section(tr('تفضيلات الأنشطة — لترتيب الاقتراحات','Activity preferences — rank suggestions'),<View style={[s.row,row]}>{catalog.variants.filter(a=>profile.age>=a.ageYears[0]&&profile.age<=a.ageYears[1]).map(a=><React.Fragment key={a.id}>{button(local(a.title),()=>toggle('preferredIds',a.sourceActivityId),false,profile.preferredIds.includes(a.sourceActivityId))}</React.Fragment>)}</View>)}
   {section(tr('احتياجات الوصول','Accessibility needs'),<><View style={[s.row,row]}>{catalog.accessibilityOptions.map(a=><React.Fragment key={a.id}>{button(tr(...accessLabels[a.id]),()=>toggle('accessIds',a.id),false,profile.accessIds.includes(a.id))}</React.Fragment>)}</View>{profile.accessIds.map(id=><View key={id} style={s.section}>{line(local(catalog.accessibilityOptions.find(a=>a.id===id)!.content))}</View>)}
   {line(tr('تأكيد تجريبي فقط: الخيارات مألوفة ومتوافقة معًا. لا يثبت ملاءمة سريرية؛ عند عدم المعرفة لا يُقترح نشاط.','Demo confirmation only: options are established and compatible together. This does not establish clinical suitability; unknown prerequisites block suggestions.'))}
   {button(tr('خيارات الوصول متوافقة — تجريبي','Access options compatible — demo'),()=>update({accessConfirmed:!profile.accessConfirmed}),false,profile.accessConfirmed)}</>)}
   {section(tr('متطلبات السلامة والمشاركة — تجريبية','Safety and participation prerequisites — demo'),<View style={[s.row,row]}>{button(tr('راغب في المشاركة','Willing to participate'),()=>update({willing:!profile.willing}),false,profile.willing)}{button(tr('الأدوات والبيئة آمنة','Materials and setting safe'),()=>update({safeMaterials:!profile.safeMaterials}),false,profile.safeMaterials)}{button(tr('وسيلة طلب التوقف متاحة','Established stop method available'),()=>update({establishedStopMethod:!profile.establishedStopMethod}),false,profile.establishedStopMethod)}</View>)}
  </View>}
  {!matches.length?line(profile.age===5?tr('محتوى الأعمار 3–5 الأصلي الكامل غير متاح. لم تُنشأ بدائل أو حقول مفقودة.','Complete original ages 3–5 content is unavailable. No replacement activities or missing fields have been fabricated.'):tr('لا توجد مسودة مناسبة للاختيارات الحالية أو لم تتأكد متطلبات الوصول والسلامة. عدّل الملف التجريبي أو تخطَّ الاقتراح.','No draft fits these selections, or safety/access prerequisites remain unconfirmed. Adjust the synthetic profile or skip the suggestion.')):browse?<View style={s.list}>{matches.map(card)}</View>:suggestion?card(suggestion):null}
  <Text style={[s.caption,txt]}>{local(catalog.tracking.rule)}</Text>
  <Modal visible={!!details} animationType="slide" onRequestClose={()=>setDetails(undefined)}>
   <View style={s.modal}><View style={s.modalHeader}>{button(tr('إغلاق التفاصيل','Close details'),()=>setDetails(undefined))}</View><ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">
    {details&&<>
     <Text style={s.badge}>{tr('مسودة للمراجعة','Draft for Review')}</Text>
     <Text accessibilityRole="header" style={[s.heading,txt]}>{local(details.title)}</Text>
     {section(tr('الهدف التعليمي','Educational goal'),line(local(details.goal)))}
     {section(tr('فكرة النشاط','About this activity'),line(local(details.description)))}
     {section(tr('خطوات الوالدين','Parent instructions'),<>{details.steps.map((step,i)=><Text key={i} style={[s.body,txt]}>{i+1}. {local(step)}</Text>)}</>)}
     {section(tr('الأدوات','Materials'),line(local(details.materials)))}
     {section(tr('مدة وتكرار مرنان','Flexible duration and frequency'),<>{line(local(catalog.timingPolicy.duration))}{line(local(catalog.timingPolicy.frequency))}</>)}
     {section(tr('خيارات الوصول — مسودات للمراجعة','Accessibility options — drafts for review'),<>{details.accessibilityOptionRefs.map(id=><View key={id} style={s.adaptation}><Text style={[s.title,txt]}>{tr(...accessLabels[id])}</Text>{line(local(catalog.accessibilityOptions.find(a=>a.id===id)!.content))}</View>)}</>)}
     {section(tr('إرشادات السلامة','Safety guidance'),line(local(details.safety)))}
     {section(tr('ملاحظات المشاركة','Participation observations'),<>{line(local(details.participationObservation))}{line(local(catalog.tracking.rule))}</>)}
     {line(tr('ملاحظات اصطناعية فقط — لا تدخل معلومات شخصية أو طبية. لا يتم الحفظ في قاعدة بيانات.','Synthetic notes only — do not enter personal or medical information. Nothing is saved to a database.'))}
     <TextInput accessibilityLabel={tr('ملاحظات مشاركة تجريبية','Synthetic participation notes')} multiline maxLength={500} style={[s.input,txt]} value={notes[noteKey(details.id)]||''} onChangeText={value=>setNotes(n=>({...n,[noteKey(details.id)]:value}))}/>
     <View style={[s.row,row]}>{button(tr('تسجيل المشاركة — تجريبي','Record participation — demo'),()=>record('participated'),true)}{button(tr('مكتمل — تجريبي','Completed — demo'),()=>record('completed'),true)}{button(tr('تخطي — تجريبي','Skip — demo'),()=>record('skipped'))}{button(tr('رفض — تجريبي','Decline — demo'),()=>record('declined'))}</View>
     {!!actions[noteKey(details.id)]&&<Text accessibilityLiveRegion="polite" style={[s.body,txt]}>{tr(...statusLabels[actions[noteKey(details.id)].status])}</Text>}
     {button(tr('اختيار هذا النشاط','Choose this activity'),()=>{setSelected(details.id);setBrowse(false);setDetails(undefined);},true)}
    </>}
   </ScrollView></View>
  </Modal>
 </View>;
}
const s=StyleSheet.create({
 outer:{backgroundColor:'#FFF',borderRadius:20,borderWidth:1,borderColor:'#DFE6F6',padding:14,gap:12},
 heading:{fontSize:21,fontWeight:'700',color:'#17264B'},title:{fontSize:17,fontWeight:'600',color:'#17264B'},body:{fontSize:16,lineHeight:26,color:'#495875'},caption:{fontSize:13,lineHeight:21,color:'#596782'},
 row:{gap:8,flexWrap:'wrap',alignItems:'center'},button:{paddingVertical:10,paddingHorizontal:14,minHeight:44,borderWidth:1,borderColor:'#D8E2F5',borderRadius:13,backgroundColor:'#EFF3FC',alignItems:'center'},primary:{backgroundColor:'#607DCB',borderColor:'#607DCB'},buttonText:{fontSize:15,color:'#243A70',textAlign:'center'},white:{color:'#FFF'},settings:{padding:10,backgroundColor:'#F6F8FD',borderRadius:16,gap:12},section:{gap:8,paddingVertical:12},card:{padding:16,borderRadius:18,borderWidth:1,borderColor:'#E1E7F4',backgroundColor:'#FFF',gap:10},icon:{padding:10,borderRadius:14},badge:{fontSize:12,color:'#79591C',backgroundColor:'#FFF3DD',borderRadius:12,padding:6,alignSelf:'flex-start'},tag:{fontSize:11,color:'#445C8D',backgroundColor:'#EEF3FF',borderRadius:8,padding:6},list:{gap:12},modal:{flex:1,backgroundColor:'#FFF'},modalHeader:{padding:16,paddingTop:32},modalBody:{padding:20,paddingBottom:70,gap:12,maxWidth:800,width:'100%',alignSelf:'center'},adaptation:{backgroundColor:'#F3F6FC',padding:12,borderRadius:12,gap:6},input:{borderColor:'#D8E2F5',borderWidth:1,borderRadius:12,padding:12,minHeight:90,fontSize:16,color:'#17264B',textAlignVertical:'top'},
});

