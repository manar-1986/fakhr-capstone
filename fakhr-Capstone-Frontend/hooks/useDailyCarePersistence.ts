import {useQuery,useQueryClient} from '@tanstack/react-query';
import {requestCareConsent} from '../utils/careNotificationRuntime';
import {useRef,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {dailyCareEnabled,readCare,saveCare,recordMedication,markAppointment,CareRecord} from '../api/dailyCare.api';
import type {CareEntry} from '../components/plan/DailyCarePreview';
type Data={schedule:CareEntry[];medications:CareEntry[];history:{time:string;title:string;status:string}[]};
export function useDailyCarePersistence(childId:string|undefined,from:string,to:string){
 const {user}=useAuth(),client=useQueryClient(),busy=useRef(false),scope=useRef('');
 const [error,setError]=useState(false),[pending,setPending]=useState(false);
 const attempt=useRef<{signature:string;requestId:string}|undefined>(undefined);
 const enabled=dailyCareEnabled(),key=['daily-care',user?.id,childId,from,to];
 scope.current=String(user?.id)+':'+childId;
 const query=useQuery({queryKey:key,queryFn:()=>readCare(childId!,from,to),enabled:enabled&&!!user?.id&&!!childId,retry:false,refetchInterval:30000,gcTime:0});
 const convert=(v:CareRecord,med:boolean):CareEntry=>{
  const action=query.data?.history.find(a=>a.reminderId===v.id&&a.occurrence===v.occurrence);
  return {id:v.id+'@'+v.occurrence,title:v.title,date:v.occurrenceDate||v.date,start:v.startTime,end:v.endTime||'',category:v.category||'medication',location:v.location||'',notes:v.notes,reminder:v.reminder,dose:v.dose||'',frequency:v.frequency||'',status:med?action?.status||'pending':v.status||'scheduled',active:med?v.active!==false:true,timezone:v.timezone,repeat:v.recurrence?.kind||'none',until:v.recurrence?.until||v.date};
 };
 const data:Data={schedule:query.data?.appointments.map(v=>convert(v,false))||[],medications:query.data?.medications.map(v=>convert(v,true))||[],history:query.data?.history.map(h=>({time:h.createdAt,title:h.scheduleSnapshot?.title||query.data?.medications.find(m=>m.id===h.reminderId)?.title||'',status:h.status}))||[]};
 async function change(fn:(data:Data)=>Data){
  if(busy.current||!user?.id||!childId||!query.data){setError(true);return}
  const currentScope=scope.current;busy.current=true;setPending(true);setError(false);
  try{
   const next=fn(data);
   const changes=(['schedule','medications'] as const).flatMap(kind=>next[kind].filter(e=>JSON.stringify(e)!==JSON.stringify(data[kind].find(v=>v.id===e.id))).map(entry=>({kind,entry})));
   if(changes.length!==1)throw new Error('ONE_CHANGE_REQUIRED');
   const {kind,entry:e}=changes[0],med=kind==='medications';
   const original=(med?query.data.medications:query.data.appointments).find(v=>v.id+'@'+v.occurrence===e.id);
   const signature=JSON.stringify({scope:currentScope,kind,entry:{...e,id:original?.id},revision:original?.revision});
   if(attempt.current?.signature!==signature)attempt.current={signature,requestId:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2)};
   const requestId=attempt.current.requestId;
   const old=data[kind].find(v=>v.id===e.id);
   if(med&&original&&old?.status!==e.status){
    const latest=query.data.history.find(h=>h.reminderId===original.id&&h.occurrence===original.occurrence);
    await recordMedication({childId,requestId,reminderId:original.id,occurrence:original.occurrence,scheduleRevision:original.revision,expectedSequence:latest?.sequence||0,status:e.status});
   }else if(!med&&original&&old?.status!==e.status){
    await markAppointment(original.id,{date:original.occurrenceDate||original.date,revision:original.revision,status:e.status});
   }else{
    const date=original&&e.date===original.occurrenceDate?original.date:e.date;
    const recurrence={kind:e.repeat||'none',interval:original?.recurrence?.interval||1,until:e.repeat&&e.repeat!=='none'?e.until||date:date,weekdays:original?.recurrence?.weekdays?.length?original.recurrence.weekdays:[new Date(date+'T12:00:00Z').getUTCDay()]};
    const body={title:e.title,date,startTime:e.start,timezone:e.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone,notes:e.notes,reminder:e.reminder==='none'?'none':'at-time',recurrence,...(med?{dose:e.dose,frequency:e.frequency,active:e.active}:{endTime:e.end,category:e.category,location:e.location,status:original?.seriesStatus||e.status}),...(original?{revision:original.revision}:{requestId})};
    await saveCare(med?'medications':'appointments',childId,original?.id,body);
   }
   if(scope.current===currentScope){
    // Permission is requested only after a parent's explicit reminder selection.
    try{
     if(e.reminder!=='none'&&(!old||old.reminder==='none'))await requestCareConsent(user.id);
    }finally{
     await client.invalidateQueries({queryKey:['daily-care',user.id,childId]});
    }
   }
  }catch{if(scope.current===currentScope)setError(true)}
  finally{busy.current=false;if(scope.current===currentScope)setPending(false)}
 }
 return {enabled,data,change,pending,error:error||query.isError,loading:query.isLoading,authenticated:!!user?.id};
}


