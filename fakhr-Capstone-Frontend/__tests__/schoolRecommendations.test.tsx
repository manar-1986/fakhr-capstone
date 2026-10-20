import React from 'react';
import {render,fireEvent,cleanup} from '@testing-library/react-native';
import SchoolRecommendationCards from '../components/directory/SchoolRecommendationCards';
import {INSTITUTIONS,institutionDirectoryCategory} from '../utils/institutionDirectory';
import {schoolDirectoryVersion} from '../data/ai/schoolDirectoryVersion';
import type {DirectoryRecommendation} from '../types/recommendation';
import snapshot from '../data/ai/schools.snapshot.json';
import {filterInstitutions} from '../utils/institutionDirectory';
const mockPush=jest.fn();let mockRTL=true;
jest.mock('expo-router',()=>({useRouter:()=>({push:mockPush})}));
jest.mock('@expo/vector-icons',()=>({Ionicons:'Icon'}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?'right':'left',dir:mockRTL?'rtl':'ltr'})}));
afterEach(()=>{cleanup();jest.clearAllMocks();});
test('versioned snapshot exactly preserves public school records, branches and source fields',()=>{
  expect(snapshot.records).toEqual(filterInstitutions(INSTITUTIONS,{}).filter(r=>institutionDirectoryCategory(r)==='school'));
  expect(snapshot.version).toBe(schoolDirectoryVersion);
});
const school=INSTITUTIONS.find(r=>institutionDirectoryCategory(r)==='school'&&!r.branches&&r.observations.some(o=>o.needsAr))!;
const row=school.observations.find(o=>o.needsAr)!;
const ref:DirectoryRecommendation={category:'school',id:school.id,branchIds:[school.id],evidence:[{branchId:school.id,sourceId:row.sourceId,page:row.page,needs:row.needsAr!,ages:row.agesAr,stage:row.stagesAr,area:row.areaAr,governorate:row.governorateAr,services:[]}]};
test.each([true,false])('real school card opens canonical existing profile; RTL=%s',rtl=>{
  mockRTL=rtl;const ui=render(<SchoolRecommendationCards references={[ref,ref]} version={schoolDirectoryVersion}/>);
  expect(ui.getAllByTestId(`school-recommendation-${school.id}`)).toHaveLength(1);
  fireEvent.press(ui.getByRole('button',{name:(rtl?school.nameAr:school.nameEn)||school.nameAr}));
  expect(mockPush).toHaveBeenCalledWith({pathname:'/(tabs)/directory/institution-details',params:{id:school.id,origin:'ask-fakhr'}});
});
test('stale snapshot and invented IDs cannot open school profiles',()=>{
  const ui=render(<SchoolRecommendationCards references={[ref]} version="stale"/>);
  expect(ui.queryAllByRole('button')).toHaveLength(0);ui.unmount();
  const invalid=render(<SchoolRecommendationCards references={[{...ref,id:'invented'}]} version={schoolDirectoryVersion}/>);
  expect(invalid.queryAllByRole('button')).toHaveLength(0);
});

test('inquiry and verified labels are explicit and follow response language',()=>{
  mockRTL=true;
  const ui=render(<SchoolRecommendationCards references={[ref]} version={schoolDirectoryVersion} language="en"/>);
  expect(ui.getByText('Inquiry only — eligibility requires school confirmation')).toBeTruthy();
  ui.unmount();
  const verified={...ref,verification:'verified' as const,evidence:ref.evidence.map(e=>({...e,verification:'verified' as const,reasons:[]}))};
  const verifiedUI=render(<SchoolRecommendationCards references={[verified]} version={schoolDirectoryVersion} language="ar"/>);
  expect(verifiedUI.getByText('أهلية موثقة في الدليل — يُرجى تأكيد القبول')).toBeTruthy();
});


test('single status, contained image and bounded description with separate actions',()=>{
 const dimensions=jest.spyOn(require('react-native'),'useWindowDimensions').mockReturnValue({width:375,height:812,scale:1,fontScale:1});
 const ui=render(<SchoolRecommendationCards references={[ref]} version={schoolDirectoryVersion} language="en"/>);
 expect(ui.getAllByText('Inquiry only — eligibility requires school confirmation')).toHaveLength(1);
 expect(ui.queryByText('Source-reported information, not confirmation of current admission.')).toBeNull();
 expect(ui.getByTestId('school-logo-'+school.id).props.contentFit).toBe('contain');
 expect(ui.getByTestId('school-summary-'+school.id).props.numberOfLines).toBe(3);
 expect(ui.getByTestId('school-actions-'+school.id)).toBeTruthy();
 expect(ui.getByText('View Details')).toBeTruthy();
 dimensions.mockRestore();
});

test('missing official English school name is visibly labeled without inventing one',()=>{
 const item=INSTITUTIONS.find(r=>r.id==='kw-s-gulf')!;
 const o=item.observations.find(x=>x.needsAr)!;
 const reference:DirectoryRecommendation={category:'school',id:item.id,branchIds:[item.id],evidence:[{branchId:item.id,sourceId:o.sourceId,page:o.page,needs:o.needsAr!,ages:o.agesAr,stage:o.stagesAr,area:o.areaAr,governorate:o.governorateAr,services:[]}]};
 const ui=render(<SchoolRecommendationCards references={[reference]} version={schoolDirectoryVersion} language="en"/>);
 expect(ui.getByText(item.nameAr)).toBeTruthy();
 expect(ui.getByText('Official English name unavailable — original Arabic name shown.')).toBeTruthy();
 expect(ui.getByText('English description unavailable. View Details for the original Arabic information.')).toBeTruthy();
});
