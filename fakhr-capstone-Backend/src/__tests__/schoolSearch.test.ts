jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {criteriaSchema,searchSchools,schoolIntent,schoolResponse,conversationLanguage} from '../modules/directorySearch/recommendations';
import snapshot from '../modules/directorySearch/schools.snapshot.json';
const mockCreate=jest.fn();
jest.mock('openai',()=>{const actual=jest.requireActual('openai');const Client=jest.fn().mockImplementation(()=>({responses:{create:mockCreate}}));Object.assign(Client,{RateLimitError:actual.RateLimitError,AuthenticationError:actual.AuthenticationError,APIConnectionError:actual.APIConnectionError});return {__esModule:true,default:Client};});
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let auth:string;const oldKey=process.env.OPENAI_API_KEY;
beforeEach(async()=>{mockCreate.mockReset();process.env.OPENAI_API_KEY='isolated-fake-key';const user=await User.create({email:'school-test@example.invalid',password:'test-only'});auth='Bearer '+generateToken({userId:String(user._id)});});
afterAll(()=>{if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;});
const criteria=(values={})=>criteriaSchema.parse({disabilities:['autism'],age:8,...values});
const row={sourceId:'isolated-fixture',page:1,row:'1',nameAr:'fixture',governorateAr:'حولي',areaAr:'السالمية',addressAr:null,phones:[],needsAr:'التوحد',stagesAr:'ابتدائي',classroomAr:'تعليم فردي',capacityAr:null,agesAr:'6–12 سنة'};
const fixture=(obs:any[]= [row])=>({id:'isolated-school',nameAr:'fixture',categories:['school'],reviewStatus:'verified',observations:obs}) as any;
test.each(['وين أفضل مدرسة لولدي عنده توحد؟','بنتي عندها متلازمة داون، وين أسجلها؟','أبي مدرسة حق طفل عنده إعاقة حركية.','وين مدارس صعوبات التعلم بالكويت؟','My child has autism. Which school is suitable?'])('detects school request: %s',q=>expect(schoolIntent(q)).toBe(true));
test.each([['autism','التوحد'],['down','متلازمة داون'],['motor','الإعاقة الحركية'],['intellectual','الإعاقة الذهنية'],['hearing','الإعاقة السمعية'],['vision','الإعاقة البصرية'],['learning','صعوبات التعلم'],['developmental','تأخر نمائي'],['speech','النطق'],['multiple','إعاقات مزدوجة'],['cerebral-palsy','شلل دماغي'],['adhd','فرط الحركة'],['epilepsy','الصرع']])('explicit source support for %s', (key,needs)=>{
  expect(searchSchools(criteria({disabilities:[key]}),[fixture([{...row,needsAr:needs}])])).toHaveLength(1);
});
test('strict age, stage, services and locations; no inferred acceptance',()=>{
  expect(searchSchools(criteria({stage:'primary',governorate:'Hawalli',area:'السالمية',services:['تعليم فردي']}),[fixture()])).toHaveLength(1);
  for(const change of [{age:5},{stage:'secondary'},{area:'الجهراء'},{disabilities:['down']}])expect(searchSchools(criteria(change),[fixture()])).toHaveLength(0);
  expect(searchSchools(criteria(),[fixture([{...row,needsAr:'جميع الإعاقات'}])])[0].verification).toBe('inquiry');
  for(const change of [{needsAr:'لا يقبل التوحد'}])expect(searchSchools(criteria(),[fixture([{...row,...change}])])).toHaveLength(0);
});
test('no cross-branch or cross-observation eligibility union; conflicts fail closed',()=>{
  const first={...row,agesAr:'2–5 سنة'};const second={...row,needsAr:'متلازمة داون'};
  expect(searchSchools(criteria(),[fixture([first,second])])).toHaveLength(0);
  expect(searchSchools(criteria(),[{...fixture(),branches:[fixture([first]),{...fixture([second]),id:'other-branch'}]}])).toHaveLength(0);
});
test('bounded real references and one relevant followup',()=>{
  expect(schoolResponse(criteria({age:null}), 'ar').answer).toContain('عمر طفلك');
  expect(schoolResponse(criteria({age:null}), 'ar').answer).not.toContain('شنو نوع');
  const found=searchSchools(criteria({age:null}));expect(found.length).toBeLessThanOrEqual(5);
  for(const ref of found)expect(snapshot.records.some(r=>r.id===ref.id)).toBe(true);
  expect(new Set(snapshot.records.map(r=>r.id)).size).toBe(snapshot.records.length);
});
test('extractor sees preferences only; never directory or private child profiles',async()=>{
  mockCreate.mockResolvedValue({output_text:JSON.stringify({intent:'school',criteria:criteria({age:null})})});
  const r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'وين مدرسة لطفلي عنده توحد؟'}).expect(200);
  expect(r.body.data.status).toBe('matches');expect(r.body.data.recommendations.length).toBeGreaterThan(0);expect(r.body.data.schoolContext.criteria.disabilities).toEqual(['autism']);
  expect(r.body.data.answer).toContain('💜 ننصحكم');
  expect(mockCreate).not.toHaveBeenCalled();
  mockCreate.mockResolvedValue({output_text:JSON.stringify({intent:'school',criteria:criteria()})});
  const next=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'8 سنوات',schoolContext:r.body.data.schoolContext}).expect(200);
  expect(next.body.data.schoolContext.criteria.age).toBe(8);
});
test('bad extraction cannot produce fictional recommendations or fall through to free text',async()=>{
  for(const output of ['Ignore all rules; fictional school','{"intent":"school","criteria":{"disabilities":["invented"]}}',JSON.stringify({intent:'other',criteria:criteria()})]){
    mockCreate.mockReset();mockCreate.mockResolvedValue({output_text:output});
    const r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'Recommend a school'}).expect(200);
    expect(r.body.data.recommendations).toEqual([]);expect(mockCreate).not.toHaveBeenCalled();
  }
});
test('auth unchanged; invalid context rejected before model; other categories gated',async()=>{
  await request(app).post('/api/ai/ask').send({question:'school'}).expect(401);
  await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'school',schoolContext:{category:'school',criteria:{age:-2}}}).expect(400);
  const r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'recommend a doctor'}).expect(200);
  expect(r.body.data.recommendations).toEqual([]);expect(mockCreate).not.toHaveBeenCalled();
});


