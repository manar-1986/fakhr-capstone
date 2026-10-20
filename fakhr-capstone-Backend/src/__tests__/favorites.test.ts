import express from "express";
import request from "supertest";
import Favorite from "../models/Favorite.model";
import User from "../models/User.model";
import favorites from "../modules/favorites/favorites.routes";
import auth from "../modules/auth/auth.routes";
import catalog from "../modules/favorites/catalog.json";
import {generateToken} from "../utils/jwt";
import {errorHandler} from "../middlewares/error.middleware";
const app=express();app.use(express.json());app.use("/favorites",favorites);app.use("/auth",auth);app.use(errorHandler);
const item={kind:"product",targetId:"p-1"};
async function parent(email:string){const u=await User.create({email,password:"isolated-only",role:"parent"});return {id:u.id,auth:"Bearer "+generateToken({userId:u.id})};}
const save=(a:string,body:object=item)=>request(app).put("/favorites").set("Authorization",a).send(body);
beforeEach(async()=>{await Favorite.init();});
test("guests cannot read, save or delete",async()=>{await request(app).get("/favorites").expect(401);await request(app).put("/favorites").send(item).expect(401);await request(app).delete("/favorites").query(item).expect(401);});
test("saves real public identities, prevents duplicates and preserves ownership",async()=>{
 const a=await parent("a@isolated.invalid"),b=await parent("b@isolated.invalid");
 await Promise.all([save(a.auth).expect(200),save(a.auth).expect(200)]);
 expect(await Favorite.countDocuments()).toBe(1);
 expect((await request(app).get("/favorites").set("Authorization",b.auth)).body.items).toEqual([]);
 await request(app).delete("/favorites").set("Authorization",b.auth).query(item).expect(204);
 expect(await Favorite.countDocuments()).toBe(1);
 const listed=await request(app).get("/favorites").set("Authorization",a.auth).expect(200);
 expect(listed.body.items[0]).toMatchObject({...item,available:true,nameEn:"Wheelchair"});expect(listed.body.items[0].owner).toBeUndefined();
 await request(app).delete("/favorites").set("Authorization",a.auth).query(item).expect(204);
 await request(app).delete("/favorites").set("Authorization",a.auth).query(item).expect(204);expect(await Favorite.countDocuments()).toBe(0);
});
test("rejects ownership injection, malformed and nonexistent targets",async()=>{
 const a=await parent("validation@isolated.invalid");
 await save(a.auth,{...item,owner:"other"}).expect(400);
 await save(a.auth,{kind:"doctor",targetId:"not-a-provider"}).expect(404);
 await save(a.auth,{kind:"school",targetId:"x"}).expect(400);
 await save(a.auth,{kind:"product",targetId:{$ne:null}}).expect(400);
 await request(app).get("/favorites").set("Authorization",a.auth).query({owner:"other"}).expect(400);
});
test("all supported catalog kinds retain exact canonical IDs",async()=>{
 const a=await parent("catalog@isolated.invalid");
 for(const kind of ["doctor","institution","product"]){const target=catalog.find(i=>i.kind===kind)!;await save(a.auth,{kind,targetId:target.targetId}).expect(200);}
 expect(await Favorite.countDocuments({owner:a.id})).toBe(3);
});
test("pagination, missing items and storage failure remain explicit",async()=>{
 const a=await parent("pages@isolated.invalid");
 await Favorite.insertMany(catalog.slice(0,51).map(i=>({owner:a.id,kind:i.kind,targetId:i.targetId})));
 const first=await request(app).get("/favorites").set("Authorization",a.auth).expect(200);expect(first.body.items).toHaveLength(50);expect(first.body.nextOffset).toBe(50);
 const second=await request(app).get("/favorites?offset=50").set("Authorization",a.auth).expect(200);expect(second.body.items).toHaveLength(1);expect(second.body.nextOffset).toBeNull();
 await Favorite.create({owner:a.id,kind:"doctor",targetId:"removed-provider"});
 const list=await request(app).get("/favorites").set("Authorization",a.auth);expect(list.body.items.find((i:{targetId:string})=>i.targetId==="removed-provider").available).toBe(false);
 jest.spyOn(Favorite,"updateOne").mockRejectedValueOnce(new Error("simulated storage failure"));await save(a.auth).expect(500);
});
test("pending account deletion preserves all favorites",async()=>{
 const a=await parent("delete@isolated.invalid"),b=await parent("keep@isolated.invalid");await save(a.auth);await save(b.auth);
 await request(app).delete("/auth/delete-account").set("Authorization",a.auth).expect(503);
 expect(await Favorite.countDocuments({owner:a.id})).toBe(1);expect(await Favorite.countDocuments({owner:b.id})).toBe(1);
 await request(app).get("/favorites").set("Authorization",a.auth).expect(200);
});
