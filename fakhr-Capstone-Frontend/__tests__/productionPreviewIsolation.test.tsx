import Explore from '../app/(tabs)/discover/index';
import React from 'react';
import {render} from '@testing-library/react-native';
import {Platform, Text} from 'react-native';
import LegacyPlan from '../app/(tabs)/plan/legacy';
import {localCarePreview} from '../components/plan/DailyCarePreview';
const mockRedirect=jest.fn();
jest.mock('expo-router',()=>({useLocalSearchParams:()=>({childId:'selected-child',date:'2026-10-20'}),Redirect:({href}:any)=>{mockRedirect(href);return require('react').createElement(require('react-native').Text,null,'Current Plan')},useRouter:()=>({}),useFocusEffect:jest.fn()}));
jest.mock('@expo/vector-icons',()=>({Ionicons:'Icon'}));
const development=__DEV__;
afterEach(()=>{(global as any).__DEV__=development;mockRedirect.mockClear()});
test('production legacy deep link redirects to current Plan and preserves child and date',()=>{
 (global as any).__DEV__=false;
 const ui=render(<LegacyPlan/>);
 expect(mockRedirect).toHaveBeenCalledWith({pathname:'/(tabs)/plan',params:{childId:'selected-child',date:'2026-10-20'}});
 expect(ui.queryByText('Illustrative preview · not personalized')).toBeNull();
});
test('production local care preview is blocked even when hosted on localhost',()=>{
 (global as any).__DEV__=false;
 Object.defineProperty(Platform,'OS',{configurable:true,value:'web'});
 Object.defineProperty(global,'window',{configurable:true,value:{location:{hostname:'localhost'}}});
 expect(localCarePreview()).toBe(false);
});
test('production Explore deep link cannot display the archived demo catalog',()=>{
 (global as any).__DEV__=false;
 render(<Explore/>);
 expect(mockRedirect).toHaveBeenCalledWith('/(tabs)/resources');
});