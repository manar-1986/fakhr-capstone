import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthLimit } from '../models/AuthSecurity.model';
import { env } from '../config/env';
import { normalizedClientIp } from '../config/proxy';
const WINDOW=15*60*1000;
export const AUTH_LIMITS={login:10,register:5,'forgot-password':3,'reset-password':10,logout:30,'delete-account':5,profile:20} as const;
export type AuthAction=keyof typeof AUTH_LIMITS;
export async function consumeAuthLimit(key:string,limit:number) {
 await AuthLimit.init();
 const reset={$lte:[{$ifNull:['$expiresAt',new Date(0)]},'$$NOW']};
 // One atomic update per shared counter. Server time and saturating counts avoid
 // clock skew and integer growth; TTL is cleanup, never the access decision.
 const row=await AuthLimit.findOneAndUpdate({_id:key},[{$set:{
  count:{$cond:[reset,1,{$min:[{$add:[{$ifNull:['$count',0]},1]},limit+1]}]},
  expiresAt:{$cond:[reset,{$add:['$$NOW',WINDOW]},'$expiresAt']}
 }}],{upsert:true,new:true,updatePipeline:true,writeConcern:{w:"majority"}});
 return {allowed:row!.count!<=limit,retryAfter:Math.max(1,Math.ceil((row!.expiresAt!.getTime()-Date.now())/1000))};
}
export function authRateLimit(action:AuthAction) {
 return async(req:Request,res:Response,next:NextFunction)=>{
  try {
   // Do not trust caller-supplied forwarding headers. A reviewed proxy topology
   // is required before enabling Express trust proxy in production.
   const ip=normalizedClientIp(req.ip||req.socket.remoteAddress);
   const body=req.body||{};
   const identity=['profile','logout','delete-account'].includes(action)?(req as any).user?.id:action==='reset-password'?String(typeof body.token==='string'?body.token.slice(0,256):'invalid'):
    typeof body.email==='string'?body.email.trim().toLowerCase().slice(0,254):(req as any).user?.id;
   const hash=(scope:string,value:string)=>crypto.createHmac('sha256',env.JWT_SECRET).update('fakhr-auth-limit-v1:'+scope+':'+value).digest('hex');
   const checks:[string,number][]=[[hash('ip',ip),60]];
   if(identity)checks.push([hash(action,identity),AUTH_LIMITS[action]]);
   else checks.push([hash(action+':ip',ip),AUTH_LIMITS[action]]);
   for(const [key,limit] of checks){const result=await consumeAuthLimit(key,limit);if(!result.allowed){res.setHeader('Retry-After',result.retryAfter);res.status(429).json({success:false,error:'Too many requests. Please try again later.'});return;}}
   next();
  } catch {res.status(503).json({success:false,error:'Authentication is temporarily unavailable'});}
 };
}
