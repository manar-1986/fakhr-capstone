import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import {configureProxy, trustedProxies, normalizedClientIp} from '../config/proxy';
import {applyDatabasePolicy, databaseOptions} from '../config/databasePolicy';
import {env} from '../config/env';
import {authRateLimit} from '../middlewares/authRateLimit';
import {AuthLimit} from '../models/AuthSecurity.model';

jest.mock('../models/AuthSecurity.model',()=>({AuthLimit:{init:jest.fn(),findOneAndUpdate:jest.fn()}}));
const fixture={NODE_ENV:'production',RENDER:'true',TRUSTED_PROXY_CIDRS:'127.0.0.1/32,::1/128'};

describe('Explicit proxy trust and normalized authentication buckets',()=>{
 it('requires explicit proxy configuration on Render production',()=>expect(()=>trustedProxies({NODE_ENV:'production',RENDER:'true'})).toThrow('TRUSTED_PROXY_CIDRS'));
 it('defaults to no header trust locally',()=>expect(trustedProxies({NODE_ENV:'test'})).toBe(false));
 it.each(['true','1','loopback','0.0.0.0/0','::/0','10.0.0.0/7','127.0.0.1/33','::1/129','127.0.0.1','127.0.0.1/32,',' 127.0.0.1/32','secret.invalid/32'])('rejects unsafe trust setting without echoing it: %s',value=>{
  expect(()=>trustedProxies({TRUSTED_PROXY_CIDRS:value})).toThrow('Invalid production configuration: TRUSTED_PROXY_CIDRS');
 });
 function app(cidrs?:string) {
  const app=express();configureProxy(app,cidrs?{...fixture,TRUSTED_PROXY_CIDRS:cidrs}:{NODE_ENV:'test'});
  app.get('/',(req,res)=>res.json({ip:normalizedClientIp(req.ip)}));return app;
 }
 it('ignores spoofed headers from untrusted direct peers',async()=>{
  const r=await request(app('192.0.2.10/32')).get('/').set('X-Forwarded-For','203.0.113.44');
  expect(r.body.ip).toBe('127.0.0.1');
 });
 it('selects nearest untrusted client, not attacker-prepended address',async()=>{
  const r=await request(app(fixture.TRUSTED_PROXY_CIDRS)).get('/').set('X-Forwarded-For','198.51.100.99, 203.0.113.44');
  expect(r.body.ip).toBe('203.0.113.44');
 });
 it('walks only explicitly trusted intermediary ranges',async()=>{
  const r=await request(app(fixture.TRUSTED_PROXY_CIDRS+',192.0.2.10/32')).get('/').set('X-Forwarded-For','198.51.100.99, 203.0.113.44, 192.0.2.10');
  expect(r.body.ip).toBe('203.0.113.44');
 });
 it.each(['::ffff:203.0.113.44','::ffff:cb00:712c'])('unifies mapped IPv4 %s',ip=>expect(normalizedClientIp(ip)).toBe('203.0.113.44'));
 it('canonicalizes IPv6 spelling',()=>expect(normalizedClientIp('2001:0db8:0:0:0:0:0:1')).toBe('2001:db8::1'));
 it.each(['unknown','203.0.113.44:123','garbage',undefined])('rejects invalid client IP %s',ip=>expect(()=>normalizedClientIp(ip)).toThrow('INVALID_CLIENT_IP'));
 it('limits repeated spoofing and keeps independent clients separate',async()=>{
  const counters=new Map<string,number>();const previous=env.JWT_SECRET;env.JWT_SECRET='synthetic-offline-hmac-fixture';
  (AuthLimit.init as jest.Mock).mockResolvedValue(undefined);
  (AuthLimit.findOneAndUpdate as jest.Mock).mockImplementation(async({ _id })=>{
   const count=(counters.get(_id)||0)+1;counters.set(_id,count);return {count,expiresAt:new Date(Date.now()+60000)};
  });
  const a=express();configureProxy(a,fixture);a.use(express.json());a.post('/',authRateLimit('login'),(_q,r)=>r.sendStatus(204));
  try {
   for(let i=0;i<10;i++)await request(a).post('/').set('X-Forwarded-For','198.51.100.'+i+', 203.0.113.44').send({email:'synthetic-a@example.invalid'}).expect(204);
   await request(a).post('/').set('X-Forwarded-For','198.51.100.200, 203.0.113.44').send({email:'synthetic-a@example.invalid'}).expect(429);
   await request(a).post('/').set('X-Forwarded-For','203.0.113.45').send({email:'synthetic-b@example.invalid'}).expect(204);
   expect([...counters.keys()].every(key=>/^[a-f0-9]{64}$/.test(key))).toBe(true);
   (AuthLimit.init as jest.Mock).mockRejectedValue(new Error('synthetic-private-detail'));
   const r=await request(a).post('/').send({email:'synthetic-b@example.invalid'}).expect(503);
   expect(r.text).not.toContain('synthetic-private-detail');
  } finally {env.JWT_SECRET=previous;}
 });
});

describe('Production database startup performs no automatic DDL',()=>{
 it('disables index and collection creation at connection level',()=>expect(databaseOptions(true)).toEqual({serverSelectionTimeoutMS:10000,autoIndex:false,autoCreate:false}));
 it('preserves isolated test/development defaults',()=>expect(databaseOptions(false)).toEqual({serverSelectionTimeoutMS:10000}));
 it('model initialization does not call collection or index creation',async()=>{
  const oldIndex=mongoose.get('autoIndex'),oldCreate=mongoose.get('autoCreate');
  applyDatabasePolicy(true);
  const conn=mongoose.createConnection();
  // Model.init waits for connection options; emulate openUri's config assignment, with no socket.
  Object.assign((conn as any).config,databaseOptions(true));
  const create=jest.spyOn(conn,'createCollection');
  const schema=new mongoose.Schema({email:{type:String,unique:true},expiresAt:Date});
  schema.index({expiresAt:1},{expireAfterSeconds:0});
  const model=conn.model('SyntheticDeploymentPolicy',schema);
  const indexes=jest.spyOn(model,'ensureIndexes');
  try {
   await model.init();expect(create).not.toHaveBeenCalled();expect(indexes).not.toHaveBeenCalled();
   expect(mongoose.get('autoIndex')).toBe(false);expect(mongoose.get('autoCreate')).toBe(false);
  } finally {
   mongoose.set('autoIndex',oldIndex);mongoose.set('autoCreate',oldCreate);await conn.destroy();
  }
 });
});
