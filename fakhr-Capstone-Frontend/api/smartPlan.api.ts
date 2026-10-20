import api from './axios';import type {Snapshot} from '../utils/smartPlan';
import {planFixturesEnabled} from '../utils/planPreviewPolicy';
export const dashboardPreview=()=>planFixturesEnabled(__DEV__,process.env.EXPO_PUBLIC_SMART_PLAN_PREVIEW,process.env.EXPO_PUBLIC_SMART_PLAN_FIXTURES);
export const readDashboard=async(childId:string,date:string)=>await api.get('/plan-dashboard',{params:{childId,date,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone}}) as unknown as Snapshot;
export const actTask=(id:string,body:unknown)=>api.post('/plan-dashboard/tasks/'+id,body);
export const actMeal=(id:string,body:unknown)=>api.put('/plan-dashboard/meals/'+id,body);
export const createMeal=(body:unknown)=>api.post('/plan-dashboard/meals',body);
export const createDailyPlan=(body:unknown)=>api.post('/plan-dashboard/generate',body);

export const addPlanActivity=(body:unknown)=>api.post('/plan-dashboard/add-activity',body);
