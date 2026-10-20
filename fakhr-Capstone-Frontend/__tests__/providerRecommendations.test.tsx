import React from 'react';
import {render,fireEvent,cleanup} from '@testing-library/react-native';
import ProviderRecommendationCards from '../components/directory/ProviderRecommendationCards';
import snapshot from '../data/ai/providers.snapshot.json';
import {providerDirectoryVersion} from '../data/ai/providerDirectoryVersion';
import {PUBLIC_DOCTORS} from '../constants/approvedDoctors';
import {findInstitution,institutionDirectoryCategory} from '../utils/institutionDirectory';
import type {DirectoryRecommendation} from '../types/recommendation';
const mockPush=jest.fn();
jest.mock('expo-router',()=>({useRouter:()=>({push:mockPush})}));
jest.mock('@expo/vector-icons',()=>({Ionicons:'Icon'}));
jest.mock('../hooks/useI18nLayout',()=>({useI18nLayout:()=>({isRTL:true})}));
afterEach(()=>{cleanup();jest.clearAllMocks();});
function reference(r:typeof snapshot.records[number]):DirectoryRecommendation {const b=r.branches[0],o=b.observations[0];return {category:r.category as DirectoryRecommendation['category'],id:r.id,branchIds:[b.id],verification:'inquiry',evidence:[{branchId:b.id,sourceId:o?.sourceId||'directory-profile',page:o?.page||0,needs:o?.needsAr||'',ages:null,stage:null,area:null,governorate:null,services:[],verification:'inquiry',reasons:['age_unknown','source_unverified']}]};}
test('all exported IDs resolve to canonical existing profiles in the correct directory',()=>{
 expect(snapshot.version).toBe(providerDirectoryVersion);
 expect(new Set(snapshot.records.map(r=>r.id)).size).toBe(snapshot.records.length);
 for(const r of snapshot.records)if(r.category==='doctor')expect(PUBLIC_DOCTORS.some(d=>d.id===r.id)).toBe(true);else expect(institutionDirectoryCategory(findInstitution(r.id)!)).toBe(r.category);
});

test.each(['ar','en'] as const)('speech clinic suggestion preserves qualification, original image and Details: %s',language=>{
 const r=snapshot.records.find(r=>r.id==='center-speech-plus')!;
 const doctor=PUBLIC_DOCTORS.find(d=>d.id===r.id)!;
 const before=JSON.stringify(doctor);
 expect((r.branches[0].profile as any).clinicServices.en).toContain('Speech and communication services');
 const profile=r.branches[0].profile;
 if(!('services' in profile))throw new Error('Missing original professional specialty');
 expect(profile.services.en).toEqual(['PhD in Special Education – Autism Specialization']);
 const ref=reference(r);ref.evidence[0].reasons!.push('clinic_service_only','qualification_unverified');
 const ui=render(<ProviderRecommendationCards references={[ref]} version={providerDirectoryVersion} language={language}/>);
 expect(ui.getByText(language==='ar'?'للاستفسار فقط — الأهلية تحتاج تأكيداً':'Inquiry only — eligibility needs confirmation')).toBeTruthy();
 const {DoctorImage,DoctorLink}=require('../components/directory/DoctorVisuals');
 expect(ui.UNSAFE_getByType(DoctorImage).props.doctor).toBe(doctor);
 expect(ui.UNSAFE_getAllByType(DoctorLink).some((link:any)=>link.props.url===doctor.clinic?.mapUrl)).toBe(true);
 fireEvent.press(ui.getByText(language==='ar'?'عرض التفاصيل':'View Details'));
 expect(mockPush).toHaveBeenLastCalledWith({pathname:'/(tabs)/directory/professional-details',params:{id:'center-speech-plus',origin:'ask-fakhr'}});
 expect(JSON.stringify(doctor)).toBe(before);
});
test.each(['doctor','rehabilitation','nursery','sports'])('both languages open original %s profile and deduplicate',category=>{
 const r=snapshot.records.find(r=>r.category===category)!;
 for(const language of ['ar','en'] as const){
  const ui=render(<ProviderRecommendationCards references={[reference(r),reference(r)]} version={providerDirectoryVersion} language={language}/>);
  expect(ui.getAllByTestId('provider-card-'+r.branches[0].id)).toHaveLength(1);
  fireEvent.press(ui.getByText(language==='ar'?'عرض التفاصيل':'View Details'));
  expect(mockPush).toHaveBeenLastCalledWith({pathname:category==='doctor'?'/(tabs)/directory/professional-details':'/(tabs)/directory/institution-details',params:{id:r.id,origin:'ask-fakhr'}});ui.unmount();
 }
});
test('rejects invalid category, ID, branch, evidence and stale version',()=>{
 const ref=reference(snapshot.records[0]);
 for(const invalid of [{...ref,id:'fake'},{...ref,category:'doctor' as const},{...ref,branchIds:['fake']},{...ref,evidence:[]}]){const ui=render(<ProviderRecommendationCards references={[invalid]} version={providerDirectoryVersion}/>);expect(ui.queryAllByText('عرض التفاصيل')).toHaveLength(0);ui.unmount();}
 const ui=render(<ProviderRecommendationCards references={[ref]} version="old"/>);expect(ui.queryAllByText('عرض التفاصيل')).toHaveLength(0);
});
test('response cannot upgrade unverified records, or inject contacts and names',()=>{
 const r=snapshot.records[0];const ref=reference(r);ref.verification='verified';ref.evidence[0].verification='verified';ref.evidence[0].reasons=[];
 const ui=render(<ProviderRecommendationCards references={[ref]} version={providerDirectoryVersion} language="en"/>);
 expect(ui.getByText('Inquiry only — eligibility needs confirmation')).toBeTruthy();
 expect(ui.queryByText('Verified service match — confirm admission with provider')).toBeNull();
});

