import { normalize } from '../directorySearch/recommendations';
export const medicalDisclaimer={
 ar:'💜 فخر منصة توعوية وداعمة للأهالي، ولسنا جهة طبية أو جهة مختصة بالتشخيص والعلاج. المعلومات المقدمة للإرشاد العام ولا تغني عن استشارة المختص. ننصحكم دائماً بمراجعة المختص المناسب لحالة طفلكم.',
 en:"💜 Fakhr is an awareness and family support platform, not a medical provider or an authority qualified to diagnose or treat. The information provided is for general guidance and does not replace consultation with a specialist. Please consult a qualified specialist for your child's needs."
};
export function withMedicalDisclaimer(answer:string,language:string){
 answer=stripMedicalDisclaimer(answer);
 return answer+'\n\n'+medicalDisclaimer[language==='en'?'en':'ar'];
}
// Normalize known Fakhr footer paragraphs, including the earlier wording.
export function stripMedicalDisclaimer(answer:string){
 const legacy=[
  '💜 فخر منصة توعوية وداعمة للأهالي، ولسنا جهة طبية. المعلومات المقدمة للإرشاد العام ولا تغني عن التشخيص أو الاستشارة الطبية. ننصحكم دائماً بمراجعة المختص المناسب لحالة طفلكم.',
  "💜 Fakhr is an awareness and family support platform, not a medical provider. Our information is for general guidance and does not replace professional medical advice, diagnosis, or treatment. Please consult a qualified specialist for your child's needs."
 ];
 for(const d of [...Object.values(medicalDisclaimer),...legacy])answer=answer.split(d).join('');
 return answer.split(/\n\s*\n/).filter(p=>! /^(?:💜\s*)?(?:فخر منصة توعوية وداعمة للأهالي|Fakhr is an awareness and family support platform)/.test(p.trim())).join('\n\n').trim();
}
export const assessmentSources={
 pada:'https://online.pada.gov.kw/InfoServices.aspx?type=1',
 hospitals:'https://www.e.gov.kw/sites/kgoenglish/pages/visitors/tourisminkuwait/essintialserviceshospitals.aspx',
 development:'https://www.cdc.gov/autism/diagnosis/index.html',
 screening:'https://www.cdc.gov/autism/hcp/diagnosis/screening.html'
};
// Candidate values remain intact. A contact finding never verifies testing or report acceptance.
const candidates=[
 ['pada','الهيئة العامة لشؤون ذوي الإعاقة — وحدة الاختبارات والمقاييس','Public Authority for Disability Affairs — Tests and Measurements Unit','1861111'],
 ['education','وزارة التربية — إدارة الخدمات النفسية والاجتماعية','Ministry of Education — Psychological and Social Services Department','24814720'],
 ['mental-health','وزارة الصحة — مركز الصحة النفسية','Ministry of Health — Mental Health Center','24843900'],
 ['developmental','وزارة الصحة — وحدة الطب التطوري','Ministry of Health — Developmental Medicine Unit','23945619'],
 ['genetics','وزارة الصحة — مركز الأمراض الوراثية','Ministry of Health — Genetic Diseases Center','24814328'],
 ['government-hospitals','وزارة الصحة — المستشفيات الحكومية','Ministry of Health — Government Hospitals',null],
 ['sabah-developmental','مستشفى الصباح — وحدة الطب التطوري','Al Sabah Hospital — Developmental Medicine Unit','24617345']
] as const;
export const assessmentKnowledge={version:'2026-10-14.2',checkedAt:'2026-10-14',organizations:candidates.map(([id,ar,en,phone])=>({id,name:{ar,en},candidatePhone:phone,departmentStatus:'unverified',serviceStatus:'unverified',referralStatus:'unverified',acceptanceStatus:'unverified',contactEvidence:id==='pada'?{status:'verified-general-contact',source:assessmentSources.pada,scope:'Authority general number, not a verified testing-unit number'}:id==='mental-health'?{status:'verified-hospital-contact',source:assessmentSources.hospitals,scope:'Government directory lists Psychiatric Hospital; supplied department identity and testing services not established'}:{status:'unverified',source:null,scope:'No authoritative confirmation found in this review'}}))};
export const assessmentIntent=(q:string)=>/\biq\b|intelligence test|intelligence assess|developmental assess|اختبار.*ذكاء|اختبارات.*ذكاء|تقييم.*تطوري|تقييم.*طفل|تقرير.*هيئه|تقييم.*نمائي/.test(normalize(q));
export const assessmentFollowUp=(q:string)=>/approv|govern|accept|accredit|report|referr|appointment|book|معتمد|اعتماد|موافق|حكوم|مقبول|تقرير|تحويل|احال|موعد|حجز|هيئه/.test(normalize(q));
export function assessmentResponse(q:string,locale:string){
 const ar=locale!=='en';const n=normalize(q);let answer:string;
 if(/توحد|autis/.test(n))answer=ar?'اختبار الذكاء وحده لا يشخّص التوحد. تقييم التوحد يشمل التاريخ النمائي والسلوك وتقييماً متخصصاً؛ الفحص الأولي ليس تشخيصاً.':'An IQ test alone does not diagnose autism. Autism evaluation considers development and behavior through specialist assessment; screening is not a diagnosis.';
 else if(/فرق|difference/.test(n))answer=ar?'اختبار الذكاء يركز على القدرات المعرفية. التقييم النمائي ينظر إلى مجالات أوسع مثل اللغة والحركة والتفاعل الاجتماعي، وقد يشمل اختبارات متعددة يختارها المختص.':'IQ testing focuses on cognitive abilities. Developmental assessment considers broader areas such as language, movement and social interaction, and may involve several tools selected by a specialist.';
 else if(/مقبول|معتمد|هيئه|حكوم|موافق|accept|accredit|report|approv|govern/.test(n))answer=ar?'لا يمكننا تأكيد قبول تقرير بعينه. صفحة الهيئة الرسمية لفتح الملف الطبي تذكر مستندات تختلف حسب الحالة، ومنها تقارير نفسية واختبارات ذكاء لبعض الحالات. تأكدوا من الهيئة من الجهة المطلوبة وحداثة التقرير والإحالة قبل حجز التقييم.':'We cannot confirm acceptance of a particular report. PADA’s medical-file page lists case-specific documents, including psychological reports and IQ testing for some cases. Confirm the required provider, report recency and referral with PADA before booking.';
 else if(/referr|appointment|book|تحويل|احال|موعد|حجز/.test(n))answer=ar?'لم نتحقق من متطلبات الإحالة أو حجز موعد تقييم لدى جهة محددة. تأكدوا من الجهة المستقبلة والهيئة من المستندات والإحالة وقبول التقرير قبل الحجز. لا ينشئ هذا الرد حجزاً.':'Referral and assessment appointment requirements are not verified for a specific provider. Confirm documents, referral requirements and report acceptance with the receiving service and PADA before booking. This response does not create an appointment.';
 else answer=ar?(locale==='ar-KW'?'ما عندنا حالياً جهة مؤكدة لإجراء اختبار الذكاء ضمن قاعدة المعلومات المتحققة. مو كل مستشفى حكومي يقدم هالخدمة. تقدرون تستفسرون من الهيئة عن المتطلبات والجهات المطلوبة.':'لا تتوفر حالياً جهة مؤكدة لإجراء اختبار الذكاء ضمن قاعدة المعلومات المتحققة. لا نفترض أن كل مستشفى حكومي يقدم الخدمة. استفسروا من الهيئة عن المتطلبات والجهات المطلوبة.'):'No IQ-testing destination is currently service-verified in this knowledge base. We do not assume every government hospital offers testing. Ask PADA about requirements and the required assessment providers.';
 const general=/فرق|difference|توحد|autis/.test(n);
 const sources=general?[assessmentSources.development,assessmentSources.screening]:[assessmentSources.pada];
 const introduction=ar?'تقدرون تستفسرون عن تقييم الذكاء ومتطلباته من الجهات الحكومية التالية. هذه جهات مرشحة للاستفسار، وليست جهات مؤكدة لتقديم الاختبار.':'You can inquire about IQ assessments and their requirements through the following government contacts. These are candidate contacts, not confirmed testing providers.';
 const verificationNotice=ar?'تأكدوا من توفر التقييم، ومتطلبات الإحالة، وقبول التقرير لدى الجهة المعنية قبل الحجز. لا تقدم جميع المستشفيات الحكومية اختبارات الذكاء. توثيق رقم الاتصال لا يؤكد توفر الخدمة.':'Before booking, confirm assessment availability, referral requirements and report acceptance with the relevant authority. Not all government hospitals offer IQ testing. A verified contact number does not verify the service.';
 const assessment={version:1 as const,introduction,explanation:general||/referr|appointment|book|تحويل|احال|موعد|حجز|مقبول|معتمد|هيئه|حكوم|accept|accredit|report|approv|govern/.test(n)?answer:'',verificationNotice,organizations:assessmentKnowledge.organizations,sources,medicalDisclaimer:medicalDisclaimer[ar?'ar':'en']};
 answer+='\n\n'+assessmentContactList(locale);
 answer+='\n\n'+(ar?'المصادر الرسمية:':'Official sources:')+'\n'+sources.join('\n');
 return {answer:withMedicalDisclaimer(answer,locale),recommendations:[],schoolContext:{category:'assessment' as const,language:locale},language:locale,status:'assessment_information',knowledgeVersion:assessmentKnowledge.version,sources,assessment};
}

