import {NativeCareBridge} from '../utils/nativeCareBridge';
const uuid='00000000-0000-4000-8000-000000000001';
function setup(){
 const pending=new Map<string,unknown>();
 const port={getPermissionsAsync:jest.fn(async()=>({granted:true})),getAllScheduledNotificationsAsync:jest.fn(async()=>[...pending.keys()].map(identifier=>({identifier}))),cancelScheduledNotificationAsync:jest.fn(async(id:string)=>{pending.delete(id)}),scheduleNotificationAsync:jest.fn(async(r:any)=>{pending.set(r.identifier,r);return r.identifier})};
 return {pending,port,bridge:new NativeCareBridge(port,'android',()=>uuid)};
}
test('restart cleanup retains unrelated alerts and transmits only generic content',async()=>{
 const {pending,port,bridge}=setup();pending.set('fakhr-care-v1-old',{});pending.set('other-feature',{});
 expect(await bridge.reconcile([{instant:Date.now()+60000}],true,true)).toEqual({scheduled:1,deliveryVerified:false});
 expect(pending.has('fakhr-care-v1-old')).toBe(false);expect(pending.has('other-feature')).toBe(true);
 expect(Object.keys(port.scheduleNotificationAsync.mock.calls[0][0].content).sort()).toEqual(['body','title']);
 await new NativeCareBridge(port,'android',()=>uuid).clear();expect([...pending.keys()]).toEqual(['other-feature']);
});
test('no consent does not request permission or schedule',async()=>{
 const {port,bridge}=setup();await bridge.reconcile([{instant:Date.now()+60000}],false,false);
 expect(port.getPermissionsAsync).not.toHaveBeenCalled();expect(port.scheduleNotificationAsync).not.toHaveBeenCalled();
});
test('capacity fails closed instead of silently dropping reminders',async()=>{
 const {port,bridge}=setup();await expect(bridge.reconcile(Array.from({length:49},()=>({instant:Date.now()+60000})),true,false)).rejects.toThrow('CARE_NOTIFICATION_UNAVAILABLE');expect(port.scheduleNotificationAsync).not.toHaveBeenCalled();
});
test('scheduling failure is sanitized and partial native alerts removed',async()=>{
 const {pending,port,bridge}=setup();port.scheduleNotificationAsync.mockImplementationOnce(async(r:any)=>{pending.set(r.identifier,r);throw new Error('synthetic sensitive payload')});
 await expect(bridge.reconcile([{instant:Date.now()+60000}],true,false)).rejects.toThrow('CARE_NOTIFICATION_UNAVAILABLE');expect(pending.size).toBe(0);
});
test('queued logout supersedes stale scheduling',async()=>{
 const {port,bridge}=setup();const old=bridge.reconcile([{instant:Date.now()+60000}],true,false);const clear=bridge.clear();await Promise.all([old,clear]);expect(port.scheduleNotificationAsync).not.toHaveBeenCalled();
});
