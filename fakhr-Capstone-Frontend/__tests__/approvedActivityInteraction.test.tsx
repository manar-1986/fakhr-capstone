import React from 'react';
import {render,fireEvent,waitFor} from '@testing-library/react-native';
import ApprovedActivityInteraction from '../components/plan/ApprovedActivityInteraction';
import {recordParticipation} from '../api/dailyCare.api';
let mockActivities:any[]=[];
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:false})}));
jest.mock('@tanstack/react-query',()=>({useQuery:()=>({data:{activities:mockActivities},isError:false})}));
jest.mock('../api/dailyCare.api',()=>({recordParticipation:jest.fn().mockResolvedValue({}),readApprovedActivities:jest.fn()}));
const text={ar:'تجريبي',en:'Synthetic reviewed wording'};
beforeEach(()=>{jest.clearAllMocks();mockActivities=[]});
test('missing approved source gives empty state without fabricating an activity',()=>{
 const v=render(<ApprovedActivityInteraction accountId="a" childId="c"/>);
 expect(v.getByText(/No complete approved content/)).toBeTruthy();
 expect(v.queryByText('Completed')).toBeNull();
});
test('complete wording and explicit suitability confirmation precede scoped participation',async()=>{
 mockActivities=[{activityId:'synthetic',templateId:'t',catalogVersion:'v1',title:text,goal:text,description:text,duration:text,steps:[text],adaptations:[text],safety:text,participationObservation:text}];
 const v=render(<ApprovedActivityInteraction accountId="a" childId="c"/>);
 fireEvent.press(v.getByText('View Details'));expect(v.queryByText('Completed')).toBeNull();
 fireEvent.press(v.getByText('Confirm adaptations, safe setting, and child willingness'));
 fireEvent.changeText(v.getByLabelText('Participation notes'),'Synthetic note');
 fireEvent.press(v.getByText('Completed'));
 await waitFor(()=>expect(recordParticipation).toHaveBeenCalledWith(expect.objectContaining({childId:'c',activityId:'synthetic',catalogVersion:'v1',status:'completed',accessibilityConfirmed:true,safetyConfirmed:true,notes:'Synthetic note'})));
 expect(v.getByText(/does not demonstrate developmental improvement/)).toBeTruthy();
});
