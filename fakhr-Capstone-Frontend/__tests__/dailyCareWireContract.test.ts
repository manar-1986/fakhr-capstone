import api from '../api/axios';
import {saveCare,readCare,recordMedication} from '../api/dailyCare.api';
import {appointment,medication,objectId,requestId,range} from '../../fakhr-capstone-Backend/src/modules/dailyCare/contracts';
jest.mock('../api/axios',()=>({__esModule:true,default:{get:jest.fn(),post:jest.fn(),put:jest.fn()}}));
const childId='000000000000000000000001';
const base={title:'Synthetic only',date:'2026-10-19',startTime:'09:00',timezone:'Asia/Kuwait',notes:'',reminder:'at-time',recurrence:{kind:'none',interval:1,until:'2026-10-19',weekdays:[]}};
test('real frontend create payloads satisfy backend strict schemas and route names',async()=>{
 await saveCare('appointments',childId,undefined,{...base,endTime:'10:00',category:'school',location:'',status:'scheduled',requestId:'synthetic-request-1'});
 const first=(api.post as jest.Mock).mock.calls[0];expect(first[0]).toBe('/daily-care/appointments');expect(appointment.extend({childId:objectId,requestId}).safeParse(first[1]).success).toBe(true);
 await saveCare('medications',childId,undefined,{...base,dose:'caregiver synthetic input',frequency:'synthetic',active:true,requestId:'synthetic-request-2'});
 const second=(api.post as jest.Mock).mock.calls[1];expect(second[0]).toBe('/daily-care/medications');expect(medication.extend({childId:objectId,requestId}).safeParse(second[1]).success).toBe(true);
});
test('read range and append-only medication endpoint preserve child and occurrence',async()=>{
 await readCare(childId,'2026-10-19','2026-10-20');const call=(api.get as jest.Mock).mock.calls[0];expect(call[0]).toBe('/daily-care');expect(range.safeParse(call[1].params).success).toBe(true);
 const body={childId,requestId:'synthetic-action-1',reminderId:'000000000000000000000002',occurrence:'2026-10-19T09:00',scheduleRevision:1,expectedSequence:0,status:'given'};
 await recordMedication(body);expect(api.post).toHaveBeenLastCalledWith('/daily-care/medication-actions',body);
});

