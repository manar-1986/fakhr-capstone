import {z} from 'zod';
export const objectId=z.string().regex(/^[a-f0-9]{24}$/i);
export const requestId=z.string().regex(/^[a-zA-Z0-9-]{12,100}$/);
export const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !isNaN(+d)&&d.toISOString().slice(0,10)===v});
export const time=z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const timezone=z.string().min(1).max(80).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true}catch{return false}});
export const recurrence=z.object({kind:z.enum(['none','daily','weekly']),interval:z.number().int().min(1).max(12),until:date,weekdays:z.array(z.number().int().min(0).max(6)).max(7)}).strict();
const common={title:z.string().trim().min(1).max(160),date,startTime:time,timezone,notes:z.string().max(2000).default(''),reminder:z.enum(['none','at-time']),recurrence};
export const appointment=z.object({...common,endTime:time,category:z.enum(['therapy','doctor','center','school','home','education','reminder','speech','occupational','behavioral','physical','sport','medical','social','parent']),location:z.string().max(300),status:z.enum(['scheduled','completed','cancelled'])}).strict();
export const medication=z.object({...common,dose:z.string().trim().min(1).max(300),frequency:z.string().trim().min(1).max(300),active:z.boolean()}).strict();
export const range=z.object({childId:objectId,from:date,to:date}).strict().refine(v=>v.to>=v.from&&(+new Date(v.to)- +new Date(v.from))/86400000<=62);
export type Schedule=z.infer<typeof medication>|z.infer<typeof appointment>;
// Wall times are interpreted in the saved IANA zone, never the caller's device zone.
// Gaps and folds are rejected instead of silently moving reminders at DST boundaries.
export function instant(day:string,clock:string,zone:string):number {
 const target=day+'T'+clock; const wall=Date.parse(target+':00Z');
 const fmt=new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const render=(n:number)=>fmt.format(new Date(n)).replace(' ','T');
 const candidates=new Set<number>();
 for(const delta of [-36,-12,0,12,36]){
   const probe=wall+delta*3600000;
   const offset=Date.parse(render(probe)+':00Z')-probe;
   const value=wall-offset;
   if(render(value)===target)candidates.add(value);
 }
 if(candidates.size!==1)throw new Error('AMBIGUOUS_OR_INVALID_WALL_TIME');
 return [...candidates][0];
}
export function dates(s:Schedule,from:string,to:string):string[]{
 const r=s.recurrence;
 if(r.until<s.date||(+new Date(r.until)- +new Date(s.date))/86400000>366)throw new Error('INVALID_RECURRENCE');
 if(r.kind==='weekly'&&!r.weekdays.length)throw new Error('INVALID_RECURRENCE');
 const out:string[]=[];
 for(let n=0;n<=366;n++){
   const d=new Date(s.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);const key=d.toISOString().slice(0,10);
   if(key>r.until||key>to)break;
   const matches=r.kind==='none'?n===0:r.kind==='daily'?n%r.interval===0:Math.floor(n/7)%r.interval===0&&r.weekdays.includes(d.getUTCDay());
   if(matches&&key>=from)out.push(key);
 }
 return out;
}
export function validateSchedule(s:Schedule){
 if('endTime' in s&&s.endTime<=s.startTime)throw new Error('INVALID_TIME_RANGE');
 for(const day of dates(s,s.date,s.recurrence.until)){
   instant(day,s.startTime,s.timezone);
   if('endTime' in s)instant(day,s.endTime,s.timezone);
 }
}
