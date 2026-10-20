import 'dotenv/config';
import mongoose from 'mongoose';
import {recoverAIBudget} from '../modules/ai/ai.budget';
import {closeWitness} from '../modules/ai/ai.witness';
async function main(){
 if(!process.env.MONGODB_URI)throw new Error('RECOVERY_CONFIGURATION');
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
 await recoverAIBudget(process.argv[2]||'',process.argv[3]||'');
 console.log('Recovery recorded. Attempts and full reservations retained; AI remains disabled.');
}
main().catch(()=>{console.error('Recovery refused or incomplete. Keep AI disabled; review witness state.');process.exitCode=1;})
 .finally(async()=>{await closeWitness();await mongoose.disconnect();});
