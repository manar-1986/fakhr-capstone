import React from 'react';
import {renderRouter,screen,fireEvent} from 'expo-router/testing-library';
import {act,waitFor} from '@testing-library/react-native';
import Home from '../app/(tabs)/home';
import {finishAuthRedirect,consumePendingAuthHref} from '../utils/authRedirect';
import {useRouter} from 'expo-router';
import {Pressable} from 'react-native';
import Dashboard from '../app/(tabs)/plan/index';
import Chat from '../app/(tabs)/plan/ask';
import SmartPlan from '../app/(tabs)/plan/assistant';
import {Text} from 'react-native';
import {mockChatReply} from '../utils/mockPlanChat';
import {assistantQuestions} from '../utils/assistantQuestions';
let rendered:ReturnType<typeof renderRouter>;
let mockPreview=true,mockRTL=true,mockHasChild=true,mockSignedIn=true;
const mockChild={id:'synthetic-child-a',name:'Test child',nameAr:'طفل الاختبار',age:6};
jest.mock('../context/AuthContext',()=>({useAuth:()=>({user:mockSignedIn?{id:'test-account'}:null})}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:mockRTL})}));
jest.mock('../api/smartPlan.api',()=>({dashboardPreview:()=>mockPreview}));
jest.mock('../api/children.api',()=>({getChildren:jest.fn()}));
jest.mock('../api/dailyCare.api',()=>({dailyCareEnabled:()=>false}));
jest.mock('../utils/personalAppointmentCalendar',()=>({}));
jest.mock('../components/plan/RestaurantScreens',()=>({RestaurantPreview:()=>null}));
jest.mock('../components/plan/DailyCarePreview',()=>({__esModule:true,default:()=>null,DailyCareProvider:({children}:any)=>children,useCarePreviewData:()=>null}));
jest.mock('@tanstack/react-query',()=>({useQuery:({queryKey}:any)=>({data:queryKey[0]==='plan-children'?(mockHasChild?[mockChild]:[]):queryKey[0]==='smart-plan'?{tasks:[],meals:[],hasPlan:false}:undefined,isLoading:false,isError:false}),useQueryClient:()=>({getQueryData:()=>mockHasChild?[mockChild]:[],invalidateQueries:jest.fn()})}));
jest.mock('../components/ui/AppText',()=>{const rn=require('react-native');return {Text:rn.Text,TextInput:rn.TextInput,ScrollView:rn.ScrollView}});
jest.mock('@expo/vector-icons',()=>({Ionicons:()=>null}));
jest.mock('../utils/mockPlanChat',()=>({mockChatReply:jest.fn(jest.requireActual('../utils/mockPlanChat').mockChatReply)}));
const assertReply=()=>{const calls=(mockChatReply as jest.Mock).mock.results;expect(calls.length).toBeGreaterThan(0);expect(screen.getAllByText(calls[calls.length-1].value).length).toBeGreaterThan(0)};
jest.mock('../api/users.api',()=>({getCurrentUser:jest.fn()}));
jest.mock('../components/home/HomeAdCarousel',()=>()=>null);
jest.mock('../components/home/HomeGlobalSearch',()=>()=>null);
jest.mock('../components/home/HomeDrawer',()=>()=>null);
function TestLogin(){const router=useRouter();return <Pressable onPress={()=>{mockSignedIn=true;finishAuthRedirect(router)}}><Text>Complete synthetic sign-in</Text><Text>Sign in destination</Text></Pressable>}
const routes={'(tabs)/home':Home,'(tabs)/plan/index':Dashboard,'(tabs)/plan/ask':Chat,'(tabs)/plan/assistant':SmartPlan,'(tabs)/profile/add-child':()=> <Text>Add child destination</Text>,'(auth)/login':TestLogin};
beforeEach(()=>{mockPreview=true;mockRTL=true;mockHasChild=true;mockSignedIn=true});
test.each([true,false])('dashboard tap opens chat, seven questions respond, Send and Back work (RTL=%s)',async rtl=>{
 mockRTL=rtl;rendered=renderRouter(routes,{initialUrl:'/plan?childId=synthetic-child-a&date=2026-10-20'});
 fireEvent.press(screen.getByLabelText(rtl?'اسأل مساعد فخر':'Ask Fakhr AI'));
 await waitFor(()=>expect(rendered.getPathname()).toBe('/plan/ask'));
 expect(screen.getByText(rtl?'مساعد فخر':'Fakhr Assistant')).toBeTruthy();
 expect(rendered.getSearchParams()).toEqual({childId:'synthetic-child-a',date:'2026-10-20'});
 for(const [,ar,en,arPrompt,enPrompt] of assistantQuestions){fireEvent.press(screen.getByLabelText(rtl?ar:en));await waitFor(()=>expect(screen.getByText(rtl?arPrompt:enPrompt)).toBeTruthy());await act(async()=>{await jest.advanceTimersByTimeAsync(350)});assertReply()}
 fireEvent.press(screen.getByText(rtl?'أسئلة إضافية':'More questions'));
 for(const q of rtl?['كيف أنشئ خطة؟','ما خيارات الوصول؟','ماذا يعني التقدم؟']:['How do I create a plan?','What accessibility options are there?','What does progress mean?']){fireEvent.press(screen.getByLabelText(q));await act(async()=>{await jest.advanceTimersByTimeAsync(350)});assertReply();expect(screen.getAllByText(q).length).toBeGreaterThan(1)}
 fireEvent.changeText(screen.getByLabelText(rtl?'اكتب سؤالك':'Type your question'),'How do I create a plan?');fireEvent.press(screen.getByLabelText(rtl?'إرسال':'Send'));await act(async()=>{await jest.advanceTimersByTimeAsync(350)});assertReply();
 fireEvent.press(screen.getByLabelText(rtl?'رجوع':'Back'));await waitFor(()=>expect(rendered.getPathname()).toBe('/plan'));
 fireEvent.press(screen.getByLabelText(rtl?'إنشاء خطة ذكية':'Create Smart Plan'));await waitFor(()=>expect(rendered.getPathname()).toBe('/plan/assistant'));
 expect(screen.getByText(rtl?'١. الأهداف وخيارات الوصول':'1. Goals and accessibility')).toBeTruthy();
});
test.each(['ask','assistant'])('non-preview navigation remains available while live AI stays disabled: %s',async target=>{mockPreview=false;rendered=renderRouter(routes,{initialUrl:'/plan?childId=synthetic-child-a&date=2026-10-20'});fireEvent.press(screen.getByLabelText(target==='ask'?'اسأل مساعد فخر':'إنشاء خطة ذكية'));await waitFor(()=>expect(rendered.getPathname()).toBe('/plan/'+target));expect(screen.getByText(target==='ask'?'المساعد الشخصي غير مفعّل بعد.':'المساعد الشخصي غير مفعّل. هذه الميزة متاحة للاختبار المحلي المعزول فقط.')).toBeTruthy()});
test.each([true,false])('missing child routes to explicit selection/sign-in, signed in=%s',async signed=>{mockPreview=false;mockHasChild=false;mockSignedIn=signed;rendered=renderRouter(routes,{initialUrl:'/plan'});fireEvent.press(screen.getByLabelText('اسأل مساعد فخر'));await waitFor(()=>expect(screen.getByText(signed?'Add child destination':'Sign in destination')).toBeTruthy())});

