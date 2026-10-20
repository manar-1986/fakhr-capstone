import { centerWhatsApp } from "../utils/centerPublicProfile";
import React from "react";
import { render, fireEvent, cleanup, waitFor } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import CenterProfileScreen from "../components/directory/CenterProfileScreen";
import { VERIFIED_PROVIDERS, INSTITUTIONS, backendInstitution, mergeInstitutions, filterInstitutions, institutionDirectoryCategory } from "../utils/institutionDirectory";
import type { HealthCenter } from "../types/directory.types";
let mockRTL = false;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../components/directory/PersonalAppointment", () => () => null);
afterEach(cleanup);

test("HOPE Center is unique, distinct from Hope School, and has no inferred WhatsApp", () => {
  const matches=INSTITUTIONS.filter(i=>i.id==="center-hope");
  expect(matches).toHaveLength(1);
  const hope=matches[0];
  expect(institutionDirectoryCategory(hope)).toBe("rehabilitation");
  expect(INSTITUTIONS.find(i=>i.id==="kw-s-hope")?.categories).toContain("school");
  expect(hope.publicProfile?.phone).toBe("+96599307764");
  expect(hope.publicProfile?.whatsapp).toBeUndefined();
  expect(hope.publicProfile?.mapUrl).toBe("https://maps.app.goo.gl/geuKhrDcQtWaoiEy8");
  expect(hope.publicProfile?.instagram).toBe("https://www.instagram.com/hopecenter.kw/");
  expect(hope.publicProfile?.services?.ar).toHaveLength(4);
  expect(hope.publicProfile?.services?.en).toHaveLength(4);
  const api=backendInstitution({id:"api-hope",name:"HOPE Center"} as HealthCenter);
  expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)==="center-hope")).toHaveLength(1);
});

test("exact aliases reconcile existing API identities without merging unrelated providers", () => {
  const first = VERIFIED_PROVIDERS.find(i => i.id === "center-first-step")!;
  const abc = VERIFIED_PROVIDERS.find(i => i.id === "center-abc-kuwait")!;
  const api = [first, abc].map((p, i) => backendInstitution({ id: `existing-${i}`, name: p.identityAliases![0] } as HealthCenter));
  const merged = mergeInstitutions(INSTITUTIONS, [...api, ...api]);
  expect(merged).toHaveLength(INSTITUTIONS.length);
  expect(merged.filter(i => i.canonicalId)).toHaveLength(2);
  expect(merged.find(i => i.canonicalId === first.id)?.id).toBe("backend:existing-0");
  expect(merged.find(i => i.canonicalId === first.id)?.publicProfile?.phone).toBe("97222133");
  expect(backendInstitution({id:"nursery",name:"حضانة قدرات لذوي الاحتياجات الخاصة"} as HealthCenter).canonicalId).toBeUndefined();
  expect(INSTITUTIONS.find(i => i.id === "kw-n-qudrat")).toBeTruthy();
});

test("nineteen source identities are retained; Speech Plus is routed to Doctors", () => {
  expect(VERIFIED_PROVIDERS).toHaveLength(23);
  expect(new Set(INSTITUTIONS.map(i => i.id)).size).toBe(INSTITUTIONS.length);
  for (const item of VERIFIED_PROVIDERS) {
    if (item.id === "center-speech-plus" || item.id === "center-speak-clinic") { expect(filterInstitutions(INSTITUTIONS,{search:item.nameAr})).not.toContain(item); continue; }
    expect(institutionDirectoryCategory(item)).toBe(item.id === "center-special-reem" || item.id === "sports-al-tomooh" || item.id === "sports-kuwait-deaf" || item.id === "sports-warba" || item.id === "sports-nova-forte" ? "sports" : "rehabilitation");
    expect(filterInstitutions(INSTITUTIONS, {search:item.nameAr})).toContain(item);
    expect(filterInstitutions(INSTITUTIONS, {search:item.nameEn!})).toContain(item);
  }
  const speak = VERIFIED_PROVIDERS.find(i => i.id === "center-speak-clinic")!;
  expect(speak.mainImage).toBe("speakclinic");
  expect(speak.publicProfile?.phone).toBe("+96550455583");
  expect(speak.publicProfile?.mapUrl).toBe("https://maps.app.goo.gl/mwvBZABT5KgMHZC67");
  expect(speak.publicProfile?.whatsapp?.url).toBe("https://wa.me/96550455583");
  expect(speak.publicProfile?.website).toBe("https://reach.link/speak_clinic");
  expect(speak.publicProfile?.services?.ar).toHaveLength(5);
  expect(speak.publicProfile?.services?.en).toHaveLength(5);
  expect(filterInstitutions(INSTITUTIONS,{search:"Speak Clinic"})).toEqual([]);
  expect(filterInstitutions(VERIFIED_PROVIDERS,{area:"الجابرية"}).map(i=>i.id)).toEqual(["center-kcld"]);
});

