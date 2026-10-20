import mongoose from 'mongoose';
import {MongoMemoryReplSet} from 'mongodb-memory-server';
import Child from '../models/Child.model';
import Template from '../models/CarePathTemplate.model';
import Plan from '../models/CarePath.model';
import Task from '../models/Task.model';
import Checkin from '../models/Checkin.model';
import {generateCarePath,getCurrentCarePath,completeTask,skipTask,createCheckin} from '../modules/carePath/carePath.service';
import {minimumRelease} from '../config/releaseProfile';
let server:MongoMemoryReplSet;
const parent=new mongoose.Types.ObjectId().toString(),foreign=new mongoose.Types.ObjectId().toString();
let childId:string,otherId:string,planId:string,taskIds:string[];
beforeAll(async()=>{
 server=await MongoMemoryReplSet.create({binary:{version:'8.0.34',arch:'x64'},replSet:{count:1,storageEngine:'wiredTiger',auth:{enable:true,customRootName:'syntheticroot',customRootPwd:'synthetic-only-root'}}});
 const base=server.getUri('synthetic_plan');
 await mongoose.connect(base,{user:'syntheticroot',pass:'synthetic-only-root',authSource:'admin',autoIndex:false,autoCreate:false});
 for(const model of [Child,Template,Plan,Task,Checkin]) {await model.createCollection();await model.createIndexes();}
 await Template.create({name:'Synthetic fixture only',duration:1,targetDiagnoses:['synthetic'],tasks:[{week:1,title:'Synthetic A',description:'Fixture',expectedOutcome:'Synthetic goal'},{week:1,title:'Synthetic B',description:'Fixture'}]});
 childId=(await Child.create({name:'Synthetic child',gender:'Male',parentId:parent,diagnosis:JSON.stringify(['synthetic'])})).id;
 otherId=(await Child.create({name:'Synthetic other child',gender:'Female',parentId:parent})).id;
 await mongoose.connection.db!.command({createRole:'planRuntime',roles:[],privileges:[
  ...['children','carepaths','tasks'].map(collection=>({resource:{db:'synthetic_plan',collection},actions:['find','insert','update']})),
  {resource:{db:'synthetic_plan',collection:'carepathtemplates'},actions:['find']},
  {resource:{db:'synthetic_plan',collection:'carepathcheckins'},actions:['insert']}
 ]});
 await mongoose.connection.db!.command({createUser:'syntheticapp',pwd:'synthetic-only-app',roles:[{role:'planRuntime',db:'synthetic_plan'}]});
 await mongoose.disconnect();
 await mongoose.connect(base,{user:'syntheticapp',pass:'synthetic-only-app',authSource:'synthetic_plan',autoCreate:false,autoIndex:false});
});
afterAll(async()=>{await mongoose.disconnect();await server?.stop();});
test('minimum-plan retains minimum security policy',()=>{expect(minimumRelease({FAKHR_RELEASE_PROFILE:'minimum-plan'})).toBe(true);});
test('restricted identity cannot create indexes or read unrelated collections',async()=>{
 await expect(mongoose.connection.db!.collection('tasks').createIndex({note:1})).rejects.toMatchObject({code:13});
 await expect(mongoose.connection.db!.collection('users').findOne({})).rejects.toMatchObject({code:13});
});
test('concurrent generation uses restricted role, transactions and one active plan',async()=>{
 const results=await Promise.all([generateCarePath({userId:parent,childId}),generateCarePath({userId:parent,childId})]);
 expect(results[0].carePath.id).toBe(results[1].carePath.id);expect(await Plan.countDocuments({childId})).toBe(1);
 planId=results[0].carePath.id;taskIds=results[0].tasks.map(t=>t.id);
 expect(taskIds).toHaveLength(2);expect(new Date(results[0].tasks[0].dueDate!).getTime()).toBeLessThan(Date.now()+60000);
});
test('foreign parent cannot read or mutate plan, tasks or feedback',async()=>{
 for(const action of [()=>getCurrentCarePath({userId:foreign,childId}),()=>generateCarePath({userId:foreign,childId}),()=>completeTask({userId:foreign,taskId:taskIds[0]}),()=>createCheckin({userId:foreign,childId,note:'Fixture'})])await expect(action()).rejects.toThrow();
 expect((await Task.findById(taskIds[0]))?.status).toBe('pending');
});
test('no matching template rolls back without creating a plan for sibling',async()=>{
 await expect(generateCarePath({userId:parent,childId:otherId})).rejects.toThrow('No matching');
 expect(await Plan.countDocuments({childId:otherId})).toBe(0);
});
test('failed task insert atomically rolls back generated plan',async()=>{
 await Child.updateOne({_id:otherId},{$set:{diagnosis:'synthetic'}});
 const spy=jest.spyOn(Task,'insertMany').mockRejectedValueOnce(new Error('Synthetic insert failure'));
 await expect(generateCarePath({userId:parent,childId:otherId})).rejects.toThrow('Synthetic insert failure');spy.mockRestore();
 expect(await Plan.countDocuments({childId:otherId})).toBe(0);
});
test('concurrent outcomes complete plan and retain completed progress',async()=>{
 await Promise.all([completeTask({userId:parent,taskId:taskIds[0]}),skipTask({userId:parent,taskId:taskIds[1]})]);
 expect((await Plan.findById(planId))?.status).toBe('completed');
 const current=await getCurrentCarePath({userId:parent,childId});expect(current.tasks.map(t=>t.status).sort()).toEqual(['completed','skipped']);
});
test('restricted insert-only check-in permission supports feedback',async()=>{
 expect((await createCheckin({userId:parent,childId,note:'Synthetic feedback'})).success).toBe(true);
 await expect(Checkin.findOne({})).rejects.toMatchObject({code:13});
});
