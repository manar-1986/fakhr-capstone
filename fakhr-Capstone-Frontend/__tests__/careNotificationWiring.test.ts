import {selectCareReminders,careInstant} from '../utils/careReminderSelection';
import {clearCareNotifications,refreshCareNotifications,requestCareConsent} from '../utils/careNotificationRuntime.native';
import {getChildren} from '../api/children.api';
import {readCare} from '../api/dailyCare.api';
import * as S from 'expo-secure-store';
jest.mock('../api/children.api',()=>({getChildren:jest.fn()}));
jest.mock('../api/dailyCare.api',()=>({readCare:jest.fn()}));
jest.mock('expo-crypto',()=>({randomUUID:()=> '00000000-0000-4000-8000-000000000001'}),{virtual:true});
jest.mock('expo-notifications',()=>({getPermissionsAsync:jest.fn(async()=>({granted:true})),requestPermissionsAsync:jest.fn(async()=>({granted:true})),getAllScheduledNotificationsAsync:jest.fn(async()=>[]),cancelScheduledNotificationAsync:jest.fn(async()=>{}),scheduleNotificationAsync:jest.fn(async()=> 'id'),setNotificationHandler:jest.fn(),setNotificationChannelAsync:jest.fn(),AndroidImportance:{DEFAULT:3},AndroidNotificationVisibility:{PRIVATE:0}}),{virtual:true});
jest.mock('expo-secure-store',()=>({getItemAsync:jest.fn(async()=> '1'),setItemAsync:jest.fn(async()=>{})}));
const N=require('expo-notifications');
const record=(id:string,date='2026-10-20')=>({id,childId:'synthetic-child',title:'private synthetic medication',dose:'private synthetic dose',notes:'private note',date,occurrenceDate:date,occurrence:date+'T09:00',startTime:'09:00',timezone:'Asia/Kuwait',reminder:'at-time' as const,revision:1,active:true,recurrence:{kind:'daily' as const,interval:1,until:date,weekdays:[]}});
beforeEach(()=>{jest.clearAllMocks();process.env.EXPO_PUBLIC_CARE_NOTIFICATIONS='true';(getChildren as jest.Mock).mockResolvedValue([{id:'child-a'},{id:'child-b'}]);(readCare as jest.Mock).mockResolvedValue({appointments:[],medications:[],history:[]});(S.getItemAsync as jest.Mock).mockResolvedValue('1')});
test('deduplicates occurrences, omits completed/cancelled/inactive and latest given medication',()=>{
 const r=record('a');const snapshots:any=[{appointments:[r,r,{...r,id:'b',status:'cancelled'},{...r,id:'c',status:'completed'}],medications:[{...r,id:'d',active:false},{...r,id:'e'}],history:[{reminderId:'e',occurrence:r.occurrence,sequence:2,status:'given'},{reminderId:'e',occurrence:r.occurrence,sequence:1,status:'pending'}]}];
 expect(selectCareReminders(snapshots)).toEqual([{instant:Date.parse('2026-10-20T06:00:00Z')}]);
});
test('saved timezone is stable and DST ambiguity fails closed',()=>{
 expect(careInstant('2026-10-20','09:00','Asia/Kuwait')).toBe(Date.parse('2026-10-20T06:00:00Z'));
 expect(()=>careInstant('2026-11-01','01:30','America/New_York')).toThrow('CARE_TIME_REVIEW_REQUIRED');
});
test('account refresh fetches every child once without asking permission automatically',async()=>{
 await refreshCareNotifications('account-a',false);expect(readCare).toHaveBeenCalledTimes(2);expect(N.requestPermissionsAsync).not.toHaveBeenCalled();
});
test('no saved consent means no network or scheduling',async()=>{
 (S.getItemAsync as jest.Mock).mockResolvedValue('0');await refreshCareNotifications('a',false);expect(getChildren).not.toHaveBeenCalled();expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
});
test('logout invalidates pending fetch so old account cannot schedule',async()=>{
 let resolve:any;(readCare as jest.Mock).mockReturnValue(new Promise(r=>resolve=r));
 const pending=refreshCareNotifications('a',false);for(let i=0;i<10;i++)await Promise.resolve();
 await clearCareNotifications();resolve({appointments:[record('a')],medications:[],history:[]});await pending;expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
});
test('explicit consent is saved per account',async()=>{
 await requestCareConsent('account-a');expect(N.requestPermissionsAsync).toHaveBeenCalledTimes(1);expect(S.setItemAsync).toHaveBeenCalledWith('care-consent-account-a','1');
});
