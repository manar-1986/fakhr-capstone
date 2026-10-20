// Inject expo-notifications from a native build only. No permissions, network,
// push tokens, or scheduling occur on import. UI lifecycle binding is pending.
export interface NativeCarePort {
 getPermissionsAsync():Promise<{granted:boolean}>;
 getAllScheduledNotificationsAsync():Promise<{identifier:string}[]>;
 cancelScheduledNotificationAsync(id:string):Promise<void>;
 scheduleNotificationAsync(request:{identifier:string;content:{title:string;body:string};trigger:{type:'date';date:Date;channelId?:string}}):Promise<string>;
}
export type CareInstant={instant:number};
const prefix='fakhr-care-v1-';
export class NativeCareBridge {
 private queue:Promise<unknown>=Promise.resolve();
 private generation=0;
 constructor(private native:NativeCarePort,private platform:'ios'|'android',private randomId:()=>string){}
 private async cleanup(){
  // OS inventory survives JS restarts. Never cancel another feature's alerts.
  for(const item of await this.native.getAllScheduledNotificationsAsync())
   if(item.identifier.startsWith(prefix))await this.native.cancelScheduledNotificationAsync(item.identifier);
 }
 reconcile(items:CareInstant[],consent:boolean,arabic:boolean){
  const generation=++this.generation;
  const run=this.queue.then(async()=>{
   try{
    await this.cleanup();
    if(generation!==this.generation||!consent||!(await this.native.getPermissionsAsync()).granted)
     return {scheduled:0,deliveryVerified:false};
    const now=Date.now();
    const valid=items.filter(i=>Number.isFinite(i.instant)&&i.instant>now&&i.instant<=now+7*86400000).sort((a,b)=>a.instant-b.instant);
    // Do not silently discard medication reminders when the native cap is exceeded.
    if(valid.length>48)throw new Error('CAPACITY');
    let scheduled=0;
    for(const item of valid){
     if(generation!==this.generation){await this.cleanup();return {scheduled:0,deliveryVerified:false};}
     const opaque=this.randomId();
     if(!/^[a-f0-9-]{36}$/i.test(opaque))throw new Error('OPAQUE_ID_REQUIRED');
     await this.native.scheduleNotificationAsync({identifier:prefix+opaque,
      content:{title:arabic?'تذكير فخر':'Fakhr reminder',body:arabic?'افتح التطبيق لعرض التفاصيل':'Open the app to view details'},
      trigger:{type:'date',date:new Date(item.instant),...(this.platform==='android'?{channelId:'fakhr-care'}:{})}});
     scheduled++;
    }
    if(generation!==this.generation){await this.cleanup();return {scheduled:0,deliveryVerified:false};}
    return {scheduled,deliveryVerified:false};
   }catch{
    try{await this.cleanup()}catch{throw new Error('CARE_NOTIFICATION_CLEANUP_REQUIRED')}
    throw new Error('CARE_NOTIFICATION_UNAVAILABLE');
   }
  });
  this.queue=run.catch(()=>undefined);return run;
 }
 // Await before completing logout/account switch; errors must remain visible.
 clear(){return this.reconcile([],false,false)}
}
