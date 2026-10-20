import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import {runBudgetedAI} from '../modules/ai/ai.transport';
import {Ledger, AI_POLICY, provisionAIBudget, reserveAI, claimAI, completeAI} from '../modules/ai/ai.budget';
import routes from '../modules/ai/ai.routes';
import {errorHandler} from '../middlewares/error.middleware';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
const mockCreate=jest.fn();
jest.mock('openai',()=>({__esModule:true,default:jest.fn().mockImplementation(()=>({responses:{create:mockCreate}}))}));
const config={category:'general',topic:'plans',language:'en'};
const original={...process.env};
const app=express();app.use(express.json());app.use('/api/ai',routes);app.use(errorHandler);
const ledger=()=>mongoose.connection.collection<Ledger>('ai_budget_ledgers');
beforeEach(async()=>{
  process.env.FAKHR_AI_ENABLED='false';
  process.env.FAKHR_AI_OPENAI_API_KEY='offline-synthetic-key';
  process.env.FAKHR_AI_LEDGER_ANCHOR='a'.repeat(64);
  process.env.FAKHR_AI_LEDGER_SIGNING_KEY='b'.repeat(64); process.env.FAKHR_AI_WITNESS_SIGNING_KEY='c'.repeat(64);
  mockCreate.mockReset().mockResolvedValue({status:'completed',output_text:'General educational guidance.',usage:{input_tokens:400,output_tokens:100}});
  await provisionAIBudget();
  process.env.FAKHR_AI_ENABLED='true';
});
afterAll(()=>{for(const key of ['FAKHR_AI_ENABLED','FAKHR_AI_OPENAI_API_KEY','FAKHR_AI_LEDGER_ANCHOR','FAKHR_AI_LEDGER_SIGNING_KEY']) {
 if(original[key]===undefined)delete process.env[key];else process.env[key]=original[key];
}});
test('disabled by default and rejects private payloads without dispatch',async()=>{
 delete process.env.FAKHR_AI_ENABLED;
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 process.env.FAKHR_AI_ENABLED='true';
 await expect(runBudgetedAI({...config,question:'private narrative'})).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
});
test('signed persistent reservation precedes dispatch; only usage metadata is stored',async()=>{
 mockCreate.mockImplementation(async()=>{
  const doc=await ledger().findOne({_id:AI_POLICY.id});
  expect(doc?.attempts[0].state).toBe('dispatching');
  return {status:'completed',output_text:'General educational guidance.',usage:{input_tokens:400,output_tokens:100}};
 });
 await expect(runBudgetedAI(config)).resolves.toEqual({output_text:'General educational guidance.'});
 expect(OpenAI).toHaveBeenLastCalledWith(expect.objectContaining({maxRetries:0,timeout:20000,logLevel:'off',baseURL:'https://api.openai.com/v1'}));
 expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({model:'gpt-5-mini',store:false,max_output_tokens:8000,service_tier:'default'}),expect.objectContaining({signal:expect.any(AbortSignal)}));
 const text=JSON.stringify(await ledger().findOne({_id:AI_POLICY.id}));
 expect(text).not.toContain('offline-synthetic-key');
 expect(text).not.toContain('General educational');
});
test.each(['missing','corrupt','replaced'])('%s ledger fails closed without initialization',async mode=>{
 if(mode==='missing')await ledger().deleteMany({});
 else await ledger().updateOne({_id:AI_POLICY.id},{$set:mode==='corrupt'?{attempts:[]}:{anchor:'c'.repeat(64),signature:'0'.repeat(64)}});
 // A corrupt signature, including on an otherwise empty ledger, is rejected.
 if(mode==='corrupt')await ledger().updateOne({_id:AI_POLICY.id},{$set:{signature:'0'.repeat(64)}});
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
});
test('twelve reservations cap spending and attempt thirteen is denied',async()=>{
 for(let i=0;i<12;i++)await runBudgetedAI(config);
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).toHaveBeenCalledTimes(12);
 const doc=await ledger().findOne({_id:AI_POLICY.id});
 expect(doc?.attempts).toHaveLength(12);
 expect(doc?.attempts.length*AI_POLICY.reservationMicros).toBe(240000);
 expect(AI_POLICY.ceilingMicros).toBe(250000);
});
test('concurrent instances cannot reserve multiple active requests',async()=>{
 const results=await Promise.allSettled(Array.from({length:8},()=>reserveAI({public:'body'})));
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts).toHaveLength(1);
});
test('reservation replay and changed-body dispatch are rejected',async()=>{
 const body={public:'body'};const token=await reserveAI(body);
 await expect(claimAI(token,{other:'body'})).rejects.toThrow();
 await claimAI(token,body);
 await expect(claimAI(token,body)).rejects.toThrow();
 await completeAI(token,10,10);
 await expect(claimAI(token,body)).rejects.toThrow();
});
test('failed requests are redacted, never retried, and remain reserved',async()=>{
 mockCreate.mockRejectedValue(new Error('offline-synthetic-key private upstream body'));
 await expect(runBudgetedAI(config)).rejects.toThrow('Budget-controlled AI is unavailable');
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).toHaveBeenCalledTimes(1);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('dispatching');
});
test.each([
 {status:'incomplete',output_text:'partial',usage:{input_tokens:10,output_tokens:10}},
 {status:'completed',output_text:'answer',usage:{input_tokens:16001,output_tokens:10}},
 {status:'completed',output_text:'answer',usage:{input_tokens:10,output_tokens:8001}},
 {status:'completed',output_text:'answer'},
])('invalid response/usage retains reservation and blocks continuation',async response=>{
 mockCreate.mockResolvedValue(response);
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('dispatching');
});
test('timeout aborts transport and does not release uncertain reservation',async()=>{
 const realTimeout=global.setTimeout;
 jest.spyOn(global,'setTimeout').mockImplementation(((callback:()=>void,ms?:number,...args:unknown[])=>realTimeout(callback,ms===20000?5:ms,...args)) as typeof setTimeout);
 mockCreate.mockImplementation((_body:unknown,options:{signal:AbortSignal})=>new Promise((_resolve,reject)=>{
   options.signal.addEventListener('abort',()=>reject(new Error('timeout private upstream')));
 }));
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate.mock.calls[0][1].signal.aborted).toBe(true);
 expect(mockCreate).toHaveBeenCalledTimes(1);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('dispatching');
});
test('provisioning cannot reset an existing ledger',async()=>{
 process.env.FAKHR_AI_ENABLED='false';
 await expect(provisionAIBudget()).rejects.toThrow();
});
test.each(['Help with activities','ساعدني في الأنشطة'])('authenticated POST uses real budget gate with mocked OpenAI: %s',async question=>{
 const user=await User.create({email:'budget-test@example.invalid',password:'synthetic'});
 const auth='Bearer '+generateToken({userId:String(user._id)});
 await request(app).post('/api/ai/ask').send({question}).expect(401);
 await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:''}).expect(400);
 expect(mockCreate).not.toHaveBeenCalled();
 const response=await request(app).post('/api/ai/ask').set('Authorization',auth).send({question}).expect(200);
 expect(response.body.data.answer).toContain('General educational guidance');
 expect(mockCreate).toHaveBeenCalledTimes(1);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('completed');
});