test.each(['ar','en'] as const)('Insan branch cards reuse original logo, exact branch maps and branch phones: %s',language=>{
 const r=snapshot.records.find(r=>r.id==='kw-n-insan-1')!;
 const ref=reference(r);ref.branchIds=r.branches.map(b=>b.id);ref.evidence=r.branches.map(b=>({...reference({...r,branches:[b]}).evidence[0]}));
 const before=JSON.stringify(findInstitution(r.id));
 const ui=render(<ProviderRecommendationCards references={[ref]} version={providerDirectoryVersion} language={language}/>);
 const Image=require('react-native').Image;
 const {DoctorLink}=require('../components/directory/DoctorVisuals');
 const {institutionImages}=require('../components/directory/InstitutionImage');
 for(const [index,b] of r.branches.entries()){
  const card=ui.getByTestId('provider-card-'+b.id);
  expect(card.findByType(Image).props.source).toBe(institutionImages.insan);
  expect(card.findByType(Image).props.resizeMode).toBe('contain');
  const urls=card.findAllByType(DoctorLink).map((l:any)=>l.props.url);
  expect(urls).toContain(index===0?'https://maps.app.goo.gl/SBwhg6hjmAsMGnmh8':'https://maps.app.goo.gl/PDFoXyqmrarNgdE5A');
  expect(urls).toContain('https://www.instagram.com/insan_kuw/');
  expect(card.findAllByType(DoctorLink).find((l:any)=>l.props.url.startsWith('tel:'))!.props.label).toBe(language==='ar'?'اتصال — تأكيد الفرع':'Call — confirm branch');
  expect(urls).not.toContain(index===0?'https://maps.app.goo.gl/PDFoXyqmrarNgdE5A':'https://maps.app.goo.gl/SBwhg6hjmAsMGnmh8');
  if(b.id==='kw-n-insan-2')expect(urls.some((url:string)=>url.includes('52226632'))).toBe(false);
 }
 fireEvent.press(ui.getAllByText(language==='ar'?'عرض التفاصيل':'View Details')[1]);
 expect(mockPush).toHaveBeenLastCalledWith({pathname:'/(tabs)/directory/institution-details',params:{id:r.id,origin:'ask-fakhr'}});
 expect(JSON.stringify(findInstitution(r.id))).toBe(before);
});

test('Basma with no recorded logo does not acquire a fabricated image',()=>{
 const r=snapshot.records.find(r=>r.id.includes('basma'))!;
 expect(r).toBeTruthy();
 const ui=render(<ProviderRecommendationCards references={[reference(r)]} version={providerDirectoryVersion} language="en"/>);
 expect(ui.UNSAFE_queryAllByType(require('react-native').Image)).toHaveLength(0);
 expect(ui.getByText('Inquiry only — eligibility needs confirmation')).toBeTruthy();
});

test.each(['ar','en'] as const)('mixed therapy references retain all cards, availability evidence and original routes: %s',language=>{
 const ids=['center-speech-plus','center-abc-kuwait','center-first-step','center-kcld','center-thiqa','provider-maram-aldihani'];
 const refs=ids.map(id=>reference(snapshot.records.find(r=>r.id===id)!));
 for(const ref of refs)ref.evidence[0].reasons!.push('female_availability_unknown');
 const ui=render(<ProviderRecommendationCards references={refs} version={providerDirectoryVersion} language={language}/>);
 expect(ui.getAllByText(language==='ar'?'عرض التفاصيل':'View Details')).toHaveLength(ids.length);
 expect(ui.getAllByText(/Confirm female-specialist availability|تأكدوا من توفر أخصائية/)).toHaveLength(ids.length);
 for(let i=0;i<refs.length;i++){
  fireEvent.press(ui.getAllByText(language==='ar'?'عرض التفاصيل':'View Details')[i]);
  expect(mockPush).toHaveBeenLastCalledWith({pathname:refs[i].category==='doctor'?'/(tabs)/directory/professional-details':'/(tabs)/directory/institution-details',params:{id:refs[i].id,origin:'ask-fakhr'}});
 }
});
