import { z } from 'zod';
import { criteriaSchema, normalize } from './recommendations';
import { extractLocation } from './locations';
export const categories = ['school','doctor','rehabilitation','nursery','sports'] as const;
export const directoryContextSchema = z.object({category:z.enum(categories),criteria:criteriaSchema,language:z.enum(['ar','ar-KW','en']).optional()}).strict();
export type DirectoryContext = z.infer<typeof directoryContextSchema>;
import { disabilityAliases, serviceAliases } from './terminology';
export { disabilityAliases, serviceAliases } from './terminology';
export const matches=(text:string,terms:string[])=>terms.some(t=>{const value=normalize(text), term=normalize(t);return term==='asd'?/\basd\b/.test(value):value.includes(term);});
export function directoryIntent(q:string):DirectoryContext['category']|undefined {
 const n=normalize(q);
 if(/حضانه|حضانات|nurser/.test(n))return 'nursery';
 if(/نادي|نوادي|انديه|club/.test(n))return 'sports';
 if(/دكتور|دكاتره|اطباء|طبيب|اخصائي|اختصاصي|مختص|doctor|specialist|therapist|pathologist|\bslp\b/.test(n))return 'doctor';
 if(/مركز|مراكز|center|centre/.test(n))return 'rehabilitation';
 if(/مدرس|مدارس|school|وين.*سجل|where.*enrol/.test(n))return 'school';
 if(therapySpecialistRequest(n))return 'doctor';
}
// Local extraction only: no child narrative or search preferences leave this server.
export function localCriteria(q:string,previous?:DirectoryContext['criteria']) {
 const n=normalize(q); const c=criteriaSchema.parse(previous||{});
 if(therapySpecialistRequest(n))c.specialistSearch=true;
 if(/اخصائيه|اختصاصيه|دكتوره|طبيبه|مختصه|\bfemale\b|\bwoman\b/.test(n))c.practitionerPreference='female';
 else if(/\bmale\b|\bman\b/.test(n))c.practitionerPreference='male';
 if(/any gender|no gender preference|ما يفرق.*(?:رجل|حرمه)|اي جنس/.test(n))c.practitionerPreference=null;
 const negated=Object.entries(disabilityAliases).filter(([,a])=>termNegated(n,a)).map(([k])=>k);
 // Service wording must not replace an already supplied disability criterion.
 const serviceOnlySpeech=explicitSpeechService(n)&&!/delay|disorder|difficult|تاخر|اضطراب|صعوب/.test(n);
 const disabilities=Object.entries(disabilityAliases).filter(([k,a])=>!negated.includes(k)&&!(k==='speech'&&serviceOnlySpeech)&&matches(n,a)).map(([k])=>k);
 c.disabilities=c.disabilities.filter(k=>!negated.includes(k));
 if(disabilities.length)c.disabilities=disabilities;
 const serviceText=n.replace(/(?:اخصائي|اختصاصي|دكتور|طبيب|مختص)ه?/g,'اخصائي').replace(/اخصائي\s+وظيفي/g,'اخصائي علاج وظيفي');
 const services=Object.entries(serviceAliases).filter(([key,a])=>!termNegated(n,a)&&matches(serviceText,a)&&(key!=='speech'||explicitSpeechService(n))).map(([k])=>k);
 c.services=c.services.filter(k=>!termNegated(n,serviceAliases[k]||[k]));
 if((/\bot\b/.test(n)||/^(?:و)?(?:ال)?وظيفي[؟?]?$/.test(n))&&!termNegated(n,['OT'])){if(!services.includes('occupational'))services.push('occupational');}
 // Explicit ABA/modification requests retain their narrower service requirement.
 if(services.includes('behaviorModification')||services.includes('aba'))services.splice(services.indexOf('behavioral'),services.includes('behavioral')?1:0);
 if(services.length)c.services=services;
 const ageText=n.replace(/ثمان(?:يه)?(?=\s*(?:سنوات|سنين|سنه))/g,'8');
 const age=ageText.match(/(?:عمر\S*\s*|aged?\s*|عنده\s*)(\d{1,2})(?!\d)/)||ageText.match(/\b(\d{1,2})[\s-]*(?:سنوات|سنه|سنين|years?|year-old)/)||ageText.match(/^\s*(\d{1,2})\s*$/);
 if(age && +age[1]<=120)c.age=+age[1];
 Object.assign(c,extractLocation(n,normalize));
 const stages:Record<string,string[]>={nursery:['nursery','حضانه'],kindergarten:['kindergarten','روضه','رياض الاطفال'],primary:['primary','ابتدائي'],middle:['middle school','متوسط'],secondary:['secondary','ثانوي']};
 for(const [key,terms] of Object.entries(stages))if(matches(n,terms))c.stage=key as any;
 return c;
}
// Negation is evaluated locally; uncertain/negative diagnosis wording must never add a filter.
export function termNegated(text:string,terms:string[]) {
 const n=normalize(text);
 return terms.some(term=>{
  const t=normalize(term);let start=0,index:number;
  while((index=n.indexOf(t,start))>=0){
   const prefix=n.slice(Math.max(0,index-90),index).split(/[.!?؟،,;]|\bbut\b|لكن|بس/).pop()||'';
   if(/(?:\b(?:not|no|without|never|doesn't|isn't|don't|except)\b|(?:^|\s)(?:ليس|ليست|مو|ما عنده|ما عندها|ما فيه|ما فيها|ما يعاني|ما تعاني|لا يعاني|لا تعاني|لا يوجد|بدون|غير مصاب|غير مصابه|عدا)(?=\s|$))/.test(prefix))return true;
   start=index+t.length;
  }return false;
 });
}
export const ambiguousCriteria=(q:string)=>/(?:under|over|اقل من|اكبر من)\s*\d/i.test(normalize(q));

// Only bounded continuations reuse directory context; unrelated questions do not.
export const directoryFollowUp=(q:string)=>/^(?:(?:ok|okay|yes)[, ]*)?(?:recommend(?: some)?|show (?:me )?(?:options|suggestions|results)|more(?: options)?|continue|what else|recommend from fakhr|(?:اوكي|اي|نعم)[، ]*(?:رشح|رشحلي)?|رشح(?:لي)?(?: من (?:ابلكيشن )?فخر)?|كمل|المزيد|خيارات اكثر|شنو بعد)[.!؟?]*$/i.test(normalize(q));

// Condition-only speech wording is not a request for a therapy service.
export const explicitSpeechService=(input:string)=>{const n=normalize(input).replace(/(?:اخصائي|اختصاصي|دكتور|طبيب|مختص)ه?/g,'اخصائي');return (/(?:دكتور|طبيب|اخصائي|اختصاصي|مختص).{0,35}(?:تاخر الكلام|تاخر بالكلام)|(?:speech|language)\s+delay.{0,25}(?:specialist|therapist)|(?:specialist|therapist).{0,25}(?:speech|language)\s+delay/.test(normalize(n)))||/\b(?:speech(?:[- ]language)?|language)\s+(?:therapy|therapist|pathologist|services?|sessions?)|\bslp\b|(?:علاج|جلسات|خدمات|اخصائي|اختصاصي|دكتور|طبيب)\s+(?:ال)?(?:نطق|تخاطب)|(?:النطق|التخاطب)\s+(?:واللغه\s+)?العلاجي/.test(normalize(n));};

// Provider requests, not educational questions about a treatment or a symptom.
export function therapySpecialistRequest(q:string){
 const n=normalize(q);
 const service=/نطق|تخاطب|وظيفي|سلوكي|تعديل\s+(?:ال)?سلوك|تحليل السلوك|speech|occupational|behavior|\baba\b|\bot\b|\bslp\b/.test(n);
 const professional=/اخصائي|اختصاصي|دكتور|طبيب|مختص|therapist|specialist|pathologist|\bslp\b/.test(n);
 const seeking=/ابي|ابغي|اريد|ابحث|وين|where|find|looking for|need/.test(n);
 const bare=/^(?:occupational therapy|speech therapy|behavioral therapy|behavior modification|aba|علاج وظيفي|العلاج الوظيفي|علاج سلوكي)$/.test(n);
 return service&&(professional||seeking||bare)&&!(/^(?:what is|explain|شنو يعني|ما هو|ما هي)/.test(n));
}

// Remember professional preferences separately from the current directory's filters.
const professionalCategory=(category:string)=>['doctor','rehabilitation'].includes(category);
const therapyServices=new Set(['speech','occupational','behavioral','aba','behaviorModification','physical','psychology']);
export const practitionerPreferenceApplies=(ctx:DirectoryContext)=>ctx.category==='doctor'||(ctx.category==='rehabilitation'&&ctx.criteria.services.some(s=>therapyServices.has(s)));
export function categoryCriteria(question:string,category:DirectoryContext['category'],previous?:DirectoryContext) {
 const fresh=localCriteria(question);
 const prior=previous?.criteria;
 let memory=prior?.specialistMemory;
 if(prior && professionalCategory(previous!.category) && (memory || prior.services.length || prior.practitionerPreference))memory={practitionerPreference:prior.practitionerPreference,services:[...prior.services],specialistSearch:prior.specialistSearch};
 const base=criteriaSchema.parse(prior||{});
 const crossing=!!previous&&previous.category!==category;
 const changingScope=crossing&&!(professionalCategory(previous!.category)&&professionalCategory(category));
 if(changingScope){base.services=[];base.stage=null;base.specialistSearch=false;base.practitionerPreference=null;}
 if(professionalCategory(category)&&changingScope&&memory){
   base.practitionerPreference=memory.practitionerPreference;
   // A new specialty replaces the remembered service; a bare return resumes it.
   if(!fresh.services.length){base.services=[...memory.services];base.specialistSearch=memory.specialistSearch;}
 }
 const result=localCriteria(question,base);
 if(!professionalCategory(category)){
   result.specialistSearch=false;result.practitionerPreference=null;
 } else {
   if(fresh.services.length)result.specialistSearch=therapySpecialistRequest(question)||fresh.services.some(s=>therapyServices.has(s));
   if(memory || result.services.length || result.practitionerPreference)memory={practitionerPreference:result.practitionerPreference,services:[...result.services],specialistSearch:result.specialistSearch};
 }
 if(memory)result.specialistMemory=memory;
 return result;
}
