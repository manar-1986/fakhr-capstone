import api from './axios';
export const dailyCareEnabled=()=>process.env.EXPO_PUBLIC_DAILY_CARE_ENABLED==='true';
export type Recurrence={kind:'none'|'daily'|'weekly';interval:number;until:string;weekdays:number[]};
export type CareRecord={id:string;childId:string;title:string;date:string;startTime:string;endTime?:string;timezone:string;notes:string;reminder:'none'|'at-time';recurrence:Recurrence;revision:number;occurrence?:string;occurrenceDate?:string;status?:string;seriesStatus?:string;category?:string;location?:string;dose?:string;frequency?:string;active?:boolean};
export type CareHistory={id:string;reminderId:string;occurrence:string;sequence:number;status:string;createdAt:string;scheduleSnapshot?:{title:string}};
export type CareSnapshot={appointments:CareRecord[];medications:CareRecord[];history:CareHistory[]};
export const readCare=async(childId:string,from:string,to:string):Promise<CareSnapshot>=>await api.get('/daily-care',{params:{childId,from,to}}) as unknown as CareSnapshot;
export const saveCare=async(kind:'appointments'|'medications',childId:string,recordId:string|undefined,body:unknown)=>recordId?api.put('/daily-care/'+kind+'/'+recordId,body):api.post('/daily-care/'+kind,{...(body as object),childId});
export const recordMedication=async(body:unknown)=>api.post('/daily-care/medication-actions',body);
export const markAppointment=async(id:string,body:{date:string;revision:number;status:string})=>api.put('/daily-care/appointments/'+id+'/occurrence',body);
export const recordParticipation=async(body:{childId:string;requestId:string;templateId:string;catalogVersion:string;activityId:string;status:'completed'|'skipped'|'declined';notes:string;accessibilityConfirmed:boolean;safetyConfirmed:boolean})=>api.post('/daily-care/participation',body);
type Bilingual={ar:string;en:string};
export type ApprovedActivity={activityId:string;templateId:string;catalogVersion:string;title:Bilingual;goal:Bilingual;description:Bilingual;steps:Bilingual[];duration:Bilingual;adaptations:Bilingual[];safety:Bilingual;participationObservation:Bilingual};
export const readApprovedActivities=async(childId:string):Promise<{activities:ApprovedActivity[]}>=>await api.get('/daily-care/activities',{params:{childId}}) as unknown as {activities:ApprovedActivity[]};

