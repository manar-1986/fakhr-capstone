import mongoose from 'mongoose';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import {appendWitness,assertWitness,witnessHead} from './ai.witness';
export const AI_POLICY = Object.freeze({
 id:'fakhr-gpt-6-luna-monthly-v1',attempts:2000,ceilingMicros:20000000,reservationMicros:10000,
 inputTokens:4000,billedInputTokens:16000,inputBytes:11904,framingAllowance:4096,
 outputTokens:8000,timeoutMs:20000,inputMicrosPerToken:0.125,outputMicrosPerToken:0.5,
});
type Attempt={month:string;token:string;bodyHash:string;state:'reserved'|'dispatching'|'completed'|'forfeited';inputTokens?:number;outputTokens?:number;recoveryId?:string};
export type Ledger={_id:string;anchor:string;policyHash:string;revision:number;months:Record<string,number>;lastSeen:number;attempts:Attempt[];recoveries:{id:string;revision:number}[];signature:string};
const collection=()=>mongoose.connection.collection<Ledger>('ai_budget_ledgers');
export const requestHash=(body:unknown)=>createHash('sha256').update(JSON.stringify(body)).digest('hex');
function settings(){
 const anchor=process.env.FAKHR_AI_LEDGER_ANCHOR,key=process.env.FAKHR_AI_LEDGER_SIGNING_KEY;
 if(!anchor||!/^[a-f0-9]{64}$/.test(anchor)||!key||!/^[a-f0-9]{64}$/.test(key))throw new Error('BUDGET_CONFIGURATION');
 return {anchor,key};
}
function unsigned(doc:Ledger){return {_id:doc._id,anchor:doc.anchor,policyHash:doc.policyHash,revision:doc.revision,months:doc.months,lastSeen:doc.lastSeen,attempts:doc.attempts,recoveries:doc.recoveries};}
function signature(doc:Omit<Ledger,'signature'>){return createHmac('sha256',settings().key).update(JSON.stringify(doc)).digest('hex');}
function verify(doc:Ledger|null):asserts doc is Ledger{
 if(!doc||doc._id!==AI_POLICY.id||doc.anchor!==settings().anchor||doc.policyHash!==requestHash(AI_POLICY)||
    !Array.isArray(doc.recoveries)||!Number.isSafeInteger(doc.revision)||doc.revision<0||!Array.isArray(doc.attempts)||doc.attempts.length>1||!doc.months||Object.keys(doc.months).length>120||!Number.isSafeInteger(doc.lastSeen)||Object.entries(doc.months).some(([m,n])=>!/^\d{4}-\d{2}$/.test(m)||!Number.isSafeInteger(n)||n<0||n>AI_POLICY.ceilingMicros)||
    doc.attempts.length*AI_POLICY.reservationMicros>AI_POLICY.ceilingMicros||typeof doc.signature!=='string'||
    !/^[a-f0-9]{64}$/.test(doc.signature))throw new Error('BUDGET_INVALID');
 if(!timingSafeEqual(Buffer.from(signature(unsigned(doc)),'hex'),Buffer.from(doc.signature,'hex')))throw new Error('BUDGET_INVALID');
}
export async function provisionAIBudget(){
 if(process.env.FAKHR_AI_ENABLED==='true'||await collection().findOne({})||await witnessHead())throw new Error('PROVISIONING_REFUSED');
 const base={_id:AI_POLICY.id,anchor:settings().anchor,policyHash:requestHash(AI_POLICY),revision:0,months:{} as Record<string,number>,lastSeen:0,attempts:[] as Attempt[],recoveries:[] as {id:string;revision:number}[]};
 const doc={...base,signature:signature(base)};
 await appendWitness(doc,null);
 await collection().insertOne(doc,{writeConcern:{w:'majority',j:true,wtimeout:5000}});
}
async function mutate(change:(doc:Ledger,month:string)=>void){
 if(mongoose.connection.readyState!==1)throw new Error('BUDGET_UNAVAILABLE');
 const current=await collection().findOne({_id:AI_POLICY.id},{readPreference:'primary',maxTimeMS:5000});verify(current);
 const verifiedWitness=await assertWitness(current);
 const previous=current.signature;
 const clock=await collection().aggregate([{$match:{_id:AI_POLICY.id}},{$project:{_id:0,now:'$$NOW'}}],{maxTimeMS:5000,readPreference:'primary'}).next();
 if(!(clock?.now instanceof Date)||!Number.isSafeInteger(clock.now.getTime())||clock.now.getTime()<current.lastSeen)throw new Error('BUDGET_CLOCK_INVALID');
 current.lastSeen=clock.now.getTime();
 const month=clock.now.toISOString().slice(0,7);
 change(current,month);current.revision++;current.signature=signature(unsigned(current));
 await appendWitness(current,previous,verifiedWitness);
 const result=await collection().replaceOne({_id:AI_POLICY.id,signature:previous},current,{writeConcern:{w:'majority',j:true,wtimeout:5000}});
 if(result.modifiedCount!==1)throw new Error('BUDGET_CONFLICT');
}
function charge(doc:Ledger,month:string) {
 if(!(month in doc.months)&&Object.keys(doc.months).length>=120)throw new Error('BUDGET_HISTORY_CAPACITY');
 const next=(doc.months[month]||0)+AI_POLICY.reservationMicros;
 if(next>AI_POLICY.ceilingMicros)throw new Error('BUDGET_EXHAUSTED');
 doc.months[month]=next;
}
export async function reserveAI(body:unknown){
 const token=randomUUID();
 await mutate((doc,month)=>{
  if(doc.attempts.some(a=>a.state==='reserved'||a.state==='dispatching'))throw new Error('BUDGET_BLOCKED');
  charge(doc,month);
  // Full attempt history remains in the independent immutable witness.
  doc.attempts=[{month,token,bodyHash:requestHash(body),state:'reserved'}];
 });return token;
}
export async function claimAI(token:string,body:unknown){
 await mutate((doc,month)=>{const a=doc.attempts.find(a=>a.token===token);
 if(!a||a.state!=='reserved'||a.bodyHash!==requestHash(body))throw new Error('RESERVATION_INVALID');
 if(a.month!==month){charge(doc,month);a.month=month;}
 a.state='dispatching';});
}
export async function completeAI(token:string,inputTokens:number,outputTokens:number){
 await mutate((doc,month)=>{const a=doc.attempts.find(a=>a.token===token);
 if(!a||a.state!=='dispatching'||!Number.isSafeInteger(inputTokens)||inputTokens<0||inputTokens>AI_POLICY.billedInputTokens||
    !Number.isSafeInteger(outputTokens)||outputTokens<0||outputTokens>AI_POLICY.outputTokens)throw new Error('USAGE_INVALID');
 // Cross-month calls retain the old charge and reserve in the new month too.
 if(a.month!==month){charge(doc,month);a.month=month;}
 Object.assign(a,{state:'completed',inputTokens,outputTokens});
 });
}
export async function recoverAIBudget(expectedSignature:string,recoveryId:string){
 if(process.env.FAKHR_AI_ENABLED!=='false'||process.env.FAKHR_AI_RECOVERY_APPROVED!=='forfeit-without-refund'||
    !/^[a-f0-9]{64}$/.test(expectedSignature)||!/^[a-f0-9-]{36}$/.test(recoveryId))throw new Error('RECOVERY_NOT_AUTHORIZED');
 const head=await witnessHead();
 if(!head||head.ledger.signature!==expectedSignature)throw new Error('RECOVERY_VERSION_CHANGED');
 verify(head.ledger);
 const current=await collection().findOne({_id:AI_POLICY.id},{readPreference:'primary',maxTimeMS:5000});
 if(current){verify(current);if(current.revision>head._id)throw new Error('RECOVERY_WITNESS_BEHIND');}
 if(!current)await collection().insertOne(head.ledger,{writeConcern:{w:'majority',j:true,wtimeout:5000}});
 else if(current.signature!==head.ledger.signature){
  const r=await collection().replaceOne({_id:AI_POLICY.id,signature:current.signature},head.ledger,{writeConcern:{w:'majority',j:true,wtimeout:5000}});
  if(r.modifiedCount!==1)throw new Error('RECOVERY_CONFLICT');
 }
 await mutate((doc,month)=>{
  if(doc.signature!==expectedSignature)throw new Error('RECOVERY_VERSION_CHANGED');
  const active=doc.attempts.filter(a=>a.state==='reserved'||a.state==='dispatching');
  if(doc.recoveries.some(r=>r.id===recoveryId))throw new Error('RECOVERY_ALREADY_RECORDED'); if(doc.recoveries.length>=1000)throw new Error('RECOVERY_HISTORY_CAPACITY'); doc.recoveries.push({id:recoveryId,revision:doc.revision});
  for(const a of active){if(a.month!==month){charge(doc,month);a.month=month;}Object.assign(a,{state:'forfeited',recoveryId});}
 });
}
