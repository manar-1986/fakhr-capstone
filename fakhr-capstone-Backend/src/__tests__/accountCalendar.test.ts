import request from 'supertest';
import {createApp} from '../application';
import User from '../models/User.model';
import Child from '../models/Child.model';
import CalendarEvent from '../models/CalendarEvent.model';
import {generateToken} from '../utils/jwt';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn()}));
const app=createApp();
test('both deletion entry points stay disabled and preserve owned children and calendar events',async()=>{
 const u=await User.create({email:'deletion@example.invalid',password:'synthetic'});
 const child=await Child.create({name:'Synthetic child',gender:'female',parentId:u._id});
 const auth='Bearer '+generateToken({userId:u.id});
 await request(app).post('/api/calendar-events').set('Authorization',auth).send({childId:child.id,title:'Personal reminder',date:'2026-11-01',startTime:'10:00',timezone:'Asia/Kuwait',category:'doctor',notes:'',requestId:'synthetic-request-001'}).expect(201);
 await request(app).delete('/api/auth/delete-account').set('Authorization',auth).expect(503);
 await request(app).delete('/api/users/'+u.id).set('Authorization',auth).expect(503);
 expect(await CalendarEvent.countDocuments()).toBe(1);expect(await Child.countDocuments()).toBe(1);expect(await User.countDocuments()).toBe(1);
});
