import React from "react";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import CenterProfileScreen from "../components/directory/CenterProfileScreen";
import { backendInstitution, findInstitution } from "../utils/institutionDirectory";
import { centerApiPublicProfile, centerWhatsApp, validCenterRating } from "../utils/centerPublicProfile";
import type { HealthCenter } from "../types/directory.types";
let mockRTL = false;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../components/directory/PersonalAppointment", () => () => null);
afterEach(cleanup);
// Test-only data. Never written to the catalog or database.
const api = (fields: Partial<HealthCenter> = {}) => ({ id:"test-center",name:"اختبار",type:"private",phone:"",address:"",city:"",...fields } as HealthCenter);
const proof = { verifiedAt:"2026-10-10",evidence:"Test-only source provenance" };

test("API contact fields survive mapping, without guessing WhatsApp or map locations", () => {
  const item = backendInstitution(api({phone:25309300,address:"عنوان موجود",googleMapsUrl:"https://maps.app.goo.gl/xuJSiameVsN9ZE1N9",whatsappNumber:"69666041",website:"https://example.org/",instagram:"https://www.instagram.com/example/"}));
  expect(item.publicProfile).toMatchObject({phone:"25309300",address:{ar:"عنوان موجود",en:"عنوان موجود"},mapUrl:"https://maps.app.goo.gl/xuJSiameVsN9ZE1N9",whatsapp:{phone:"69666041",url:"https://wa.me/96569666041"},website:"https://example.org/",instagram:"https://www.instagram.com/example/"});
  expect(centerApiPublicProfile(api({phone:"٢٥٣٠٩٣٠٠"}))).toEqual({phone:"25309300"});
  expect(centerApiPublicProfile(api({website:"javascript:alert(1)",mapUrl:"https://example.org/",instagram:"https://example.org/",address:"Kuwait (verify address)"}))).toEqual({});
  expect(centerWhatsApp({phone:"11111111",url:"https://wa.me/96569666041?text=private"})).toEqual({phone:"69666041",url:"https://wa.me/96569666041"});
  expect(centerWhatsApp(undefined,"https://wa.me/")).toBeUndefined();
});

test("a curated API match gains missing contacts but retains its sourced phone", () => {
  const item = backendInstitution(api({name:"First Step Centre for Family Counseling",phone:"22260445",whatsapp:"69666041",googleMapsUrl:"https://maps.app.goo.gl/example"}));
  expect(item.id).toBe("backend:test-center");
  expect(item.publicProfile?.phone).toBe("97222133");
  expect(item.publicProfile?.whatsapp?.phone).toBe("69666041");
});

test.each([undefined,0,-1,6,NaN,Infinity])("hides missing/out-of-range rating %s even with provenance", value => {
  expect(centerApiPublicProfile(api({rating:value,ratingVerification:proof})).rating).toBeUndefined();
});
test("requires rating provenance and never invents review counts", () => {
  expect(centerApiPublicProfile(api({rating:4.5})).rating).toBeUndefined();
  expect(centerApiPublicProfile(api({rating:4.5,ratingVerification:proof})).rating).toEqual({value:4.5,...proof,count:undefined});
  expect(validCenterRating({value:4.5,...proof,count:-2})?.count).toBeUndefined();
  expect(validCenterRating({value:4.5,...proof,verifiedAt:"invalid"})).toBeUndefined();
});

test.each(["web","ios","android"] as const)("%s About tab supports contact combinations and verified ratings in both languages", async os => {
  const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:os});
  const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
  try { for(const rtl of [true,false]) {mockRTL=rtl;
    const ui=render(<CenterProfileScreen item={backendInstitution(api({phone:"25309300",whatsapp:"69666041",address:"عنوان موجود",googleMapsUrl:"https://maps.app.goo.gl/xuJSiameVsN9ZE1N9",website:"https://example.org/",instagram:"https://www.instagram.com/example/",rating:4.5,ratingVerification:proof,reviewCount:12}))}/>);
    expect(ui.getByRole("tab",{name:rtl?"نبذة":"About"}).props.accessibilityState.selected).toBe(true);
    expect(ui.getByText("4.5 / 5")).toBeTruthy();
    expect(ui.getByText(rtl?"عدد التقييمات: 12":"Reviews: 12")).toBeTruthy();
    for(const [label,url] of [[rtl?"اتصال بالمركز":"Call Center","tel:25309300"],[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp","https://wa.me/96569666041"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/xuJSiameVsN9ZE1N9"],[rtl?"الموقع الإلكتروني":"Website","https://example.org/"],["@example","https://www.instagram.com/example/"]]) {
      const link=ui.getByRole("link",{name:label});if(os==="web")expect(link.props.href).toBe(url);else {fireEvent.press(link);await waitFor(()=>expect(open).toHaveBeenLastCalledWith(url));}
    }
    fireEvent.press(ui.getByRole("tab",{name:rtl?"الموقع":"Location"}));expect(ui.queryByText("4.5 / 5")).toBeNull();
    ui.unmount();
    for(const fields of [{phone:"25309300"},{whatsapp:"69666041"},{website:"https://example.org/"},{}]) {
      const partial=render(<CenterProfileScreen item={backendInstitution(api(fields))}/>);
      expect(partial.queryAllByRole("link")).toHaveLength(Object.keys(fields).length);
      expect(partial.queryByText(rtl?"التقييم":"Rating")).toBeNull();partial.unmount();
    }
    const archived=render(<CenterProfileScreen item={findInstitution("kw-r-21")!}/>);
    expect(archived.queryAllByRole("link")).toHaveLength(3);
    const whatsapp=archived.getByRole("link",{name:rtl?"تواصل عبر الواتساب":"Contact via WhatsApp"});
    if(os==="web")expect(whatsapp.props.href).toBe("https://wa.me/96550993750");else{fireEvent.press(whatsapp);await waitFor(()=>expect(open).toHaveBeenLastCalledWith("https://wa.me/96550993750"));}archived.unmount();
  }} finally {open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});
