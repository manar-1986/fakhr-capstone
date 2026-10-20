import {closeSession, finishSignIn, sessionBlocked, sessionGeneration} from '../utils/sessionLifecycle';
import {PRODUCTION_API, releaseApiUrl, unavailableApi, unavailableRoute, retryAfterSeconds, retryQuery, featureDisabled, requireGeneratedPlan} from '../utils/minimumRelease';
import {QueryClient} from '@tanstack/react-query';
beforeEach(()=>finishSignIn());
test.each([false,true])('logout clears all account caches even when revocation fails=%s',async fail=>{
 const events:string[]=[];const client=new QueryClient();client.setQueryData(['children','a'],[{id:'synthetic'}]);client.setQueryData(['currentUser'],{id:'a'});
 const remove=jest.fn(async(key:string)=>{events.push(key);});
 const before=sessionGeneration();
 const result=await closeSession({mark:async()=>{events.push('tombstone');},revoke:async()=>{events.push('revoke');if(fail)throw Error('offline');},remove,cancel:()=>client.cancelQueries(),clear:()=>client.clear(),clearUser:()=>events.push('clearUser')});
 expect(result).toEqual({revoked:!fail,cleanupComplete:true});expect(events.indexOf('revoke')).toBeLessThan(events.indexOf('token'));
 expect(remove).toHaveBeenCalledWith('token');expect(remove).toHaveBeenCalledWith('user_profile_cache');expect(client.getQueryCache().getAll()).toHaveLength(0);expect(sessionBlocked()).toBe(true);expect(sessionGeneration()).toBeGreaterThan(before);
});
test('storage failure still clears memory, tries both removals, and reports incomplete cleanup',async()=>{
 const remove=jest.fn(async()=>{throw Error('storage unavailable');}),clear=jest.fn(),clearUser=jest.fn();
 const result=await closeSession({mark:async()=>{},revoke:async()=>{},remove,cancel:async()=>{},clear,clearUser});
 expect(result).toEqual({revoked:true,cleanupComplete:false});expect(remove).toHaveBeenCalledTimes(2);expect(clear).toHaveBeenCalled();expect(clearUser).toHaveBeenCalled();
});
test('already-invalid token is treated as revoked and cleanup continues',async()=>{
 expect(await closeSession({mark:async()=>{},revoke:async()=>{throw {status:401};},remove:async()=>{},cancel:async()=>{},clear:()=>{},clearUser:()=>{}})).toEqual({revoked:true,cleanupComplete:true});
});
test.each([undefined,PRODUCTION_API,PRODUCTION_API+'/'])('production API is pinned for %s',url=>expect(releaseApiUrl(false,url)).toBe(PRODUCTION_API));
test.each(['http://localhost:8000','http://127.0.0.1:8000/api','http://fakhrcapstone-36gs.onrender.com/api','https://attacker.invalid/api','https://fakhrcapstone-36gs.onrender.com/api?x=1'])('unsafe release API rejected: %s',url=>expect(()=>releaseApiUrl(false,url)).toThrow('Invalid production'));
test('development resolution remains separate',()=>expect(releaseApiUrl(true,'http://localhost:8000')).toBeUndefined());
test.each(['/plan','/(tabs)/plan/progress','/favorites','/directory/booking','/directory/helpCenter','/messages','/community','/forgot-password','/reset-password','/generate-plan'])('unavailable route blocked: %s',p=>expect(unavailableRoute(p)).toBe(true));
test.each(['/home','/login','/register','/profile/edit-child','/directory/centers','/profile/edit-profile'])('retained route remains: %s',p=>expect(unavailableRoute(p)).toBe(false));
test.each(['/favorites','/care-paths/generate','/auth/forgot-password','/ai/ask','/support/messages'])('unavailable API never sent: %s',p=>expect(unavailableApi(p,'post')).toBe(true));
test.each(['/auth/login','/auth/register','/auth/logout','/children','/users/me'])('retained API remains: %s',p=>expect(unavailableApi(p,'post')).toBe(false));
test('catalog reads retained; mutations and account deletion blocked',()=>{expect(unavailableApi('/directory/centers')).toBe(false);expect(unavailableApi('/directory/centers','post')).toBe(true);expect(unavailableApi('/users/abc','delete')).toBe(true);});
test('Retry-After supports seconds and HTTP-date, rejects malformed values',()=>{expect(retryAfterSeconds('12')).toBe(12);expect(retryAfterSeconds('Thu, 01 Jan 1970 00:01:00 GMT',0)).toBe(60);expect(retryAfterSeconds('invalid')).toBeUndefined();expect(retryAfterSeconds('-3')).toBeUndefined();});
test('no automatic retries for disabled features, rate limits or instructed delays',()=>{expect(retryQuery(0,featureDisabled())).toBe(false);expect(retryQuery(0,Object.assign(Error(),{status:429}))).toBe(false);expect(retryQuery(0,Object.assign(Error(),{status:503,retryAfterSeconds:30}))).toBe(false);expect(retryQuery(2,Error())).toBe(false);});
test.each([null,undefined,{week:1}])('unconfirmed generation cannot succeed: %s',p=>expect(()=>requireGeneratedPlan(p as any)).toThrow('not confirmed'));
test('confirmed generation preserves result',()=>{const p={week:1,tasks:[]};expect(requireGeneratedPlan(p)).toBe(p);});
