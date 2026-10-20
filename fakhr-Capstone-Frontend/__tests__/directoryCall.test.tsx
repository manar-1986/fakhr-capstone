import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import DirectoryCallButton from "../components/directory/DirectoryCallButton";
import DirectoryCard from "../components/directory/DirectoryCard";
import { directoryPhoneUrl, institutionPrimaryPhone } from "../utils/directoryCall";
import { INSTITUTIONS } from "../utils/institutionDirectory";
let mockRTL=false;
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left",dir:mockRTL?"rtl":"ltr"})}));
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
afterEach(()=>jest.restoreAllMocks());
test.each([['+9651832000','tel:+9651832000'],['22286547','tel:+96522286547'],['1881122','tel:1881122'],['+96599307764','tel:+96599307764'],['٢٥٣٠٩٣٠٠','tel:+96525309300'],['',undefined],['123',undefined],['22286547 / 60009762',undefined]])('validates %s without combining contacts',(phone,url)=>expect(directoryPhoneUrl(phone)).toBe(url));
test.each(['ios','android'])('native %s opens provider dialer without navigation',async platform=>{
 jest.replaceProperty(Platform,'OS',platform as any);const open=jest.spyOn(Linking,'openURL').mockResolvedValue(undefined);const navigate=jest.fn();const stop=jest.fn();
 const page=render(<DirectoryCard name="Provider" image={null} phone="22286547" onOpen={navigate}/>);
 expect(page.queryByText('22286547')).toBeNull();fireEvent.press(page.getByLabelText('Call'),{stopPropagation:stop});
 expect(open).toHaveBeenCalledWith('tel:+96522286547');expect(stop).toHaveBeenCalled();expect(navigate).not.toHaveBeenCalled();
});
test('invalid contact hidden and desktop uses tel link in both languages',()=>{
 jest.replaceProperty(Platform,'OS','web');const page=render(<DirectoryCallButton phone="unknown"/>);expect(page.queryByRole('link')).toBeNull();
 for(const rtl of [false,true]) {mockRTL=rtl;page.rerender(<DirectoryCallButton phone="+96599307764"/>);expect(page.getByLabelText(rtl?'اتصال':'Call').props.href).toBe('tel:+96599307764');}mockRTL=false;
});
test('dialer failure produces inline feedback',async()=>{
 jest.replaceProperty(Platform,'OS','ios');jest.spyOn(Linking,'openURL').mockRejectedValue(new Error('unavailable'));const page=render(<DirectoryCallButton phone="25309300"/>);fireEvent.press(page.getByLabelText('Call'),{stopPropagation:jest.fn()});await waitFor(()=>expect(page.getByRole('alert')).toBeTruthy());
});
test('institutions use public primary contacts, not research or secondary numbers',()=>{
 const item=INSTITUTIONS[0];expect(institutionPrimaryPhone({...item,publicProfile:undefined,publicContact:undefined})).toBeUndefined();
 expect(institutionPrimaryPhone({...item,publicProfile:{phone:'25309300',additionalPhone:'60009762'}})).toBe('25309300');
 for(const category of ['school','nursery','rehabilitation'] as const) expect(institutionPrimaryPhone({...item,categories:[category],publicProfile:{phone:'25309300'}})).toBe('25309300');
});

 test.each([false,true])('directory palette and profile navigation remain consistent in RTL=%s',rtl=>{
 mockRTL=rtl;const open=jest.fn();const page=render(<DirectoryCard name="Provider" specialty="Specialty" image={null} onOpen={open}/>);
 expect(page.toJSON()).toMatchObject({props:{style:expect.arrayContaining([expect.objectContaining({backgroundColor:'#EBF1FD'})])}});
 expect(page.getByRole('button',{name:'Provider'})).toHaveStyle({backgroundColor:'#607DCB'});
 expect(page.getByText(rtl?'عرض الملف':'View Profile')).toHaveStyle({color:'#0B093B'});
 expect(page.getByText('Provider')).toHaveStyle({color:'#0B093B'});
 expect(page.getByText('Specialty')).toHaveStyle({color:'#5E6486'});
 fireEvent.press(page.getByRole('button',{name:'Provider'}));expect(open).toHaveBeenCalledTimes(1);mockRTL=false;
 });
