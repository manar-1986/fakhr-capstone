// Native delivery adapter contract. No OS notification package or permission is activated here.
export type PrivateReminder={id:string;revision:number;instant:number};
export type NotificationPort={
 permission:()=>Promise<boolean>;
 schedule:(input:{identifier:string;at:number;title:string;body:string})=>Promise<void>;
 cancel:(identifier:string)=>Promise<void>;
};
export class CareNotificationCoordinator {
 private scheduled=new Set<string>();
 constructor(private port:NotificationPort){}
 async clear(){for(const id of this.scheduled){await this.port.cancel(id);this.scheduled.delete(id)}}
 async reconcile(scope:string,items:PrivateReminder[],explicitConsent:boolean,arabic:boolean){
  await this.clear();
  if(!explicitConsent||!await this.port.permission())return {scheduled:0,deliveryVerified:false};
  const now=Date.now(),horizon=now+7*86400000;
  const selected=items.filter(x=>x.instant>now&&x.instant<=horizon).sort((a,b)=>a.instant-b.instant).slice(0,48);
  try{
   for(const item of selected){
    const identifier=scope+':'+item.id+':'+item.revision+':'+item.instant;
    // Generic lock-screen copy deliberately contains no name, diagnosis, medication or dose.
    await this.port.schedule({identifier,at:item.instant,title:arabic?'تذكير فخر':'Fakhr reminder',body:arabic?'افتح التطبيق لعرض التفاصيل':'Open the app to view details'});
    this.scheduled.add(identifier);
   }
  }catch{await this.clear();throw new Error('NOTIFICATION_RECONCILIATION_FAILED')}
  return {scheduled:selected.length,deliveryVerified:false};
 }
}
