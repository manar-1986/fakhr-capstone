import api from './axios';
import type {Prefs} from '../utils/dailyCompanion';
export const readCompanion=async(childId:string)=>await api.get('/plan-dashboard/companion',{params:{childId}}) as unknown as {record:Prefs|null};
export const saveCompanion=async(childId:string,p:Prefs)=>await api.put('/plan-dashboard/companion',{childId,enabled:p.enabled,quietStart:p.quietStart,quietEnd:p.quietEnd,timezone:p.timezone,snoozes:p.snoozes,revision:p.revision}) as unknown as {record:Prefs};
