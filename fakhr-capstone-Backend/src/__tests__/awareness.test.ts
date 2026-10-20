jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {categories,topics,sources} from '../modules/awarenessKnowledge/topics';
import {selectAwareness,publicPrompt,urgentResponse} from '../modules/awarenessKnowledge/retrieval';
import {directoryIntent,localCriteria} from '../modules/directorySearch/criteria';
import {searchProviders} from '../modules/directorySearch/providers';
import {medicalDisclaimer} from '../modules/assessmentKnowledge/assessment';
const mockCreate=jest.fn();
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>({responses:{create:mockCreate}}))}));
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let auth:string;
beforeEach(async()=>{mockCreate.mockReset().mockImplementation(async({input}:any)=>({output_text:JSON.parse(input).topics.map((t:any)=>[t.explanation,t.support,t.seekHelp].join('\n\n')).join('\n\n')}));process.env.OPENAI_API_KEY='mock-only';const u=await User.create({email:'awareness@example.invalid',password:'isolated-only'});auth='Bearer '+generateToken({userId:String(u._id)});});
const ask=(question:string,schoolContext?:unknown,extra={})=>request(app).post('/api/ai/ask').set('Authorization',auth).send({question,schoolContext,...extra});

test.each(['أبي دكتور نطق وتخاطب حق ولدي','أخصائي نطق','اختصاصي تخاطب','speech therapist','speech-language pathologist','speech language pathologist','SLP'])('service without age: %s',async q=>{
 expect(directoryIntent(q)).toBe('doctor');const c=localCriteria(q);expect(c.age).toBeNull();expect(c.services).toContain('speech');expect(c.disabilities).not.toContain('speech');
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('matches');
 const ref=r.body.data.recommendations.find((x:any)=>x.id==='center-speech-plus');expect(ref).toBeTruthy();expect(ref.verification).toBe('inquiry');expect(ref.evidence[0].reasons).toContain('clinic_service_only');expect(ref.evidence[0].reasons).toContain('qualification_unverified');
 expect(ref.evidence[0].services.join(' ')).not.toMatch(/certified speech|معتمد في النطق/i);expect(mockCreate).not.toHaveBeenCalled();
 expect(r.body.data.answer.endsWith(medicalDisclaimer[r.body.data.language==='en'?'en':'ar'])).toBe(true);
});
test('documented age exclusions still apply to clinic-service suggestions',()=>{
 const c=localCriteria('speech therapist age 8');const catalog=[{id:'isolated-clinic',category:'doctor',branches:[{id:'isolated-clinic',sourceStatus:'unverified',observations:[],profile:{clinicServices:{en:['Speech services']},ages:{en:'2-5'}}}]}];
 expect(searchProviders({category:'doctor',criteria:c},catalog)).toEqual([]);
});
const examples=[
 ['ولدي توحد ليش يصك أذونه؟','sound'],['ليش طفلي يرفرف بإيدينه؟','stimming'],['بنتي تكرر الكلام، شنو السبب؟','echolalia'],['ولدي ما يطالع بعيوني، هل هذا توحد؟','eyeContact'],['شنو علامات عسر القراءة؟','learning'],['شلون أساعد طفل عنده شلل دماغي؟','movement'],['ليش طفل فرط الحركة ما يقدر يقعد بمكانه؟','attention'],['طفلي يتأخر بالكلام، شنو أسوي؟','communication'],['What does sensory sensitivity mean in autism?','sensory'],['How can I help with selective eating?','feeding'],['What helps with sleep?','sleep']
];
test.each(examples)('specific source selection: %s',async(q,id)=>{
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('educational_guidance');expect(r.body.data.schoolContext.topicIds).toContain(id);expect(r.body.data.answer).toContain(topics[id].facts[r.body.data.language==='en'?'en':'ar']);
 const input=JSON.parse(mockCreate.mock.calls[0][0].input);expect(input.topics.some((t:any)=>Object.values(topics[id].question).includes(t.question))).toBe(true);
 expect(r.body.data.awareness.sources.some((s:any)=>topics[id].sources.includes(s.id))).toBe(true);
 const disclaimer=medicalDisclaimer[r.body.data.language==='en'?'en':'ar'];expect(r.body.data.answer.split(disclaimer)).toHaveLength(2);expect(r.body.data.answer.endsWith(disclaimer)).toBe(true);
});
test.each(Object.entries(categories))('category %s has bilingual evidence without forwarding category or narrative',async(id,category)=>{
 for(const q of ['Explain '+category.aliases[0],'شنو '+(category.aliases.find(a=>/[\u0600-\u06ff]/.test(a))||'')]){
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('educational_guidance');expect(r.body.data.awareness.status).toBe('source-checked-not-clinically-reviewed');
 const input=JSON.parse(mockCreate.mock.calls[mockCreate.mock.calls.length-1][0].input);expect(input.categoryId).toBeUndefined();expect(input.topics.length).toBeGreaterThan(0);expect(input.topics.length).toBeLessThanOrEqual(3);
 }
 expect(category.sources.length).toBeGreaterThan(0);
});
test('all topic references exist and are public authority URLs',()=>{
 for(const t of Object.values(topics))for(const id of t.sources){expect(sources[id]).toBeDefined();expect(sources[id][1]).toMatch(/^https:\/\/(?:[^/]+\.)?(?:nhs\.uk|cdc\.gov|nidcd\.nih\.gov|who\.int)\//);}
});
test('private text, diagnosis assertions and arbitrary context never reach OpenAI',async()=>{
 await ask('PRIVATE_NAME age 8 with autism why covers ears? PRIVATE_PASSWORD private@example.invalid',undefined,{childProfile:{name:'PRIVATE_CHILD',diagnosis:'PRIVATE_DIAGNOSIS'},history:['PRIVATE_HISTORY']}).expect(200);
 const payload=JSON.stringify(mockCreate.mock.calls);for(const secret of ['PRIVATE_','private@example.invalid','age 8','autism',auth])expect(payload).not.toContain(secret);
 expect(mockCreate.mock.calls[0][0].store).toBe(false);
 await ask('more',{category:'awareness',topicIds:['PRIVATE_INSTRUCTION']}).expect(400);
});
test('specific followup retains educational topic and language; new topic switches',async()=>{
 const first=await ask('ليش طفلي يرفرف؟').expect(200);const next=await ask('شلون اساعده؟',first.body.data.schoolContext).expect(200);
 expect(next.body.data.schoolContext.topicIds).toEqual(['stimming']);expect(next.body.data.language).toBe('ar-KW');
 const switched=await ask('What about sleep?',next.body.data.schoolContext).expect(200);expect(switched.body.data.schoolContext.topicIds).toEqual(['sleep']);expect(switched.body.data.language).toBe('en');
});
test('awareness question is not swallowed by prior directory context',async()=>{
 const first=await ask('autism school age 8').expect(200);const next=await ask('Why does a child cover ears?',first.body.data.schoolContext).expect(200);expect(next.body.data.status).toBe('educational_guidance');
 const provider=await ask('speech therapist',next.body.data.schoolContext).expect(200);expect(provider.body.data.schoolContext.category).toBe('doctor');
});
test('duplicate medical footer from model is removed and sources precede final footer',async()=>{
 mockCreate.mockResolvedValue({output_text:medicalDisclaimer.en+'\n\nRepetitive movements may be calming. Offer comfort and seek help for injury.\n\n'+medicalDisclaimer.en});
 const r=await ask('Why hand flapping?').expect(200);expect(r.body.data.answer.split(medicalDisclaimer.en)).toHaveLength(2);expect(r.body.data.answer.indexOf('Repetitive movements')).toBeLessThan(r.body.data.answer.indexOf('Educational sources'));expect(r.body.data.answer.endsWith(medicalDisclaimer.en)).toBe(true);
});
test.each(['My child cannot breathe','My child is not breathing','طفلي ما يتنفس','شفايفه زرقاء','my child is unresponsive'])('urgent local advice without OpenAI: %s',async q=>{
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('urgent_guidance');expect(mockCreate).not.toHaveBeenCalled();expect(r.body.data.answer.endsWith(medicalDisclaimer[r.body.data.language==='en'?'en':'ar'])).toBe(true);
});
test('negated urgent symptoms do not trigger emergency route',()=>expect(urgentResponse('My child is not choking','en')).toBeUndefined());
test('condition-only speech concern is not a directory/service filter',()=>{expect(directoryIntent('طفلي يتأخر بالكلام شنو أسوي')).toBeUndefined();expect(localCriteria('speech delay').services).toEqual([]);expect(selectAwareness('طفلي يتأخر بالكلام شنو أسوي')?.topicIds).toContain('communication');});
test('authentication still required',async()=>{await request(app).post('/api/ai/ask').send({question:'Why hand flapping?'}).expect(401);expect(mockCreate).not.toHaveBeenCalled();});

test.each(['Your child has autism.','Give 5 mg melatonin.','Force eye contact every day.'])('prohibited model instruction never reaches parent: %s',async output=>{
 mockCreate.mockResolvedValue({output_text:output});const r=await ask('Why hand flapping?').expect(200);expect(r.body.data.answer).not.toContain(output);expect(r.body.data.answer).toContain('Repetitive movements');expect(r.body.data.answer.endsWith(medicalDisclaimer.en)).toBe(true);
});
test('fabricated generated URLs are not shown; registry sources remain',async()=>{
 mockCreate.mockResolvedValue({output_text:'Helpful explanation https://fake-provider.invalid/claim'});const r=await ask('Why hand flapping?').expect(200);expect(r.body.data.answer).not.toContain('fake-provider');expect(r.body.data.answer).toContain(sources.support[1]);
});

const needQuestions=[['Why cover ears?','ليش يصك اذونه؟','sound'],['Why hand flapping?','ليش يرفرف؟','stimming'],['Why repeats words?','ليش يكرر الكلام؟','echolalia'],['Why avoid eye contact?','ليش ما يطالع بعيوني؟','eyeContact'],['How to support selective eating?','شلون نساعد مع الاكل الانتقائي؟','feeding'],['How to support sleep?','شلون نساعد مع النوم؟','sleep'],['What helps emotional regulation?','شنو يساعد مع الانفعال؟','regulation'],['How to support coordination?','شلون نساعد مع التوازن؟','movement']];
test.each(Object.entries(categories).flatMap(([id,c])=>needQuestions.flatMap(([en,ar,topic])=>[[id,c.aliases[0]+' '+en,topic,'en'],[id,(c.aliases.find(a=>/[\u0600-\u06ff]/.test(a))||'')+' '+ar,topic,'ar']])) )('category %s with specific question %s selects %s',async(id,q,topic,lang)=>{
 mockCreate.mockImplementation(async({input}:any)=>{const pack=JSON.parse(input);return {output_text:pack.topics.map((t:any)=>[t.explanation,t.support,t.seekHelp].join('\n')).join('\n')};});
 const r=await ask(q).expect(200);expect(r.body.data.status).toBe('educational_guidance');expect(r.body.data.schoolContext.topicIds).toContain(topic);expect(r.body.data.answer).toContain(topics[topic].facts[lang==='en'?'en':'ar']);
 const footer=medicalDisclaimer[lang==='en'?'en':'ar'];expect(r.body.data.answer.endsWith(footer)).toBe(true);expect(r.body.data.answer.split(footer)).toHaveLength(2);
});
test('a behavior alone never establishes a category or diagnosis context',()=>expect(selectAwareness('Why hand flapping?')?.categoryId).toBeUndefined());

test.each(['أبي أخصائي حق تأخر الكلام','أبي دكتور حق ولدي عنده تأخر بالكلام','specialist for speech delay'])('explicit delay specialist request finds inquiry option: %s',async q=>{
 const r=await ask(q).expect(200);expect(r.body.data.recommendations.some((x:any)=>x.id==='center-speech-plus'&&x.verification==='inquiry')).toBe(true);expect(mockCreate).not.toHaveBeenCalled();
});
test('condition-only Arabic speech delay does not invent a service request',()=>expect(localCriteria('طفلي عنده تأخر الكلام').services).toEqual([]));

test.each(['autism','speech delay'])('speech service followup preserves prior %s, age and location',async condition=>{
 const first=await ask(condition+' schools age 8 in Hawalli governorate').expect(200);
 const next=await ask('speech therapist',first.body.data.schoolContext).expect(200);
 expect(next.body.data.schoolContext.criteria.disabilities).toEqual(first.body.data.schoolContext.criteria.disabilities);
 expect(next.body.data.schoolContext.criteria.age).toBe(8);expect(next.body.data.schoolContext.criteria.governorate).toEqual(first.body.data.schoolContext.criteria.governorate);expect(next.body.data.schoolContext.criteria.services).toContain('speech');
});

test('school mention in an educational question is not a directory request',async()=>{
 const r=await ask('Why is reading difficult at school?').expect(200);expect(r.body.data.status).toBe('educational_guidance');expect(r.body.data.schoolContext.topicIds).toContain('learning');expect(r.body.data.recommendations).toBeUndefined();
});
test('followup asking for help changes only public answer intent',async()=>{
 const first=await ask('Why hand flapping?').expect(200);const next=await ask('How can I help?',first.body.data.schoolContext).expect(200);
 expect(next.body.data.schoolContext.intent).toBe('support');expect(JSON.parse(mockCreate.mock.calls[1][0].input).focus).toContain('support steps');expect(next.body.data.schoolContext.topicIds).toEqual(['stimming']);
});

const soundQuestions=[
 'ولدي عنده توحد، ليش يصك أذونه لما يسمع أصوات عالية؟',
 'لماذا يغطي طفلي أذنيه عندما يسمع الأصوات العالية؟',
 'ليش يسكر اذونه من الاصوات؟',
 'Why does my child cover ears around loud sounds?'
];
test.each(soundQuestions)('sound relevance without inferred hearing loss: %s',async q=>{
 const r=await ask(q).expect(200);const d=r.body.data;
 expect(d.schoolContext.topicIds).toEqual(['sound']);
 expect(d.awareness.sources.some((s:any)=>s.id==='sensoryNeeds')).toBe(true);
 expect(d.awareness.sources.some((s:any)=>s.id==='hearing')).toBe(false);
 const lang=d.language==='en'?'en':'ar';
 expect(d.answer.startsWith(topics.sound.facts[lang])).toBe(true);
 expect(d.answer.indexOf(topics.sound.support[lang])).toBeGreaterThan(d.answer.indexOf(topics.sound.facts[lang]));
 expect(d.answer).toContain(topics.sound.referral[lang]);
 expect(d.answer.split(medicalDisclaimer[lang])).toHaveLength(2);
 expect(d.answer.endsWith(medicalDisclaimer[lang])).toBe(true);
 const payload=JSON.stringify(mockCreate.mock.calls);
 expect(payload).not.toContain(q);expect(payload).not.toContain(auth);
 expect(mockCreate.mock.calls[0][0].store).toBe(false);
});
test.each(soundQuestions)('generic output falls back to selected evidence: %s',async q=>{
 mockCreate.mockResolvedValue({output_text:'جربوا نشاط لعب قصير وقابل للتعديل، وناقشوا الاحتياجات الفردية مع المختص.'});
 const r=await ask(q).expect(200);const lang=r.body.data.language==='en'?'en':'ar';
 expect(r.body.data.answer).not.toContain('نشاط لعب قصير');
 expect(r.body.data.answer.startsWith(topics.sound.facts[lang])).toBe(true);
 expect(r.body.data.answer).toContain(topics.sound.support[lang]);
 expect(r.body.data.answer).toContain(topics.sound.referral[lang]);
 expect(r.body.data.answer.split(medicalDisclaimer[lang])).toHaveLength(2);
 expect(r.body.data.answer.endsWith(medicalDisclaimer[lang])).toBe(true);
});
test.each(['طفلي عنده ضعف السمع شلون اساعده؟','شنو صعوبات السمع؟','Explain hearing loss'])('explicit hearing concern: %s',q=>{
 expect(selectAwareness(q)?.topicIds).toContain('hearing');
});
test('relevant generated paraphrase is retained',async()=>{
 const answer='Loud sounds may feel overwhelming. Offer a quiet place and seek medical advice for ear pain.';
 mockCreate.mockResolvedValue({output_text:answer});const r=await ask(soundQuestions[3]).expect(200);
 expect(r.body.data.answer.startsWith(answer)).toBe(true);
});
test('unsafe sound advice uses safe evidence fallback',async()=>{
 mockCreate.mockResolvedValue({output_text:'Force exposure to loud sounds.'});
 const r=await ask(soundQuestions[3]).expect(200);
 expect(r.body.data.answer).not.toContain('Force exposure');
 expect(r.body.data.answer).toContain(topics.sound.support.en);
 expect(r.body.data.answer.endsWith(medicalDisclaimer.en)).toBe(true);
});

test.each(['Try a short learning activity and speak to a professional.','A clear explanation will help.'])('English generic output cannot pass on substring overlap: %s',async output=>{
 mockCreate.mockResolvedValue({output_text:output});const r=await ask(soundQuestions[3]).expect(200);
 expect(r.body.data.answer).not.toContain(output);expect(r.body.data.answer.startsWith(topics.sound.facts.en)).toBe(true);
});
test.each(['What is sensory overload?','شنو حساسية الصوت؟','ليش يغطي اذانه من اصوات عالية؟'])('sound aliases remain recognized: %s',q=>expect(selectAwareness(q)?.topicIds).toContain('sound'));
