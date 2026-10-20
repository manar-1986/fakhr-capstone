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
const rows=[["haircut","ليش ولدي ما يتحمل قص شعره؟","لماذا يرفض طفلي قص الشعر؟","Why does my child hate haircuts?"],["hairWashing","ليش بنتي ما تبي اغسل شعرها؟","لماذا يرفض طفلي غسل شعره؟","Why does my child dislike hair washing?"],["hairBrushing","ليش بنتي تصيح لما امشط شعرها؟","لماذا يرفض طفلي تمشيط الشعر؟","Why does hair brushing upset my child?"],["nailCare","ليش ولدي ما يخليني اقص اظافره؟","لماذا يرفض طفلي تقليم الأظافر؟","Why does my child hate nail cutting?"],["toothbrushing","ليش بنتي ما تبي تفرش اسنانها؟","لماذا يرفض طفلي تنظيف الأسنان؟","Why does my child hate brushing teeth?"],["clothing","ليش ولدي يتضايق من تيكت الملابس؟","لماذا ينزعج طفلي من ملمس الملابس؟","Why do clothing labels bother my child?"],["sensory","ليش ولدي يتضايق من لمس بعض الأشياء؟","لماذا طفلي حساس للمس؟","Why is my child sensitive to touch?"],["sound","ليش ولدي يتضايق من اصوات عالية؟","لماذا ينزعج طفلي من الأصوات العالية؟","Why does my child hate loud sounds?"],["brightLight","ليش بنتي تتضايق من الليت القوي؟","لماذا ينزعج طفلي من الضوء الساطع؟","Why do bright lights bother my child?"]];
const cases=rows.flatMap(([id,...qs])=>qs.map((q,i)=>({id,q,lang:i===2?'en':'ar'})));
test.each(cases)('specific grooming answer: $q',async({id,q,lang})=>{
 const r=await ask(q).expect(200),d=r.body.data,l=lang as 'ar'|'en';
 expect(d.status).toBe('educational_guidance');expect(d.schoolContext.topicIds).toEqual([id]);
 expect(d.answer.startsWith(topics[id].facts[l])).toBe(true);
 expect(d.answer).toContain(topics[id].support[l]);expect(d.answer).toContain(topics[id].referral[l]);
 expect(d.awareness.sources.map((s:any)=>s.id)).toEqual(expect.arrayContaining(topics[id].sources));
 expect(d.answer.indexOf('https://')).toBeGreaterThan(d.answer.indexOf(topics[id].referral[l]));
 expect(d.answer.split(medicalDisclaimer[l])).toHaveLength(2);expect(d.answer.endsWith(medicalDisclaimer[l])).toBe(true);
 expect(JSON.stringify(mockCreate.mock.calls)).not.toContain(q);expect(mockCreate.mock.calls[0][0].store).toBe(false);
 expect(d.schoolContext.categoryId).toBeUndefined();
});
test.each(cases)('generic sensory answer fails relevance: $q',async({id,q,lang})=>{
 const generic=lang==='en'?'Sensory needs vary. Offer comfortable choices and discuss with a professional.':'الاحتياجات الحسية تختلف. وفروا خيارات مريحة وراجعوا المختص.';
 if(id!=='sensory')expect(clearlyIrrelevantAwareness(generic,{category:'awareness',topicIds:[id]})).toBe(true);
 mockCreate.mockResolvedValue({output_text:'Try a short play activity. Ask a professional.'});
 const r=await ask(q).expect(200),l=lang as 'ar'|'en';
 expect(r.body.data.answer.startsWith(topics[id].facts[l])).toBe(true);
 expect(r.body.data.answer.endsWith(medicalDisclaimer[l])).toBe(true);
});
test.each(rows)('followups preserve concern and new concern replaces it: %s',(id,q)=>{
 const previous=selectAwareness(q)!;
 for(const follow of ['شنو اسوي؟','شلون اساعدها؟','متى اراجع الطبيب؟','How can I help her?'])expect(selectAwareness(follow,previous)?.topicIds).toEqual([id]);
 expect(selectAwareness('Why does my child hate haircuts?',previous)?.topicIds).toEqual(['haircut']);
});
test('Arabic word fragments do not turn brushing into walking',()=>{
 expect(selectAwareness('لماذا يرفض طفلي تمشيط الشعر؟')?.topicIds).toEqual(['hairBrushing']);
 expect(selectAwareness('ليش ولدي يمشي على أطراف أصابعه؟')?.topicIds).toEqual(['toeWalking']);
 expect(selectAwareness('ليش يتأخر بالمشي؟')?.topicIds).toEqual(['motorDelay']);
});
test.each(['ar','en'])('specific source bundles and fallback quality %s',lang=>{
 for(const [id]of rows){const ctx={category:'awareness' as const,topicIds:[id]};
 expect(clearlyIrrelevantAwareness(safeEducationalFallback(ctx,lang),ctx)).toBe(false);
 for(const claim of evidenceFor(ctx).claims){expect(claim.clinicalReview).toBe('pending');for(const source of claim.sourceIds)expect(sources[source]).toBeDefined();}
 }
});
test('private narrative and diagnosis never reach mock',async()=>{
 await ask('PRIVATE_NAME autism: Why does my child hate haircuts? private@example.invalid',undefined,{childProfile:{name:'PRIVATE_CHILD'},history:['PRIVATE_HISTORY']}).expect(200);
 const sent=JSON.stringify(mockCreate.mock.calls);for(const term of ['PRIVATE_','private@example.invalid','autism',auth])expect(sent).not.toContain(term);
});
test('followup through authenticated API stays on grooming',async()=>{
 const first=await ask('ليش ولدي ما يتحمل قص شعره؟').expect(200);
 const next=await ask('شلون اساعده؟',first.body.data.schoolContext).expect(200);
 expect(next.body.data.schoolContext.topicIds).toEqual(['haircut']);
});
test('referral guidance distinguishes discomfort from urgent symptoms',()=>{
 expect(topics.toothbrushing.referral.en).toContain('difficulty breathing or swallowing');
 expect(topics.brightLight.referral.en).toContain('Loss of sight');
 expect(urgentResponse('Why does my child hate haircuts?','en')).toBeUndefined();
 expect(urgentResponse('My child cannot breathe','en')).toContain('emergency');
});
