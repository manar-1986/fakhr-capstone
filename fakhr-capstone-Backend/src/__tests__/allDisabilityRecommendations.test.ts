jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {categories,localCriteria,disabilityAliases} from '../modules/directorySearch/criteria';
import {searchSchools,criteriaSchema,schoolResponse} from '../modules/directorySearch/recommendations';
import {searchProviders,providerResponse} from '../modules/directorySearch/providers';
import {assessmentKnowledge,assessmentResponse,medicalDisclaimer,withMedicalDisclaimer} from '../modules/assessmentKnowledge/assessment';
import schools from '../modules/directorySearch/schools.snapshot.json';
import providers from '../modules/directorySearch/providers.snapshot.json';
const mockCreate=jest.fn();
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>({responses:{create:mockCreate}}))}));
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let token:string;
beforeEach(async()=>{mockCreate.mockReset().mockResolvedValue({output_text:'Safe general guidance'});process.env.OPENAI_API_KEY='mock-only';const u=await User.create({email:'all-disabilities@example.invalid',password:'test-only'});token=generateToken({userId:String(u._id)});});
const ask=(question:string,schoolContext?:unknown)=>request(app).post('/api/ai/ask').set('Authorization','Bearer '+token).send({question,schoolContext});
const row=(needs:string)=>({sourceId:'test-only',page:1,needsAr:needs,agesAr:'3–12 سنة',stagesAr:'ابتدائي',areaAr:'السالمية',governorateAr:'حولي'});
const fixture=(category:string,needs:string)=>({id:'fixture-only',category,reviewStatus:'verified',observations:[row(needs)],branches:[{id:'fixture-branch',sourceStatus:'verified',reviewStatus:'verified',profile:{},observations:[row(needs)]}]}) as any;
const run=(category:typeof categories[number],c:ReturnType<typeof localCriteria>,records?:any[])=>category==='school'?searchSchools(c,records):searchProviders({category,criteria:c},records);

test.each([
 ['visual impairments','vision'],['عسر القراءة','learning'],['فرط حركة وتشتت انتباه','adhd'],['إعاقة مزدوجة','multiple'],
 ['ازدواج الإعاقة','multiple'],['physical impairments','motor'],['ديسلكسيا','learning'],['تأخر لغوي','speech'],
 ['متلازمة داون','down'],['شلل دماغي','cerebral-palsy'],['hearing impairment','hearing'],['تأخر نمائي','developmental'],
])('explicit terminology %s', (q,key)=>expect(localCriteria(q).disabilities).toContain(key));

test.each(['My child does not have visual impairments','طفلي لا يعاني من عسر القراءة','ولدي ما عنده فرط حركة','بنتي مو عندها إعاقة مزدوجة'])('negative conditions are not positive filters: %s',q=>expect(localCriteria(q).disabilities).toEqual([]));
test('language selection and unrelated words do not create a speech diagnosis',()=>expect(localCriteria('Please use English language').disabilities).toEqual([]));

test.each(Object.keys(disabilityAliases))('all five adapters support explicit %s evidence and retain canonical references',key=>{
 const c=criteriaSchema.parse({disabilities:[key],age:4});
 for(const category of categories){
  const result=run(category,c,[fixture(category,disabilityAliases[key][0])]);
  expect(result).toHaveLength(1);expect(result[0].verification).toBe('verified');
  const catalog=category==='school'?schools.records:providers.records;
  const before=JSON.stringify(catalog);const real=run(category,c);
  expect(new Set(real.map(r=>r.id)).size).toBe(real.length);
  for(const r of real){expect(catalog.some(x=>x.id===r.id)).toBe(true);expect(r.verification).toBe('inquiry');}
  expect(JSON.stringify(catalog)).toBe(before);
 }
});

