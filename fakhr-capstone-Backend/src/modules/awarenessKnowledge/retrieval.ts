import { topicClaims, sourceReviews } from './evidence';
import { normalize } from '../directorySearch/recommendations';
import { termNegated } from '../directorySearch/criteria';
import { categories, topics, sources, knowledgeVersion } from './topics';
import { withMedicalDisclaimer } from '../assessmentKnowledge/assessment';
export type AwarenessContext={category:'awareness';topicIds:string[];intent?:'explain'|'support'|'signs'|'evaluation';categoryId?:keyof typeof categories;language?:'ar'|'ar-KW'|'en'};
const has=(q:string,a:string[])=>a.some(t=>{
 const n=normalize(q),term=normalize(t);let from=0,index;
 while((index=n.indexOf(term,from))>=0){
  if(term==='مشي' && /[\u0600-\u06ff]/.test(n[index+term.length]||'')){from=index+term.length;continue;}
  if(!/^[a-z]/.test(term)||(!/[a-z]/.test(n[index-1]||'')&&!/[a-z]/.test(n[index+term.length]||'')))return true;
  from=index+term.length;
 }return false;
});
export function selectAwareness(q:string,previous?:AwarenessContext){
 const n=normalize(q);
 const categoryAliases=Object.values(categories).flatMap(c=>c.aliases).map(normalize);
 // Match the concern independently of the named category and intervening family words.
 let behaviorText=n;
 for(const alias of [...categoryAliases].sort((a,b)=>b.length-a.length))if(has(behaviorText,[alias]))behaviorText=behaviorText.split(alias).join(' ');
 behaviorText=normalize(behaviorText.replace(/(?:^|\s)(?:طفلي|طفلتي|ولدي|بنتي|طفلنا|طفلتنا)(?=\s|$)/g,' '));
 const ids=Object.keys(topics).filter(id=>{const needs=topics[id].aliases.filter(a=>!categoryAliases.includes(normalize(a)));return has(behaviorText,needs)&&(!termNegated(behaviorText,needs)||/why|ليش|لماذا|كيف/.test(n)&&/does not|doesn't|cannot|can't|ما ي|ما ت|لا ي|لا ت/.test(n));});
 const categoryId=(Object.keys(categories) as (keyof typeof categories)[]).find(id=>has(n,categories[id].aliases)&&!termNegated(n,categories[id].aliases));
 const follow=/^(?:and |what about |و)?(?:more|continue|examples?|how (?:can i|to) help|what can i do|what causes it|why|when should (?:i|we) (?:seek help|see a doctor)|is it dangerous|how can i help(?: her| him)?|متي اراجع الطبيب|متي نراجع الطبيب|هل هذا خطير|شلون اتصرف|شنو اسوي لها|شنو اسوي له|كمل|المزيد|امثله|شلون اساعده|شلون اساعدها|شنو اسوي|شنو السبب|ليش|وضح اكثر)[.!؟?]*$/i.test(n);
 if(!ids.length&&!follow&&/why|ليش|لماذا/.test(n))return undefined;
 if(!ids.length&&!categoryId&&! (previous&&follow))return undefined;
 // Specific behaviors take priority over condition words; never infer a category from behavior.
 const supersedes:Record<string,string[]>={toeWalking:['movement'],motorDelay:['movement','development'],letterReversal:['learning'],staring:['attention','vision'],spinning:['stimming','movement','sensory'],selfInjury:['regulation']};
 const concernIds=['haircut','hairWashing','hairBrushing','nailCare','toothbrushing','clothing','brightLight'];
 for(const id of concernIds)supersedes[id]=['sensory','dailyLiving'];
 const filtered=ids.filter(id=>!ids.some(other=>(supersedes[other]||[]).includes(id)));
 const specific=filtered.filter(id=>!['development','communication','sensory'].includes(id));
 const selected=(specific.length?specific:filtered.length?filtered:categoryId?categories[categoryId].topics:previous!.topicIds).slice(0,3);
 const intent:AwarenessContext['intent']=/when.*(?:assess|help|doctor)|متي.*(?:تقييم|مختص|طبيب)/.test(n)?'evaluation':/signs|symptoms|علامات|اعراض/.test(n)?'signs':/how.*(?:help|support)|what can i do|شلون.*(?:اساعد|نساعد)|شنو اسوي|كيف.*ساعد/.test(n)?'support':follow?previous?.intent||'support':'explain';
 return {category:'awareness' as const,topicIds:selected,intent,categoryId:categoryId||previous?.categoryId};
}
export function educationalQuestion(q:string){
 return /why|when|متي|what (?:does|is|are)|how|explain|signs|symptom|ليش|شنو|شلون|ما هي|ما هو|هل|علامات|كيف|لماذا/.test(normalize(q));
}
export function publicPrompt(ctx:AwarenessContext,locale:string){
 // Only server-owned need-based educational constants. Do not include categoryId,
 // source URLs, question, profile, age, diagnosis, or previous conversation text.
 return JSON.stringify({focus:({explain:'Explain possible reasons first.',support:'Prioritize practical low-risk support steps.',signs:'Describe general signs without diagnosing.',evaluation:'Prioritize when to seek professional assessment.'} as const)[ctx.intent||'explain'],task:'Answer the educational question directly; explain possibilities, safe practical support and when professional review is needed. No individual diagnosis, medication, dosing or treatment plan. Do not introduce facts outside this evidence. Do not invent sources or contacts.',
  topics:ctx.topicIds.map(id=>{const t=topics[id];return {question:t.question[locale==='en'?'en':'ar'],explanation:t.facts[locale==='en'?'en':'ar'],support:t.support[locale==='en'?'en':'ar'],seekHelp:t.referral[locale==='en'?'en':'ar']};})});
}
export function evidenceFor(ctx:AwarenessContext){
 const ids=[...new Set([...ctx.topicIds.flatMap(id=>topics[id].sources),...(ctx.categoryId?categories[ctx.categoryId].sources:[])])];
 return {version:knowledgeVersion,status:'source-checked-not-clinically-reviewed',checkedAt:'2026-10-14',claims:ctx.topicIds.flatMap(topicClaims),sources:ids.map(id=>({id,title:sources[id][0],url:sources[id][1],verification:sourceReviews[id]}))};
}
export function localIntroduction(ctx:AwarenessContext,locale:string){
 return ctx.categoryId?categories[ctx.categoryId][locale==='en'?'en':'ar']:'';
}
export function sourceFooter(ctx:AwarenessContext,locale:string){
 const evidence=evidenceFor(ctx);
 return (locale==='en'?'Educational sources — source-checked summaries, not clinically reviewed or an individual assessment:':'مصادر توعوية — ملخصات راجعنا مصادرها، ولم تخضع لمراجعة سريرية وليست تقييماً فردياً:')+'\n'+evidence.sources.map(s=>s.title+': '+s.url).join('\n');
}
// Local safety response: never wait for the model, ask age, or infer a diagnosis.
// Explicit negations are excluded; this is not a comprehensive triage system.
export function urgentResponse(q:string,locale:string){
 const n=normalize(q);
 const danger=['cannot breathe','can’t breathe',"can't breathe",'not breathing','blue lips','unresponsive','unconscious','choking','ما يتنفس','مو قادر يتنفس','ما يقدر يتنفس','شفايفه زرقاء','شفايفها زرقاء','فاقد الوعي','مو قاعد يستجيب','اختناق'];
 const active=(terms:string[])=>terms.some(t=>has(n,[t])&&!/(?:not|no|without|ليس|بدون)\s+$/.test(n.slice(0,n.indexOf(normalize(t)))));
 // Hypothetical education and past episodes should not be declared current emergencies.
 const hypothetical=/^(?:what if|what are|what is|what does|explain|ما هي|شنو يعني|ماذا لو)/.test(n);
 const present=!hypothetical&&active(danger);
 const headImpact=active(['hit his head','hit her head','head injury','ضرب راسه','ضربت راسها','اصابه بالراس']);
 const afterHeadEmergency=headImpact&&active(['cannot stay awake','new weakness','ما يقدر يصحصح','ضعف جديد']);
 const vomiting=headImpact&&active(['vomiting','يتقيا','ترجع','يرجع']);
 const suspectedSeizure=!hypothetical&&active(['first seizure','first convulsion','اول تشنج','اول نوبه تشنج']);
 if(!hypothetical&&(afterHeadEmergency||vomiting||suspectedSeizure)){
  const immediate=afterHeadEmergency||suspectedSeizure;
  const answer=locale==='en'
   ? (immediate?'A first suspected seizure or difficulty staying awake/new weakness after a head injury needs emergency medical help now.':'Vomiting after a head injury needs urgent medical assessment. Contact an urgent medical service now.')+' This does not establish a diagnosis. Do not wait for a chat response.'
   : (immediate?'الاشتباه بأول تشنج أو صعوبة البقاء مستيقظاً أو ضعف جديد بعد ضربة الرأس يحتاج مساعدة طبية طارئة الحين.':'القيء بعد ضربة الرأس يحتاج تقييماً طبياً عاجلاً. تواصلوا مع جهة طبية عاجلة الحين.')+' هذا مو تشخيص. لا تنتظرون رد المحادثة.';
  const source=suspectedSeizure?sources.seizures:sources.headInjury;
  return withMedicalDisclaimer(answer+'\n\n'+source[0]+': '+source[1],locale);
 }
 if(!present)return undefined;
 return withMedicalDisclaimer((locale==='en'?'If the child has trouble breathing, blue lips, is unresponsive or is choking now, seek emergency medical help immediately. Contact local emergency services and follow their instructions. Do not wait for an online assessment.':'إذا الطفل الحين عنده صعوبة بالتنفس أو ازرقاق بالشفاه أو فاقد الاستجابة أو يختنق، اطلبوا المساعدة الطبية الطارئة فوراً واتبعوا تعليمات الطوارئ. لا تنتظرون تقييم المحادثة.')+'\n\n'+sources.urgent[0]+': '+sources.urgent[1],locale);
}