test.each(["web", "ios", "android"] as const)("%s: bilingual profiles use supported links and omit missing data", async os => {
  const original = Platform.OS;
  Object.defineProperty(Platform,"OS",{configurable:true,value:os});
  const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
  try { for (const rtl of [true,false]) { mockRTL=rtl;
    for (const item of VERIFIED_PROVIDERS) {
      const ui=render(<CenterProfileScreen item={item}/>);
      expect(ui.getAllByText(rtl?item.nameAr:item.nameEn!)).not.toHaveLength(0);
      expect(ui.getAllByRole("tab")).toHaveLength(2);
      const p=item.publicProfile!;
      if(p.description) expect(ui.getByText(p.description[rtl?"ar":"en"])).toBeTruthy();
      for (const service of p.services?.[rtl?"ar":"en"] || []) expect(ui.getAllByText(service).length).toBeGreaterThan(0);
      const expected=[p.phone?`tel:${p.phone}`:null,p.additionalPhone?`tel:${p.additionalPhone}`:null,centerWhatsApp(p.whatsapp)?.url,p.mapUrl,p.website,p.additionalUrl,p.instagram].filter(Boolean);
      const links=ui.getAllByRole("link");
      expect(links).toHaveLength(expected.length);
      for(let i=0;i<links.length;i++) {
        if(os==="web") expect(links[i].props.href).toBe(expected[i]);
        else {fireEvent.press(links[i]); await waitFor(()=>expect(open).toHaveBeenLastCalledWith(expected[i]));}
      }
      fireEvent.press(ui.getByRole("tab",{name:rtl?"الموقع":"Location"}));
      if(p.description) expect(ui.queryByText(p.description[rtl?"ar":"en"])).toBeNull();
      expect(ui.queryByText(/بيانات مرجعية|Source details|Verification warnings/)).toBeNull();
      ui.unmount();
    }
  }} finally {open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});

test("Thiqa resolves aliases once and retains its business WhatsApp link",()=>{
 const thiqa=VERIFIED_PROVIDERS.find(i=>i.id==="center-thiqa")!;
 expect(thiqa.publicProfile?.services?.ar).toHaveLength(6);
 expect(thiqa.publicProfile?.services?.en).toHaveLength(6);
 expect(thiqa.publicProfile?.whatsapp).toEqual({url:"https://wa.me/message/GWQL6WWG5DXZC1"});
 const api=backendInstitution({id:"existing-thiqa",name:"مركز ثقة للاستشارات والتدخل المبكر"} as HealthCenter);
 expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)==="center-thiqa")).toHaveLength(1);
});

test("Maram is one independent provider with supplied contacts and no invented location",()=>{
 const item=VERIFIED_PROVIDERS.find(i=>i.id==="provider-maram-aldihani")!;
 expect(item.publicProfile?.classification?.en).toBe("Independent Occupational Therapist");
 expect(item.publicProfile?.phone).toBe("+96599982918");
 expect(item.publicProfile?.additionalPhone).toBe("+96569990629");
 expect(item.publicProfile?.whatsapp).toEqual({url:"https://wa.link/e9inge"});
 expect(item.publicProfile?.address).toBeUndefined();expect(item.publicProfile?.mapUrl).toBeUndefined();
 const api=backendInstitution({id:"api-maram",name:"Maram Al-Dihani"} as HealthCenter);
 expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)===item.id)).toHaveLength(1);
});

