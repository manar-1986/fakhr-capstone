import type {CareSnapshot} from '../api/dailyCare.api';
// Saved IANA timezone is authoritative. Reject DST gaps/folds, never guess.
export function careInstant(day:string,clock:string,zone:string):number {
 const target=day+'T'+clock,wall=Date.parse(target+':00Z');
 const fmt=new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const render=(n:number)=>fmt.format(new Date(n)).replace(' ','T');
 const candidates=new Set<number>();
 for(const delta of [-36,-12,0,12,36]){
  const probe=wall+delta*3600000,offset=Date.parse(render(probe)+':00Z')-probe,value=wall-offset;
  if(render(value)===target)candidates.add(value);
 }
 if(candidates.size!==1)throw new Error('CARE_TIME_REVIEW_REQUIRED');
 return [...candidates][0];
}
export function selectCareReminders(snapshots:CareSnapshot[]){
 const seen=new Set<string>();const selected:{instant:number}[]=[];
 for(const s of snapshots)for(const kind of ['appointments','medications'] as const)for(const r of s[kind]){
  if(r.reminder!=='at-time'||r.active===false||r.seriesStatus==='cancelled'||r.status==='cancelled'||r.status==='completed')continue;
  const latest=s.history.filter(a=>a.reminderId===r.id&&a.occurrence===r.occurrence).sort((a,b)=>b.sequence-a.sequence)[0];
  if(kind==='medications'&&latest&&latest.status!=='pending')continue;
  const key=kind+':'+r.id+':'+r.occurrence;
  if(seen.has(key))continue;seen.add(key);
  selected.push({instant:careInstant(r.occurrenceDate||r.date,r.startTime,r.timezone)});
 }
 return selected;
}
