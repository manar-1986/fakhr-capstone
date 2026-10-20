import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
let server:MongoMemoryServer|undefined;
beforeAll(async()=>{server=await MongoMemoryServer.create({binary:{version:"7.0.14",arch:process.platform==="win32"?"x64":process.arch},instance:{storageEngine:"wiredTiger"}});await mongoose.connect(server.getUri());},180000);
afterEach(async()=>{if(mongoose.connection.readyState===1)for(const collection of Object.values(mongoose.connection.collections))await collection.deleteMany({});});
afterAll(async()=>{await mongoose.disconnect();await server?.stop();});