test('actual SDK with mocked HTTP preserves safe wire request and parses the answer',async()=>{
 const RealOpenAI=jest.requireActual<typeof import('openai')>('openai').default;
 const fakeFetch=jest.fn(async(_url:unknown,init?:RequestInit)=>{
  const body=JSON.parse(String(init?.body));
  expect(body.store).toBe(false);
  expect(body.max_output_tokens).toBe(8000);
  expect(body.service_tier).toBe('default');
  expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('dispatching');
  return new Response(JSON.stringify({id:'synthetic',object:'response',status:'completed',
   output:[{type:'message',id:'synthetic-message',status:'completed',role:'assistant',
     content:[{type:'output_text',text:'Offline HTTP answer.',annotations:[]}]}],
   usage:{input_tokens:100,output_tokens:20,total_tokens:120}}),{status:200,headers:{'content-type':'application/json'}});
 });
 (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementationOnce(options=>new RealOpenAI({...options,fetch:fakeFetch}));
 await expect(runBudgetedAI(config)).resolves.toEqual({output_text:'Offline HTTP answer.'});
 expect(fakeFetch).toHaveBeenCalledTimes(1);
});
test('actual SDK never retries HTTP 429; private upstream error is redacted',async()=>{
 const RealOpenAI=jest.requireActual<typeof import('openai')>('openai').default;
 const fakeFetch=jest.fn(async()=>new Response(JSON.stringify({error:{message:'private-upstream-secret',type:'rate_limit_error'}}),{status:429,headers:{'content-type':'application/json'}}));
 (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementationOnce(options=>new RealOpenAI({...options,fetch:fakeFetch}));
 await expect(runBudgetedAI(config)).rejects.toThrow('Budget-controlled AI is unavailable, disabled, or awaiting review');
 expect(fakeFetch).toHaveBeenCalledTimes(1);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('dispatching');
});

test('existing generic API key cannot enable this dedicated test transport',async()=>{
 delete process.env.FAKHR_AI_OPENAI_API_KEY;
 process.env.OPENAI_API_KEY='synthetic-old-key-not-for-use';
 try {
  await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
  expect(mockCreate).not.toHaveBeenCalled();
 } finally {if(original.OPENAI_API_KEY===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=original.OPENAI_API_KEY;}
});
test('oversized public input is rejected before reservation or HTTP',async()=>{
 const builder=await import('../modules/ai/ai.requests');
 const body=builder.buildAIRequest(config);
 jest.spyOn(builder,'buildAIRequest').mockReturnValue({...body,input:'word '.repeat(6000)});
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts).toHaveLength(0);
});


import {randomUUID} from 'node:crypto';
import {recoverAIBudget} from '../modules/ai/ai.budget';
import {witnessConnection,witnessHead,appendOnlyPrivileges} from '../modules/ai/ai.witness';
import {witnessAdmin} from '../testSupport/integrationMongo';
function approveRecovery(){process.env.FAKHR_AI_ENABLED='false';process.env.FAKHR_AI_RECOVERY_APPROVED='forfeit-without-refund';}
afterEach(()=>{delete process.env.FAKHR_AI_RECOVERY_APPROVED;});
test('restoring an older valid signed ledger cannot reopen budget',async()=>{
 const initial=await ledger().findOne({_id:AI_POLICY.id});
 await runBudgetedAI(config);
 await ledger().replaceOne({_id:AI_POLICY.id},initial!);
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).toHaveBeenCalledTimes(1);
});
test('missing witness fails closed and cannot silently provision a new campaign',async()=>{
 await witnessAdmin!.collection('ai_budget_witness').deleteMany({});
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 process.env.FAKHR_AI_ENABLED='false';
 await expect(provisionAIBudget()).rejects.toThrow();
 expect(mockCreate).not.toHaveBeenCalled();
});
test('witness write credentials cannot alter or remove historical entries',async()=>{
 const conn=await witnessConnection();
 await expect(conn.collection('ai_budget_witness').deleteMany({})).rejects.toThrow();
 await expect(conn.collection('ai_budget_witness').updateOne({},{$set:{signature:'0'.repeat(64)}})).rejects.toThrow();
});
test('witness corruption fails closed',async()=>{
 await witnessAdmin!.collection('ai_budget_witness').updateOne({},{$set:{signature:'0'.repeat(64)}});
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
});
test('witness chain gaps fail closed',async()=>{
 await runBudgetedAI(config);
 await witnessAdmin!.collection<{_id:number}>('ai_budget_witness').deleteOne({_id:1});
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).toHaveBeenCalledTimes(1);
});
test('same-host witness configuration is rejected',async()=>{
 const original=process.env.FAKHR_AI_WITNESS_URI;
 process.env.FAKHR_AI_WITNESS_URI=process.env.MONGODB_URI;
 try{await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});expect(mockCreate).not.toHaveBeenCalled();}
 finally{process.env.FAKHR_AI_WITNESS_URI=original;}
});
test('role checks reject wildcard, update and administrative privileges',()=>{
 const resource={db:'witness',collection:'ai_budget_witness'};
 expect(appendOnlyPrivileges([{resource,actions:['find','insert']}],'witness')).toBe(true);
 expect(appendOnlyPrivileges([{resource,actions:['find','insert','update']}],'witness')).toBe(false);
 expect(appendOnlyPrivileges([{resource:{db:'',collection:''},actions:['find','insert']}],'witness')).toBe(false);
 expect(appendOnlyPrivileges([],'witness')).toBe(false);
});
test('partial primary write preserves witness reservation and allows no dispatch until recovery',async()=>{
 const col=ledger();
 jest.spyOn(col,'replaceOne').mockRejectedValueOnce(new Error('synthetic primary outage'));
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
 expect((await witnessHead())?.ledger.attempts).toHaveLength(1);
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 approveRecovery();const head=(await witnessHead())!;
 await recoverAIBudget(head.ledger.signature,randomUUID());
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts[0].state).toBe('forfeited');
 process.env.FAKHR_AI_ENABLED='true';
 await runBudgetedAI(config);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts).toHaveLength(2);
 expect(mockCreate).toHaveBeenCalledTimes(1);
});
test('recovery requires disabled AI and exact reviewed witness revision',async()=>{
 const body={public:'body'};const token=await reserveAI(body);await claimAI(token,body);
 const head=(await witnessHead())!;
 await expect(recoverAIBudget(head.ledger.signature,randomUUID())).rejects.toThrow();
 approveRecovery();
 await expect(recoverAIBudget('0'.repeat(64),randomUUID())).rejects.toThrow();
 await recoverAIBudget(head.ledger.signature,randomUUID());
 await expect(recoverAIBudget(head.ledger.signature,randomUUID())).rejects.toThrow();
 await expect(claimAI(token,body)).rejects.toThrow();
 await expect(completeAI(token,10,10)).rejects.toThrow();
});
test('twelve failed/recovered requests still exhaust all attempts with no refunds',async()=>{
 mockCreate.mockRejectedValue(new Error('synthetic failure'));
 for(let i=0;i<12;i++){
  process.env.FAKHR_AI_ENABLED='true';
  await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
  approveRecovery();
  await recoverAIBudget((await witnessHead())!.ledger.signature,randomUUID());
 }
 process.env.FAKHR_AI_ENABLED='true';
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).toHaveBeenCalledTimes(12);
 const attempts=(await ledger().findOne({_id:AI_POLICY.id}))!.attempts;
 expect(attempts).toHaveLength(12);
 expect(attempts.every(a=>a.state==='forfeited')).toBe(true);
 expect(attempts.length*AI_POLICY.reservationMicros).toBe(240000);
});
test('concurrent recovery cannot refund or duplicate an attempt',async()=>{
 await reserveAI({public:'body'});approveRecovery();const head=(await witnessHead())!;
 const result=await Promise.allSettled([recoverAIBudget(head.ledger.signature,randomUUID()),recoverAIBudget(head.ledger.signature,randomUUID())]);
 expect(result.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts).toHaveLength(1);
});
test('byte cap catches low-token but oversized strings; reservations include full safety allowance',async()=>{
 const builder=await import('../modules/ai/ai.requests');
 const body=builder.buildAIRequest(config);
 jest.spyOn(builder,'buildAIRequest').mockReturnValue({...body,input:'a'.repeat(12000)});
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
 expect(AI_POLICY.inputBytes+AI_POLICY.framingAllowance).toBe(AI_POLICY.billedInputTokens);
 expect(AI_POLICY.billedInputTokens*AI_POLICY.inputMicrosPerToken+AI_POLICY.outputTokens*AI_POLICY.outputMicrosPerToken).toBe(AI_POLICY.reservationMicros);
});

