import mongoose from "mongoose";
import {Router,Response,NextFunction} from "express";
import {z} from "zod";
import {authenticate,AuthRequest} from "../../middlewares/auth.middleware";
import {SupportAgent,SupportConversation,SupportRate,SupportReport} from "../../models/Support.model";
import User from "../../models/User.model";
const router=Router();
// No production activation until support provisioning and privacy policy are approved.
router.use((_req,res,next)=>{if(process.env.NODE_ENV==="production"||process.env.FAKHR_SUPPORT_LOCAL_TEST!=="1"){res.status(503).json({message:"Support messaging is not enabled"});return;}next();});
router.use(authenticate);
const wrap=(fn:(req:AuthRequest,res:Response)=>Promise<unknown>)=>(req:AuthRequest,res:Response,next:NextFunction)=>{void fn(req,res).catch(()=>res.status(503).json({message:"Support request could not be completed"}));};
router.use((req:AuthRequest,res,next)=>{void (async()=>{
 if(req.user!.role!=="parent"&&!(req.user!.role==="admin"&&await SupportAgent.exists({userId:req.user!.id,active:true})))return res.status(403).json({message:"Support access denied"});
 next();
})().catch(()=>res.status(503).json({message:"Support unavailable"}));});
const own=(req:AuthRequest)=>req.user!.role==="admin"?{assignedAdminId:req.user!.id}:{parentId:req.user!.id};
const id=z.string().regex(/^[a-f\d]{24}$/i);
const text=(max:number)=>z.string().trim().min(1).max(max).refine(s=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s));
const requestId=z.string().regex(/^[a-zA-Z0-9-]{12,100}$/);
async function limited(req:AuthRequest,res:Response){
 for(const [window,limit] of [[60000,10],[3600000,100]]){
  const bucket=Math.floor(Date.now()/window);const key=req.user!.id+":"+window+":"+bucket;
  const hit=await SupportRate.findOneAndUpdate({_id:key},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((bucket+2)*window)}},{upsert:true,new:true});
  if(hit.count>limit){res.setHeader("Retry-After",Math.ceil(((bucket+1)*window-Date.now())/1000));res.status(429).json({message:"Please wait before sending more requests"});return true;}
 }return false;
}
router.get("/",wrap(async(req,res)=>{
 const offset=z.coerce.number().int().min(0).max(10000).safeParse(req.query.offset||0);if(!offset.success)return res.status(400).json({message:"Invalid page"});
 const rows=await SupportConversation.find(own(req)).select("subject status updatedAt").sort({updatedAt:-1,_id:-1}).skip(offset.data).limit(31).lean();
 return res.json({mode:req.user!.role==="admin"?"admin":"parent",items:rows.slice(0,30).map(r=>({id:String(r._id),subject:r.subject,status:r.status,updatedAt:r.updatedAt})),nextOffset:rows.length>30?offset.data+30:null});
}));
router.post("/",wrap(async(req,res)=>{
 if(req.user!.role!=="parent")return res.status(403).json({message:"Only parents start inquiries"});
 const p=z.object({subject:text(120),body:text(4000),requestId}).strict().safeParse(req.body);if(!p.success)return res.status(400).json({message:"Invalid inquiry"});
 if(await limited(req,res))return;
 const old=await SupportConversation.findOne({parentId:req.user!.id,requestId:p.data.requestId});if(old)return res.json({id:String(old._id)});
 const agents=await SupportAgent.find({active:true}).select("userId").lean();const admin=await User.findOne({_id:{$in:agents.map(a=>a.userId)},role:"admin",isDisabled:{$ne:true}}).sort({_id:1});
 if(!admin)return res.status(503).json({message:"No authorized Fakhr support administrator is available"});
 await SupportConversation.init();
 const row=await SupportConversation.findOneAndUpdate({parentId:req.user!.id,requestId:p.data.requestId},{$setOnInsert:{parentId:req.user!.id,assignedAdminId:admin._id,subject:p.data.subject,requestId:p.data.requestId,messages:[{requestId:p.data.requestId,sender:"parent",body:p.data.body,createdAt:new Date()}]}},{upsert:true,new:true});
 return res.status(201).json({id:String(row._id)});
}));
router.get("/:id",wrap(async(req,res)=>{
 if(!id.safeParse(req.params.id).success)return res.status(400).json({message:"Invalid conversation"});
 const row=await SupportConversation.findOne({_id:req.params.id,...own(req)}).lean();if(!row)return res.status(404).json({message:"Conversation not found"});
 return res.json({id:String(row._id),subject:row.subject,status:row.status,messages:row.messages.map(m=>({id:String(m._id),sender:m.sender,body:m.body,createdAt:m.createdAt}))});
}));
router.post("/:id/messages",wrap(async(req,res)=>{
 const p=z.object({body:text(4000),requestId}).strict().safeParse(req.body);if(!p.success||!id.safeParse(req.params.id).success)return res.status(400).json({message:"Invalid message"});
 if(await limited(req,res))return;
 const scope={_id:req.params.id,...own(req)};
 const row=await SupportConversation.findOne(scope);if(!row)return res.status(404).json({message:"Conversation not found"});
 if(row.messages.some(m=>m.requestId===p.data.requestId))return res.json({sent:true});
 const saved=await SupportConversation.updateOne({...scope,status:"open","messages.99":{$exists:false},"messages.requestId":{$ne:p.data.requestId}},{$push:{messages:{...p.data,sender:req.user!.role==="admin"?"admin":"parent",createdAt:new Date()}}});
 if(!saved.modifiedCount){if(await SupportConversation.exists({...scope,"messages.requestId":p.data.requestId}))return res.json({sent:true});return res.status(409).json({message:"Conversation is closed or full"});}
 return res.json({sent:true});
}));
router.post("/:id/report",wrap(async(req,res)=>{
 const p=z.object({reason:z.enum(["privacy","abuse","other"])}).strict().safeParse(req.body);if(!p.success||!id.safeParse(req.params.id).success)return res.status(400).json({message:"Invalid report"});
 if(await limited(req,res))return;
 const scope={_id:req.params.id,...own(req)};await SupportReport.init();
 const session=await mongoose.startSession();let found=false;
 try {await session.withTransaction(async()=>{
 const row=await SupportConversation.findOneAndUpdate(scope,{$set:{status:"closed"}},{session});found=!!row;if(!row)return;
 await SupportReport.updateOne({conversationId:req.params.id,reporterId:req.user!.id},{$set:{reason:p.data.reason}},{upsert:true,session});
 });}finally{await session.endSession();}
 return found?res.json({reported:true}):res.status(404).json({message:"Conversation not found"});
}));
router.delete("/:id",wrap(async(req,res)=>{
 if(req.user!.role!=="parent")return res.status(403).json({message:"Only the parent can delete this local-test conversation"});
 if(!id.safeParse(req.params.id).success)return res.status(400).json({message:"Invalid conversation"});
 if(await limited(req,res))return;
 const session=await mongoose.startSession();let found=false;
 try{await session.withTransaction(async()=>{const row=await SupportConversation.findOneAndDelete({_id:req.params.id,parentId:req.user!.id},{session});found=!!row;if(!row)return;await SupportReport.deleteMany({conversationId:row._id},{session});});}finally{await session.endSession();}
 return found?res.status(204).send():res.status(404).json({message:"Conversation not found"});
}));
export default router;
