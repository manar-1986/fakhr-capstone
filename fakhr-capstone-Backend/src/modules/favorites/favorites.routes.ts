import { Router, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import Favorite from "../../models/Favorite.model";
import User from "../../models/User.model";
import Professional from "../../models/Professional.model";
import Center from "../../models/Center.model";
import catalog from "./catalog.json";
import { ApiError } from "../../middlewares/apiError";
const identity = z.object({kind:z.enum(["doctor","institution","product"]),targetId:z.string().min(1).max(120).regex(/^[a-zA-Z0-9:_-]+$/)}).strict();
const router=Router(); router.use(authenticate);
const wrap=(fn:(req:AuthRequest,res:Response)=>Promise<unknown>)=>(req:AuthRequest,res:Response,next:NextFunction)=>{void fn(req,res).catch(next);};
async function resolve(kind:string,targetId:string) {
 const local=catalog.find(i=>i.kind===kind&&i.targetId===targetId); if(local)return local;
 if(kind==="doctor"&&/^[a-f0-9]{24}$/i.test(targetId)) {const p=await Professional.findById(targetId).select("name").lean();if(p)return {kind,targetId,nameAr:p.name,nameEn:p.name};}
 if(kind==="institution"&&/^backend:[a-f0-9]{24}$/i.test(targetId)) {const p=await Center.findById(targetId.slice(8)).select("name").lean();if(p)return {kind,targetId,nameAr:p.name,nameEn:p.name};}
 return null;
}
router.get("/",wrap(async(req,res)=>{
 const page=z.object({offset:z.coerce.number().int().min(0).max(100000).default(0)}).strict().safeParse(req.query);
 if(!page.success)return res.status(400).json({message:"Invalid pagination"});
 const entries=await Favorite.find({owner:req.user!.id}).sort({createdAt:-1,_id:-1}).skip(page.data.offset).limit(51).lean();
 const items=await Promise.all(entries.slice(0,50).map(async f=>{const item=await resolve(f.kind,f.targetId);return {...item,kind:f.kind,targetId:f.targetId,available:!!item};}));
 return res.json({items,nextOffset:entries.length>50?page.data.offset+50:null});
}));
router.put("/",wrap(async(req,res)=>{
 const p=identity.safeParse(req.body);if(!p.success)return res.status(400).json({message:"Invalid favorite"});
 if(!await resolve(p.data.kind,p.data.targetId))return res.status(404).json({message:"Item not found"});
 await Favorite.init();
 await mongoose.connection.transaction(async session=>{
  const owner=await User.updateOne({_id:req.user!.id},{$inc:{__v:1}},{session,timestamps:false});
  if(!owner.matchedCount)throw ApiError.unauthorized("Account no longer exists");
  await Favorite.updateOne({owner:req.user!.id,...p.data},{$setOnInsert:{owner:req.user!.id,...p.data}},{upsert:true,session});
 });
 return res.status(200).json({saved:true});
}));
router.delete("/",wrap(async(req,res)=>{
 const p=identity.safeParse(req.query);if(!p.success)return res.status(400).json({message:"Invalid favorite"});
 await Favorite.deleteOne({owner:req.user!.id,...p.data});return res.status(204).send();
}));
export default router;