test("KDC reconciles its existing backend seed name into one listing",()=>{
 const item=VERIFIED_PROVIDERS.find(i=>i.id==="center-kdc")!;
 const api=backendInstitution({id:"existing-kdc",name:"KDC | Kuwait Developmental Center"} as HealthCenter);
 const matches=mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)===item.id);
 expect(matches).toHaveLength(1);expect(matches[0].id).toBe("backend:existing-kdc");
 expect(item.publicProfile?.ages).toBeUndefined();
 expect(item.publicProfile?.phone).toBe("+96597697665");
 expect(filterInstitutions(INSTITUTIONS,{search:"KDC"})).toEqual([item]);
});

test("Initials is unique and displays localized Instagram and associated specialist",()=>{
 const item=VERIFIED_PROVIDERS.find(i=>i.id==="center-initials-clinic")!;
 const api=backendInstitution({id:"api-initials",name:"Initials Clinic"} as HealthCenter);
 expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)===item.id)).toHaveLength(1);
 for(const rtl of [true,false]) {mockRTL=rtl;const ui=render(<CenterProfileScreen item={item}/>);expect(ui.getByLabelText(rtl?"إنستقرام":"Instagram")).toBeTruthy();expect(ui.getByText(rtl?"أ. سمية العصفور":"Somaya Al-Asfour")).toBeTruthy();expect(ui.getByLabelText(rtl?"لينكتري":"Linktree")).toBeTruthy();ui.unmount();}
});

test("Kun Ala Sila is unique, searchable without diacritics, with no invented location",()=>{
 const item=VERIFIED_PROVIDERS.find(i=>i.id==="center-kun-ala-sila")!;
 expect(filterInstitutions(INSTITUTIONS,{search:"مركز كن على صلة"})).toEqual([item]);
 expect(item.publicProfile?.services?.ar).toHaveLength(5);expect(item.publicProfile?.services?.en).toHaveLength(5);
 expect(item.publicProfile?.address).toBeUndefined();expect(item.publicProfile?.mapUrl).toBeUndefined();
 expect(item.publicProfile?.phone).toBe("+96565117417");
 const api=backendInstitution({id:"api-sila",name:"مركز كن على صلة"} as HealthCenter);
 expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)===item.id)).toHaveLength(1);
});

test("CCET retains its source identity and school placement with both supplied phone actions",()=>{
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-child")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.observations).toHaveLength(2);expect(institutionDirectoryCategory(item)).toBe("school");
 expect(item.publicProfile?.classification?.en).toBe("Non-profit Public Benefit Association");
 expect(item.publicProfile?.whatsapp).toBeUndefined();expect(item.publicProfile?.address).toBeUndefined();
 for(const rtl of [true,false]) {mockRTL=rtl;const ui=render(<CenterProfileScreen item={item}/>);expect(ui.getByText("+9651832000")).toBeTruthy();expect(ui.getByText("+96560362896")).toBeTruthy();expect(ui.getByLabelText(rtl?"اتصال مسائي":"Evening Phone")).toBeTruthy();ui.unmount();}
});

