// Isolated local QA only. Does not import app.ts or use MONGODB_URI.
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {writeFileSync} from "fs";
import {join} from "path";
import {tmpdir} from "os";
import calendar from "../modules/calendar/calendar.routes";
import Child from "../models/Child.model";
import User from "../models/User.model";
import {generateToken} from "../utils/jwt";
import {authenticate,AuthRequest} from "../middlewares/auth.middleware";
async function main(){
 const mongo=await MongoMemoryServer.create({binary:{version:"7.0.14",arch:process.platform==="win32"?"x64":process.arch},instance:{storageEngine:"wiredTiger"}});
 await mongoose.connect(mongo.getUri());
 const user=await User.create({email:"calendar-browser@example.invalid",password:"test-only-not-real",name:"Calendar Test Parent",role:"parent"});
 const child=await Child.create({parentId:user._id,name:"Calendar Test Child",gender:"female"});
 await Child.create({parentId:user._id,name:"Second Test Child",gender:"male"});
 const app=express();app.use(express.json());app.use("/api/calendar-events",calendar);
 app.get("/api/users/me",authenticate,(req:AuthRequest,res)=>res.json({success:true,data:{user:{id:String(user._id),name:user.name,role:user.role,email:user.email}}}));
 app.get("/api/children",authenticate,async(req:AuthRequest,res)=>res.json({success:true,data:{children:(await Child.find({parentId:req.user!.id})).map(c=>({id:String(c._id),parentId:String(c.parentId),name:c.name})),count:2}}));
 app.get("/api/care-paths/current",authenticate,(req,res)=>res.json({carePath:null,tasks:[]}));
 app.post("/test/restart-database",async(req,res)=>{await mongoose.disconnect();await mongo.stop({doCleanup:false});await mongo.start();await mongoose.connect(mongo.getUri());res.json({restarted:true});});
 app.use((req,res)=>res.status(404).json({message:"Not part of isolated calendar QA"}));
 app.use((err:any,req:any,res:any,next:any)=>res.status(err.statusCode||500).json({message:err.message}));
 const server=app.listen(18080,"127.0.0.1",()=>{writeFileSync(join(tmpdir(),"fakhr-calendar-qa.json"),JSON.stringify({token:generateToken({userId:String(user._id)}),childId:String(child._id),parentId:String(user._id)}));console.log("Isolated calendar QA listening on 127.0.0.1:18080");});
 const stop=async()=>{server.close();await mongoose.disconnect();await mongo.stop();process.exit(0);};process.on("SIGINT",()=>void stop());process.on("SIGTERM",()=>void stop());
}
void main();
