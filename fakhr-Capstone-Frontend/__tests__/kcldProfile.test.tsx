import React from "react";
import { Platform } from "react-native";
import { render,cleanup } from "@testing-library/react-native";
import CenterProfileScreen from "../components/directory/CenterProfileScreen";
import { INSTITUTIONS, findInstitution, filterInstitutions } from "../utils/institutionDirectory";
import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
let mockRTL=false;
jest.mock("expo-router",()=>({useRouter:()=>({push:jest.fn()})}));
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left",dir:mockRTL?"rtl":"ltr"})}));
jest.mock("../components/directory/PersonalAppointment",()=>({__esModule:true,default:()=>null}));
afterEach(cleanup);
test.each([true,false])("existing KCLD renders services, supervision and direct contacts (RTL %s)",rtl=>{
  mockRTL=rtl;const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:"web"});
  try{const item=findInstitution("center-kcld")!;const ui=render(<CenterProfileScreen item={item}/>);
    expect(INSTITUTIONS.filter(x=>x.id===item.id)).toHaveLength(1);
    expect(filterInstitutions(INSTITUTIONS,{search:"KCLD"})).toEqual([item]);
    for(const text of [...item.publicProfile!.services![rtl?"ar":"en"],...item.publicProfile!.supervisors![rtl?"ar":"en"]])expect(ui.getByText(text)).toBeTruthy();
    expect(ui.getByText(rtl?"تأسس عام 2010":"Established in 2010")).toBeTruthy();
    expect(ui.getAllByRole("link").map(x=>x.props.href)).toEqual(expect.arrayContaining(["tel:+96555269262","https://wa.me/96555269262","http://kcld-kw.com/arabic/index.html","https://maps.app.goo.gl/je3cAvLqZYQjPMY48"]));
    expect(PUBLIC_DOCTORS.filter(d=>d.nameEn === "Dr. Noha Al-Mufarreh")).toHaveLength(1);
    expect(PUBLIC_DOCTORS.some(d=>/Awatef Al-Balushi/.test(d.nameEn))).toBe(false);
  }finally{Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});
