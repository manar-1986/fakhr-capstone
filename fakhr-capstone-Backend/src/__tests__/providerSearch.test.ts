jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {localCriteria,directoryIntent,disabilityAliases,DirectoryContext} from '../modules/directorySearch/criteria';
import {searchProviders,ProviderRecord} from '../modules/directorySearch/providers';
import {assessmentKnowledge,assessmentResponse,medicalDisclaimer} from '../modules/assessmentKnowledge/assessment';
import snapshot from '../modules/directorySearch/providers.snapshot.json';
const mockCreate=jest.fn(()=>{throw Error('Unexpected outbound AI call');});
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>({responses:{create:mockCreate}}))}));
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let auth:string;
beforeEach(async()=>{mockCreate.mockClear();const u=await User.create({email:'provider-test@example.invalid',password:'isolated-only'});auth='Bearer '+generateToken({userId:String(u._id)});});
const ctx=(extra={})=>({category:'rehabilitation',criteria:localCriteria('autism age 8'),language:'en',...extra}) as DirectoryContext;
const record=(extra={})=>({id:'isolated-only',category:'rehabilitation',branches:[{id:'branch',sourceStatus:'verified',profile:{services:{en:['Speech therapy']}},observations:[{sourceId:'isolated',page:1,needsAr:'التوحد',agesAr:'6–12 سنة'}]}],...extra}) as ProviderRecord;
test.each(Object.entries(disabilityAliases))('recognizes represented category %s locally',(key,terms)=>{expect(localCriteria(terms[0]).disabilities).toContain(key);expect(localCriteria(terms[terms.length-1]).disabilities).toContain(key);});
test.each([['وين أحسن دكتور نطق حق ولدي؟','doctor'],['ولدي عنده توحد، وين ألقى مركز مناسب؟','rehabilitation'],['أبي أخصائي علاج وظيفي بالكويت.','doctor'],['بنتي عندها متلازمة داون، وين ألقى حضانة؟','nursery'],['وين نادي رياضي للأطفال ذوي الإعاقة؟','sports'],['My child has cerebral palsy. Which centers could help?','rehabilitation']])('detects directory %s',(q,c)=>expect(directoryIntent(q)).toBe(c));
test('verified service evidence vs incomplete and excluded eligibility',()=>{
 expect(searchProviders(ctx(),[record()])[0].verification).toBe('verified');
 const incomplete=record();incomplete.branches[0].sourceStatus='unverified';incomplete.branches[0].observations[0].agesAr=null;
 expect(searchProviders(ctx(),[incomplete])[0].evidence[0].reasons).toEqual(expect.arrayContaining(['source_unverified','age_unknown']));
 const excluded=record();excluded.branches[0].observations.push({needsAr:'لا يقبل التوحد'});expect(searchProviders(ctx(),[excluded])).toEqual([]);
 expect(searchProviders(ctx({criteria:localCriteria('autism age 4')}),[record()])).toEqual([]);
 expect(searchProviders(ctx({criteria:localCriteria('visual disability age 8')}),[record()])).toEqual([]);
 expect(searchProviders(ctx(),[record(),record()])).toHaveLength(1);
});
test('no branch borrows another branch age or condition',()=>{
 const r=record();r.branches.push({...r.branches[0],id:'second',observations:[{needsAr:'داون',agesAr:'6–12 سنة'}]});r.branches[0].observations[0].agesAr='2–5 سنة';
 expect(searchProviders(ctx(),[r])).toEqual([]);
});
test('real catalog references are canonical, unique and inquiry only',()=>{
 const before=JSON.stringify(snapshot);
 for(const category of ['doctor','rehabilitation','nursery','sports'] as const){
  const refs=searchProviders(ctx({category,criteria:localCriteria(category==='sports'?'intellectual age 8':'autism age 8')}));
  for(const r of refs){expect(snapshot.records.some(x=>x.id===r.id&&x.category===category)).toBe(true);expect(r.verification).toBe('inquiry');}
 }
 expect(JSON.stringify(snapshot)).toBe(before);
 expect(new Set(snapshot.records.map(r=>r.id)).size).toBe(snapshot.records.length);
});
test('seven candidates retained, contacts do not imply service or report acceptance',()=>{
 expect(assessmentKnowledge.organizations).toHaveLength(7);
 for(const o of assessmentKnowledge.organizations){expect(o.serviceStatus).toBe('unverified');expect(o.acceptanceStatus).toBe('unverified');}
 expect(assessmentKnowledge.organizations.find(o=>o.id==='government-hospitals')?.candidatePhone).toBeNull();
 const answer=assessmentResponse('Where can I get IQ testing?','en').answer;
 expect(answer).toContain('No IQ-testing destination');expect(answer).toContain('24617345');expect(answer).toContain('Contact details not independently verified.');
 expect(answer.split(medicalDisclaimer.en)).toHaveLength(2);
 expect(assessmentResponse('هل تقرير الذكاء مقبول عند الهيئة؟','ar').answer).toContain('لا يمكننا تأكيد');
 expect(assessmentResponse('هل اختبار الذكاء يشخص التوحد؟','ar').answer).toContain('وحده لا يشخّص');
});
test('API maintains private criteria locally, bilingual context and auth; ignores fabricated references',async()=>{
 await request(app).post('/api/ai/ask').send({question:'doctor'}).expect(401);
 let r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'My child PRIVATE_NAME has autism. Which center?',locale:'ar',recommendations:[{id:'fake'}]}).expect(200);
 expect(r.body.data.language).toBe('en');expect(r.body.data.status).toBe('matches');expect(r.body.data.recommendations.length).toBeGreaterThan(0);expect(r.body.data.answer).not.toContain('How old');expect(JSON.stringify(r.body)).not.toContain('PRIVATE_NAME');
 r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'8',schoolContext:r.body.data.schoolContext}).expect(200);
 expect(r.body.data.schoolContext.criteria.age).toBe(8);expect(r.body.data.language).toBe('en');
 for(const q of ['وين أسوي اختبار ذكاء حق ولدي؟','PRIVATE_NAME medical history and password secret','My child has autism and is 8; which school?'])await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:q}).expect(200);
 expect(mockCreate).not.toHaveBeenCalled();
 await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'doctor',schoolContext:{category:'doctor',criteria:{age:-2}}}).expect(400);
});
