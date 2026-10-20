import React from 'react';
import {render,fireEvent} from '@testing-library/react-native';
import TabsLayout from '../app/(tabs)/_layout';
import AuthLayout from '../app/(auth)/_layout';
import OnboardingLayout from '../app/(onboarding)/_layout';
let mockPath='/home',mockRTL=false;
const mockReplace=jest.fn();
jest.mock('expo-router',()=>({usePathname:()=>mockPath,useRouter:()=>({replace:mockReplace}),Tabs:()=>null,Stack:()=>null}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:mockRTL})}));
jest.mock('../components/navigation/MainTabBar',()=>({MainTabBar:()=>null}));
jest.mock('../components/ui/AppText',()=>({Text:require('react-native').Text}));
jest.mock('react-i18next',()=>({useTranslation:()=>({t:(s:string)=>s})}));
test.each([false,true])('disabled deep links do not mount feature screens and localize RTL=%s',rtl=>{
 mockRTL=rtl;
 for(const [Component,route] of [[TabsLayout,'/plan'],[AuthLayout,'/forgot-password'],[OnboardingLayout,'/generate-plan']] as const){
 mockPath=route;const ui=render(<Component/>);expect(ui.getByText(rtl?'هذه الميزة غير متاحة حالياً.':'This feature is currently unavailable.')).toBeTruthy();fireEvent.press(ui.getByRole('button'));expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');ui.unmount();}
});
