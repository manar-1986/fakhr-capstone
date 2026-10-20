import {Platform,Alert} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {NativeCareBridge} from './nativeCareBridge';
import {selectCareReminders} from './careReminderSelection';
import {getChildren} from '../api/children.api';
import {readCare} from '../api/dailyCare.api';
import {sessionBlocked,sessionGeneration} from './sessionLifecycle';
// Resolved by the private native build; never loaded by Expo Web.
const N=require('expo-notifications');
const Crypto=require('expo-crypto');
const bridge=new NativeCareBridge(N,Platform.OS==='android'?'android':'ios',()=>Crypto.randomUUID());
let epoch=0;
const enabled=()=>process.env.EXPO_PUBLIC_CARE_NOTIFICATIONS==='true';
const key=(account:string)=>'care-consent-'+account.replace(/[^a-zA-Z0-9_-]/g,'_');
export async function clearCareNotifications(){epoch++;await bridge.clear()}
export async function requestCareConsent(account:string){
 if(!enabled()||sessionBlocked())return false;
 const generation=sessionGeneration();
 if(Platform.OS==='android')await N.setNotificationChannelAsync('fakhr-care',{name:'Fakhr reminders',importance:N.AndroidImportance.DEFAULT,lockscreenVisibility:N.AndroidNotificationVisibility.PRIVATE});
 const p=await N.requestPermissionsAsync();
 if(generation!==sessionGeneration()||sessionBlocked())return false;
 await SecureStore.setItemAsync(key(account),p.granted?'1':'0');return p.granted;
}
export async function refreshCareNotifications(account:string,arabic:boolean){
 const ticket=++epoch,generation=sessionGeneration();
 // Clear stale alerts before fetching. Network/auth failures never preserve obsolete medication times.
 await bridge.clear();
 if(!enabled()||sessionBlocked()||await SecureStore.getItemAsync(key(account))!=='1')return;
 try{
  const now=new Date(),from=new Date(+now-86400000).toISOString().slice(0,10),to=new Date(+now+8*86400000).toISOString().slice(0,10);
  const children=await getChildren();
  if(children.length>20)throw new Error('CAPACITY');
  const snapshots=[];
  for(const child of children){
   if(ticket!==epoch||generation!==sessionGeneration()||sessionBlocked())return;
   snapshots.push(await readCare(child.id,from,to));
  }
  if(ticket!==epoch||generation!==sessionGeneration()||sessionBlocked())return;
  await bridge.reconcile(selectCareReminders(snapshots),true,arabic);
 }catch{
  if(ticket!==epoch)return;
  await bridge.clear();
  Alert.alert(arabic?'تذكيرات فخر':'Fakhr reminders',arabic?'تعذر تحديث التذكيرات. راجع الجدول داخل التطبيق.':'Reminders could not be refreshed. Check the schedule in the app.');
 }
}
N.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:false,shouldSetBadge:false})});