export function safeEducationalFallback(ctx:AwarenessContext,locale:string){
 const lang=locale==='en'?'en':'ar';
 return ctx.topicIds.map(id=>{const t=topics[id];return [t.facts[lang],t.support[lang],t.referral[lang]].join('\n\n');}).join('\n\n');
}
// A conservative output boundary for obvious prohibited instructions. This is not
// a clinical factuality checker; clinician review remains necessary before release.
export function prohibitedOutput(text:string){
 if(/(?:طفلك|ولدك|بنتك|ابنك|ابنتك)\s+(?:مصاب|مصابه|عنده|عندها)\s+(?:توحد|فرط الحركه|عسر القراءه|اعاقه|شلل)/.test(normalize(text)))return true;
 return /\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|milligrams?)\b|\b(?:your child|your son|your daughter) (?:definitely |certainly )?(?:has|is diagnosed with|is autistic)|طفلك (?:مصاب|عنده توحد)|(?:اعط|أعط|تناول).{0,25}(?:دواء|جرعه|جرعة)|\b(?:give|take|prescribe).{0,30}(?:medication|dose|melatonin|ritalin)|force.{0,20}(?:eye contact|eat|exposure)/i.test(text);
}

export function asksForProvider(q:string){
 const n=normalize(q);
 return /where|find|recommend|looking for|which.*(?:school|doctor|center|nurser|club)|وين|ابي|ابغي|رشح|اقترح|اي مدرس|شنو.*(?:مدرسه مناسبه|مركز مناسب)/.test(n);
}

