import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import routes from "../modules/calendar/calendar.routes";
import CalendarEvent from "../models/CalendarEvent.model";
import Child from "../models/Child.model";
import User from "../models/User.model";
import { generateToken } from "../utils/jwt";
const app=express();app.use(express.json());app.use("/events",routes);app.use((err:any,req:any,res:any,next:any)=>res.status(err.statusCode||500).json({message:err.message}));
const data={title:"Test activity",date:"2026-10-12",startTime:"09:00",endTime:"10:00",timezone:"Asia/Kuwait",category:"home",notes:"test only",requestId:"isolated-test-request-1"};
async function fixture(){const parent=await User.create({email:"calendar-test@example.invalid",password:"test-only",role:"parent"});const child=await Child.create({name:"Test child",gender:"female",parentId:parent._id});return {token:generateToken({userId:String(parent._id)}),childId:String(child._id)};}
test("CRUD, persisted Mongo reads across reconnect, idempotency and optimistic concurrency",async()=>{
 await CalendarEvent.init();const {token,childId}=await fixture();const api=()=>request(app);const auth="Bearer "+token;
 const created=await api().post("/events").set("Authorization",auth).send({...data,childId}).expect(201);const id=created.body.event.id;
 const duplicate=await api().post("/events").set("Authorization",auth).send({...data,childId}).expect(200);expect(duplicate.body.event.id).toBe(id);expect(await CalendarEvent.countDocuments()).toBe(1);
 const uri=mongoose.connection.getClient().options.hosts.map(h=>h.toString()).join(",");const db=mongoose.connection.name;const replicaSet=mongoose.connection.getClient().options.replicaSet;await mongoose.disconnect();await mongoose.connect("mongodb://"+uri+"/"+db,{replicaSet});
 const fresh=await api().get("/events").set("Authorization",auth).query({childId,from:data.date,to:data.date}).expect(200);expect(fresh.body.events[0].title).toBe(data.title);
 const {requestId,...fields}=data;await api().put("/events/"+id).set("Authorization",auth).send({...fields,title:"Edited",revision:0,status:"completed"}).expect(200);
 await api().put("/events/"+id).set("Authorization",auth).send({...fields,revision:0}).expect(409);
 await api().delete("/events/"+id).set("Authorization",auth).query({revision:0}).expect(409);
 await api().delete("/events/"+id).set("Authorization",auth).query({revision:1}).expect(204);expect(await CalendarEvent.countDocuments()).toBe(0);
});
test("guest, cross-parent access and malformed dates are rejected",async()=>{
 const {token,childId}=await fixture();const auth="Bearer "+token;
 await request(app).get("/events").query({childId,from:data.date,to:data.date}).expect(401);
 const other=await User.create({email:"other-calendar@example.invalid",password:"test-only",role:"parent"});const foreign=await Child.create({name:"Other",gender:"male",parentId:other._id});
 await request(app).post("/events").set("Authorization",auth).send({...data,childId:String(foreign._id)}).expect(404);
 await request(app).post("/events").set("Authorization",auth).send({...data,childId,date:"2026-02-30"}).expect(400);
 await request(app).post("/events").set("Authorization",auth).send({...data,childId,endTime:"08:00"}).expect(400);
 const created=await request(app).post("/events").set("Authorization",auth).send({...data,childId}).expect(201);
 const otherAuth="Bearer "+generateToken({userId:String(other._id)});
 await request(app).get("/events").set("Authorization",otherAuth).query({childId,from:data.date,to:data.date}).expect(404);
 await request(app).delete("/events/"+created.body.event.id).set("Authorization",otherAuth).query({revision:0}).expect(404);
 const {requestId,...fields}=data;
 await request(app).put("/events/"+created.body.event.id).set("Authorization",otherAuth).send({...fields,revision:0}).expect(404);
 await request(app).post("/events").send({...data,childId}).expect(401);
 await request(app).post("/events").set("Authorization",auth).send({...data,childId,status:"confirmed"}).expect(400);
});

test("concurrent retries create one event and child ownership cannot be reassigned",async()=>{
 await CalendarEvent.init();const {token,childId}=await fixture();const auth="Bearer "+token;
 const responses=await Promise.all([1,2,3].map(()=>request(app).post("/events").set("Authorization",auth).send({...data,childId})));
 expect(responses.map(r=>r.status).sort()).toEqual([200,200,201]);
 expect(new Set(responses.map(r=>r.body.event.id)).size).toBe(1);
 expect(await CalendarEvent.countDocuments()).toBe(1);
 const {requestId,...fields}=data;
 await request(app).put("/events/"+responses[0].body.event.id).set("Authorization",auth).send({...fields,revision:0,childId:new mongoose.Types.ObjectId().toString()}).expect(400);
 const updated=await request(app).put("/events/"+responses[0].body.event.id).set("Authorization",auth).send({...fields,endTime:undefined,revision:0}).expect(200);
 expect(updated.body.event.endTime).toBeUndefined();
});
