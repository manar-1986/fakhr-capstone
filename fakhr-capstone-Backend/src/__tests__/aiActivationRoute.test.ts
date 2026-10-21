import express from 'express';
import request from 'supertest';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
import {authenticate} from '../middlewares/auth.middleware';
import {aiActivation} from '../modules/ai/ai.activation';
import {errorHandler} from '../middlewares/error.middleware';
import {AuthLimit,RevokedToken} from '../models/AuthSecurity.model';
import {createHash} from 'node:crypto';
const app=express();app.use('/api/ai',authenticate,aiActivation);app.post('/api/ai/ask',(_q,r)=>r.json({mock:true}));app.use(errorHandler);
beforeEach(()=>{process.env.FAKHR_AI_ACCESS='pilot';process.env.FAKHR_AI_ENABLED='true';process.env.FAKHR_AI_LEDGER_SIGNING_KEY='a'.repeat(64);});
afterAll(()=>{delete process.env.FAKHR_AI_ACCESS;delete process.env.FAKHR_AI_ENABLED;delete process.env.FAKHR_AI_LEDGER_SIGNING_KEY;});
test('authenticated pilot enforces persistent quota and revocation',async()=>{
 const u=await User.create({email:'synthetic@example.invalid',password:'synthetic'});const token=generateToken({userId:String(u._id)});
 await request(app).post('/api/ai/ask').expect(401);
 for(let i=0;i<3;i++)await request(app).post('/api/ai/ask').set('Authorization','Bearer '+token).expect(200);
 const counters=await AuthLimit.find({}).lean();expect(counters).toHaveLength(3);for(const counter of counters){expect(counter._id).toMatch(/^[a-f0-9]{64}$/);expect(counter._id).not.toContain(String(u._id));}
 const r=await request(app).post('/api/ai/ask').set('Authorization','Bearer '+token).expect(429);expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);
 await RevokedToken.create({_id:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+60000)});
 await request(app).post('/api/ai/ask').set('Authorization','Bearer '+token).expect(401);
});

import {consumeAIQuotas,AI_QUOTAS} from '../modules/ai/ai.quotas';
import {createHmac} from 'node:crypto';
test('approved account quota constants remain 3/15m, 10/day, 100/month',()=>{
 expect(AI_QUOTAS).toEqual([{scope:'quarter',limit:3,unit:'minute',amount:15},{scope:'day',limit:10,unit:'day',amount:1},{scope:'month',limit:100,unit:'month',amount:1}]);
});
test.each([['quarter',3],['day',10],['month',100]] as const)('%s quota permits last attempt then denies without resetting other windows',async(scope,limit)=>{
 const account='synthetic-quota-boundary';await consumeAIQuotas(account);
 const key=createHmac('sha256',process.env.FAKHR_AI_LEDGER_SIGNING_KEY!).update('fakhr-ai-quota-v2:'+scope+':'+account).digest('hex');
 // Synthetic local boundary state; real Mongo pipeline and server clock remain active.
 await AuthLimit.updateOne({_id:key},{$set:{count:limit-1}});
 expect((await consumeAIQuotas(account)).allowed).toBe(true);
 const denied=await consumeAIQuotas(account);expect(denied.allowed).toBe(false);expect(denied.retryAfter).toBeGreaterThan(0);
 expect((await AuthLimit.findById(key))!.count).toBe(limit+1);
 expect((await consumeAIQuotas('different-synthetic-account')).allowed).toBe(true);
});
