import {sendHelpMessage} from '../api/helpCenter.api';
import type {SchoolContext} from '../types/recommendation';
type Topic=Extract<SchoolContext,{category:'general'}>['topic'];
// Only reviewed constants cross the authenticated API boundary, never the typed narrative.
const prompts:Record<Topic,string>={plans:'General weekly plan guidance',activities:'General educational activities',products:'General educational product selection',sessions:'General session preparation',development:'General development guidance',parenting:'General parent guidance'};
export function generalAskRequest(text:string,ar:boolean){
 const q=text.normalize('NFKC').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[\u064B-\u065F]/g,'');
 let topic:Topic|undefined;
 if(/plan|weekly|خطه|جدول/.test(q))topic='plans';
 else if(/activit|play|نشاط|انشط|لعب/.test(q))topic='activities';
 else if(/product|resource|منتج|موارد/.test(q))topic='products';
 else if(/session|appointment|جلس|موعد/.test(q))topic='sessions';
 else if(/development|progress|accessibility|تقدم|نمو|تطور|وصول/.test(q))topic='development';
 else if(/parent|caregiv|اهل|والدين/.test(q))topic='parenting';
 if(!topic)return null;
 const locale=ar?'ar':'en';
 return {message:prompts[topic],locale,schoolContext:{category:'general',topic,language:locale}} as const;
}
export async function sendGeneralAsk(text:string,ar:boolean){
 const request=generalAskRequest(text,ar);
 if(!request)return ar?'اختر موضوعاً عاماً: الأنشطة، الخطط، المنتجات، الجلسات أو النمو. لا ترسل بيانات شخصية.':'Choose a general topic: activities, plans, products, sessions or development. Do not share personal data.';
 return (await sendHelpMessage(request)).message;
}
export function generalAskError(error:unknown,ar:boolean){
 const e=error as {status?:number;code?:string};
 if(e?.status===401)return ar?'يرجى تسجيل الدخول مجدداً.':'Please sign in again.';
 if(e?.status===429)return ar?'وصلت إلى حد الطلبات. يرجى الانتظار قبل المحاولة مجدداً.':'Request limit reached. Please wait before trying again.';
 if(e?.code==='FEATURE_DISABLED')return ar?'المساعد العام غير مفعّل حالياً.':'The general assistant is currently disabled.';
 return ar?'المساعد غير متاح مؤقتاً. حاول لاحقاً.':'The assistant is temporarily unavailable. Try again later.';
}
