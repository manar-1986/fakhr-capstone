import request from 'supertest';
import {createApp} from '../application';
import endpoints from '../testSupport/frontendEndpoints.json';
import User from '../models/User.model';
import Child from '../models/Child.model';
import Template from '../models/CarePathTemplate.model';
import {generateToken} from '../utils/jwt';
import {env} from '../config/env';
import {disableAccount} from '../utils/sessionSecurity';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn()}));
const app=createApp();
async function account(){const u=await User.create({email:'contract@example.invalid',password:'synthetic'});return {u,auth:'Bearer '+generateToken({userId:u.id})};}
test.each(endpoints)('mounted frontend route $method $path rejects guests or serves its public contract',async({method,path})=>{
 const url=path.replace(/:[^/]+/g,'invalid');
 const r=await (request(app) as any)[method.toLowerCase()](url).send({});
 const expected=path.startsWith('/api/support')?503:
 path.startsWith('/api/auth/')&&!path.endsWith('/logout')?400:
 method==='GET'&&(path.startsWith('/api/directory/')||path.startsWith('/api/services')||path.startsWith('/api/community/'))?(path.includes(':')?400:200):401;
 expect(r.status).toBe(expected);
});
test('saved child goals round-trip through create, list, detail and update; ownership remains enforced',async()=>{
 const {u,auth}=await account();
 const body={name:'Synthetic child',gender:'female',areasOfFocus:['communication'],supportGoals:['independence']};
 const made=await request(app).post('/api/children').set('Authorization',auth).send(body).expect(201);const id=made.body.data.child.id;
 expect(made.body.data.child.supportGoals).toEqual(body.supportGoals);
 const update=await request(app).put('/api/children/'+id).set('Authorization',auth).send({areasOfFocus:['learning'],supportGoals:[]}).expect(200);
 expect(update.body.data.child.areasOfFocus).toEqual(['learning']);expect(update.body.data.child.supportGoals).toEqual([]);
 expect((await request(app).get('/api/children').set('Authorization',auth)).body.data.children[0].areasOfFocus).toEqual(['learning']);
 expect((await request(app).get('/api/children/'+id).set('Authorization',auth)).body.data.child.areasOfFocus).toEqual(['learning']);
 const other=await User.create({email:'other-contract@example.invalid',password:'synthetic'});
 await request(app).put('/api/children/'+id).auth(generateToken({userId:other.id}),{type:'bearer'}).send({supportGoals:['intrusion']}).expect(404);
 expect((await Child.findById(id))?.parentId.toString()).toBe(u.id);
});
test('registered plan contracts return tasks and persist done, skip, and check-in',async()=>{
 const {u,auth}=await account();const child=await Child.create({name:'Synthetic',gender:'male',parentId:u.id});
 const template=await Template.create({name:'Synthetic-only template',duration:1,tasks:[{week:1,title:'Synthetic task',description:'Not advice'}]});
 const made=await request(app).post('/api/care-paths/generate').set('Authorization',auth).send({childId:child.id,templateId:template.id}).expect(201);
 const id=made.body.tasks[0]._id;
 await request(app).post('/api/care-path-tasks/'+id+'/complete').set('Authorization',auth).send({note:'Synthetic note'}).expect(200);
 const current=await request(app).get('/api/care-paths/current').set('Authorization',auth).query({childId:child.id}).expect(200);expect(current.body.tasks[0].status).toBe('completed');expect(current.body.tasks[0].note).toBe('Synthetic note');expect(current.body.carePath.status).toBe('completed');
 await request(app).post('/api/care-path-tasks/'+id+'/skip').set('Authorization',auth).send({}).expect(400);
 const check=await request(app).post('/api/care-paths/checkin').set('Authorization',auth).send({childId:child.id,note:'Synthetic feedback'}).expect(201);expect(check.body.success).toBe(true);
});
test('production cannot activate AI or Messages via feature flags',async()=>{
 const {auth}=await account();const old=env.NODE_ENV,oldNode=process.env.NODE_ENV,oldAI=process.env.FAKHR_AI_ENABLED;
 try{env.NODE_ENV='production';process.env.NODE_ENV='production';process.env.FAKHR_AI_ENABLED='true';process.env.FAKHR_SUPPORT_LOCAL_TEST='1';
 await request(app).post('/api/ai/ask').send({question:'Test'}).expect(401);
 await request(app).post('/api/ai/ask').set('Authorization',auth).send({question:'Test'}).expect(503);
 await request(app).get('/api/support').set('Authorization',auth).expect(503);
 }finally{env.NODE_ENV=old;process.env.NODE_ENV=oldNode;process.env.FAKHR_AI_ENABLED=oldAI;delete process.env.FAKHR_SUPPORT_LOCAL_TEST;}
});
test('disabled users cannot use imported Calendar, Favorites or Support routes',async()=>{
 const {u,auth}=await account();await disableAccount(u.id);process.env.FAKHR_SUPPORT_LOCAL_TEST='1';
 try{for(const url of ['/api/calendar-events','/api/favorites','/api/support'])await request(app).get(url).set('Authorization',auth).expect(401);}finally{delete process.env.FAKHR_SUPPORT_LOCAL_TEST;}
});
