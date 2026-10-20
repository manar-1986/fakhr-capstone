import React from 'react';
import {render} from '@testing-library/react-native';
import Layout from '../app/(onboarding)/_layout';
jest.mock('../components/screens/MinimumUnavailable',()=>()=>require('react').createElement(require('react-native').Text,null,'Unavailable'));
let mockPath='/landing';
jest.mock('expo-router',()=>{
 const React=require('react');const {Text}=require('react-native');
 const Stack=({children}:any)=>React.createElement(Text,null,'stack',children);Stack.Screen=()=>null;
 return {Stack,usePathname:()=>mockPath,Redirect:({href}:any)=>React.createElement(Text,null,href)};
});
test.each(['parent-profile','child-basic','child-medical','child-diagnosis','child-challenges','child-goals'])('legacy %s uses the existing protected child editor before accepting unsaved inputs',route=>{
 mockPath='/'+route;const ui=render(<Layout/>);expect(ui.getByText('/(tabs)/profile/add-child')).toBeTruthy();
});
test.each(['landing'])('%s remains accessible',route=>{
 mockPath='/'+route;const ui=render(<Layout/>);expect(ui.queryByText('/(tabs)/profile/add-child')).toBeNull();
});
test('minimum release blocks plan generation before screen mounts',()=>{mockPath='/generate-plan';const ui=render(<Layout/>);expect(ui.getByText('Unavailable')).toBeTruthy();});
