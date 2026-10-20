import React from 'react';
import {clearCareNotifications} from '../utils/careNotificationRuntime';
jest.mock('../utils/careNotificationRuntime',()=>({clearCareNotifications:jest.fn(async()=>{})}));
import {act,renderHook,waitFor} from '@testing-library/react-native';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider,useAuth} from '../context/AuthContext';
import {logout} from '../api/auth.api';
import {getCurrentUser} from '../api/users.api';
import {finishSignIn} from '../utils/sessionLifecycle';
let mockValues:Record<string,string>={};
jest.mock('../utils/secureStorage',()=>({getItemAsync:jest.fn(async(k:string)=>mockValues[k]??null),setItemAsync:jest.fn(async(k:string,v:string)=>{mockValues[k]=v;}),deleteItemAsync:jest.fn(async(k:string)=>{delete mockValues[k];})}));
jest.mock('../api/auth.api',()=>({logout:jest.fn()}));
jest.mock('../api/users.api',()=>({getCurrentUser:jest.fn()}));
test('notification cleanup failure does not prevent token removal or report clean logout',async()=>{
 const client=new QueryClient();const wrapper=({children}:React.PropsWithChildren)=><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
 const h=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(h.result.current.user?.id).toBe('a'));
 jest.mocked(clearCareNotifications).mockRejectedValueOnce(new Error('synthetic OS failure'));
 jest.mocked(logout).mockResolvedValueOnce(undefined as never);
 await act(async()=>{expect((await h.result.current.logout()).cleanupComplete).toBe(false)});
 expect(mockValues.token).toBeUndefined();expect(h.result.current.user).toBeNull();h.unmount();client.clear();
});
beforeEach(()=>{finishSignIn();mockValues={token:'synthetic'};jest.mocked(getCurrentUser).mockResolvedValue({id:'a',name:'Synthetic',email:'synthetic@example.invalid',role:'parent'});});
test.each([false,true])('actual AuthProvider invokes revocation before token cleanup and isolates cache (failure=%s)',async fail=>{
 const client=new QueryClient({defaultOptions:{queries:{retry:false}}});client.setQueryData(['children'],[{id:'private-synthetic'}]);
 jest.mocked(logout).mockImplementation(async()=>{expect(mockValues.token).toBe('synthetic');if(fail)throw Error('offline');});
 const wrapper=({children}:React.PropsWithChildren)=><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
 const h=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(h.result.current.user?.id).toBe('a'));
 await act(async()=>{expect(await h.result.current.logout()).toEqual({revoked:!fail,cleanupComplete:true});});
 expect(logout).toHaveBeenCalled();expect(mockValues.token).toBeUndefined();expect(mockValues.user_profile_cache).toBeUndefined();expect(mockValues.logout_pending).toBe('1');expect(h.result.current.user).toBeNull();expect(client.getQueryCache().getAll()).toHaveLength(0);
 h.unmount();client.clear();
});
test('persistent sign-out marker prevents loading a leftover token after restart',async()=>{
 mockValues={token:'synthetic',logout_pending:'1'};jest.mocked(getCurrentUser).mockClear();
 const client=new QueryClient();const wrapper=({children}:React.PropsWithChildren)=><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
 const h=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(h.result.current.loading).toBe(false));expect(h.result.current.user).toBeNull();expect(getCurrentUser).not.toHaveBeenCalled();h.unmount();client.clear();
});

test('real logout then sign-in clears persistent guard and isolates new account',async()=>{
 const client=new QueryClient();const wrapper=({children}:React.PropsWithChildren)=><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
 const h=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(h.result.current.user?.id).toBe('a'));
 await act(async()=>{await h.result.current.logout();});
 client.setQueryData(['children'],[{id:'old-account'}]);
 await act(async()=>{await h.result.current.signIn('new-synthetic',{id:'b',name:'New synthetic',email:'new@example.invalid'});});
 expect(h.result.current.user?.id).toBe('b');expect(mockValues.logout_pending).toBeUndefined();expect(mockValues.token).toBe('new-synthetic');expect(client.getQueryCache().getAll()).toHaveLength(0);
 h.unmount();client.clear();
});

test('invalid sign-in never releases a logged-out session',async()=>{
 const client=new QueryClient();const wrapper=({children}:React.PropsWithChildren)=><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
 const h=renderHook(()=>useAuth(),{wrapper});await waitFor(()=>expect(h.result.current.loading).toBe(false));
 await act(async()=>{await h.result.current.logout();});
 await expect(h.result.current.signIn('',{id:'b'} as any)).rejects.toThrow();
 expect(mockValues.logout_pending).toBe('1');expect(mockValues.token).toBeUndefined();expect(h.result.current.user).toBeNull();h.unmount();client.clear();
});
