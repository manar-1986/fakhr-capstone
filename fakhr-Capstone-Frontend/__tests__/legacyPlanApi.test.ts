import api from '../api/axios';
import {getProgress,getTaskDetails,generateCarePath,submitCheckIn,getChildren,getWeeklyPlan} from '../api/care-path.api';
jest.mock('../api/axios',()=>({__esModule:true,default:{get:jest.fn(),post:jest.fn()}}));
beforeEach(()=>jest.resetAllMocks());
test('progress uses the selected child and computes actual completed tasks',async()=>{
 jest.mocked(api.get).mockResolvedValue({carePath:{_id:'plan'},tasks:[{_id:'a',status:'completed'},{_id:'b',status:'skipped'}]});
 expect(await getProgress('child')).toEqual({completedTasks:1,totalTasks:2,completionRate:50});
 expect(api.get).toHaveBeenCalledWith('/care-paths/current',{params:{childId:'child'}});
});
test('multiple children require explicit selection and never generate for the first child',async()=>{
 jest.mocked(api.get).mockResolvedValue({data:{children:[{id:'a'},{id:'b'}]}});
 await expect(generateCarePath()).rejects.toThrow('Select a child');expect(api.post).not.toHaveBeenCalled();
});
test('generation uses the actual registered endpoint and rejects missing confirmation',async()=>{
 jest.mocked(api.post).mockResolvedValue({});await expect(generateCarePath('child')).rejects.toThrow('not confirmed');
 jest.mocked(api.post).mockResolvedValue({carePath:{_id:'plan'},tasks:[{_id:'task',title:'Actual'}]});
 expect((await generateCarePath('child')).tasks[0].id).toBe('task');
 expect(api.post).toHaveBeenCalledWith('/care-paths/generate',{childId:'child'});
});
test('task details preserve bilingual content and actual status',async()=>{
 jest.mocked(api.get).mockResolvedValue({task:{_id:'task',title:'Actual',titleAr:'حقيقي',status:'completed'}});
 expect(await getTaskDetails('task')).toMatchObject({id:'task',completed:true,titleAr:'حقيقي'});
 expect(api.get).toHaveBeenCalledWith('/care-path-tasks/task');
});
test('check-in requires a persisted acknowledgement and preserves notes',async()=>{
 jest.mocked(api.post).mockResolvedValue({success:true,checkin:{_id:'check',createdAt:'date',note:'Private original text'}});
 expect(await submitCheckIn({childId:'child',notes:'Private original text',rating:0})).toEqual({id:'check',date:'date',notes:'Private original text',rating:0});
 jest.mocked(api.post).mockRejectedValue(new Error('offline'));await expect(submitCheckIn({childId:'child',notes:'x',rating:0})).rejects.toThrow('offline');
});
test('children and absent weekly plans use real endpoint responses',async()=>{
 jest.mocked(api.get).mockResolvedValueOnce({data:{children:[{id:'child'}]}}).mockResolvedValueOnce({carePath:null,tasks:[]});
 expect(await getChildren()).toEqual([{id:'child'}]);expect(await getWeeklyPlan('child')).toBeNull();
});
