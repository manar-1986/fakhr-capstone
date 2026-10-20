jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {localCriteria} from '../modules/directorySearch/criteria';
import {searchProviders,providerResponse} from '../modules/directorySearch/providers';
import {medicalDisclaimer} from '../modules/assessmentKnowledge/assessment';
import snapshot from '../modules/directorySearch/providers.snapshot.json';
const mockCreate=jest.fn(()=>{throw Error('No outbound OpenAI for directory searches');});
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>({responses:{create:mockCreate}}))}));
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let auth:string;
beforeEach(async()=>{mockCreate.mockClear();const u=await User.create({email:'specialists@example.invalid',password:'isolated-only'});auth='Bearer '+generateToken({userId:String(u._id)});});
const ask=(question:string,schoolContext?:unknown)=>request(app).post('/api/ai/ask').set('Authorization',auth).send({question,schoolContext});
const examples=[
 ['ابي اخصائيه سلوكي','behavioral'],['أبي أخصائية سلوكية','behavioral'],['أبي علاج سلوكي','behavioral'],['Behavioral therapist','behavioral'],['Behavior specialist','behavioral'],
 ['أبي أخصائي تعديل سلوك','behaviorModification'],['Behavior modification specialist','behaviorModification'],['ABA specialist','aba'],
 ['ابي اخصائيه نطق','speech'],['أبي أخصائي نطق','speech'],['أبي دكتورة تخاطب','speech'],['Speech therapist','speech'],['Speech-language therapist','speech'],
 ['أبي أخصائية علاج وظيفي','occupational'],['أبي أخصائي وظيفي','occupational'],['أبي علاج وظيفي حق ولدي','occupational'],['أبي دكتورة علاج وظيفي','occupational'],['Occupational therapist','occupational'],['Occupational therapy','occupational'],['OT specialist','occupational']
];
test.each(examples)('retrieves documented services without age: %s',async(q,service)=>{
 const r=await ask(q).expect(200);const d=r.body.data;
 expect(d.status).toBe('matches');expect(d.schoolContext.criteria.services).toEqual([service]);expect(d.schoolContext.criteria.age).toBeNull();
 expect(d.recommendations.length).toBeGreaterThan(0);expect(mockCreate).not.toHaveBeenCalled();
 for(const ref of d.recommendations)expect(snapshot.records.some(r=>r.id===ref.id&&r.category===ref.category)).toBe(true);
 const disclaimer=medicalDisclaimer[d.language==='en'?'en':'ar'];expect(d.answer.split(disclaimer)).toHaveLength(2);expect(d.answer.endsWith(disclaimer)).toBe(true);
});
test('speech returns doctors and centers, all documented service matches, never invented credentials',async()=>{
 const d=(await ask('أبي أخصائية نطق').expect(200)).body.data;
 expect(new Set(d.recommendations.map((r:any)=>r.category))).toEqual(new Set(['doctor','rehabilitation']));
 expect(d.recommendations.length).toBeGreaterThan(5);
 for(const id of ['center-speech-plus','center-abc-kuwait','center-slp-shahad-shehab','center-initials-clinic'])expect(d.recommendations.some((r:any)=>r.id===id)).toBe(true);
 const clinic=d.recommendations.find((r:any)=>r.id==='center-speech-plus');expect(clinic.evidence[0].reasons).toContain('qualification_unverified');
 for(const id of ['doctor-fatima-al-awadhi','doctor-hadeel-yassin-faras','doctor-dalal-sulaiman-al-shayji'])expect(d.recommendations.some((r:any)=>r.id===id)).toBe(false);
 expect(d.schoolContext.criteria.practitionerPreference).toBe('female');expect(d.answer).toContain('تأكيد توفر أخصائية');
 expect(d.recommendations.every((r:any)=>r.evidence.every((e:any)=>e.reasons.includes('female_availability_unknown')))).toBe(true);
});
test.each(['أبي أخصائية علاج وظيفي','female occupational therapist'])('OT preference and criteria survive category and location follow-ups: %s',async q=>{
 const a=(await ask(q).expect(200)).body.data;
 const b=(await ask('عمره ٨ سنوات في السالمية',a.schoolContext).expect(200)).body.data;
 const c=(await ask('والمراكز؟',b.schoolContext).expect(200)).body.data;
 expect(c.schoolContext.criteria).toMatchObject({services:['occupational'],age:8,area:'السالمية',practitionerPreference:'female',specialistSearch:true});
 expect(c.recommendations.length).toBeGreaterThan(0);
});
test('OT includes the existing independent practitioner without relabeling their category',async()=>{
 const d=(await ask('OT specialist').expect(200)).body.data;
 expect(d.recommendations).toEqual(expect.arrayContaining([expect.objectContaining({id:'provider-maram-aldihani',category:'rehabilitation'})]));
});
test('strict specialty, age and branch exclusions, no psychology or employment substitution',()=>{
 const rec=(id:string,service:string,ages='2-5')=>({id,category:'rehabilitation',branches:[{id,sourceStatus:'unverified',observations:[],profile:{services:{en:[service]},ages:{en:ages}}}]});
 const catalog=[rec('ot','Occupational therapy'),rec('pt','Physical therapy'),rec('psych','Psychological counseling'),rec('jobs','Employment services'),rec('cbt','Cognitive Behavioral Therapy')];
 expect(searchProviders({category:'doctor',criteria:localCriteria('OT specialist age 4')},catalog).map(r=>r.id)).toEqual(['ot']);
 expect(searchProviders({category:'doctor',criteria:localCriteria('OT specialist age 8')},catalog)).toEqual([]);
 expect(searchProviders({category:'doctor',criteria:localCriteria('Behavior specialist age 4')},catalog)).toEqual([]);
 const branched=rec('branches','Occupational therapy');branched.branches.push({...rec('older','Physical therapy','6-12').branches[0]});
 expect(searchProviders({category:'doctor',criteria:localCriteria('OT specialist age 8')},[branched])).toEqual([]);
});
test('no misleading notice for clarification or no match',()=>{
 for(const criteria of [localCriteria('doctor'),localCriteria('OT specialist age 8 in nowhere')]){
  if(criteria.services.length)criteria.services=['unsupported-test-service'];
  const d=providerResponse({category:'doctor',criteria,language:'en'});
  expect(d.recommendations).toHaveLength(0);expect(d.answer).not.toContain('Please contact');
 }
});
test('documented behavioral subtypes are separate and psychotherapy is not inferred',()=>{
 expect(localCriteria('ABA specialist').services).toEqual(['aba']);
 expect(localCriteria('Behavior modification specialist').services).toEqual(['behaviorModification']);
 expect(localCriteria('Occupational therapist').services).toEqual(['occupational']);
 expect(localCriteria('psychological counseling specialist').services).toEqual(['psychology']);
});

