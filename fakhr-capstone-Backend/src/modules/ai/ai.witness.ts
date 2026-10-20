import mongoose, {Connection} from 'mongoose';
import {createHmac,timingSafeEqual} from 'node:crypto';
import type {Ledger} from './ai.budget';
type Witness = {_id:number; anchor:string; previous:string|null; ledger:Ledger; signature:string};
export const WITNESS_LIMITS=Object.freeze({timeoutMs:5000,batchSize:512,entries:25000});
declare const verifiedBrand:unique symbol;
export type VerifiedWitness={readonly [verifiedBrand]:true};
// Opaque, single-use capabilities cannot be forged by passing a caller-supplied head.
const verifiedHeads=new WeakMap<VerifiedWitness,{head:Witness;checkedAt:number}>();
let pending:Promise<Connection>|undefined;
let connectedUri:string|undefined;
function authority(uri:string) {
 const match=/^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?([^/?]+)/.exec(uri);
 if(!match)throw new Error('WITNESS_CONFIGURATION');
 return match[1].toLowerCase();
}
export async function witnessConnection() {
 const uri=process.env.FAKHR_AI_WITNESS_URI,primary=process.env.MONGODB_URI;
 if(!uri || !primary || authority(uri)===authority(primary))throw new Error('INDEPENDENT_WITNESS_REQUIRED');
 if(pending && connectedUri!==uri)throw new Error('WITNESS_CONFIGURATION_CHANGED');
 if(!pending) {
  connectedUri=uri;
  pending=mongoose.createConnection(uri,{serverSelectionTimeoutMS:5000,autoCreate:false,autoIndex:false}).asPromise();
 }
 return pending;
}
export async function closeWitness() {
 try { if(pending)await (await pending).close(); } catch { /* Never disclose connection errors during cleanup. */ }
 pending=undefined;connectedUri=undefined;
}
type Privilege={resource:{db?:string;collection?:string;anyResource?:boolean;cluster?:boolean};actions:string[]};
export function appendOnlyPrivileges(privileges:Privilege[],db:string):boolean {
 return privileges.length>0 &&
  privileges.every(p=>p.resource.db===db && p.resource.collection==='ai_budget_witness' &&
    !p.resource.anyResource && !p.resource.cluster && p.actions.every(a=>a==='find'||a==='insert')) &&
  ['find','insert'].every(a=>privileges.some(p=>p.actions.includes(a)));
}
async function collection(signal?:AbortSignal) {
 const conn=await witnessConnection();
 signal?.throwIfAborted();
 const status=await conn.db!.command({connectionStatus:1,showPrivileges:true},{signal,timeoutMS:WITNESS_LIMITS.timeoutMs});
 signal?.throwIfAborted();
 if(!appendOnlyPrivileges(status.authInfo?.authenticatedUserPrivileges||[],conn.name))throw new Error('WITNESS_ROLE_NOT_APPEND_ONLY');
 return conn.collection<Witness>('ai_budget_witness');
}
function sign(doc:Omit<Witness,'signature'>) {
 const key=process.env.FAKHR_AI_WITNESS_SIGNING_KEY;
 if(!key || !/^[a-f0-9]{64}$/.test(key) || key===process.env.FAKHR_AI_LEDGER_SIGNING_KEY)throw new Error('WITNESS_KEY_INVALID');
 return createHmac('sha256',key).update(JSON.stringify(doc)).digest('hex');
}
function verify(doc:Witness) {
 const base={_id:doc._id,anchor:doc.anchor,previous:doc.previous,ledger:doc.ledger};
 if(!Number.isSafeInteger(doc._id)||doc._id<0||doc._id!==doc.ledger.revision ||
    doc.anchor!==process.env.FAKHR_AI_LEDGER_ANCHOR || !/^[a-f0-9]{64}$/.test(doc.signature) ||
    !timingSafeEqual(Buffer.from(sign(base),'hex'),Buffer.from(doc.signature,'hex')))throw new Error('WITNESS_INVALID');
}
export async function witnessHead() {
 const started=performance.now();
 const controller=new AbortController();
 const timeoutError=new Error('WITNESS_TIMEOUT');
 const expired=new Promise<never>((_,reject)=>controller.signal.addEventListener('abort',()=>reject(timeoutError),{once:true}));
 const timer=setTimeout(()=>controller.abort(timeoutError),WITNESS_LIMITS.timeoutMs);
 const checkDeadline=()=>{
  if(performance.now()-started>=WITNESS_LIMITS.timeoutMs)controller.abort(timeoutError);
  controller.signal.throwIfAborted();
 };
 const read=async()=>{
  const col=await collection(controller.signal);checkDeadline();
  // Check every signature/link. Never authorize against a partial chain or tail alone.
  const cursor=col.find({},{readPreference:'primary',maxTimeMS:WITNESS_LIMITS.timeoutMs,
   timeoutMS:Math.max(1,WITNESS_LIMITS.timeoutMs-(performance.now()-started)),
   timeoutMode:'cursorLifetime',signal:controller.signal}).sort({_id:1})
   .limit(WITNESS_LIMITS.entries+1).batchSize(WITNESS_LIMITS.batchSize);
  let head:Witness|null=null,count=0;
  try {for await(const row of cursor){
   checkDeadline();
   if(++count>WITNESS_LIMITS.entries)throw new Error('WITNESS_REVIEW_REQUIRED');
   verify(row);
   if(row._id!==count-1||row.previous!==(head?.signature||null))throw new Error('WITNESS_CHAIN_INVALID');
   head=row;
  }checkDeadline();return head;
  }finally{
   // Abort reaches the driver's pending read; cleanup must not defeat the deadline.
   const cleanup=cursor.close({timeoutMS:1000});
   if(controller.signal.aborted)void cleanup.catch(()=>{});else await cleanup;
  }
 };
 try{return await Promise.race([read(),expired]);}
 finally{clearTimeout(timer);}
}
export async function appendWitness(next:Ledger,previousLedgerSignature:string|null,verified?:VerifiedWitness) {
 let head:Witness|null;
 if(verified){
  const evidence=verifiedHeads.get(verified);verifiedHeads.delete(verified);
  if(!evidence||performance.now()-evidence.checkedAt>=WITNESS_LIMITS.timeoutMs)throw new Error('WITNESS_EVIDENCE_INVALID');
  head=evidence.head;
 }else head=await witnessHead();
 if((head?.ledger.signature||null)!==previousLedgerSignature ||
    next.revision!==(head?head._id+1:0))throw new Error('WITNESS_CONFLICT');
 // Do not append entry 25,001 and leave a partially advanced ledger at the limit.
 if(next.revision>=WITNESS_LIMITS.entries)throw new Error('WITNESS_REVIEW_REQUIRED');
 const base={_id:next.revision,anchor:next.anchor,previous:head?.signature||null,ledger:next};
 // Unique _id serializes competing writers even if they verified the same head.
 // No retry on duplicate revision or uncertain insertion; primary CAS remains mandatory.
 await (await collection()).insertOne({...base,signature:sign(base)},{writeConcern:{w:'majority',j:true,wtimeout:5000}});
}
export async function assertWitness(ledger:Ledger) {
 const head=await witnessHead();
 if(!head || head.ledger.signature!==ledger.signature || head._id!==ledger.revision)throw new Error('LEDGER_ROLLBACK_OR_PARTIAL_WRITE');
 const evidence=Object.freeze({}) as VerifiedWitness;
 verifiedHeads.set(evidence,{head:structuredClone(head),checkedAt:performance.now()});
 return evidence;
}


