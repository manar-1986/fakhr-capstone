import React from 'react';
import {render,fireEvent} from '@testing-library/react-native';
import {StyleSheet,View} from 'react-native';
import {AppNavigationShell} from '../components/navigation/AppNavigationShell';
let mockRTL=true,mockCanBack=true;
const mockRouter={canGoBack:()=>mockCanBack,back:jest.fn(),replace:jest.fn()};
jest.mock('expo-router',()=>({useRouter:()=>mockRouter,usePathname:()=>'/plan',useSegments:()=>['(tabs)'],useGlobalSearchParams:()=>({})}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:mockRTL})}));
jest.mock('../context/AuthContext',()=>({useAuth:()=>({user:null})}));
jest.mock('../utils/assistantSession',()=>({syncAssistantAccount:jest.fn()}));
jest.mock('../utils/authRedirect',()=>({clearCancelledAuthDestination:jest.fn()}));
jest.mock('@expo/vector-icons',()=>({Ionicons:'Icon'}));
jest.mock('react-native-safe-area-context',()=>({SafeAreaProvider:'SafeAreaProvider',useSafeAreaInsets:()=>({top:24,bottom:0,left:0,right:0})}));
jest.mock('../components/home/HomeDrawer',()=>{const React=require('react');const {View}=require('react-native');return {__esModule:true,default:({visible}:any)=>visible?React.createElement(View,{testID:'existing-drawer'}):null};});
test.each([true,false])('single fixed shared header and handlers in RTL=%s',rtl=>{
 mockRTL=rtl;mockCanBack=true;jest.clearAllMocks();
 const v=render(<AppNavigationShell><View testID="plan-content"/></AppNavigationShell>);
 expect(v.getAllByTestId('app-header')).toHaveLength(1);
 expect(StyleSheet.flatten(v.getByTestId('app-header-row').props.style)).toMatchObject({direction:'ltr',flexDirection:rtl?'row-reverse':'row'});
 expect(StyleSheet.flatten(v.getByTestId('app-header').props.style)).toMatchObject({paddingTop:24,minHeight:84,flexShrink:0});
 expect(v.getByTestId('app-header-back').findByType('Icon' as any).props.name).toBe(rtl?'chevron-forward':'chevron-back');
 fireEvent.press(v.getByTestId('app-header-menu'));expect(v.getByTestId('existing-drawer')).toBeTruthy();
 fireEvent.press(v.getByTestId('app-header-back'));expect(mockRouter.back).toHaveBeenCalledTimes(1);
 mockCanBack=false;fireEvent.press(v.getByTestId('app-header-back'));expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home');
});