test.each(['والعلاج الوظيفي؟','والوظيفي؟','And OT?'])('bounded OT follow-up replaces speech service and keeps female preference: %s',async q=>{
 const a=(await ask('أبي أخصائية نطق').expect(200)).body.data;
 const b=(await ask(q,a.schoolContext).expect(200)).body.data;
 expect(b.schoolContext.criteria).toMatchObject({services:['occupational'],practitionerPreference:'female',specialistSearch:true});expect(b.recommendations.length).toBeGreaterThan(0);
});

// Category transitions must carry common criteria, never unrelated therapy filters.
test.each([
 ['أبي أخصائية نطق لطفل عنده إعاقة ذهنية عمره ٨ سنوات في السالمية','والمدارس؟','والحضانات؟','والنوادي؟','والدكاترة؟'],
 ['أريد أخصائية علاج وظيفي لطفل لديه إعاقة ذهنية عمره ٨ سنوات في السالمية','أريد مدرسة','أريد حضانة','أريد نادي رياضي','أريد أخصائي'],
 ['female speech therapist for intellectual disabilities age 8 in Salmiya','What about schools?','What about nurseries?','What about sports clubs?','What about specialists?'],
])('professional preference survives unrelated directory switches: %s',async(first,school,nursery,sports,back)=>{
 let d=(await ask(first).expect(200)).body.data;
 const initial=d.schoolContext.criteria;
 expect(initial.practitionerPreference).toBe('female');
 for(const [q,category] of [[school,'school'],[nursery,'nursery'],[sports,'sports']]){
  d=(await ask(q,d.schoolContext).expect(200)).body.data;
  expect(d.schoolContext.category).toBe(category);
  expect(d.schoolContext.criteria).toMatchObject({disabilities:initial.disabilities,age:8,area:initial.area,governorate:initial.governorate,services:localCriteria(q).services,practitionerPreference:null,specialistSearch:false});
  expect(d.schoolContext.criteria.specialistMemory.practitionerPreference).toBe('female');
  expect(d.answer).not.toMatch(/female-specialist|توفر أخصائية/);
  expect(d.recommendations.every((r:any)=>r.evidence.every((e:any)=>!e.reasons.includes('female_availability_unknown')))).toBe(true);
 }
 d=(await ask(back,d.schoolContext).expect(200)).body.data;
 expect(d.schoolContext.criteria).toMatchObject({services:initial.services,practitionerPreference:'female',specialistSearch:true,age:8,area:initial.area,stage:null});
 expect(mockCreate).not.toHaveBeenCalled();
});
test.each(['والنوادي؟','What about sports clubs?'])('Al Tomooh has no inherited staffing warning: %s',async question=>{
 const a=(await ask('أبي أخصائية نطق لطفل عنده إعاقة ذهنية').expect(200)).body.data;
 const b=(await ask(question,a.schoolContext).expect(200)).body.data;
 const club=b.recommendations.find((r:any)=>r.id==='sports-al-tomooh');
 expect(club).toBeDefined();expect(club.category).toBe('sports');
 expect(club.evidence.every((e:any)=>!e.reasons.includes('female_availability_unknown'))).toBe(true);
 expect(b.answer).not.toMatch(/female-specialist|توفر أخصائية/);
});
test('explicit school service stays active only there, then a new specialist service replaces remembered speech',async()=>{
 const a=(await ask('female speech therapist for intellectual disabilities').expect(200)).body.data;
 const b=(await ask('schools with occupational therapy',a.schoolContext).expect(200)).body.data;
 expect(b.schoolContext.criteria.services).toEqual(['occupational']);
 expect(b.schoolContext.criteria.practitionerPreference).toBeNull();
 const c=(await ask('sports clubs',b.schoolContext).expect(200)).body.data;
 expect(c.schoolContext.criteria.services).toEqual(['sports']);
 const d=(await ask('ABA specialist',c.schoolContext).expect(200)).body.data;
 expect(d.schoolContext.criteria.services).toEqual(['aba']);expect(d.schoolContext.criteria.practitionerPreference).toBe('female');
});
test('provider presentation rejects stale practitioner warnings on unrelated categories',()=>{
 for(const category of ['nursery','sports'] as const){
  const ctx={category,criteria:localCriteria('female speech therapist for intellectual disabilities'),language:'en' as const};
  const d=providerResponse(ctx);
  expect(d.answer).not.toContain('female-specialist');
  expect(d.recommendations.every(r=>r.evidence.every((e:any)=>!e.reasons.includes('female_availability_unknown')))).toBe(true);
 }
});

test('explicitly removing practitioner preference remains removed after a category round trip',async()=>{
 const a=(await ask('female speech therapist for intellectual disabilities').expect(200)).body.data;
 const b=(await ask('speech therapist no gender preference',a.schoolContext).expect(200)).body.data;
 const c=(await ask('sports clubs',b.schoolContext).expect(200)).body.data;
 const d=(await ask('specialists',c.schoolContext).expect(200)).body.data;
 expect(d.schoolContext.criteria.practitionerPreference).toBeNull();expect(d.answer).not.toContain('female-specialist');
 expect(d.schoolContext.criteria.services).toEqual(['speech']);
});