/** Conservative topical coverage, not a clinical factuality check.
 * A missing topic fails closed to the selected public evidence. Never inspect a narrative here.
 */
const relevance:Record<string,RegExp>={
 haircut:/haircut|hair cutting|قص الشعر|قصات/,
 hairWashing:/hair washing|wash.*hair|غسل الشعر|شطف/,
 hairBrushing:/hair brushing|brush.*hair|تمشيط|فرشاه/,
 nailCare:/nail|اظافر|الاظافر/,
 toothbrushing:/toothbrush|tooth|teeth|اسنان/,
 clothing:/fabric|clothing|labels|ملابس|قماش|تيكت/,
 brightLight:/bright light|lighting|الضوء|اضاءه/,
 sound:/\b(sound|sounds|noise|ears?|auditory)\b|صوت|اصوات|ضوضاء|اذن|اذون|اذان/,
 sensory:/sensory|texture|touch|light|حسي|لمس|ضوء|ملمس/,
 stimming:/flap|repetitive|stimming|رفرف|متكرر/,
 eyeContact:/eye contact|gaze|تواصل بصري|نظر|عيون/,
 echolalia:/repeat|echolalia|تكرار|يكرر|ترديد/,
 communication:/speech|language|communication|كلام|لغه|نطق|تواصل/,
 attention:/attention|focus|concentrat|انتباه|تركيز/,
 learning:/read|spell|learn|قراءه|تعلم|تهجئه/,
 movement:/movement|motor|mobility|حركه|حركي|توازن/,
 feeding:/food|eat|feeding|اكل|طعام/,
 sleep:/sleep|bedtime|نوم/,
 regulation:/distress|emotion|regulat|ضيق|انفعال|انزعاج/,
 hearing:/hearing|deaf|سمع/,
 vision:/vision|visual|بصر|رؤيه/,
 development:/develop|milestone|skill|نمو|مهار/,
 staring:/star|looking upward|responsiv|تحديق|للاعلى|استجابه/,
 spinning:/spinning|spin in|movement sensations|لف حول|اللف|الدوران/,
 selfInjury:/self.bit|head.bang|injur|عض|ضرب الراس|اصابه/,
 letterReversal:/revers|letter|حروف|الحرف/,
 toeWalking:/toe|heel|اصابع|كعبي/,
 motorDelay:/walking|motor|مشي|حركه/,
 dailyLiving:/dressing|hygiene|toilet|daily living|لبس|نظافه|حمام/
};
export function clearlyIrrelevantAwareness(text:string,ctx:AwarenessContext){
 const n=normalize(text.replace(/https?:\/\/[^\s)]+/g,''));
 const hasSupport=/offer|use|notice|reduce|allow|note|keep|try|make|observe|attend|respond|do not|لا |لاحظ|خفف|وفر|قدم|خل|استخدم|سجل|تكلم|اسمع|قسم|جرب|حافظ|اطلب|سه|ركز|وروا|اختار/.test(n);
 const hasReferral=/seek|discuss|assessment|professional|clinician|doctor|medical|review|مختص|طبيب|تقييم|راجع|مراجعه|استعين|مساعده/.test(n);
 return !hasSupport||!hasReferral||ctx.topicIds.some(id=>!relevance[id]?.test(n));
}
export function awarenessLimitation(locale:string){return withMedicalDisclaimer(locale==='en'
 ? 'I do not have enough verified educational information to explain this specific concern safely. Please describe the behavior in general terms without names or private records, or discuss it with a qualified professional.'
 : 'ما عندي معلومات توعوية موثقة كافية عشان أفسر هالقلق بأمان. ممكن توصفون السلوك بشكل عام بدون أسماء أو تقارير خاصة، أو تناقشونه مع المختص المناسب.',locale);}
