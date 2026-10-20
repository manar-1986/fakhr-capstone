import React,{useState} from 'react';
import {View,Pressable,Linking,StyleSheet} from 'react-native';
import {Text} from '../ui/AppText';
import {AwarenessEvidence} from '../../types/awareness';

// Editorial descriptions, not official Arabic publication titles. Match the
// complete known title so an unfamiliar source always retains its original name.
const arabicDescriptions:Record<string,string>={
 'NHS Humber — hair care':'العناية بالشعر',
 'NHS Devon — hair washing':'غسل الشعر',
 'NHS Oxford — hair washing, cutting and brushing':'غسل الشعر وقصّه وتمشيطه',
 'NHS Humber — nail cutting':'قص الأظافر',
 'NHS Humber — brushing teeth':'تنظيف الأسنان بالفرشاة',
 'NHS Humber — dressing':'ارتداء الملابس',
 'NHS — contact dermatitis':'التهاب الجلد التماسي',
 'NHS — toothache':'ألم الأسنان',
 'NHS — eye pain':'ألم العين',
 'NHS — noise sensitivity':'الحساسية للأصوات',
 'NHS Cambridgeshire — communication':'التواصل',
 'NHS Lancashire and South Cumbria — sensory processing needs':'احتياجات معالجة المعلومات الحسية',
 'NHS Devon — support with behaviour':'دعم التعامل مع السلوك',
 'Somerset NHS — letter and number reversals':'عكس اتجاه الحروف والأرقام',
 'Gateshead NHS — idiopathic toe walking':'المشي على أطراف الأصابع دون سبب معروف',
 'NHS — epilepsy and seizure symptoms':'الصرع وأعراض النوبات',
 'NHS — head injury and concussion':'إصابات الرأس والارتجاج',
 'NHS Autism Central — sensory differences':'الاختلافات الحسية',
 'NHS — supporting an autistic child':'دعم الطفل ذي التوحد',
 'NHS — signs of autism in children':'علامات التوحد لدى الأطفال',
 'NIDCD — speech and language development':'تطور النطق واللغة',
 'CDC — ADHD symptoms':'أعراض اضطراب فرط الحركة وتشتت الانتباه',
 'NHS — dyslexia in children':'عسر القراءة لدى الأطفال',
 'CDC — cerebral palsy':'الشلل الدماغي',
 'NHS — supporting children with Down syndrome':'دعم الأطفال والشباب ذوي متلازمة داون',
 'NHS — learning disabilities (intellectual disability terminology)':'الإعاقة الذهنية وفق المصطلح البريطاني المستخدم في المصدر',
 'WHO — deafness and hearing loss':'الصمم وفقدان السمع',
 'WHO — vision impairment':'ضعف البصر',
 'CDC — Learn the Signs. Act Early.':'التعرف على علامات النمو والتدخل المبكر',
 'Kingston and Richmond NHS — selective eating':'الانتقائية في الأكل',
 'NHS — sleep and young children':'النوم لدى الأطفال الصغار',
 'NHS — urgent help for young children':'طلب المساعدة الطبية العاجلة للأطفال الصغار',
};
export function educationalSourceLabel(title:string,language?:string){
 const description=language!=='en'?arabicDescriptions[title]:undefined;
 return description?`${title.split(' — ')[0]} — ${description}`:title;
}

export function withoutExactSourceFooter(answer:string,data:AwarenessEvidence):string {
 const titles=data.sources.map(s=>s.title+': '+s.url).join('\n');
 const headings=['Educational sources — source-checked summaries, not clinically reviewed or an individual assessment:','مصادر توعوية — ملخصات راجعنا مصادرها، ولم تخضع لمراجعة سريرية وليست تقييماً فردياً:'];
 const paragraphs=answer.split(/\n\s*\n/);
 const matches=(p:string)=>headings.some(h=>p===h+'\n'+titles);
 return paragraphs.some(matches)?paragraphs.filter(p=>!matches(p)).join('\n\n'):answer;
}
export default function EducationalSources({data,language}:{data:AwarenessEvidence;language?:string}){
 const ar=language!=='en',tr=(a:string,e:string)=>ar?a:e;
 const [open,setOpen]=useState(false);
 const direction={textAlign:ar?'right' as const:'left' as const,writingDirection:ar?'rtl' as const:'ltr' as const};
 const checked=data.sources.every(s=>s.verification.status==='source-checked');
 return <View testID="educational-sources" style={styles.box}>
  <Text accessibilityRole="header" style={[styles.heading,direction]}>{tr('المصادر التوعوية','Educational Sources')}</Text>
  <Text style={[styles.meta,direction]}>{checked?tr('ملخصات توعوية روجعت مصادرها؛ لم تخضع لمراجعة سريرية وليست تقييماً فردياً.','Source-checked educational summaries; not clinically reviewed or an individual assessment.'):tr('مصادر توعوية تتضمن مواد لم يكتمل التحقق منها؛ لم تخضع لمراجعة سريرية.','Educational sources include material awaiting verification; not clinically reviewed.')}</Text>
  {data.sources.map(s=><Pressable key={s.id} accessibilityRole="link" accessibilityLabel={educationalSourceLabel(s.title,language)} onPress={()=>void Linking.openURL(s.url)} style={styles.action}><Text style={[styles.link,direction]}>{educationalSourceLabel(s.title,language)} ↗</Text></Pressable>)}
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} style={styles.action}><Text style={[styles.link,direction]}>{tr('تفاصيل التحقق','Verification details')} {open?'−':'+'}</Text></Pressable>
  {open&&<View testID="educational-source-details" style={{gap:8}}>{data.sources.map(s=><View key={s.id} style={{gap:3}}>
   {ar&&arabicDescriptions[s.title]&&<Text style={[styles.meta,direction]}>الوصف العربي للتوضيح، وليس عنواناً رسمياً مترجماً.</Text>}
   <Text style={[styles.meta,direction]}>{s.title}</Text>
   <Text style={[styles.meta,direction]}>{tr('الحالة','Status')}: {s.verification.status==='source-checked'?tr('تمت مراجعة المصدر','Source checked'):s.verification.status==='verification-pending'?tr('التحقق قيد الانتظار','Verification pending'):s.verification.status}</Text>
   <Text style={[styles.meta,direction]}>{tr('تاريخ التحقق','Checked')}: {s.verification.checkedAt||tr('غير متوفر','Not available')}</Text>
   <Text style={[styles.meta,direction]}>{tr('المراجعة السريرية','Clinical review')}: {s.verification.clinicalReview==='not-clinically-reviewed'?tr('لم تتم مراجعة سريرية','Not clinically reviewed'):s.verification.clinicalReview}</Text>
   {/review date has passed/i.test(s.verification.note)&&<Text style={[styles.meta,direction]}>{tr('تجاوز المصدر موعد المراجعة؛ يحتاج إعادة تحقق قبل الإصدار.','Source review is overdue; recheck before release.')}</Text>}
   {!!s.verification.note&&<Text style={[styles.meta,direction]}>{s.verification.note}</Text>}
  </View>)}</View>}
 </View>;
}
const styles=StyleSheet.create({box:{gap:4,padding:12,borderRadius:18,backgroundColor:'#EBF1FD',borderColor:'#E5E9F8',borderWidth:1,width:'100%'},heading:{fontSize:14,lineHeight:22,color:'#0B093B'},meta:{fontSize:12,lineHeight:20,color:'#5E6486'},action:{minHeight:44,justifyContent:'center'},link:{fontSize:13,lineHeight:21,color:"#0B093B",flexShrink:1}});
