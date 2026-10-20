import React from 'react';
import {render,act} from '@testing-library/react-native';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {CareNotificationLifecycle} from '../components/CareNotificationLifecycle';
import {clearCareNotifications,refreshCareNotifications} from '../utils/careNotificationRuntime';
let mockUser:any={id:'account-a'};
jest.mock('../context/AuthContext',()=>({useAuth:()=>({user:mockUser,loading:false})}));
jest.mock('../context/LanguageContext',()=>({useLanguage:()=>({isRTL:true})}));
jest.mock('../utils/careNotificationRuntime',()=>({clearCareNotifications:jest.fn(async()=>{}),refreshCareNotifications:jest.fn(async()=>{})}));
test('root lifecycle handles login, saved edits, account switch and unmount',async()=>{
 jest.useFakeTimers();const client=new QueryClient();
 const tree=()=> <QueryClientProvider client={client}><CareNotificationLifecycle/></QueryClientProvider>;
 const view=render(tree());expect(refreshCareNotifications).toHaveBeenCalledWith('account-a',true);
 client.setQueryData(['daily-care','account-a','child-a'],{});
 await act(async()=>{await client.invalidateQueries({queryKey:['daily-care']});jest.advanceTimersByTime(300)});
 expect(refreshCareNotifications).toHaveBeenCalledTimes(2);
 mockUser={id:'account-b'};view.rerender(tree());expect(clearCareNotifications).toHaveBeenCalled();expect(refreshCareNotifications).toHaveBeenLastCalledWith('account-b',true);
 mockUser=null;view.rerender(tree());view.unmount();expect(clearCareNotifications).toHaveBeenCalled();client.clear();jest.useRealTimers();
});