test.each(categories)('%s broad support stays inquiry-only and respects branch restrictions',category=>{
 const c=criteriaSchema.parse({disabilities:['multiple'],age:4});
 const r=fixture(category,'جميع الإعاقات');
 const result=run(category,c,[r]);expect(result).toHaveLength(1);expect(result[0].verification).toBe('inquiry');expect(result[0].evidence[0].reasons).toContain('disability_unknown');
 expect(run(category,{...c,age:20},[r])).toEqual([]);
 r.branches[0].observations.push(row('لا يقبل إعاقات متعددة'));
 expect(run(category,c,[r])).toEqual([]);
 r.branches.push({...fixture(category,'إعاقات متعددة').branches[0],id:'eligible-branch'});
 const allowed=run(category,c,[r]);expect(allowed[0].branchIds).toEqual(['eligible-branch']);
 expect(run(category,{...c,area:'different place'},[r])).toEqual([]);
});

test('no age gate for service searches; missing age never establishes eligibility',()=>{
 for(const category of ['doctor','rehabilitation','sports'] as const){
  const c=localCriteria(category==='sports'?'sports':'occupational therapy');const r=providerResponse({category,criteria:c,language:'en'});
  expect(r.status).not.toBe('follow_up');expect(r.answer).not.toContain('How old');
 }
 expect(providerResponse({category:'sports',criteria:localCriteria('sports'),language:'en'}).recommendations.some(r=>r.id==='sports-al-tomooh')).toBe(true);
 const result=schoolResponse(localCriteria('Down syndrome'),'en');expect(result.recommendations.length).toBeGreaterThan(0);expect(result.answer).toContain('How old');expect(result.recommendations.every(r=>r.verification==='inquiry')).toBe(true);
 expect(run('doctor',localCriteria('autism'),[fixture('doctor','autism')])[0].evidence[0].reasons).toContain('age_unknown');
});

test('school service matching uses canonical bilingual aliases',()=>{
 const r=fixture('school','توحد');r.branches[0].publicProfile={services:{ar:['العلاج الوظيفي']}};
 const result=run('school',localCriteria('autism occupational therapy age 4'),[r]);expect(result[0].evidence[0].reasons).not.toContain('services_unknown');
});

test.each([
 ['Down syndrome school age 4 in Hawalli','show me options','What about centers?','en'],
 ['مدرسة لطفل عنده متلازمة داون عمره ٤ سنوات في حولي','المزيد','مراكز','ar'],
 ['أبي مدرسة حق ولدي عنده داون عمره ٤ سنوات في حولي','اوكي رشح','والمراكز؟','ar-KW'],
])('criteria survive bounded follow-ups: %s',async(q,follow,next,language)=>{
 const a=(await ask(q).expect(200)).body.data;const b=(await ask(follow,a.schoolContext).expect(200)).body.data;const c=(await ask(next,b.schoolContext).expect(200)).body.data;
 expect(b.schoolContext.category).toBe('school');expect(c.schoolContext.category).toBe('rehabilitation');
 for(const r of [a,b,c])expect(r.schoolContext.criteria).toMatchObject({disabilities:['down'],age:4,governorate:'حولي'});
 expect(c.language).toBe(language);expect(mockCreate).not.toHaveBeenCalled();
});

test('service and area survive category-only followup; unrelated topics do not retain diagnosis',async()=>{
 const a=(await ask('autism occupational therapy age 4 centers in السالمية').expect(200)).body.data;
 const b=(await ask('What about doctors?',a.schoolContext).expect(200)).body.data;
 expect(b.schoolContext.criteria).toMatchObject({disabilities:['autism'],services:['occupational'],age:4,area:'السالمية'});
 const c=(await ask('educational resources',b.schoolContext).expect(200)).body.data;expect(c.schoolContext.category).toBe('general');expect(c.schoolContext).not.toHaveProperty('criteria');
});

