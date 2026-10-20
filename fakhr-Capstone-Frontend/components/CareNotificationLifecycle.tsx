import {useEffect} from 'react';
import {AppState,Alert} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {useAuth} from '../context/AuthContext';
import {useLanguage} from '../context/LanguageContext';
import {clearCareNotifications,refreshCareNotifications} from '../utils/careNotificationRuntime';
export function CareNotificationLifecycle(){
 const {user,loading}=useAuth(),{isRTL}=useLanguage(),client=useQueryClient();
 useEffect(()=>{
  let disposed=false,timer:ReturnType<typeof setTimeout>|undefined;
  const report=()=>Alert.alert(isRTL?'تذكيرات فخر':'Fakhr reminders',isRTL?'تعذر تنظيف التذكيرات. راجع إعدادات الإشعارات.':'Reminder cleanup failed. Review notification settings.');
  const refresh=()=>{if(!disposed)void (!loading&&user?.id?refreshCareNotifications(user.id,isRTL):clearCareNotifications()).catch(report)};
  const schedule=()=>{if(timer)clearTimeout(timer);timer=setTimeout(refresh,250)};
  refresh();
  const sub=AppState.addEventListener('change',state=>{if(state==='active')refresh()});
  const unsub=client.getQueryCache().subscribe(event=>{
   if(event.type==='updated'&&event.query.queryKey[0]==='daily-care'&&event.action.type==='invalidate')schedule();
  });
  // Refresh while foregrounded, also detecting device timezone/permission changes.
  const interval=setInterval(()=>{if(AppState.currentState==='active')refresh()},60000);
  return()=>{disposed=true;sub.remove();unsub();clearInterval(interval);if(timer)clearTimeout(timer);void clearCareNotifications().catch(report)};
 },[user?.id,loading,isRTL,client]);
 return null;
}
