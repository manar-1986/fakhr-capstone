import request from 'supertest';
import {createApp} from '../application';
import User from '../models/User.model';
import Child from '../models/Child.model';
import Template from '../models/CarePathTemplate.model';
import CarePath from '../models/CarePath.model';
import Task from '../models/Task.model';
import {generateToken} from '../utils/jwt';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn()}));
const app=createApp();
async function parent(email='parent@example.invalid',role='parent'){
 const user=await User.create({name:'Synthetic parent',email,password:'synthetic',role});
 return {user,auth:'Bearer '+generateToken({userId:user.id})};
}
test.each(['parent','admin'])('email replacement is disabled for %s; unchanged email and name updates remain compatible',async(role)=>{
 const {user,auth}=await parent('parent@example.invalid',role);
 await request(app).put('/api/users/'+user.id).set('Authorization',auth).send({email:'replacement@example.invalid',name:'Rejected'}).expect(403);
 expect((await User.findById(user.id))?.name).toBe('Synthetic parent');
 await request(app).put('/api/users/'+user.id).set('Authorization',auth).send({email:' PARENT@example.invalid ',name:'Updated'}).expect(200);
 await request(app).put('/api/users/'+user.id).set('Authorization',auth).send({email:'parent@example.invalid'}).expect(200);
 expect((await User.findById(user.id))?.email).toBe('parent@example.invalid');
});
test('guest and other parent cannot update an account',async()=>{
 const owner=await parent(),other=await parent('other@example.invalid');
 await request(app).put('/api/users/'+owner.user.id).send({name:'Intrusion'}).expect(401);
 await request(app).put('/api/users/'+owner.user.id).set('Authorization',other.auth).send({name:'Intrusion'}).expect(403);
});
test('task details enforce parent ownership, including administrator accounts',async()=>{
 const owner=await parent(),other=await parent('other@example.invalid','admin');
 const child=await Child.create({name:'Synthetic',gender:'female',parentId:owner.user.id});
 const template=await Template.create({name:'Synthetic template',duration:1,tasks:[{week:1,title:'Synthetic task',description:'Synthetic'}]});
 const made=await request(app).post('/api/care-paths/generate').set('Authorization',owner.auth).send({childId:child.id,templateId:template.id}).expect(201);
 const url='/api/care-path-tasks/'+made.body.tasks[0]._id;
 expect((await request(app).get(url).set('Authorization',owner.auth).expect(200)).body.task.title).toBe('Synthetic task');
 await request(app).get(url).expect(401);
 await request(app).get(url).set('Authorization',other.auth).expect(404);
});
test('automatic generation never falls back to an unrelated template',async()=>{
 const {user,auth}=await parent();const child=await Child.create({name:'Synthetic',gender:'female',parentId:user.id,diagnosis:'unmatched'});
 await Template.create({name:'Unrelated synthetic',duration:1,targetDiagnoses:['other'],tasks:[]});
 await request(app).post('/api/care-paths/generate').set('Authorization',auth).send({childId:child.id}).expect(404);
 expect(await CarePath.countDocuments()).toBe(0);
});
test('concurrent generation creates one complete plan and one set of tasks',async()=>{
 const {user,auth}=await parent();const child=await Child.create({name:'Synthetic',gender:'female',parentId:user.id});
 const template=await Template.create({name:'Concurrent synthetic',duration:1,tasks:[{week:1,title:'Synthetic',description:'Synthetic'}]});
 await CarePath.init();await Task.init();
 const results=await Promise.all(Array.from({length:3},()=>request(app).post('/api/care-paths/generate').set('Authorization',auth).send({childId:child.id,templateId:template.id})));
 expect(results.map(r=>r.status)).toEqual([201,201,201]);
 expect(await CarePath.countDocuments({childId:child.id})).toBe(1);expect(await Task.countDocuments()).toBe(1);
});

