import React from 'react';
jest.mock('../utils/careNotificationRuntime',()=>({requestCareConsent:jest.fn(async()=>false)}));
import {renderHook,act,waitFor} from '@testing-library/react-native';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {useDailyCarePersistence} from '../hooks/useDailyCarePersistence';
import {readCare,saveCare,recordMedication} from '../api/dailyCare.api';
let mockAccount='account-a';
jest.mock('../context/AuthContext',()=>({useAuth:()=>({user:{id:mockAccount}})}));
jest.mock('../api/dailyCare.api',()=>({dailyCareEnabled:()=>true,readCare:jest.fn(),saveCare:jest.fn(),recordMedication:jest.fn()}));
const med={id:'record-1',childId:'child-a',title:'Synthetic medication',date:'2026-10-19',occurrenceDate:'2026-10-19',occurrence:'2026-10-19T09:00',startTime:'09:00',timezone:'Asia/Kuwait',notes:'',reminder:'none',recurrence:{kind:'daily',interval:1,until:'2026-10-20',weekdays:[]},revision:3,dose:'synthetic-only',frequency:'synthetic-only',active:true};
const snapshot={appointments:[],medications:[med],history:[]};
let client:QueryClient;
const wrapper=({children}:{children:React.ReactNode})=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
beforeEach(()=>{mockAccount='account-a';client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});jest.clearAllMocks();(readCare as jest.Mock).mockResolvedValue(snapshot);(saveCare as jest.Mock).mockResolvedValue({});(recordMedication as jest.Mock).mockResolvedValue({})});
afterEach(()=>client.clear());
test('medication action includes child, occurrence and expected revisions; does not save dose again',async()=>{
 const {result,unmount}=renderHook(()=>useDailyCarePersistence('child-a','2026-10-01','2026-10-31'),{wrapper});
 await waitFor(()=>expect(result.current.data.medications).toHaveLength(1));
 await act(()=>result.current.change(d=>({...d,medications:d.medications.map(m=>({...m,status:'given'}))})));
 expect(recordMedication).toHaveBeenCalledWith(expect.objectContaining({childId:'child-a',reminderId:'record-1',scheduleRevision:3,expectedSequence:0,occurrence:med.occurrence,status:'given'}));
 expect(saveCare).not.toHaveBeenCalled();expect(JSON.stringify((recordMedication as jest.Mock).mock.calls)).not.toContain('synthetic-only');unmount();
});
test('failed create keeps idempotency key on explicit retry and does not show false success',async()=>{
 const {result,unmount}=renderHook(()=>useDailyCarePersistence('child-a','2026-10-01','2026-10-31'),{wrapper});
 await waitFor(()=>expect(result.current.data.medications).toHaveLength(1));
 (saveCare as jest.Mock).mockRejectedValue(new Error('Synthetic network failure'));
 const change=(d:any)=>({...d,schedule:[{id:'mock-'+Math.random(),title:'Synthetic appointment',date:'2026-10-19',start:'09:00',end:'10:00',category:'school',location:'',notes:'',reminder:'none',dose:'',frequency:'',status:'scheduled',active:true}]});
 await act(()=>result.current.change(change));await act(()=>result.current.change(change));
 expect(result.current.error).toBe(true);expect(result.current.data.schedule).toHaveLength(0);
 expect((saveCare as jest.Mock).mock.calls[0][3].requestId).toBe((saveCare as jest.Mock).mock.calls[1][3].requestId);unmount();
});
test('switching account/child has a separate cache without prior data',async()=>{
 const {result,rerender,unmount}=renderHook(({child})=>useDailyCarePersistence(child,'2026-10-01','2026-10-31'),{wrapper,initialProps:{child:'child-a'}});
 await waitFor(()=>expect(result.current.data.medications).toHaveLength(1));
 (readCare as jest.Mock).mockReturnValue(new Promise(()=>{}));mockAccount='account-b';rerender({child:'child-b'});
 expect(result.current.data.medications).toHaveLength(0);unmount();
});
