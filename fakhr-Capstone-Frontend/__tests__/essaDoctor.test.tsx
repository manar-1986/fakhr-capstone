import React from "react";
import { render, cleanup } from "@testing-library/react-native";
import { Platform } from "react-native";
import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { ESSA_AL_MASHMOUM } from "../constants/essaAlMashmoum";
import { REEM_KANAWATI } from "../constants/reemKanawati";
import DoctorProfileScreen from "../components/directory/DoctorProfileScreen";
import PersonalAppointment from "../components/directory/PersonalAppointment";
let mockRTL=false;
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left",dir:mockRTL?"rtl":"ltr"})}));
jest.mock("../components/directory/PersonalAppointment",()=>({__esModule:true,default:jest.fn(()=>null)}));
afterEach(cleanup);
test("Essa and Reem are distinct, unique records with separate contact information",()=>{
  for(const d of [ESSA_AL_MASHMOUM,REEM_KANAWATI])expect(PUBLIC_DOCTORS.filter(x=>x.id===d.id)).toEqual([d]);
  expect(ESSA_AL_MASHMOUM.clinic?.phone).toBe("+96567754444");
  expect(REEM_KANAWATI.clinic?.nameEn).toBe("Medica Physio");
  expect(REEM_KANAWATI.clinic?.phone).toBeUndefined();
});
test.each([true,false])("Essa profile has correct localized contact and calendar data (RTL %s)",rtl=>{
  mockRTL=rtl;const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:"web"});
  try{const ui=render(<DoctorProfileScreen doctor={ESSA_AL_MASHMOUM}/>);
    expect(ui.getAllByRole("tab")).toHaveLength(2);
    expect(ui.getAllByText(rtl?ESSA_AL_MASHMOUM.nameAr:ESSA_AL_MASHMOUM.nameEn).length).toBeGreaterThan(0);
    expect(ui.getAllByRole("link").map(x=>x.props.href)).toEqual(["tel:+96567754444","https://maps.app.goo.gl/bNAsciu6VGFf64JC7"]);
    const props=(PersonalAppointment as jest.Mock).mock.calls.slice(-1)[0][0];
    expect(props).toMatchObject({identity:ESSA_AL_MASHMOUM.id,name:rtl?ESSA_AL_MASHMOUM.nameAr:ESSA_AL_MASHMOUM.nameEn,address:rtl?"حولي، مجمع الأندلس، الدور الثالث":"Hawally, Al-Andalus Complex, third floor",nativeEditor:true});
  }finally{Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});
