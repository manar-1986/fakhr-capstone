import {AuthLimit} from '../../models/AuthSecurity.model';
import {createHmac} from 'node:crypto';

export const AI_QUOTAS=[{scope:'quarter',limit:3,unit:'minute',amount:15},{scope:'day',limit:10,unit:'day',amount:1},{scope:'month',limit:100,unit:'month',amount:1}] as const;
export function quotaUpdate(unit:'minute'|'day'|'month',amount:number,limit:number) {
 const reset={$lte:[{$ifNull:['$expiresAt',new Date(0)]},'$$NOW']};
 // Quarter-hour is a window from the first attempt; day/month use UTC boundaries.
 const start=unit==='minute'?'$$NOW':{$dateTrunc:{date:'$$NOW',unit,timezone:'UTC'}};
 return [{$set:{count:{$cond:[reset,1,{$min:[{$add:[{$ifNull:['$count',0]},1]},limit+1]}]},
  expiresAt:{$cond:[reset,{$dateAdd:{startDate:start,unit,amount,timezone:'UTC'}},'$expiresAt']}}}];
}
export async function consumeAIQuotas(account:string) {
 const keyMaterial=process.env.FAKHR_AI_LEDGER_SIGNING_KEY;
 if(!keyMaterial||!/^[a-f0-9]{64}$/.test(keyMaterial))throw new Error('QUOTA_CONFIGURATION');
 await AuthLimit.init();
 for(const q of AI_QUOTAS){
  const key=createHmac('sha256',keyMaterial).update('fakhr-ai-quota-v2:'+q.scope+':'+account).digest('hex');
  const row=await AuthLimit.findOneAndUpdate({_id:key},quotaUpdate(q.unit,q.amount,q.limit),
   {upsert:true,new:true,updatePipeline:true,writeConcern:{w:'majority',wtimeout:5000},maxTimeMS:5000});
  if(!row||!Number.isInteger(row.count)||!(row.expiresAt instanceof Date))throw new Error('QUOTA_UNAVAILABLE');
  if(row.count>q.limit)return {allowed:false,retryAfter:Math.max(1,Math.ceil((row.expiresAt.getTime()-Date.now())/1000))};
 }
 return {allowed:true,retryAfter:0};
}