test.each(['ar','ar-KW','en'])('all seven contacts, exact numbers and scoped statuses in %s',language=>{
 const result=assessmentResponse(language==='en'?'Where can I get government approved IQ testing?':'وين أسوي اختبار ذكاء معتمد؟',language);
 for(const o of assessmentKnowledge.organizations){expect(result.answer).toContain(o.name[language==='en'?'en':'ar']);if(o.candidatePhone)expect(result.answer.split(o.candidatePhone)).toHaveLength(2);expect(o.serviceStatus).toBe('unverified');expect(o.acceptanceStatus).toBe('unverified');}
 expect(assessmentKnowledge.organizations).toHaveLength(7);
 expect(assessmentKnowledge.organizations.filter(o=>o.candidatePhone)).toHaveLength(6);
 expect(result.answer).toContain(language==='en'?'No specific phone supplied.':'لم يُزود رقم محدد.');
 expect(result.answer).toContain(language==='en'?'Referral requirements: unverified.':'متطلبات الإحالة: غير متحقق منها.');
 expect(result.answer).toContain(language==='en'?'Official report acceptance: unknown.':'قبول التقرير رسمياً: غير مؤكد.');
 const disclaimer=medicalDisclaimer[language==='en'?'en':'ar'];expect(result.answer.endsWith(disclaimer)).toBe(true);expect(result.answer.split(disclaimer)).toHaveLength(2);
});

test.each(['ar','en'])('medical footer normalization keeps answer first and one exact final notice: %s',language=>{
 const d=medicalDisclaimer[language as 'ar'|'en'];const answer=withMedicalDisclaimer(d+'\n\nHelpful answer\n\n'+d+'\n\nContact: 1861111',language);
 expect(answer.startsWith('Helpful answer')).toBe(true);expect(answer.indexOf('1861111')).toBeLessThan(answer.indexOf(d));expect(answer.endsWith(d)).toBe(true);expect(answer.split(d)).toHaveLength(2);
});

test.each(['autism schools age 8','developmental delay nursery age 4','intellectual disabilities sports clubs','مدرسة لطفل عنده داون','أبي حضانة لطفل عنده تأخر نمائي'])('ordinary education/sports response has eligibility notice only: %s',async q=>{
 const r=(await ask(q).expect(200)).body.data;expect(r.answer).not.toContain('Fakhr is an awareness');expect(r.answer).not.toContain('فخر منصة توعوية');expect(r.answer).toMatch(/(?:confirm|للتأكد)/);
});
test.each(['occupational therapy centers','وين ألقى دكتور نطق؟','IQ assessment','child development','therapy sessions'])('medical/therapy answer ends with exactly one full disclaimer: %s',async q=>{
 const r=(await ask(q).expect(200)).body.data;const d=medicalDisclaimer[r.language==='en'?'en':'ar'];expect(r.answer.endsWith(d)).toBe(true);expect(r.answer.split(d)).toHaveLength(2);
});
test('generated general answer is preserved; nonmedical guidance has no medical footer',async()=>{
 const r=(await ask('educational resources').expect(200)).body.data;expect(r.answer.startsWith('Safe general guidance')).toBe(true);expect(r.answer).not.toContain(medicalDisclaimer.en);expect(mockCreate).toHaveBeenCalled();
});

test('Kuwaiti plural category switches preserve authenticated session criteria without OpenAI',async()=>{
 let response=await ask('أبي مدرسة لطفل عنده توحد عمره ٨ سنوات في السالمية');
 expect(response.status).toBe(200);
 const initial=response.body.data.schoolContext.criteria;
 for(const [question,category] of [['والدكاترة؟','doctor'],['والمراكز؟','rehabilitation'],['والحضانات؟','nursery'],['والمدارس؟','school'],['والنوادي؟','sports']]){
  response=await ask(question,response.body.data.schoolContext);
  expect(response.status).toBe(200);
  expect(response.body.data.schoolContext.category).toBe(category);
  expect(response.body.data.schoolContext.criteria).toEqual(initial);
 }
 expect(mockCreate).not.toHaveBeenCalled();
});