test.each(["web","ios","android"] as const)("HOPE School %s keeps separate identity and all contact actions",async os=>{
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-hope")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(institutionDirectoryCategory(item)).toBe("school");expect(item.observations).toHaveLength(2);
 expect(INSTITUTIONS.find(i=>i.id==="center-hope")?.mainImage).toBe("hope");expect(item.mainImage).toBe("hopeschool");expect(item.publicProfile?.ages).toBeUndefined();
 const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:os});const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 try {for(const rtl of [true,false]){mockRTL=rtl;const ui=render(<CenterProfileScreen item={item}/>);
 for(const condition of item.publicProfile!.supportedConditions![rtl?"ar":"en"])expect(ui.getAllByText(condition).length).toBeGreaterThan(0);
 const urls=["tel:+96522496600","tel:+96522496601","tel:+96522496602","tel:+96551414344","mailto:Info@hopeschool.edu.kw","https://maps.app.goo.gl/iZRSe6BaGFa7wuHa9","https://www.instagram.com/hopeschoolkuwait/"];
 const links=ui.getAllByRole("link");expect(links).toHaveLength(urls.length);for(let i=0;i<urls.length;i++){if(os==="web")expect(links[i].props.href).toBe(urls[i]);else{fireEvent.press(links[i]);await waitFor(()=>expect(open).toHaveBeenLastCalledWith(urls[i]));}}ui.unmount();}}finally{open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});


test("Let's Speech retains its identity and rejects stale API profile data after moving",()=>{
 const item=VERIFIED_PROVIDERS.find(i=>i.id==="home-provider-lets-speech")!;
 expect(item.publicProfile).toEqual({classification:{ar:"علاج النطق والتخاطب",en:"Speech and Language Therapy"},phone:"+96597944756",instagramLabel:{ar:"إنستقرام",en:"Instagram"},instagram:"https://www.instagram.com/lets.speech/",mapUrl:"https://maps.app.goo.gl/2yC4gYUayPofTkAKA"});
 expect(item.mainImage).toBe("letsspeech");expect(item.observations).toEqual([]);
 for(const name of ["Let's Speech","Lets Speech","ليتس سبيتش","لتس سبيتش"]){
  expect(filterInstitutions(INSTITUTIONS,{search:name})).toEqual([item]);
  const stale=backendInstitution({id:"stale",name,phone:"55555555",website:"https://old.example.com",address:"Old address"} as HealthCenter);
  expect(stale).toEqual(item);expect(mergeInstitutions(INSTITUTIONS,[stale]).filter(i=>i.id===item.id)).toEqual([item]);
 }
});

test("Special Reem has one searchable center identity and reconciles all supplied aliases", () => {
 const item=INSTITUTIONS.find(i=>i.id==="center-special-reem")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);
 expect(institutionDirectoryCategory(item)).toBe("sports");
 for(const alias of item.identityAliases!){
   expect(filterInstitutions(INSTITUTIONS,{search:alias})).toEqual([item]);
   const api=backendInstitution({id:"existing-reem",name:alias} as HealthCenter);
   expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)===item.id)).toHaveLength(1);
 }
 expect(item.disabilityTags).toEqual([]);expect(item.publicProfile?.ages).toBeUndefined();
 expect(item.publicProfile?.services).toEqual({ar:["تحليل السلوك","العلاج الطبيعي","العلاج الوظيفي"],en:["Behavior Analysis","Physiotherapy","Occupational Therapy"]});
 expect(item.mainImage).toBe("specialreem");
});

test.each(["web","ios","android"] as const)("Special Reem %s renders bilingual services and exact contact actions",async os=>{
 const item=INSTITUTIONS.find(i=>i.id==="center-special-reem")!;
 const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:os});const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const urls=["tel:+96595007009","https://wa.me/96595007009","https://www.instagram.com/special.reem/","https://maps.app.goo.gl/gW7SfCGw6qyiWav69"].sort();
 try{for(const rtl of [true,false]){mockRTL=rtl;open.mockClear();const ui=render(<CenterProfileScreen item={item}/>);
 for(const service of item.publicProfile!.services![rtl?"ar":"en"])expect(ui.getByText(service)).toBeTruthy();
 expect(ui.getByLabelText("Special Reem Center").props.resizeMode).toBe("contain");
 const links=ui.getAllByRole("link");expect(links).toHaveLength(4);
 if(os==="web")expect(links.map(link=>link.props.href).sort()).toEqual(urls);
 else{for(const link of links)fireEvent.press(link);await waitFor(()=>expect(open.mock.calls.map(call=>call[0]).sort()).toEqual(urls));}
 ui.unmount();}}finally{open.mockRestore();Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});
