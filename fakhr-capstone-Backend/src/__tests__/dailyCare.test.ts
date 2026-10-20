import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import {MongoMemoryReplSet} from 'mongodb-memory-server';
import routes from '../modules/dailyCare/dailyCare.routes';
import Calendar from '../models/CalendarEvent.model';
import Child from '../models/Child.model';
import User from '../models/User.model';
import Template from '../models/CarePathTemplate.model';
import {MedicationReminder,MedicationAction,ActivityParticipation} from '../models/DailyCare.model';
import {AuthLimit,RevokedToken} from '../models/AuthSecurity.model';
import {generateToken} from '../utils/jwt';
import {createHash} from 'crypto';
import {instant,dates,validateSchedule} from '../modules/dailyCare/contracts';
const app=express();app.use(express.json({limit:'16kb'}));app.use('/care',routes);app.use((e:any,_q:any,s:any,_n:any)=>s.status(e.statusCode||500).json({code:'AUTH_FAILED'}));
let server:MongoMemoryReplSet,auth:string,childId:string,foreignId:string,medId:string,appointmentId:string,token:string;
const schedule={title:'SYNTHETIC PRIVATE',date:'2026-10-19',startTime:'09:00',timezone:'Asia/Kuwait',notes:'SYNTHETIC NOTE',reminder:'at-time',recurrence:{kind:'daily',interval:1,until:'2026-10-21',weekdays:[]}};
const appt={...schedule,endTime:'10:00',category:'speech',location:'Synthetic location',status:'scheduled'};
const med={...schedule,dose:'SYNTHETIC DOSE ONLY',frequency:'Caregiver-entered synthetic schedule',active:true};
const api=()=>request(app),header=(r:any)=>r.set('Authorization',auth);
beforeAll(async()=>{
 if(!process.env.MONGOMS_SYSTEM_BINARY)throw new Error('LOCAL_BINARY_REQUIRED');
 server=await MongoMemoryReplSet.create({binary:{systemBinary:process.env.MONGOMS_SYSTEM_BINARY,version:'8.0.34'},replSet:{count:1,storageEngine:'wiredTiger',auth:{enable:true,customRootName:'syntheticroot',customRootPwd:'synthetic-only-root'}}});
 await mongoose.connect(server.getUri('synthetic_daily_care'),{user:'syntheticroot',pass:'synthetic-only-root',authSource:'admin',autoCreate:false,autoIndex:false});
 for(const model of [User,Child,Template,Calendar,MedicationReminder,MedicationAction,ActivityParticipation,AuthLimit,RevokedToken]){await model.createCollection();await model.createIndexes()}
 const parent=await User.create({email:'care@example.invalid',password:'synthetic-only',role:'parent'});
 childId=String((await Child.create({name:'Synthetic child',gender:'Male',parentId:parent._id,age:7,supportGoals:JSON.stringify(['communication'])}))._id);
 foreignId=String((await Child.create({name:'Foreign synthetic',gender:'Male',parentId:new mongoose.Types.ObjectId()}))._id);
 token=generateToken({userId:String(parent._id)});auth='Bearer '+token;process.env.FAKHR_DAILY_CARE_ENABLED='true';
});
afterAll(async()=>{await mongoose.disconnect();await server?.stop()});
test('DST gap/fold reject; saved Kuwait wall time is exact',()=>{
 expect(instant('2026-10-19','09:00','Asia/Kuwait')).toBe(Date.parse('2026-10-19T06:00:00Z'));
 expect(()=>instant('2026-03-08','02:30','America/New_York')).toThrow();
 expect(()=>instant('2026-11-01','01:30','America/New_York')).toThrow();
 expect(dates(med as any,'2026-10-19','2026-10-21')).toHaveLength(3);
 expect(()=>validateSchedule({...med,recurrence:{...med.recurrence,until:'2030-01-01'}} as any)).toThrow();
});
test('guest and foreign child denied; capability defaults closed',async()=>{
 await api().get('/care').expect(401);
 await header(api().post('/care/appointments')).send({...appt,childId:foreignId,requestId:'foreign-request-1'}).expect(404);
 process.env.FAKHR_DAILY_CARE_ENABLED='false';await header(api().get('/care')).expect(503);process.env.FAKHR_DAILY_CARE_ENABLED='true';
});
test('appointment create, exact replay, changed payload conflict',async()=>{
 const body={...appt,childId,requestId:'appointment-request-1'};
 const first=await header(api().post('/care/appointments')).send(body).expect(201);appointmentId=first.body.record.id;
 await header(api().post('/care/appointments')).send(body).expect(200);
 await header(api().post('/care/appointments')).send({...body,title:'Different'}).expect(409);
 expect(await Calendar.countDocuments()).toBe(1);
});
test('concurrent edits have one winner; cancellation retains record',async()=>{
 const results=await Promise.all([1,2].map(()=>header(api().put('/care/appointments/'+appointmentId)).send({...appt,status:'cancelled',revision:0})));
 expect(results.map(x=>x.status).sort()).toEqual([200,409]);expect(await Calendar.countDocuments()).toBe(1);
 expect((await Calendar.findById(appointmentId))?.status).toBe('cancelled');
});
test('medication create and expanded calendar share stable occurrence identity',async()=>{
 const result=await header(api().post('/care/medications')).send({...med,childId,requestId:'medication-request-1'}).expect(201);medId=result.body.record.id;
 const list=await header(api().get('/care')).query({childId,from:'2026-10-19',to:'2026-10-21'}).expect(200);
 expect(list.body.medications).toHaveLength(3);expect(new Set(list.body.medications.map((x:any)=>x.id)).size).toBe(1);
 expect(list.headers['cache-control']).toBe('no-store');
});
test('one recurring appointment cancellation does not cancel other dates',async()=>{
 const created=await header(api().post('/care/appointments')).send({...appt,childId,requestId:'occurrence-isolation-1'}).expect(201);
 await header(api().put('/care/appointments/'+created.body.record.id+'/occurrence')).send({date:'2026-10-20',revision:0,status:'cancelled'}).expect(200);
 const list=await header(api().get('/care')).query({childId,from:'2026-10-19',to:'2026-10-21'}).expect(200);
 expect(list.body.appointments.filter((x:any)=>x.id===created.body.record.id).map((x:any)=>x.status)).toEqual(['scheduled','cancelled','scheduled']);
});
test('medication history append only, replay safe, concurrent status conflict',async()=>{
 const body={childId,reminderId:medId,occurrence:'2026-10-19T09:00',scheduleRevision:0,expectedSequence:0,status:'given',requestId:'action-request-1'};
 await header(api().post('/care/medication-actions')).send(body).expect(201);
 await header(api().post('/care/medication-actions')).send(body).expect(200);
 await header(api().post('/care/medication-actions')).send({...body,requestId:'action-request-2',status:'skipped'}).expect(409);
 await header(api().post('/care/medication-actions')).send({...body,requestId:'action-request-3',expectedSequence:1,status:'pending'}).expect(201);
 expect(await MedicationAction.countDocuments()).toBe(2);
 expect((await MedicationAction.findOne({sequence:1}))?.scheduleSnapshot?.dose).toBe(med.dose);
});
test('invalid medication occurrence and stale schedule rejected',async()=>{
 const body={childId,reminderId:medId,occurrence:'2026-10-20T10:00',scheduleRevision:0,expectedSequence:0,status:'given',requestId:'invalid-occurrence-1'};
 await header(api().post('/care/medication-actions')).send(body).expect(400);
 await header(api().put('/care/medications/'+medId)).send({...med,active:false,revision:0}).expect(200);
 await header(api().post('/care/medication-actions')).send({...body,occurrence:'2026-10-20T09:00'}).expect(409);
});
test('draft participation denied; approved version records no developmental progress',async()=>{
 const template=await Template.create({name:'Synthetic approval fixture',duration:1,tasks:[]});
 const body={childId,templateId:String(template._id),catalogVersion:'synthetic-1',activityId:'synthetic-activity',status:'completed',notes:'Synthetic participation',accessibilityConfirmed:true,safetyConfirmed:true,requestId:'participation-request-1'};
 await header(api().post('/care/participation')).send(body).expect(409);
 await Template.collection.updateOne({_id:template._id},{$set:{publicationStatus:'approved',catalogVersion:'synthetic-1',approvedActivities:[{activityId:'synthetic-activity',title:{ar:'تجريبي',en:'Synthetic'},goal:{ar:'تجريبي',en:'Synthetic'},description:{ar:'تجريبي',en:'Synthetic'},steps:[{ar:'تجريبي',en:'Synthetic'}],duration:{ar:'تجريبي',en:'Synthetic'},adaptations:[{ar:'تجريبي',en:'Synthetic'}],safety:{ar:'تجريبي',en:'Synthetic'},participationObservation:{ar:'تجريبي',en:'Synthetic'},ageYears:[6,9],goalIds:['communication']}]}});
 await header(api().post('/care/participation')).send(body).expect(201);
 await header(api().post('/care/participation')).send(body).expect(200);
 expect(await ActivityParticipation.countDocuments()).toBe(1);
 await header(api().post('/care/participation')).send({...body,requestId:'decline-request-1',status:'declined',accessibilityConfirmed:false,safetyConfirmed:false}).expect(201);
 await header(api().post('/care/participation')).send({...body,requestId:'unsafe-completion-1',accessibilityConfirmed:false,safetyConfirmed:false}).expect(400);
});
test('missing unique index fails closed without leaking private input',async()=>{
 await MedicationReminder.collection.dropIndex('parentId_1_requestId_1');
 const result=await header(api().post('/care/medications')).send({...med,childId,requestId:'missing-index-request'}).expect(503);
 expect(result.body).toEqual({code:'CARE_INDEX_PREREQUISITE'});
 expect(JSON.stringify(result.body)).not.toContain('SYNTHETIC');
});
test('storage read failures sanitized; overlarge range rejected',async()=>{
 await header(api().get('/care')).query({childId,from:'2026-01-01',to:'2026-12-31'}).expect(400);
 const spy=jest.spyOn(Child,'exists').mockRejectedValueOnce(new Error('SYNTHETIC PRIVATE DOSE'));
 const result=await header(api().get('/care')).query({childId,from:'2026-10-19',to:'2026-10-21'}).expect(503);
 expect(result.body).toEqual({code:'CARE_STORAGE_UNAVAILABLE'});spy.mockRestore();
});
test('revoked session cannot access care records',async()=>{
 await RevokedToken.create({_id:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+60000)});
 await header(api().get('/care')).query({childId,from:'2026-10-19',to:'2026-10-21'}).expect(401);
});
test('restricted runtime persists across reconnect and cannot delete or manage indexes',async()=>{
 await MedicationReminder.createIndexes();
 const privileges=[
  ...['calendarevents','medicationreminders'].map(collection=>({resource:{db:'synthetic_daily_care',collection},actions:['find','insert','update','listIndexes']})),
  ...['medicationactions','activityparticipations'].map(collection=>({resource:{db:'synthetic_daily_care',collection},actions:['find','insert','listIndexes']})),
  {resource:{db:'synthetic_daily_care',collection:'children'},actions:['find','update']},
  {resource:{db:'synthetic_daily_care',collection:'users'},actions:['find']},
  {resource:{db:'synthetic_daily_care',collection:'revokedtokens'},actions:['find']},
  {resource:{db:'synthetic_daily_care',collection:'authlimits'},actions:['find','insert','update']},
  {resource:{db:'synthetic_daily_care',collection:'carepathtemplates'},actions:['find']},
 ];
 await mongoose.connection.db!.command({createRole:'syntheticCareRuntime',privileges,roles:[]});
 await mongoose.connection.db!.command({createUser:'syntheticcare',pwd:'synthetic-only-runtime',roles:[{role:'syntheticCareRuntime',db:'synthetic_daily_care'}]});
 const user=await User.findOne({email:'care@example.invalid'});
 token=generateToken({userId:String(user!._id),nonce:'fresh-synthetic'});auth='Bearer '+token;
 await mongoose.disconnect();
 await mongoose.connect(server.getUri('synthetic_daily_care'),{user:'syntheticcare',pass:'synthetic-only-runtime',authSource:'synthetic_daily_care',autoCreate:false,autoIndex:false});
 const list=await header(api().get('/care')).query({childId,from:'2026-10-19',to:'2026-10-21'}).expect(200);
 expect(list.body.history).toHaveLength(2);
 await header(api().post('/care/appointments')).send({...appt,childId,requestId:'restricted-request-1'}).expect(201);
 await expect(Calendar.collection.deleteOne({_id:new mongoose.Types.ObjectId(appointmentId)})).rejects.toMatchObject({code:13});
 await expect(Calendar.collection.createIndex({notes:1})).rejects.toMatchObject({code:13});
 await expect(MedicationAction.collection.updateOne({},{$set:{status:'given'}})).rejects.toMatchObject({code:13});
});

