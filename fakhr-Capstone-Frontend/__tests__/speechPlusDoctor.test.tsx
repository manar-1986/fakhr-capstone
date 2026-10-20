import React from "react";
import { render, cleanup } from "@testing-library/react-native";
import { Platform } from "react-native";
import { SPEECH_PLUS_SOURCE, SPEECH_PLUS_DOCTOR } from "../constants/speechPlus";
import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { filterInstitutions, INSTITUTIONS, backendInstitution } from "../utils/institutionDirectory";
import DoctorProfileScreen from "../components/directory/DoctorProfileScreen";
import type { HealthCenter } from "../types/directory.types";
let mockRTL=false;
jest.mock("expo-router",()=>({useRouter:()=>({push:jest.fn()})}));
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left",dir:mockRTL?"rtl":"ltr"})}));
jest.mock("../components/directory/PersonalAppointment",()=>({__esModule:true,default:()=>null}));
afterEach(cleanup);
test("one stable identity moves into Doctors; exact API aliases cannot reappear as centers",()=>{
  expect(PUBLIC_DOCTORS.filter(d=>d.id===SPEECH_PLUS_SOURCE.id)).toEqual([SPEECH_PLUS_DOCTOR]);
  expect(INSTITUTIONS.filter(i=>i.id===SPEECH_PLUS_SOURCE.id)).toHaveLength(1);
  for(const name of ["Speech Plus","Speech+"]){
    expect(filterInstitutions(INSTITUTIONS,{search:name})).toHaveLength(0);
    const api=backendInstitution({id:"existing",name} as HealthCenter);
    expect(filterInstitutions([api],{})).toHaveLength(0);
  }
  expect(SPEECH_PLUS_DOCTOR.sourceInstitution).toBe(SPEECH_PLUS_SOURCE);
  expect(SPEECH_PLUS_DOCTOR.clinic?.whatsapp).toEqual(SPEECH_PLUS_SOURCE.publicProfile?.whatsapp);
  expect(SPEECH_PLUS_DOCTOR.clinic?.phone).toBeUndefined();
  expect(SPEECH_PLUS_DOCTOR.suppliedBiography?.independentlyVerified).toBe(false);
});
test.each([true,false])("bilingual doctor page retains clinic content and all existing links (RTL %s)",rtl=>{
  mockRTL=rtl;const original=Platform.OS;Object.defineProperty(Platform,"OS",{value:"web",configurable:true});
  try{const ui=render(<DoctorProfileScreen doctor={SPEECH_PLUS_DOCTOR}/>);
  expect(ui.getByText(rtl?"د. دعاء الملك":"Dr. Doaa Al-Malek")).toBeTruthy();
  expect(ui.getAllByText(SPEECH_PLUS_DOCTOR.suppliedBiography![rtl?"ar":"en"]).length).toBeGreaterThan(0);
  expect(ui.getByText(SPEECH_PLUS_SOURCE.publicProfile!.description![rtl?"ar":"en"])).toBeTruthy();
  const links=ui.getAllByRole("link").map(x=>x.props.href);
  expect(links).toEqual(expect.arrayContaining([SPEECH_PLUS_SOURCE.publicProfile!.whatsapp!.url,SPEECH_PLUS_SOURCE.publicProfile!.mapUrl,SPEECH_PLUS_SOURCE.publicProfile!.website,SPEECH_PLUS_SOURCE.publicProfile!.instagram]));
  }finally{Object.defineProperty(Platform,"OS",{value:original,configurable:true});}
});
