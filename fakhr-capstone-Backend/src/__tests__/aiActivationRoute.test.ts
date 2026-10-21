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
