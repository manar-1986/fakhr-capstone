import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { execFile } from 'child_process';
import { promisify } from 'util';
import User from '../models/User.model';
import Child from '../models/Child.model';
import { AuthLimit, RevokedToken } from '../models/AuthSecurity.model';
import auth from '../modules/auth/auth.routes';
import users from '../modules/users/users.routes';
import children from '../modules/children/children.routes';
import { errorHandler } from '../middlewares/error.middleware';
import { generateToken } from '../utils/jwt';
import { clearBlacklist } from '../utils/tokenBlacklist';
import { disableAccount } from '../utils/sessionSecurity';
import { consumeAuthLimit } from '../middlewares/authRateLimit';
import { hashPassword } from '../utils/hash';
import { env } from '../config/env';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn().mockResolvedValue(undefined)}));
const app=express();app.use(express.json());app.use('/api/auth',auth);app.use('/api/users',users);app.use('/api/children',children);app.use(errorHandler);
async function account(){const u=await User.create({email:`${new mongoose.Types.ObjectId()}@example.invalid`,password:await hashPassword('synthetic-pass')});return {u,token:generateToken({userId:u.id})};}
describe('Persistent authentication security',()=>{
 it('persists current-token logout across memory reset and a fresh process, keeping another session valid',async()=>{
  const {u,token}=await account(),other=generateToken({userId:u.id});
  await request(app).post('/api/auth/logout').auth(token,{type:'bearer'}).expect(200);clearBlacklist();
  await request(app).get('/api/users/me').auth(token,{type:'bearer'}).expect(401);
  await request(app).get('/api/users/me').auth(other,{type:'bearer'}).expect(200);
  const hash=crypto.createHash('sha256').update(token).digest('hex');
  await promisify(execFile)(process.execPath,['-e',`const m=require('mongoose');m.connect(process.env.TEST_URI).then(async()=>{const r=await m.connection.collection('revokedtokens').findOne({_id:process.env.TEST_HASH});await m.disconnect();process.exit(r?0:1)}).catch(()=>process.exit(2))`],{cwd:process.cwd(),env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEST_URI:process.env.MONGODB_URI,TEST_HASH:hash},timeout:20000});
  expect(JSON.stringify(await RevokedToken.find().lean())).not.toContain(token);
 });
 it('denies disabled and deleted accounts and invalidates old tokens after safe re-enable',async()=>{
  const {u,token}=await account();await disableAccount(u.id);
  await request(app).get('/api/children').auth(token,{type:'bearer'}).expect(401);
  await request(app).post('/api/auth/login').send({email:u.email,password:'synthetic-pass'}).expect(401);
  await User.updateOne({_id:u.id},{$set:{isDisabled:false}});
  await request(app).get('/api/users/me').auth(token,{type:'bearer'}).expect(401);
  const login=await request(app).post('/api/auth/login').send({email:u.email,password:'synthetic-pass'}).expect(200);
  await User.deleteOne({_id:u.id});
  await request(app).get('/api/users/me').auth(login.body.data.token,{type:'bearer'}).expect(401);
 });
 it('atomically consumes a reset token once and revokes old sessions',async()=>{
  const {u,token}=await account(),raw='a'.repeat(64);
  await User.updateOne({_id:u.id},{$set:{resetPasswordToken:crypto.createHash('sha256').update(raw).digest('hex'),resetPasswordExpires:new Date(Date.now()+60000)}});
  const result=await Promise.all([1,2].map(()=>request(app).post('/api/auth/reset-password').send({token:raw,password:'updated-synthetic'})));
  expect(result.map(r=>r.status).sort()).toEqual([200,400]);
  expect((await User.findById(u.id))?.authVersion).toBe(1);
  await request(app).get('/api/children').auth(token,{type:'bearer'}).expect(401);
  const login=await request(app).post('/api/auth/login').send({email:u.email,password:'updated-synthetic'}).expect(200);
  await request(app).get('/api/users/me').auth(login.body.data.token,{type:'bearer'}).expect(200);
 });
 it('rejects legacy unversioned tokens',async()=>{
  const {u}=await account();const old=jwt.sign({userId:u.id},env.JWT_SECRET,{expiresIn:'1h'});
  await request(app).get('/api/users/me').auth(old,{type:'bearer'}).expect(401);
 });
 it('fails closed when persistent revocation storage is unavailable',async()=>{
  const {token}=await account();jest.spyOn(RevokedToken,'exists').mockRejectedValueOnce(new Error('synthetic unavailable'));
  await request(app).get('/api/children').auth(token,{type:'bearer'}).expect(401);
 });
 it('limits normalized account attempts despite changed forwarding headers',async()=>{
  const {u}=await account();
  for(let i=0;i<10;i++)await request(app).post('/api/auth/login').set('X-Forwarded-For',`192.0.2.${i}`).send({email:u.email.toUpperCase(),password:'incorrect'}).expect(401);
  const r=await request(app).post('/api/auth/login').send({email:u.email,password:'synthetic-pass'}).expect(429);expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);
  expect(JSON.stringify(await AuthLimit.find().lean())).not.toContain(u.email);
 });
 it('caps parallel attempts atomically and resets only after expiry',async()=>{
  const results=await Promise.all(Array.from({length:20},()=>consumeAuthLimit('synthetic-concurrent',5)));
  expect(results.filter(r=>r.allowed)).toHaveLength(5);
  await AuthLimit.updateOne({_id:'synthetic-concurrent'},{$set:{expiresAt:new Date(0)}});
  expect((await consumeAuthLimit('synthetic-concurrent',5)).allowed).toBe(true);
 });
 it('limits reset delivery and fails closed on rate-store failure',async()=>{
  for(let i=0;i<3;i++)await request(app).post('/api/auth/forgot-password').send({email:'missing@example.invalid'}).expect(200);
  await request(app).post('/api/auth/forgot-password').send({email:'missing@example.invalid'}).expect(429);
  jest.spyOn(AuthLimit,'findOneAndUpdate').mockRejectedValueOnce(new Error('synthetic unavailable'));
  await request(app).post('/api/auth/register').send({email:'new@example.invalid',password:'synthetic-pass'}).expect(503);
  expect(await User.countDocuments()).toBe(0);
 });
 it('does not acknowledge logout when persistent storage fails',async()=>{
  const {token}=await account();jest.spyOn(RevokedToken,'updateOne').mockRejectedValueOnce(new Error('synthetic unavailable'));
  await request(app).post('/api/auth/logout').auth(token,{type:'bearer'}).expect(500);
 });
 it('shares an exhausted rate counter with a fresh process',async()=>{
  await consumeAuthLimit('synthetic-shared',1);
  await promisify(execFile)(process.execPath,['-e',`const m=require('mongoose');m.connect(process.env.TEST_URI).then(async()=>{const {consumeAuthLimit}=require('./dist/middlewares/authRateLimit');const r=await consumeAuthLimit('synthetic-shared',1);await m.disconnect();process.exit(r.allowed?1:0)}).catch(()=>process.exit(2))`],{cwd:process.cwd(),env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEST_URI:process.env.MONGODB_URI,JWT_SECRET:'synthetic-local-validation-only'},timeout:20000});
 });
 it('does not permit new security fields to be changed through profile update',async()=>{
  const {u,token}=await account();await Child.create({name:'Synthetic',gender:'other',parentId:u.id});
  await request(app).put(`/api/users/${u.id}`).auth(token,{type:'bearer'}).send({name:'Synthetic updated',authVersion:999,isDisabled:true,role:'admin'}).expect(200);
  const after=await User.findById(u.id);expect(after?.authVersion).toBe(0);expect(after?.isDisabled).toBe(false);expect(after?.role).toBe('parent');
 });
});
