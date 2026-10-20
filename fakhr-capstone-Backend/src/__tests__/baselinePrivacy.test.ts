import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../models/User.model';
import Child from '../models/Child.model';
import Post from '../models/Post.model';
import Center from '../models/Center.model';
import CarePath from '../models/CarePath.model';
import Task from '../models/Task.model';
import users from '../modules/users/users.routes';
import auth from '../modules/auth/auth.routes';
import children from '../modules/children/children.routes';
import community from '../modules/community/community.routes';
import directory from '../modules/directory/directory.routes';
import centers from '../modules/centers/centers.routes';
import plans from '../modules/carePath/carePath.routes';
import { errorHandler } from '../middlewares/error.middleware';
import { generateToken } from '../utils/jwt';
jest.mock('../utils/email', () => ({sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined)}));
const app = express(); app.use(express.json());
app.use('/api/users',users); app.use('/api/auth',auth); app.use('/api/children',children); app.use('/api/community',community); app.use('/api/directory',directory); app.use('/api/centers',centers); app.use('/api',plans); app.use(errorHandler);
async function account(role='parent') { const u=await User.create({name:'Synthetic Parent',email:`${new mongoose.Types.ObjectId()}@example.invalid`,password:'synthetic-only',role});return {id:u.id,email:u.email,token:generateToken({userId:u.id})}; }
async function child(parentId:string) {return Child.create({name:'Synthetic Child',gender:'other',parentId,medicalHistory:'Synthetic private history'});}
const center={name:'Synthetic Center',type:'public' as const,address:'Synthetic',city:'Synthetic',phone:'000'};
describe('Baseline privacy boundaries',()=>{
 it.each(['/api/auth/delete-account','/api/users/me'])('rejects anonymous deletion at %s',async url=>{await request(app).delete(url).expect(401);});
 it('blocks both deletion routes without deleting parent or related child records',async()=>{
  const u=await account();const c=await child(u.id);
  for(const url of ['/api/auth/delete-account',`/api/users/${u.id}`])await request(app).delete(url).auth(u.token,{type:'bearer'}).expect(503);
  expect(await User.findById(u.id)).not.toBeNull();expect(await Child.findById(c.id)).not.toBeNull();
 });
 it('does not disclose parent email in community list or created post',async()=>{
  const a=await account(),b=await account();
  await Post.create({title:'Synthetic title',content:'Synthetic content',authorId:a.id});
  const r=await request(app).get('/api/community/posts').auth(b.token,{type:'bearer'}).expect(200);
  expect(JSON.stringify(r.body)).not.toContain(a.email);
  const created=await request(app).post('/api/community/posts').auth(b.token,{type:'bearer'}).send({title:'Synthetic',content:'Synthetic'}).expect(201);
  expect(JSON.stringify(created.body)).not.toContain(b.email);
 });
 it.each(['/api/directory/centers','/api/centers'])('protects center creation at %s',async url=>{
  await request(app).post(url).send(center).expect(401);
  const p=await account(),a=await account('admin');
  await request(app).post(url).auth(p.token,{type:'bearer'}).send(center).expect(403);
  expect(await Center.countDocuments()).toBe(0);
  await request(app).post(url).auth(a.token,{type:'bearer'}).send(center).expect(201);
 });
 it('permits only administrators to delete centers',async()=>{
  const c=await Center.create(center),p=await account(),a=await account('admin');
  await request(app).delete(`/api/centers/${c.id}`).auth(p.token,{type:'bearer'}).expect(403);
  expect(await Center.findById(c.id)).not.toBeNull();
  await request(app).delete(`/api/centers/${c.id}`).auth(a.token,{type:'bearer'}).expect(200);
 });
 it('isolates child listing, reads and updates between parents',async()=>{
  const a=await account(),b=await account();const c=await child(a.id);
  await request(app).get('/api/children').expect(401);
  const list=await request(app).get('/api/children').auth(b.token,{type:'bearer'}).expect(200);expect(list.body.data.count).toBe(0);
  await request(app).get(`/api/children/${c.id}`).auth(b.token,{type:'bearer'}).expect(404);
  await request(app).put(`/api/children/${c.id}`).auth(b.token,{type:'bearer'}).send({name:'Wrong'}).expect(404);
  await request(app).put(`/api/children/${c.id}`).auth(a.token,{type:'bearer'}).send({parentId:b.id}).expect(403);
  await request(app).put(`/api/children/${c.id}`).auth(a.token,{type:'bearer'}).send({name:'Updated synthetic'}).expect(200);
  expect((await Child.findById(c.id))?.parentId.toString()).toBe(a.id);
 });
 it('denies foreign care paths, tasks and check-ins without writes',async()=>{
  const a=await account(),b=await account(),c=await child(a.id);
  const plan=await CarePath.create({childId:c.id,templateId:new mongoose.Types.ObjectId(),status:'active'});
  const task=await Task.create({carePathId:plan.id,week:1,title:'Synthetic',description:'Synthetic'});
  await request(app).get('/api/care-paths/current').query({childId:c.id}).auth(b.token,{type:'bearer'}).expect(404);
  await request(app).post('/api/care-paths/generate').auth(b.token,{type:'bearer'}).send({childId:c.id}).expect(404);
  await request(app).post('/api/care-paths/checkin').auth(b.token,{type:'bearer'}).send({childId:c.id,note:'Wrong'}).expect(404);
  for(const action of ['complete','skip'])await request(app).post(`/api/care-path-tasks/${task.id}/${action}`).auth(b.token,{type:'bearer'}).send({}).expect(404);
  expect((await Task.findById(task.id))?.status).toBe('pending');
  await request(app).post(`/api/care-path-tasks/${task.id}/complete`).auth(a.token,{type:'bearer'}).send({}).expect(200);
 });
 it('never returns password reset tokens even in development',async()=>{
  const previous=process.env.NODE_ENV;process.env.NODE_ENV='development';
  try{const a=await account();const r=await request(app).post('/api/auth/forgot-password').send({email:a.email}).expect(200);
  expect(r.body.data.resetToken).toBeUndefined();expect(r.body.data.resetLink).toBeUndefined();}finally{process.env.NODE_ENV=previous;}
 });
});
