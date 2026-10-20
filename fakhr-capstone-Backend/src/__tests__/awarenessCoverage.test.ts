jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {topics,categories,sources} from '../modules/awarenessKnowledge/topics';
import {selectAwareness,publicPrompt,evidenceFor,clearlyIrrelevantAwareness,safeEducationalFallback,urgentResponse} from '../modules/awarenessKnowledge/retrieval';
import {medicalDisclaimer} from '../modules/assessmentKnowledge/assessment';
const mockCreate=jest.fn();
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>({responses:{create:mockCreate}}))}));
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let auth:string;
beforeEach(async()=>{
 mockCreate.mockReset().mockImplementation(async({input}:any)=>({output_text:JSON.parse(input).topics.map((t:any)=>[t.explanation,t.support,t.seekHelp].join('\n\n')).join('\n\n')}));
 process.env.OPENAI_API_KEY='mock-only';
 const user=await User.create({email:'behavior-coverage@example.invalid',password:'isolated-only'});
 auth='Bearer '+generateToken({userId:String(user._id)});
});
const ask=(question:string,schoolContext?:unknown,extra={})=>request(app).post('/api/ai/ask').set('Authorization',auth).send({question,schoolContext,...extra});
const examples=[
 ['stimming','لماذا يرفرف طفلي بيديه؟','ليش ولدي يرفرف بإيدينه؟','Why does my child flap her hands?'],
 ['sound','لماذا يغطي طفلي أذنيه؟','ليش طفلي يصك أذونه؟','Why does my child cover ears?'],
 ['staring','لماذا يحدق طفلي في مكان فارغ؟','ليش ولدي يطالع فوق أو يركز على مكان فاضي؟','Why is my child staring into space?'],
 ['spinning','لماذا يدور طفلي حول نفسه؟','ليش يلف حول نفسه؟','Why does my child spin in circles?'],
 ['echolalia','لماذا يكرر طفلي الكلام؟','ليش يكرر الكلام؟','Why does my child repeat words?'],
 ['selfInjury','لماذا يعض طفلي نفسه أو يضرب رأسه؟','ليش يعض نفسه أو يضرب راسه؟','Why does my child bite herself or bang her head?'],
 ['eyeContact','لماذا لا ينظر طفلي في عيني؟','ليش ما يطالع بعيوني؟','Why does my child avoid eye contact?'],
 ['communication','لماذا يتأخر طفلي بالكلام؟','ليش يتأخر بالكلام؟','Why does my child have delayed speech?'],
 ['attention','لماذا لا يركز طفلي؟','ليش ما يركز؟','Why can my child not concentrate?'],
 ['letterReversal','لماذا يكتب طفلي الحروف بالعكس؟','ليش يكتب الحروف بالعكس؟','Why does my child write letters backwards?'],
 ['toeWalking','لماذا يمشي طفلي على أطراف أصابعه؟','ليش يمشي على أطراف أصابعه؟','Why does my child walk on toes?'],
 ['feeding','لماذا يرفض طفلي أنواعاً من الطعام؟','ليش يرفض أنواع معينة من الأكل؟','Why does my child refuse certain foods?'],
 ['sensory','لماذا يتضايق طفلي من لمس الأشياء؟','ليش يتضايق من لمس بعض الأشياء؟','Why is my child sensitive to touch?'],
 ['sleep','لماذا يعاني طفلي من صعوبة النوم؟','ليش عنده صعوبة بالنوم؟','Why does my child have trouble sleeping?'],
 ['motorDelay','لماذا يتأخر طفلي بالمشي؟','ليش يتأخر بالمشي أو الحركة؟','Why is my child late to walk?']
];
const cases=examples.flatMap(([id,...questions])=>questions.map((q,i)=>({id,q,lang:i===2?'en':'ar'})));
test.each(cases)('specific answer and evidence: $q',async({id,q,lang})=>{
 const r=await ask(q).expect(200);const d=r.body.data;
 expect(d.status).toBe('educational_guidance');expect(d.schoolContext.topicIds[0]).toBe(id);
 expect(d.schoolContext.categoryId).toBeUndefined();
 expect(d.answer.startsWith(topics[id].facts[lang as 'ar'|'en'])).toBe(true);
 expect(d.answer).toContain(topics[id].support[lang as 'ar'|'en']);expect(d.answer).toContain(topics[id].referral[lang as 'ar'|'en']);
 expect(d.awareness.claims.some((c:any)=>c.id===id+'.facts'&&c.clinicalReview==='pending')).toBe(true);
 expect(d.awareness.sources.some((s:any)=>topics[id].sources.includes(s.id))).toBe(true);
 const footer=medicalDisclaimer[lang as 'ar'|'en'];expect(d.answer.split(footer)).toHaveLength(2);expect(d.answer.endsWith(footer)).toBe(true);
 expect(JSON.stringify(mockCreate.mock.calls)).not.toContain(q);expect(mockCreate.mock.calls[0][0].store).toBe(false);
});
test.each(Object.entries(categories).flatMap(([category,c])=>cases.map(item=>({category,...item,prefix:item.lang==='en'?c.aliases[0]:(c.aliases.find(a=>/[\u0600-\u06ff]/.test(a))||'')}))))('behavior priority for $category: $q',({category,id,q,prefix})=>{
 const ctx=selectAwareness(prefix+'. '+q)!;expect(ctx.topicIds[0]).toBe(id);
 expect(ctx.categoryId).toBe(category);
 expect(publicPrompt(ctx,'en')).not.toContain('categoryId');
});
test.each(Object.keys(topics))('every topic rejects generic output and has a complete evidence fallback: %s',id=>{
 const ctx={category:'awareness' as const,topicIds:[id]};
 for(const locale of ['ar','en']){
 expect(clearlyIrrelevantAwareness('Try a short play activity. Ask a professional.',ctx)).toBe(true);
 expect(clearlyIrrelevantAwareness('جربوا نشاط لعب قصير وراجعوا المختص.',ctx)).toBe(true);
 const answer=safeEducationalFallback(ctx,locale);
 expect(clearlyIrrelevantAwareness(answer,ctx)).toBe(false);
 expect(answer.startsWith(topics[id].facts[locale as 'ar'|'en'])).toBe(true);
 expect(evidenceFor(ctx).claims).toHaveLength(3);
 }
});
test.each(cases)('irrelevant generation replaced, sources then one notice: $q',async({id,q,lang})=>{
 mockCreate.mockResolvedValue({output_text:'Try a short play activity. Ask a professional.'});
 const r=await ask(q).expect(200);const a=r.body.data.answer;
 expect(a).not.toContain('Try a short play');expect(a.startsWith(topics[id].facts[lang as 'ar'|'en'])).toBe(true);
 const footer=medicalDisclaimer[lang as 'ar'|'en'];expect(a.split(footer)).toHaveLength(2);expect(a.endsWith(footer)).toBe(true);
 expect(a.indexOf('https://')).toBeGreaterThan(a.indexOf(topics[id].support[lang as 'ar'|'en']));
});
test.each(['شنو اسوي؟','شلون اساعدها؟','متى اراجع الطبيب؟','How can I help her?','When should I see a doctor?'])('followup preserves topic: %s',q=>{
 const previous=selectAwareness('Why does my child spin in circles?')!;
 expect(selectAwareness(q,previous)?.topicIds).toEqual(['spinning']);
 expect(selectAwareness('ليش يكتب الحروف بالعكس؟',previous)?.topicIds).toEqual(['letterReversal']);
});
test('female Kuwaiti spellings and daily living remain educational',async()=>{
 for(const [q,id] of [['ليش بنتي تلف حول نفسها؟','spinning'],['ليش تعض نفسها؟','selfInjury'],['ليش ما تركز؟','attention'],['شلون اساعدها تلبس؟','dailyLiving']]){
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('educational_guidance');expect(r.body.data.schoolContext.topicIds).toContain(id);
 }
});
test.each(['My child is unresponsive now','طفلي مو قاعد يستجيب','My child hit his head and cannot stay awake','My child had his first seizure','طفلي ضرب راسه ويتقيا'])('urgent concern is handled locally: %s',async q=>{
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('urgent_guidance');expect(mockCreate).not.toHaveBeenCalled();
 const footer=medicalDisclaimer[r.body.data.language==='en'?'en':'ar'];expect(r.body.data.answer.split(footer)).toHaveLength(2);expect(r.body.data.answer.endsWith(footer)).toBe(true);
});
test.each(['Why does my child stare?','ليش يعض نفسه؟','What is choking?','My child is not choking','My child has no head injury and is vomiting'])('ordinary or negated concern is not declared an emergency: %s',q=>expect(urgentResponse(q,'en')).toBeUndefined());
test('private data and diagnosis are not inserted in the public prompt',async()=>{
 await ask('PRIVATE_NAME autism: Why does my child spin in circles? private@example.invalid',undefined,{childProfile:{name:'PRIVATE_CHILD',diagnosis:'PRIVATE_DIAGNOSIS'},history:['PRIVATE_HISTORY'],token:'PRIVATE_TOKEN'}).expect(200);
 const payload=JSON.stringify(mockCreate.mock.calls);
 for(const forbidden of ['PRIVATE_','private@example.invalid','autism',auth])expect(payload).not.toContain(forbidden);
});
test('unsupported concern receives a limitation without a model invention',async()=>{
 const r=await ask('Why does my child have an unexplained unusual symptom?').expect(200);
 expect(r.body.data.answer).toContain('enough verified educational information');expect(mockCreate).not.toHaveBeenCalled();
});
test('claim references resolve and do not imply clinical review',()=>{
 for(const id of Object.keys(topics))for(const claim of evidenceFor({category:'awareness',topicIds:[id]}).claims){
 expect(claim.checkedAt).toBe('2026-10-14');expect(claim.clinicalReview).toBe('pending');expect(claim.sourceIds.length).toBeGreaterThan(0);
 for(const source of claim.sourceIds)expect(sources[source]).toBeDefined();
 }
});

