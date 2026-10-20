import mongoose from "mongoose";
import User from "../../models/User.model";
import { ApiError } from "../../middlewares/apiError";
import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import Child from "../../models/Child.model";
import CalendarEvent from "../../models/CalendarEvent.model";
const id = z.string().regex(/^[a-f0-9]{24}$/i);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {const d=new Date(v+"T12:00:00Z");return !isNaN(+d)&&d.toISOString().slice(0,10)===v;});
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const fields = z.object({title:z.string().trim().min(1).max(160),date,startTime:time,endTime:time.optional(),timezone:z.string().max(80).refine(v=>{try{new Intl.DateTimeFormat("en",{timeZone:v});return true;}catch{return false;}}),category:z.enum(["therapy","doctor","center","school","home","education","reminder"]),notes:z.string().max(2000).default(""),status:z.enum(["scheduled","completed"]).default("scheduled")}).strict();
const validTimes = (v:{startTime:string;endTime?:string}) => !v.endTime || v.endTime>v.startTime;
const create = fields.extend({childId:id,requestId:z.string().min(12).max(100).regex(/^[a-zA-Z0-9-]+$/)}).strict().refine(validTimes,{message:"End time must follow start time"});
const update = fields.extend({revision:z.number().int().nonnegative()}).strict().refine(validTimes,{message:"End time must follow start time"});
const query = z.object({childId:id,from:date,to:date}).strict().refine(v=>v.to>=v.from && (+new Date(v.to)- +new Date(v.from))/86400000<=366);
const router=Router(); router.use(authenticate);
router.use((req,res,next)=>{if(process.env.FAKHR_DAILY_CARE_ENABLED==='true'&&!['GET','HEAD'].includes(req.method)){res.status(409).json({code:'USE_DAILY_CARE_API'});return;}next();});
const wrap=(fn:(req:AuthRequest,res:Response)=>Promise<unknown>)=>(req:AuthRequest,res:Response,next:NextFunction)=>{void fn(req,res).catch(next);};
const owned=(parentId:string,childId:string)=>Child.exists({_id:childId,parentId});
const serialize=(e:any)=>{const v=e.toObject?e.toObject():e;return {id:String(v._id),childId:String(v.childId),title:v.title,date:v.date,startTime:v.startTime,endTime:v.endTime,timezone:v.timezone,category:v.category,notes:v.notes,status:v.status,revision:v.revision};};
router.get("/",wrap(async(req,res)=>{
 const p=query.safeParse(req.query);if(!p.success)return res.status(400).json({message:"Invalid calendar range"});
 if(!await owned(req.user!.id,p.data.childId))return res.status(404).json({message:"Child not found"});
 const events=await CalendarEvent.find({parentId:req.user!.id,childId:p.data.childId,date:{$gte:p.data.from,$lte:p.data.to}}).sort({date:1,startTime:1,_id:1});
 return res.json({events:events.map(serialize)});
}));
router.post("/",wrap(async(req,res)=>{
 const p=create.safeParse(req.body);if(!p.success)return res.status(400).json({message:"Invalid event"});
 if(!await owned(req.user!.id,p.data.childId))return res.status(404).json({message:"Child not found"});
 const {childId,requestId,...data}=p.data;
 // Retry identity must be protected by the unique index before accepting creates.
 await CalendarEvent.init();
 try {
 const event=await mongoose.connection.transaction(async session=>{
   // A real write serializes creation against account deletion, without changing profile fields.
   const parent=await User.updateOne({_id:req.user!.id},{$inc:{__v:1}},{session,timestamps:false});
   if(!parent.matchedCount)throw ApiError.unauthorized("Account no longer exists");
   if(!await Child.exists({_id:childId,parentId:req.user!.id}).session(session))throw ApiError.notFound("Child not found");
   const [created]=await CalendarEvent.create([{...data,childId,requestId,parentId:req.user!.id}],{session});
   return created;
 });
 return res.status(201).json({event:serialize(event)});
}
 catch(error:any){if(error.code!==11000)throw error;
 const previous=await CalendarEvent.findOne({parentId:req.user!.id,requestId});
 if(!previous||String(previous.childId)!==childId)return res.status(409).json({message:"Request identity conflict"});
 return res.json({event:serialize(previous)});}
}));
router.put("/:id",wrap(async(req,res)=>{
 const eventId=id.safeParse(req.params.id),p=update.safeParse(req.body);if(!eventId.success||!p.success)return res.status(400).json({message:"Invalid event"});
 const existing=await CalendarEvent.findOne({_id:eventId.data,parentId:req.user!.id});
 if(!existing||!await owned(req.user!.id,String(existing.childId)))return res.status(404).json({message:"Event not found"});
 const {revision,...data}=p.data;
 const event=await CalendarEvent.findOneAndUpdate({_id:eventId.data,parentId:req.user!.id,revision},{$set:data,$unset: data.endTime ? {} : {endTime:1},$inc:{revision:1}},{new:true,runValidators:true});
 if(!event)return res.status(409).json({message:"Event changed; reload before editing"});return res.json({event:serialize(event)});
}));
router.delete("/:id",wrap(async(req,res)=>{
 const eventId=id.safeParse(req.params.id),revision=z.coerce.number().int().nonnegative().safeParse(req.query.revision);
 if(!eventId.success||!revision.success)return res.status(400).json({message:"Invalid event"});
 const existing=await CalendarEvent.findOne({_id:eventId.data,parentId:req.user!.id});
 if(!existing||!await owned(req.user!.id,String(existing.childId)))return res.status(404).json({message:"Event not found"});
 const deleted=await CalendarEvent.deleteOne({_id:eventId.data,parentId:req.user!.id,revision:revision.data});
 if(!deleted.deletedCount)return res.status(409).json({message:"Event changed; reload before deleting"});return res.status(204).send();
}));
export default router;
