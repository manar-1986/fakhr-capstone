import React from 'react';
import {render,fireEvent} from '@testing-library/react-native';
import Professionals from '../app/(tabs)/professionals/index';
const mockQueryKey=jest.fn();let mockRTL=false;
jest.mock('@tanstack/react-query',()=>({useQuery:({queryKey}:any)=>{mockQueryKey(queryKey);return {data:[],isLoading:false,error:null}}}));
jest.mock('expo-router',()=>({useRouter:()=>({push:jest.fn(),replace:jest.fn()}),useLocalSearchParams:()=>({})}));
jest.mock('@expo/vector-icons',()=>({Ionicons:'Icon'}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:mockRTL})}));
jest.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key})}));
test.each([false,true])('legacy professionals search remains editable and updates query in RTL=%s',rtl=>{
 mockRTL=rtl;const ui=render(<Professionals/>);
 const input=ui.getByLabelText('copy.searchProfessionalsPlaceholder');
 fireEvent.changeText(input,'speech');
 expect(mockQueryKey).toHaveBeenLastCalledWith(['professionals','all','speech']);
 fireEvent.changeText(ui.getByLabelText('copy.searchProfessionalsPlaceholder'),'speech therapy');
 expect(mockQueryKey).toHaveBeenLastCalledWith(['professionals','all','speech therapy']);
 expect(ui.getByText('copy.sort').parent).toBeTruthy();
 expect(ui.getByRole('button',{disabled:true})).toBeTruthy();
});