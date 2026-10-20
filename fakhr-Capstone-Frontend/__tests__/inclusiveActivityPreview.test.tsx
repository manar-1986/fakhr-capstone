jest.mock('../hooks/useDailyCarePersistence',()=>({useDailyCarePersistence:()=>({enabled:false,data:{schedule:[],medications:[],history:[]},change:jest.fn(),pending:false,error:false,loading:false})}));
import React from 'react';
import {render,fireEvent} from '@testing-library/react-native';
import InclusiveActivityPreview from '../components/plan/InclusiveActivityPreview';
import {draftCatalog,eligibleDraftActivities,initialSyntheticProfile} from '../utils/inclusivePlanPreview';
let mockLocal=true, mockRTL=false;
jest.mock('../components/plan/DailyCarePreview',()=>({localCarePreview:()=>mockLocal}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?'right':'left',dir:mockRTL?'rtl':'ltr',tabRow:mockRTL?'row-reverse':'row'})}));
jest.mock('@expo/vector-icons',()=>({Ionicons:()=>null}));
beforeEach(()=>{mockLocal=true;mockRTL=false;});
test('exact 30 drafts cover requested bands and exclude incomplete original content',()=>{
 expect(draftCatalog.variants).toHaveLength(30);
 for(const age of [7,11,15])expect(eligibleDraftActivities({...initialSyntheticProfile,age,goalIds:draftCatalog.groups.map(g=>g.id)})).toHaveLength(10);
 expect(eligibleDraftActivities({...initialSyntheticProfile,age:5})).toEqual([]);
 expect(new Set(draftCatalog.variants.map(v=>v.id)).size).toBe(30);
 expect(draftCatalog.variants.every(v=>v.status==='NEW_DRAFT_REQUIRES_APPROVAL')).toBe(true);
});
test.each([{willing:false},{safeMaterials:false},{establishedStopMethod:false},{accessConfirmed:false},{communication:''},{participation:'unknown' as const},{goalIds:[]},{accessIds:['not-real']},{age:NaN}])('unknown prerequisite fails closed %j',patch=>{
 expect(eligibleDraftActivities({...initialSyntheticProfile,...patch})).toEqual([]);
});
test('goals filter, preferences rank, established partner access allowed; diagnosis unused',()=>{
 expect(eligibleDraftActivities({...initialSyntheticProfile,goalIds:['social']})).toHaveLength(2);
 const p={...initialSyntheticProfile,preferredIds:['book'],participation:'partner' as const,communication:'aac',accessIds:['vision','mobility']};
 expect(eligibleDraftActivities(p)[0].sourceActivityId).toBe('book');
 expect(eligibleDraftActivities({...p,diagnosis:'anything'} as typeof p)).toEqual(eligibleDraftActivities(p));
});
test('non-local preview fails closed',()=>{mockLocal=false;expect(render(<InclusiveActivityPreview/>).queryByTestId('inclusive-activity-preview')).toBeNull();});
test('details preserve exact wording; selection and synthetic notes stay activity-scoped',()=>{
 const v=render(<InclusiveActivityPreview accountId="demo" childId="one"/>);
 fireEvent.press(v.getByText('View Details'));
 const first=draftCatalog.variants[0];
 expect(v.getByText(first.description.en)).toBeTruthy();
 expect(v.getByText(first.safety.en)).toBeTruthy();
 fireEvent.changeText(v.getByLabelText('Synthetic participation notes'),'synthetic note');
 fireEvent.press(v.getByText('Skip — demo'));
 expect(v.getByText('Skip recorded — demo')).toBeTruthy();
 fireEvent.press(v.getByText('Close details'));
 fireEvent.press(v.getByText('Browse alternatives'));
 fireEvent.press(v.getAllByText('Choose this activity')[1]);
 expect(v.getByText('Explore a child-chosen story or information book')).toBeTruthy();
 fireEvent.press(v.getByText('View Details'));
 expect(v.getByLabelText('Synthetic participation notes').props.value).toBe('');
 fireEvent.press(v.getByText('Close details'));
});
test.each([{accountId:'different',childId:'one'},{accountId:'demo',childId:'two'}])('account or child change erases notes',next=>{
 const v=render(<InclusiveActivityPreview accountId="demo" childId="one"/>);
 fireEvent.press(v.getByText('View Details'));
 fireEvent.changeText(v.getByLabelText('Synthetic participation notes'),'synthetic secret');
 v.rerender(<InclusiveActivityPreview {...next}/>);
 fireEvent.press(v.getByText('View Details'));
 expect(v.getByLabelText('Synthetic participation notes').props.value).toBe('');
});
test('profile accessibility changes require renewed confirmation; 3–5 stays empty',()=>{
 const v=render(<InclusiveActivityPreview/>);
 fireEvent.press(v.getByText('Customize synthetic profile'));
 fireEvent.press(v.getByLabelText('Vision'));
 expect(v.queryByText('View Details')).toBeNull();
 fireEvent.press(v.getByText('Access options compatible — demo'));
 expect(v.getByText('View Details')).toBeTruthy();
 fireEvent.press(v.getByText('3–5'));
 expect(v.getByText(/Complete original ages 3–5 content is unavailable/)).toBeTruthy();
});
test('Arabic details preserve Arabic catalog wording',()=>{
 mockRTL=true;const v=render(<InclusiveActivityPreview/>);
 fireEvent.press(v.getByText('عرض التفاصيل'));
 expect(v.getByText(draftCatalog.variants[0].safety.ar)).toBeTruthy();
 expect(v.getByLabelText('ملاحظات مشاركة تجريبية')).toBeTruthy();
});


