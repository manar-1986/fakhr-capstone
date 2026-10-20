import {Snapshot,Task} from './smartPlan';
/** Pure, all-days validation before the caller commits synthetic memory changes. */
export function stageMockPlan(current:Snapshot[],basis:string[],additions:{day:number;task:Task}[]):Snapshot[]{
 if(current.length!==7||basis.length!==7||current.some((d,i)=>JSON.stringify(d)!==basis[i]))throw Error('STALE_PREVIEW');
 if(additions.some(a=>!Number.isInteger(a.day)||a.day<0||a.day>6||!a.task.id.startsWith('mock-ai:')||!a.task.draft))throw Error('INVALID_FIXTURE');
 const next:Snapshot[]=JSON.parse(JSON.stringify(current));
 for(const {day,task} of additions){const existing=next[day].tasks.find(x=>x.id===task.id);if(existing){if(existing.startTime!==task.startTime)throw Error('EXISTING_ACTIVITY_CONFLICT');continue}next[day].hasPlan=true;next[day].tasks.push(task)}
 return next;
}
