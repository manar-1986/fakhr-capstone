jest.mock('../hooks/useDailyCarePersistence',()=>({useDailyCarePersistence:()=>({enabled:false,data:{schedule:[],medications:[],history:[]},change:jest.fn(),pending:false,error:false,loading:false})}));
import React from 'react';
import {render,fireEvent} from '@testing-library/react-native';
import ChildPlanToday from '../components/plan/ChildPlanToday';
import {reviewedActivities,suitableActivities,previewActivityTitles,ReviewedActivity} from '../utils/reviewedActivityCatalog';
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:false,align:'left',dir:'ltr',tabRow:'row'})}));
jest.mock('@expo/vector-icons',()=>({Ionicons:()=>null}));
jest.mock('expo-router',()=>({useRouter:()=>({push:jest.fn()})}));
jest.mock('../components/plan/FamilySupport',()=>()=>null);
jest.mock('../components/plan/CalendarEventList',()=>()=>null);
jest.mock('../components/plan/DailyCarePreview',()=>({__esModule:true,default:()=>null,localCarePreview:()=>true}));
jest.mock('../utils/journeyStore',()=>({readJourney:jest.fn(),addJourneyRecord:jest.fn()}));
const props={preview:true,goals:[],tasks:[],allTasks:[],records:[],loading:false,error:false,onRetry:jest.fn(),onProgress:jest.fn(),renderTask:jest.fn()};
test('catalog absent fails closed; only user-supplied preview titles exist',()=>{expect(reviewedActivities).toEqual([]);expect(previewActivityTitles).toHaveLength(3);expect(suitableActivities([], {goalIds:['x'],age:5,preferenceIds:[]})).toEqual([])});
test('future suitability requires goal and age and respects stated preferences',()=>{const a={goalIds:['communication'],minAge:3,maxAge:6,preferenceIds:['books']} as ReviewedActivity;expect(suitableActivities([a],{goalIds:['communication'],age:5,preferenceIds:['books']})).toEqual([a]);expect(suitableActivities([a],{goalIds:['other'],age:5,preferenceIds:['books']})).toEqual([]);expect(suitableActivities([a],{goalIds:['communication'],age:9,preferenceIds:['books']})).toEqual([]);expect(suitableActivities([a],{goalIds:['communication'],preferenceIds:['books']})).toEqual([])});
test('suggestion integration does not call real task renderer',()=>{const v=render(<ChildPlanToday {...props}/>);expect(v.getByText('Suggested Activity for Your Child')).toBeTruthy();expect(v.getByText('Choose a game or book for free time')).toBeTruthy();fireEvent.press(v.getByText('View Details'));fireEvent.changeText(v.getByLabelText('Synthetic participation notes'),'demo');fireEvent.press(v.getByText('Completed — demo'));expect(v.getByText('Completion recorded — demo')).toBeTruthy();expect(props.renderTask).not.toHaveBeenCalled()});

