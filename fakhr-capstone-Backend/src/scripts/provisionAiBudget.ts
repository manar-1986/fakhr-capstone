import 'dotenv/config';
import mongoose from 'mongoose'; import {closeWitness} from '../modules/ai/ai.witness';
import {provisionAIBudget} from '../modules/ai/ai.budget';

// Operator-only, explicitly approved provisioning. Not part of startup/build/request handling.
// Reconcile the old Windows test ledger before using a new campaign; never run this to reset spending.
async function main() {
  if(process.argv[2]!=='--initialize-empty-budget' ||
     process.env.FAKHR_AI_PROVISION_APPROVED!=='monthly-USD20' ||
     process.env.FAKHR_AI_ENABLED==='true' || !process.env.MONGODB_URI) throw new Error('PROVISIONING_NOT_AUTHORIZED');
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
  await provisionAIBudget();
  console.log('AI budget ledger provisioned; live generation remains disabled.');
}
main().catch(()=>{console.error('AI budget provisioning failed; no automatic reset or retry.');process.exitCode=1;})
  .finally(async()=>{await closeWitness();await mongoose.disconnect();});

