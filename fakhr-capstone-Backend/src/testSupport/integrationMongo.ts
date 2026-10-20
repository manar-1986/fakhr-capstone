import mongoose,{Connection} from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { clearBlacklist } from "../utils/tokenBlacklist";
import {closeWitness} from "../modules/ai/ai.witness";
let server:MongoMemoryReplSet,witnessServer:MongoMemoryReplSet;
export let witnessAdmin:Connection|undefined;
const originalUri=process.env.MONGODB_URI;
beforeAll(async()=>{
 const binary={version:"7.0.14",arch:process.platform==="win32"?"x64":process.arch};
 server=await MongoMemoryReplSet.create({binary,replSet:{count:1,storageEngine:"wiredTiger"}});
 process.env.MONGODB_URI=server.getUri();
 await mongoose.connect(server.getUri());
 if(expect.getState().testPath?.includes('aiPortableBudget')){
  witnessServer=await MongoMemoryReplSet.create({binary,replSet:{count:1,storageEngine:'wiredTiger',
   auth:{enable:true,customRootName:'testroot',customRootPwd:'synthetic-root-only'}}});
  const base=witnessServer.getUri('witness');
  witnessAdmin=await mongoose.createConnection(base.replace('mongodb://','mongodb://testroot:synthetic-root-only@')+'&authSource=admin').asPromise();
  await witnessAdmin.db!.createCollection('ai_budget_witness');
  await witnessAdmin.db!.command({createRole:'appendOnly',privileges:[{resource:{db:'witness',collection:'ai_budget_witness'},actions:['find','insert']}],roles:[]});
  await witnessAdmin.db!.command({createUser:'witnessapp',pwd:'synthetic-app-only',roles:[{role:'appendOnly',db:'witness'}]});
  process.env.FAKHR_AI_WITNESS_URI=base.replace('mongodb://','mongodb://witnessapp:synthetic-app-only@')+'&authSource=witness';
 }
},180000);
afterEach(async()=>{
 jest.restoreAllMocks();clearBlacklist();
 for(const col of Object.values(mongoose.connection.collections))await col.deleteMany({});
 if(witnessAdmin)await witnessAdmin.collection('ai_budget_witness').deleteMany({});
});
afterAll(async()=>{
 await closeWitness();await witnessAdmin?.close();await mongoose.disconnect();await witnessServer?.stop();await server?.stop();
 if(originalUri===undefined)delete process.env.MONGODB_URI;else process.env.MONGODB_URI=originalUri;
});