test('recovery restores completed history without replenishing budget',async()=>{
 const initial=await ledger().findOne({_id:AI_POLICY.id});
 await runBudgetedAI(config);
 const head=(await witnessHead())!;
 await ledger().replaceOne({_id:AI_POLICY.id},initial!);
 approveRecovery();await recoverAIBudget(head.ledger.signature,randomUUID());
 const doc=(await ledger().findOne({_id:AI_POLICY.id}))!;
 expect(doc.attempts).toHaveLength(1);expect(doc.attempts[0].state).toBe('completed');
 expect(doc.recoveries).toHaveLength(1);
});
test('witness outage blocks dispatch before spending',async()=>{
 const conn=await witnessConnection();
 jest.spyOn(conn.db!,'command').mockRejectedValueOnce(new Error('synthetic outage'));
 await expect(runBudgetedAI(config)).rejects.toMatchObject({statusCode:503});
 expect(mockCreate).not.toHaveBeenCalled();
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts).toHaveLength(0);
});
test('removing primary ledger cannot reset campaign while witness survives',async()=>{
 await runBudgetedAI(config);
 await ledger().deleteMany({});
 process.env.FAKHR_AI_ENABLED='false';
 await expect(provisionAIBudget()).rejects.toThrow();
 approveRecovery();await recoverAIBudget((await witnessHead())!.ledger.signature,randomUUID());
 expect((await ledger().findOne({_id:AI_POLICY.id}))?.attempts).toHaveLength(1);
});
