import {stageMockPlan} from '../utils/mockPlanSave';
import {Snapshot,Task} from '../utils/smartPlan';
const empty=():Snapshot[]=>Array.from({length:7},()=>({tasks:[],meals:[],hasPlan:false}));
const task:Task={id:'mock-ai:fixture',title:'Fixture',status:'pending',draft:true,startTime:'16:00'};
test('stage is nonmutating, duplicate-safe and preserves existing records',()=>{const days=empty();days[0].tasks.push({...task,id:'existing'});const basis=days.map(x=>JSON.stringify(x));const next=stageMockPlan(days,basis,[{day:0,task},{day:0,task}]);expect(next[0].tasks).toHaveLength(2);expect(days[0].tasks).toHaveLength(1);expect(next[1]).toEqual(days[1])});
test('rejects stale snapshot and conflicting repeated edit without partial updates',()=>{const days=empty(),basis=days.map(x=>JSON.stringify(x));days[6].hasPlan=true;expect(()=>stageMockPlan(days,basis,[{day:0,task}])).toThrow('STALE_PREVIEW');expect(days[0].tasks).toHaveLength(0);days[0].tasks=[task];expect(()=>stageMockPlan(days,days.map(x=>JSON.stringify(x)),[{day:0,task:{...task,startTime:'17:00'}}])).toThrow('EXISTING_ACTIVITY_CONFLICT')});
test('rejects nonfixture records',()=>{const days=empty();expect(()=>stageMockPlan(days,days.map(x=>JSON.stringify(x)),[{day:0,task:{...task,draft:false}}])).toThrow()});
