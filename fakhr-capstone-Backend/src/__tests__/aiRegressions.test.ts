jest.mock('../modules/ai/ai.transport',()=>({runBudgetedAI:async(config:unknown)=>{const {buildAIRequest}=require('../modules/ai/ai.requests');const OpenAI=require('openai').default;return new OpenAI({apiKey:'offline-only'}).responses.create(buildAIRequest(config));}}));
import {publicPrompt} from '../modules/awarenessKnowledge/retrieval';
import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import {localCriteria} from '../modules/directorySearch/criteria';
import {generalPrompts} from '../modules/ai/ai.service';
const mockCreate=jest.fn();
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>({responses:{create:mockCreate}}))}));
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
let auth:string;
beforeEach(async()=>{mockCreate.mockReset().mockResolvedValue({output_text:'Generated safe guidance'});process.env.OPENAI_API_KEY='mock-only';const u=await User.create({email:'regression@example.invalid',password:'temporary-only'});auth='Bearer '+generateToken({userId:String(u._id)});});
const ask=(question:string,schoolContext?:unknown,extra={})=>request(app).post('/api/ai/ask').set('Authorization',auth).send({question,schoolContext,...extra});
test.each(['My child does not have ADHD.','My child does not have autism.','طفلي لا يعاني من فرط الحركة','ولدي مو عنده توحد','بنتي ما عندها فرط الحركة','طفلي ليس مصاباً بالتوحد'])('negation clears prior criteria: %s',q=>{
 expect(localCriteria(q).disabilities).toEqual([]);
 const previous=localCriteria(/ADHD|الحركة/.test(q)?'ADHD':'autism');expect(localCriteria(q,previous).disabilities).toEqual([]);
});
test('mixed conditions keep positive evidence only',()=>expect(localCriteria('My child does not have ADHD but has autism').disabilities).toEqual(['autism']));
test.each(['8-year-old','8 years old','عمره ٨ سنوات','عمرها ثمان سنوات'])('age expression %s',q=>expect(localCriteria(q).age).toBe(8));
test.each([['العلاج الوظيفي','occupational'],['Occupational therapy','occupational'],['Speech therapy','speech'],['علاج النطق','speech']])('service %s',(q,s)=>expect(localCriteria(q).services).toContain(s));
test.each([['My child has autism and is 8 years old. Which schools are suitable?','What about centers?','en'],['ولدي عنده توحد عمره ٨ سنوات أبي مدرسة','والمراكز؟','ar-KW']])('category transition preserves criteria and language %s',async(q,next,lang)=>{
 const first=await ask(q).expect(200);const second=await ask(next,first.body.data.schoolContext).expect(200);
 expect(second.body.data.schoolContext).toMatchObject({category:'rehabilitation',criteria:{disabilities:['autism'],age:8},language:lang});expect(mockCreate).not.toHaveBeenCalled();
});
test('negative follow-up clears previously retained diagnosis',async()=>{
 const first=await ask('ADHD school age 8').expect(200);const next=await ask('My child does not have ADHD.',first.body.data.schoolContext).expect(200);
 expect(next.body.data.schoolContext.criteria.disabilities).toEqual([]);expect(next.body.data.recommendations).toEqual([]);
});
test.each(['government approval?','Do I need a referral?','How can I book an appointment?','هل التقرير معتمد حكومياً؟','أحتاج تحويل؟','شلون أحجز موعد؟'])('assessment context handles %s',async q=>{
 const first=await ask('Where can I get IQ testing?').expect(200);const next=await ask(q,first.body.data.schoolContext).expect(200);
 expect(next.body.data.status).toBe('assessment_information');expect(next.body.data.schoolContext.category).toBe('assessment');expect(mockCreate).not.toHaveBeenCalled();
});
test.each([['child development','development'],['activities','activities'],['weekly plans','plans'],['educational resources','products'],['sessions and appointments','sessions'],['parent guidance','parenting']])('general AI is model-generated for %s',async(q,topic)=>{
 if(topic==='development')mockCreate.mockResolvedValueOnce({output_text:'Development varies. Offer accessible practice and seek professional advice for lost skills. Generated safe guidance'});
 const r=await ask(q).expect(200);expect(r.body.data.answer).toContain('Generated safe guidance');expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({input:topic==='development'?publicPrompt({category:'awareness',topicIds:['development']},'en'):generalPrompts[topic as keyof typeof generalPrompts],store:false,model:'gpt-5-mini'}));
});
test('personal narrative, credentials, profile and history never enter model payload',async()=>{
 const r=await ask('Suggest activities for PRIVATE_NAME with autism age 8, password PRIVATE_PASSWORD, email private@example.invalid',undefined,{childProfile:{name:'PRIVATE_CHILD'},history:['PRIVATE_HISTORY'],account:'PRIVATE_ACCOUNT'}).expect(200);
 const payload=JSON.stringify(mockCreate.mock.calls);for(const value of ['PRIVATE_NAME','autism','age 8','PRIVATE_PASSWORD','private@example.invalid','PRIVATE_CHILD','PRIVATE_HISTORY','PRIVATE_ACCOUNT',auth])expect(payload).not.toContain(value);
 expect(mockCreate.mock.calls[0][0].input).toBe(generalPrompts.activities);expect(r.body.data.answer).toContain('not personalized');
});
test.each([['ساعدني في الأنشطة','Arabic'],['أبي أنشطة حق ولدي','Kuwaiti Arabic'],['Help with activities','English']])('language instruction %s',async(q,language)=>{await ask(q).expect(200);expect(mockCreate.mock.calls[0][0].instructions).toContain(language);});
test('general followup keeps only topic and language; explicit switch wins',async()=>{
 const first=await ask('Help with activities').expect(200);await ask('more',first.body.data.schoolContext).expect(200);expect(mockCreate).toHaveBeenCalledTimes(2);
 const switched=await ask('Where can I get IQ testing?',first.body.data.schoolContext).expect(200);expect(switched.body.data.schoolContext.category).toBe('assessment');expect(mockCreate).toHaveBeenCalledTimes(2);
});
test('unrecognized personal question fails closed without outbound text',async()=>{const r=await ask('PRIVATE_NAME medical report PRIVATE_SECRET').expect(200);expect(r.body.data.answer).toContain('cannot safely');expect(mockCreate).not.toHaveBeenCalled();});
test('provider failures are sanitized and empty output fails',async()=>{mockCreate.mockRejectedValueOnce(new Error('PRIVATE_ERROR'));let r=await ask('activities').expect(500);expect(JSON.stringify(r.body)).not.toContain('PRIVATE_ERROR');mockCreate.mockResolvedValueOnce({output_text:''});await ask('activities').expect(500);});
test('invalid fabricated conversation state is rejected',async()=>{await ask('more',{category:'general',topic:'PRIVATE_PROMPT'}).expect(400);expect(mockCreate).not.toHaveBeenCalled();});

test('Arabic negation does not match inside appointment words',()=>expect(localCriteria('موعد لطفل عنده توحد').disabilities).toEqual(['autism']));