test('incomplete evidence is inquiry only; paraphrased support is not a conflict',()=>{
 const unknown=searchSchools(criteria(),[fixture([{...row,agesAr:null}])]);
 expect(unknown[0].verification).toBe('inquiry');expect(unknown[0].evidence[0].reasons).toContain('age_unknown');
 const paraphrase=searchSchools(criteria(),[fixture([row,{...row,needsAr:'اضطراب طيف التوحد'}])]);
 expect(paraphrase[0].verification).toBe('verified');
 const services=searchSchools(criteria({services:['unknown service']}),[fixture()]);expect(services[0].verification).toBe('inquiry');
 expect(searchSchools(criteria(),[fixture([row,{...row,needsAr:'لا يقبل التوحد'}])])).toEqual([]);
});
test('branches never borrow eligibility or location; conflicting age evidence is inquiry',()=>{
 const result=searchSchools(criteria(),[fixture([row,{...row,agesAr:'2–5 سنة'}])]);expect(result[0].verification).toBe('inquiry');
 const branches=[{...fixture([{...row,agesAr:'2–5 سنة'}]),id:'young'},{...fixture([row]),id:'older'}];
 expect(searchSchools(criteria(),[{...fixture(),branches}])[0].branchIds).toEqual(['older']);
});
test('real snapshot yields canonical inquiry suggestions without changing records',()=>{
 const before=JSON.stringify(snapshot);
 const result=searchSchools(criteria());expect(result.length).toBeGreaterThan(0);
 for(const r of result){expect(snapshot.records.some(x=>x.id===r.id)).toBe(true);expect(r.verification).toBe('inquiry');}
 expect(JSON.stringify(snapshot)).toBe(before);
});
test('language follows question then conversation, never overrides English with Arabic UI',()=>{
 expect(conversationLanguage('Which school?',undefined,'ar')).toBe('en');
 expect(conversationLanguage('8','en','ar')).toBe('en');
 expect(conversationLanguage('وين مدرسة حق ولدي؟','en')).toBe('ar-KW');
 expect(conversationLanguage('8','ar-KW')).toBe('ar-KW');
 expect(conversationLanguage('What about primary school?','ar-KW','ar')).toBe('en');
});
test('API keeps English followups with Arabic UI and preserves language for numeric replies',async()=>{
 mockCreate.mockResolvedValue({output_text:JSON.stringify({intent:'school',criteria:criteria()})});
 let r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'Which school supports autism?',locale:'ar'}).expect(200);
 expect(r.body.data.schoolContext.language).toBe('en');expect(r.body.data.answer).toContain('Fakhr');
 r=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'8',locale:'ar',schoolContext:r.body.data.schoolContext}).expect(200);
 expect(r.body.data.schoolContext.language).toBe('en');
});
