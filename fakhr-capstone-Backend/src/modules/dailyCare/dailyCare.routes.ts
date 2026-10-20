import {Router} from 'express';
import mongoose from 'mongoose';
import {createHash} from 'crypto';
import {z} from 'zod';
import {authenticate,AuthRequest} from '../../middlewares/auth.middleware';
import Child from '../../models/Child.model';
import CalendarEvent from '../../models/CalendarEvent.model';
import {MedicationReminder,MedicationAction,ActivityParticipation} from '../../models/DailyCare.model';
import {AuthLimit} from '../../models/AuthSecurity.model';
import {appointment,medication,objectId,requestId,range,validateSchedule,dates} from './contracts';
import {approvedForChild} from './approvedActivities';

const router=Router();router.use(authenticate);
router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next()});
router.use((_req,res,next)=>process.env.FAKHR_DAILY_CARE_ENABLED==='true'?next():res.status(503).json({code:'FEATURE_DISABLED'}));
const fail=(code:string,status=400)=>Object.assign(new Error(code),{safeCode:code,status});
const hash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
// No error messages, request bodies, medication names/doses, or driver diagnostics leave this boundary.
const wrap=(fn:any)=>(req:any,res:any)=>Promise.resolve(fn(req,res)).catch((e:any)=>{if(e.status===429)res.set('Retry-After','60');return res.status(e.safeCode?e.status:503).json({code:e.safeCode||'CARE_STORAGE_UNAVAILABLE'})});
const parse=(schema:any,value:any)=>{const p=schema.safeParse(value);if(!p.success)throw fail('INVALID_CARE_INPUT');return p.data};
const owned=async(parentId:string,childId:string,session?:any)=>{
 const q=Child.exists({_id:childId,parentId});if(session)q.session(session);
 if(!await q)throw fail('CHILD_NOT_FOUND',404);
};
const view=(doc:any)=>{const v=doc.toObject?doc.toObject():doc;const {_id,parentId,requestId,fingerprint,__v,...safe}=v;return {id:String(_id),...safe,childId:String(v.childId)}};
async function ready(model:any){
 const indexes=await model.collection.indexes();
 for(const [key,options] of model.schema.indexes()){
  if(!indexes.some((i:any)=>JSON.stringify(i.key)===JSON.stringify(key)&&!!i.unique===!!options.unique&&!i.partialFilterExpression&&!i.sparse))throw fail('CARE_INDEX_PREREQUISITE',503);
 }
}
async function limited(parentId:string){
 const bucket=Math.floor(Date.now()/60000);
 const value=await AuthLimit.findOneAndUpdate({_id:'care:'+hash(parentId)+':'+bucket},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((bucket+2)*60000)}},{upsert:true,new:true});
 if((value.count||0)>60)throw fail('CARE_RATE_LIMITED',429);
}
async function transaction(parentId:string,childId:string,fn:(session:any)=>Promise<any>){
 return mongoose.connection.transaction(async session=>{
  // Shared child document serializes writes and deletion; no demographic fields are changed.
  const child=await Child.updateOne({_id:childId,parentId},{$inc:{__v:1}},{session,timestamps:false});
  if(!child.matchedCount)throw fail('CHILD_NOT_FOUND',404);
  return fn(session);
 },{readConcern:{level:'snapshot'},writeConcern:{w:'majority'},maxCommitTimeMS:5000});
}
async function replay(model:any,parentId:string,request:string,fingerprint:string){
 const prior=await model.findOne({parentId,requestId:request});
 if(prior&&prior.fingerprint!==fingerprint)throw fail('REQUEST_CONFLICT',409);
 return prior;
}
for(const [path,model,schema] of [['appointments',CalendarEvent,appointment],['medications',MedicationReminder,medication]] as const){
 router.post('/'+path,wrap(async(req:AuthRequest,res:any)=>{
  const {childId,requestId:request,...data}=parse(schema.extend({childId:objectId,requestId}),req.body);
  await owned(req.user!.id,childId);try{validateSchedule(data)}catch{throw fail('INVALID_SCHEDULE_OR_TIMEZONE')}
  await ready(model);await limited(req.user!.id);const fingerprint=hash({childId,...data});
  const previous=await replay(model,req.user!.id,request,fingerprint);if(previous)return res.json({record:view(previous)});
  try{
   const record=await transaction(req.user!.id,childId,async session=>(await (model as any).create([{...data,parentId:req.user!.id,childId,requestId:request,fingerprint,revision:0}],{session}))[0]);
   return res.status(201).json({record:view(record)});
  }catch(e:any){if(e.code!==11000)throw e;const prior=await replay(model,req.user!.id,request,fingerprint);if(!prior)throw fail('REQUEST_CONFLICT',409);return res.json({record:view(prior)})}
 }));
 router.put('/'+path+'/:id',wrap(async(req:AuthRequest,res:any)=>{
  const id=parse(objectId,req.params.id);const {revision,...data}=parse(schema.extend({revision:z.number().int().nonnegative()}),req.body);
  const existing=await (model as any).findOne({_id:id,parentId:req.user!.id});if(!existing)throw fail('CARE_NOT_FOUND',404);
  await owned(req.user!.id,String(existing.childId));try{validateSchedule(data as any)}catch{throw fail('INVALID_SCHEDULE_OR_TIMEZONE')}
  await ready(model);await limited(req.user!.id);
  const record=await transaction(req.user!.id,String(existing.childId),async session=>{
   const value=await (model as any).findOneAndUpdate({_id:id,parentId:req.user!.id,revision},{$set:data,$inc:{revision:1}},{new:true,session,runValidators:true});
   if(!value)throw fail('REVISION_CONFLICT',409);return value;
  });return res.json({record:view(record)});
 }));
}
router.get('/',wrap(async(req:AuthRequest,res:any)=>{
 const p=parse(range,req.query);await owned(req.user!.id,p.childId);
 const filter={parentId:req.user!.id,childId:p.childId,date:{$lte:p.to},$or:[{date:{$gte:p.from}},{'recurrence.until':{$gte:p.from}}]};
 const [appointments,medications]=await Promise.all([CalendarEvent.find(filter).limit(201).maxTimeMS(5000),MedicationReminder.find(filter).limit(201).maxTimeMS(5000)]);
 if(appointments.length>200||medications.length>200)throw fail('RANGE_TOO_LARGE',413);
 const expand=(records:any[])=>records.flatMap(record=>{
  const v=view(record);const schedule={...v,recurrence:v.recurrence||{kind:'none',interval:1,until:v.date,weekdays:[]}};
  return dates(schedule as any,p.from,p.to).map(date=>({...v,seriesStatus:v.status,status:v.occurrenceStatus?.[date]||v.status,occurrence:date+'T'+v.startTime,occurrenceDate:date}));
 });
 const events=expand(appointments),reminders=expand(medications);
 if(events.length+reminders.length>2000)throw fail('RANGE_TOO_LARGE',413);
 const actions=await MedicationAction.find({parentId:req.user!.id,childId:p.childId,occurrence:{$gte:p.from,$lt:p.to+'~'}}).sort({createdAt:-1,_id:-1}).limit(501).maxTimeMS(5000);
 if(actions.length>500)throw fail('RANGE_TOO_LARGE',413);
 res.set('Cache-Control','no-store');return res.json({appointments:events,medications:reminders,history:actions.map(view)});
}));
router.post('/medication-actions',wrap(async(req:AuthRequest,res:any)=>{
 const p=parse(z.object({childId:objectId,requestId,reminderId:objectId,occurrence:z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),scheduleRevision:z.number().int().nonnegative(),expectedSequence:z.number().int().nonnegative(),status:z.enum(['given','skipped','pending'])}).strict(),req.body);
 await owned(req.user!.id,p.childId);await ready(MedicationAction);await limited(req.user!.id);
 const fingerprint=hash(p),prior=await replay(MedicationAction,req.user!.id,p.requestId,fingerprint);if(prior)return res.json({record:view(prior)});
 const record=await transaction(req.user!.id,p.childId,async session=>{
  const reminder=await MedicationReminder.findOne({_id:p.reminderId,parentId:req.user!.id,childId:p.childId,active:true,revision:p.scheduleRevision}).session(session);
  if(!reminder)throw fail('REMINDER_CHANGED',409);
  const day=p.occurrence.slice(0,10);
  if(!dates(reminder.toObject() as any,day,day).includes(day)||p.occurrence!==day+'T'+reminder.startTime)throw fail('INVALID_OCCURRENCE');
  const latest=await MedicationAction.findOne({parentId:req.user!.id,childId:p.childId,reminderId:p.reminderId,occurrence:p.occurrence}).sort({sequence:-1}).session(session);
  if((latest?.sequence||0)!==p.expectedSequence)throw fail('REVISION_CONFLICT',409);
  return (await MedicationAction.create([{...p,parentId:req.user!.id,fingerprint,sequence:p.expectedSequence+1,scheduleSnapshot:{title:reminder.title,dose:reminder.dose,frequency:reminder.frequency,timezone:reminder.timezone}}],{session}))[0];
 });return res.status(201).json({record:view(record)});
}));
router.put('/appointments/:id/occurrence',wrap(async(req:AuthRequest,res:any)=>{
 const id=parse(objectId,req.params.id),p=parse(z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),revision:z.number().int().nonnegative(),status:z.enum(['scheduled','completed','cancelled'])}).strict(),req.body);
 const existing=await CalendarEvent.findOne({_id:id,parentId:req.user!.id});if(!existing)throw fail('CARE_NOT_FOUND',404);
 await owned(req.user!.id,String(existing.childId));await limited(req.user!.id);
 const schedule={...existing.toObject(),recurrence:existing.recurrence||{kind:'none',interval:1,until:existing.date,weekdays:[]}};
 if(!dates(schedule as any,p.date,p.date).includes(p.date))throw fail('INVALID_OCCURRENCE');
 const record=await transaction(req.user!.id,String(existing.childId),async session=>{
  const result=await CalendarEvent.findOneAndUpdate({_id:id,parentId:req.user!.id,revision:p.revision},{$set:{['occurrenceStatus.'+p.date]:p.status},$inc:{revision:1}},{new:true,session});
  if(!result)throw fail('REVISION_CONFLICT',409);return result;
 });return res.json({record:view(record)});
}));
router.get('/activities',wrap(async(req:AuthRequest,res:any)=>{
 const p=parse(z.object({childId:objectId}).strict(),req.query);await owned(req.user!.id,p.childId);
 res.set('Cache-Control','no-store');return res.json({activities:await approvedForChild(req.user!.id,p.childId)});
}));
router.post('/participation',wrap(async(req:AuthRequest,res:any)=>{
 const p=parse(z.object({childId:objectId,requestId,templateId:objectId,catalogVersion:z.string().min(1).max(80),activityId:z.string().min(1).max(80),status:z.enum(['completed','skipped','declined']),notes:z.string().max(2000),accessibilityConfirmed:z.boolean(),safetyConfirmed:z.boolean()}).strict().refine(v=>v.status!=='completed'||(v.accessibilityConfirmed&&v.safetyConfirmed)),req.body);
 await owned(req.user!.id,p.childId);await ready(ActivityParticipation);await limited(req.user!.id);
 // Explicit publication/version required. Local review drafts cannot become production records.
 const template=(await approvedForChild(req.user!.id,p.childId)).find(a=>a.templateId===p.templateId&&a.catalogVersion===p.catalogVersion&&a.activityId===p.activityId);
 if(!template)throw fail('ACTIVITY_NOT_APPROVED',409);
 const fingerprint=hash(p),prior=await replay(ActivityParticipation,req.user!.id,p.requestId,fingerprint);if(prior)return res.json({record:view(prior)});
 const record=await transaction(req.user!.id,p.childId,async session=>(await ActivityParticipation.create([{...p,parentId:req.user!.id,fingerprint}],{session}))[0]);
 return res.status(201).json({record:view(record)});
}));
export default router;
