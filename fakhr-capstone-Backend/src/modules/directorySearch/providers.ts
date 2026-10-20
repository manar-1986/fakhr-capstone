import { broadDisabilitySupport } from './terminology';
import snapshot from './providers.snapshot.json';
import { DirectoryContext, disabilityAliases, serviceAliases, matches, practitionerPreferenceApplies } from './criteria';
import { normalize } from './recommendations';
export type ProviderBranch={id:string;sourceStatus:string;observations:any[];profile:any;sources?:unknown[]};
export type ProviderRecord={id:string;category:string;branches:ProviderBranch[]};
const records=snapshot.records as ProviderRecord[];
export const providerVersion=snapshot.version;
const exclusion=/(?:لا يقبل|لا تشمل|لا يشمل|غير مقبول|باستثناء|عدا|not accept|not support|except|exclud)/i;
function range(raw:string):[number,number]|undefined {const m=normalize(raw).match(/^(?:من\s*|ages?\s*)?(\d{1,2})\s*(?:-|–|الى|to)\s*(\d{1,2})(?:\s*(?:سنه|سنوات|سنين|years?))?$/);return m&&+m[1]<=+m[2]?[+m[1],+m[2]]:undefined;}
export function searchProviders(ctx:DirectoryContext,catalog:ProviderRecord[]=records){
 const c=ctx.criteria;const specialist=c.specialistSearch&&['doctor','rehabilitation'].includes(ctx.category);const preference=practitionerPreferenceApplies(ctx)?c.practitionerPreference:null;const output:any[]=[];const seen=new Set<string>();
 if(!c.services.length&&!c.disabilities.length)return output;
 for(const r of catalog){
  const cross=specialist;
  if((cross?!['doctor','rehabilitation'].includes(r.category):r.category!==ctx.category)||seen.has(r.id))continue;
  const evidence:any[]=[];
  for(const b of r.branches){
   const p=b.profile;const services=[...(p.services?.ar||[]),...(p.services?.en||[]),...(p.additionalServices?.ar||[]),...(p.additionalServices?.en||[]),p.specialization?.ar,p.specialization?.en,...(r.category==='doctor'?[]:[p.classification?.ar,p.classification?.en,p.description?.ar,p.description?.en])].filter(Boolean);
   // A doctor's degree or specialty does not establish disability acceptance.
   const conditions=[...(p.supportedConditions?.ar||[]),...(p.supportedConditions?.en||[]),...(r.category==='doctor'?[]:[p.specialization?.ar,p.specialization?.en,p.classification?.ar,p.classification?.en,p.description?.ar,p.description?.en,...services])].filter(Boolean);
   const clinicServices=r.category==='doctor'?[p.clinicServices?.ar,p.clinicServices?.en].flat().filter(Boolean):[];
   const rows=b.observations.length?b.observations:[{sourceId:'directory-profile',page:0,needsAr:conditions.join(' · ')}];
   const negative=[...conditions,...services,...clinicServices,...b.observations.map(o=>o.needsAr||'')].filter(t=>exclusion.test(normalize(t)));
   if(negative.some(t=>broadDisabilitySupport.test(normalize(t))||c.disabilities.some(d=>matches(t,disabilityAliases[d]||[d]))||c.services.some(s=>matches(t,serviceAliases[s]||[s]))))continue;
   for(const o of rows){
    const needs=[o.needsAr||'',...conditions].join(' · ');const serviceText=[...services,o.classroomAr||''].join(' · ');
    const disabilityMatch=c.disabilities.every(d=>matches(needs,disabilityAliases[d]||[d]));
    const serviceMatches=(text:string,s:string)=>{
     // Generic behavioral intervention can include documented ABA/modification;
     // psychotherapy/CBT alone is not evidence of that service.
     const clean=s==='behavioral'?text.replace(/العلاج السلوكي المعرفي|علاج سلوكي معرفي|cognitive behavio[u]?ral therapy/gi,''):text;
     const aliases=s==='behavioral'?[...serviceAliases.behavioral,...serviceAliases.aba,...serviceAliases.behaviorModification]:serviceAliases[s]||[s];
     return matches(clean,aliases);
    };
    const professionalServiceMatch=c.services.every(s=>serviceMatches(serviceText,s));
    const clinicMatch=c.services.length>0&&c.services.every(s=>serviceMatches(clinicServices.join(' · '),s));
    const serviceMatch=professionalServiceMatch||clinicMatch;
    if(specialist&&c.services.length&&!serviceMatch)continue;
    // A relevant anchor is mandatory. Unknowns are not treated as positive evidence.
    const broad=c.disabilities.length>0 && broadDisabilitySupport.test(normalize(needs));
    if(!(c.disabilities.length&&disabilityMatch)&&!(c.services.length&&serviceMatch)&&!broad)continue;
    const reasons:string[]=[];
    if(preference)reasons.push(preference==='female'?'female_availability_unknown':'male_availability_unknown');
    if(c.specialistSearch&&r.category==='rehabilitation')reasons.push('provider_service_evidence');
    if(clinicMatch&&!professionalServiceMatch)reasons.push('clinic_service_only','qualification_unverified');
    if(c.age===null)reasons.push('age_unknown');
    if(!disabilityMatch)reasons.push('disability_unknown');
    if(!serviceMatch)reasons.push('services_unknown');
    const ages=o.agesAr||p.ages?.ar||p.ages?.en||null;const limits=ages?range(ages):undefined;
    const branchRanges=[...b.observations.map(x=>x.agesAr),p.ages?.ar,p.ages?.en].filter(Boolean).map(range).filter((r):r is [number,number]=>!!r);
    if(c.age!==null&&branchRanges.length){
     if(branchRanges.every(r=>c.age!<r[0]||c.age!>r[1]))continue;
     if(branchRanges.some(r=>c.age!<r[0]||c.age!>r[1]))reasons.push('age_conflict');
    }
    if(c.age!==null){if(limits&&(c.age<limits[0]||c.age>limits[1]))continue;if(!limits)reasons.push('age_unknown');}
    if(c.stage){
     const stages:Record<string,string[]>={nursery:['nursery','حضانه'],kindergarten:['kindergarten','روضه','رياض'],primary:['primary','ابتدائي'],middle:['middle','متوسط'],secondary:['secondary','ثانوي']};
     if(o.stagesAr&&!matches(o.stagesAr,stages[c.stage]||[c.stage]))continue;
     if(!o.stagesAr)reasons.push('stage_unknown');
    }
    const area=o.areaAr||p.area?.ar||p.area?.en||null;const governorate=o.governorateAr||p.governorate?.ar||p.governorate?.en||null;
    let mismatch=false;for(const [actual,wanted] of [[area,c.area],[governorate,c.governorate]])if(wanted){if(!actual)reasons.push('location_unknown');else if(normalize(actual)!==normalize(wanted))mismatch=true;}
    if(mismatch)continue;
    if(b.sourceStatus!=='verified')reasons.push('source_unverified');
    evidence.push({branchId:b.id,sourceId:o.sourceId||'directory-profile',page:o.page||0,needs,ages,stage:o.stagesAr||null,area,governorate,services,clinicServices,verification:reasons.length?'inquiry':'verified',reasons});
   }
  }
  if(evidence.length){seen.add(r.id);const e=evidence.slice(0,4);output.push({category:r.category,id:r.id,branchIds:[...new Set(e.map(x=>x.branchId))],verification:e.every(x=>x.verification==='verified')?'verified':'inquiry',evidence:e});}
 }
 return output.sort((a,b)=>Number(b.verification==='verified')-Number(a.verification==='verified')||Number(a.evidence.every((e:any)=>e.reasons.includes('disability_unknown')))-Number(b.evidence.every((e:any)=>e.reasons.includes('disability_unknown')))||a.id.localeCompare(b.id)).slice(0,specialist?undefined:5);
}
export function providerResponse(ctx:DirectoryContext){
 const preference=practitionerPreferenceApplies(ctx)?ctx.criteria.practitionerPreference:null;const ar=ctx.language!=='en';const kw=ctx.language==='ar-KW';let question='';
 if(!ctx.criteria.disabilities.length&&!ctx.criteria.services.length)question=ar?(kw?'شنو الخدمة أو النشاط اللي تبحثون عنه؟':'ما الخدمة أو النشاط الذي تبحثون عنه؟'):'Which service or activity are you looking for?';
 const recommendations=question?[]:searchProviders(ctx);
 let answer=question||(recommendations.length?(ar?'هذه خيارات من دليل فخر وليست ترتيباً للأفضل. الخيارات المعلّمة للاستفسار لا تؤكد الأهلية.':'These options come from Fakhr, not a best-provider ranking. Inquiry-only suggestions do not confirm eligibility.'):(ar?'لم نجد تطابقاً موثقاً في دليل فخر الحالي. لم نفترض قبول عمر أو إعاقة دون دليل.':'No documented match was found in the current Fakhr directory. Age or disability acceptance was not assumed.'));
 if(!question && ctx.category==='nursery' && ctx.criteria.age===null)answer+='\n\n'+(ar?(kw?'جم عمر طفلك؟ نحتاجه لتضييق الخيارات حسب شروط العمر.':'ما عمر طفلك؟ يساعدنا على تضييق الخيارات حسب شروط العمر.'):'How old is your child? This helps narrow options by documented age requirements.');
 if(recommendations.some(r=>r.evidence.some((e:any)=>e.reasons.includes('clinic_service_only'))))answer+='\n\n'+(ar?'الخدمة المطلوبة مذكورة للعيادة المرتبطة بالملف، وليست إثباتاً لمؤهل صاحب الملف في تقديمها. استفسروا عن المختص الذي يقدم الخدمة ومؤهلاته وقبول الحالة.':'The requested service is listed for the linked clinic, not as proof of the named professional’s qualification to deliver it. Ask who provides the service, their credentials and suitability.');
 if(recommendations.length)answer+='\n\n'+providerEligibilityNotice(ctx.language||'en')+(preference==='female'?(ar?' يرجى تأكيد توفر أخصائية؛ بيانات الخدمة لا تثبت توفر موظفة مؤهلة حالياً.':' Please confirm female-specialist availability; service listings do not establish current qualified female staffing.'):preference==='male'?(ar?' يرجى تأكيد توفر أخصائي حسب التفضيل المطلوب.':' Please confirm male-specialist availability.'):'');
 return {answer,recommendations,directoryVersion:providerVersion,schoolContext:ctx,counts:{verified:recommendations.filter(r=>r.verification==='verified').length,inquiry:recommendations.filter(r=>r.verification==='inquiry').length},status:question?'follow_up':recommendations.length?'matches':'no_match'};
}

export const providerEligibilityNotice=(language:string)=>language==='en'?'💜 Please contact the provider to confirm eligibility, services and availability.':'💜 ننصحكم بالتواصل مع الجهة للتأكد من شروط القبول والخدمات وتوفر الأماكن.';
