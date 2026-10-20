import {CareNotificationCoordinator} from '../utils/careNotifications';
test('no permission or scheduling without explicit consent',async()=>{
 const port={permission:jest.fn(),schedule:jest.fn(),cancel:jest.fn()};
 await new CareNotificationCoordinator(port).reconcile('synthetic',[],false,false);
 expect(port.permission).not.toHaveBeenCalled();expect(port.schedule).not.toHaveBeenCalled();
});
test('bounded generic reminders cancel on logout; never claim delivery',async()=>{
 const port={permission:jest.fn().mockResolvedValue(true),schedule:jest.fn().mockResolvedValue(undefined),cancel:jest.fn().mockResolvedValue(undefined)};
 const c=new CareNotificationCoordinator(port),now=Date.now();
 const result=await c.reconcile('opaque-account',Array.from({length:60},(_,i)=>({id:'opaque-'+i,revision:1,instant:now+60000+i*1000})),true,true);
 expect(result).toEqual({scheduled:48,deliveryVerified:false});
 expect(port.schedule.mock.calls[0][0].body).toBe('افتح التطبيق لعرض التفاصيل');
 await c.clear();expect(port.cancel).toHaveBeenCalledTimes(48);
});
test('failure cancels previously scheduled reminders',async()=>{
 const port={permission:jest.fn().mockResolvedValue(true),schedule:jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('synthetic')),cancel:jest.fn().mockResolvedValue(undefined)};
 const c=new CareNotificationCoordinator(port);
 await expect(c.reconcile('scope',[{id:'1',revision:1,instant:Date.now()+60000},{id:'2',revision:1,instant:Date.now()+120000}],true,false)).rejects.toThrow('NOTIFICATION_RECONCILIATION_FAILED');
 expect(port.cancel).toHaveBeenCalledTimes(1);
});
