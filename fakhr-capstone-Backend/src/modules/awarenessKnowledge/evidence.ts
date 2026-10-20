import { topics, sources, SourceId } from './topics';
// Verification is source inspection, never clinical endorsement. Sections below are
// claim bundles with stable IDs and their exact bilingual text for editorial review.
export const checkedAt='2026-10-14';
export const sourceReviews=Object.fromEntries(Object.keys(sources).map(id=>[id,{
 checkedAt:id==='sensory'?null:checkedAt,
 status:id==='sensory'?'verification-pending':'source-checked',
 clinicalReview:'not-clinically-reviewed',
 note:id==='sensory'?'Legacy source not reverified; replaced for sensory answers.':id==='toes'||id==='down'||id==='skin'?'Publisher review date has passed; re-review before release.':'Public source inspected; translated summaries require clinical review.'
}]));
// Field-level evidence avoids attaching a convenient but unrelated source to a claim.
const supportByTopic:Record<string,SourceId[]>={haircut:["hairCare"],hairWashing:["hairWashing"],hairBrushing:["hairCare","hairBrushing"],nailCare:["nailCare"],toothbrushing:["toothbrushing"],clothing:["clothing"],brightLight:["sensoryNeeds"],sound:['support'],sensory:['support'],stimming:['support'],eyeContact:['communicationSupport'],echolalia:['communicationSupport','speech'],communication:['speech','down'],attention:['down','support'],learning:['reading','down'],movement:['motor','down'],feeding:['feeding'],sleep:['sleep'],regulation:['support','behaviour'],hearing:['hearing'],vision:['vision'],development:['development'],staring:['seizures','sensoryNeeds'],spinning:['support'],selfInjury:['behaviour','support'],letterReversal:['reversals'],toeWalking:['toes'],motorDelay:['development','down'],dailyLiving:['down','sensoryNeeds']};
export function topicClaims(id:string){
 const t=topics[id];
 return (['facts','support','referral'] as const).map(field=>({
  id:id+'.'+field,field,text:t[field],statements:Object.entries(t[field]).flatMap(([language,text])=>text.split(/[.!؟?]+/).map(v=>v.trim()).filter(Boolean).map((statement,index)=>({id:id+'.'+field+'.'+language+'.'+(index+1),language,text:statement,sourceIds:field==='support'?supportByTopic[id]||t.sources:t.sources,checkedAt,clinicalReview:'pending'}))),sourceIds:field==='support'?supportByTopic[id]||t.sources:t.sources,
  checkedAt,verification:'source-checked-not-clinically-reviewed',clinicalReview:'pending',
  scope:'General educational summary; not evidence about any individual child.'
 }));
}