jest.setTimeout(30000);

 test.each([true,false])('Home floating assistant supports authenticated and guest return, signed in=%s',async signed=>{mockSignedIn=signed;mockPreview=false;consumePendingAuthHref();rendered=renderRouter(routes,{initialUrl:'/home'});fireEvent.press(screen.getByTestId('home-ask-fakhr'));if(!signed){await waitFor(()=>expect(rendered.getPathname()).toBe('/login'));fireEvent.press(screen.getByText('Complete synthetic sign-in'))}await waitFor(()=>expect(rendered.getPathname()).toBe('/plan/ask'));expect(screen.getByText('مساعد فخر')).toBeTruthy();expect(screen.getAllByText('طفل الاختبار').length).toBeGreaterThan(0);expect(screen.getByText('المساعد الشخصي غير مفعّل بعد.')).toBeTruthy()});
 test.each([true,false])('Home plan card opens dashboard, signed in=%s',async signed=>{mockSignedIn=signed;mockPreview=false;mockHasChild=signed;rendered=renderRouter(routes,{initialUrl:'/home'});fireEvent.press(screen.getByTestId('home-child-plan-shortcut'));await waitFor(()=>expect(rendered.getPathname()).toBe('/plan'));expect(screen.getByText('خطتي')).toBeTruthy()});
 test('Home assistant without a child presents Add Child action',async()=>{mockPreview=false;mockHasChild=false;rendered=renderRouter(routes,{initialUrl:'/home'});fireEvent.press(screen.getByTestId('home-ask-fakhr'));await waitFor(()=>expect(rendered.getPathname()).toBe('/plan/ask'));expect(screen.getByText('لا يوجد طفل محدد')).toBeTruthy();fireEvent.press(screen.getByLabelText('تغيير الطفل'));await waitFor(()=>expect(rendered.getPathname()).toBe('/profile/add-child'))});

test('explicit local assistant preview requires no account and normal Home action still requires login',async()=>{mockPreview=true;mockSignedIn=false;rendered=renderRouter(routes,{initialUrl:'/home'});fireEvent.press(screen.getByLabelText('معاينة المساعد — محاكاة محلية'));await waitFor(()=>expect(rendered.getPathname()).toBe('/plan/ask'));expect(screen.getByText('معاينة محلية — ردود تجريبية فقط. لا تُدخل بيانات شخصية.')).toBeTruthy();fireEvent.press(screen.getByLabelText('رجوع'));await waitFor(()=>expect(rendered.getPathname()).toBe('/home'));fireEvent.press(screen.getByTestId('home-ask-fakhr'));await waitFor(()=>expect(rendered.getPathname()).toBe('/login'))});
test('mock entry is absent outside isolated preview',()=>{mockPreview=false;rendered=renderRouter(routes,{initialUrl:'/home'});expect(screen.queryByLabelText('معاينة المساعد — محاكاة محلية')).toBeNull()});
