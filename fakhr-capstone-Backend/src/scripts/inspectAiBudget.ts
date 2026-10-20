import 'dotenv/config';
import mongoose from 'mongoose';
import {witnessHead,closeWitness} from '../modules/ai/ai.witness';
import {AI_POLICY} from '../modules/ai/ai.budget';
async function main(){
 if(process.env.FAKHR_AI_ENABLED!=='false'||!process.env.MONGODB_URI)throw new Error('DISABLE_AI');
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
 const head=await witnessHead();if(!head)throw new Error('MISSING_WITNESS');
 console.log(JSON.stringify({revision:head._id,expectedSignature:head.ledger.signature,
  attempts:head.ledger.attempts.length,reservedMicros:head.ledger.attempts.length*AI_POLICY.reservationMicros,
  states:head.ledger.attempts.map(a=>a.state)}));
}
main().catch(()=>{console.error('Budget inspection failed; keep AI disabled.');process.exitCode=1;})
 .finally(async()=>{await closeWitness();await mongoose.disconnect();});