test.each(Object.keys(topics))('topic mention alone is not a complete helpful answer: %s',id=>{
 expect(clearlyIrrelevantAwareness(topics[id].question.en,{category:'awareness',topicIds:[id]})).toBe(true);
});

test('assessment followup remains educational instead of a doctor directory search',async()=>{
 const first=await ask('Why is my child staring?').expect(200);
 const next=await ask('When should I see a doctor?',first.body.data.schoolContext).expect(200);
 expect(next.body.data.status).toBe('educational_guidance');expect(next.body.data.schoolContext.topicIds).toEqual(['staring']);
});
test('a named diagnosis does not justify generic answers to unsupported behaviors',async()=>{
 const r=await ask('My child has autism. Why does an unexplained unusual symptom happen?').expect(200);
 expect(r.body.data.answer).toContain('enough verified educational information');expect(mockCreate).not.toHaveBeenCalled();
});
test.each(['بنتك عندها توحد','ولدك عنده فرط الحركة','Your child has ADHD.'])('diagnosis assertions rejected: %s',async output=>{
 mockCreate.mockResolvedValue({output_text:output});const r=await ask('ليش ما يركز؟').expect(200);
 expect(r.body.data.answer).not.toContain(output);expect(r.body.data.answer).toContain(topics.attention.facts.ar);
});