export function assessmentContactList(locale:string){
 const ar=locale!=='en';
 const heading=ar?'جهات حكومية مرشحة للاستفسار — ليست قائمة بجهات مؤكدة لإجراء اختبارات الذكاء:':'Candidate government contacts for inquiry — not confirmed IQ-testing providers:';
 return heading+'\n\n'+assessmentKnowledge.organizations.map((o,index)=>{
  const contact=o.contactEvidence.status==='verified-general-contact'
   ? (ar?'رقم عام موثق للهيئة؛ رقم الوحدة والقسم غير متحقق منه.':'Verified general authority contact; unit/department contact unverified.')
   :o.contactEvidence.status==='verified-hospital-contact'
   ? (ar?'رقم مستشفى موثق بالدليل الحكومي؛ القسم المذكور وخدمة التقييم غير متحقق منهما.':'Verified hospital contact in the government directory; supplied department and assessment service unverified.')
   :(ar?'بيانات الاتصال غير متحقق منها بصورة مستقلة.':'Contact details not independently verified.');
  const phone=o.candidatePhone || (ar?'لم يُزود رقم محدد.':'No specific phone supplied.');
  const unknown=ar?'توفر التقييم: غير مؤكد. متطلبات الإحالة: غير متحقق منها. قبول التقرير رسمياً: غير مؤكد.':'Assessment availability: unknown. Referral requirements: unverified. Official report acceptance: unknown.';
  return (index+1)+'. '+o.name[ar?'ar':'en']+'\n'+(ar?'الهاتف: ':'Phone: ')+phone+'\n'+contact+'\n'+unknown+(o.contactEvidence.source?'\n'+o.contactEvidence.source:'');
 }).join('\n\n');
}
