import React from "react";
import {render, cleanup, fireEvent} from "@testing-library/react-native";
import {Platform, Linking} from "react-native";
import EducationProfileScreen from "../components/directory/EducationProfileScreen";
import {educationProfile} from "../utils/educationProfile";
import {INSTITUTIONS} from "../utils/institutionDirectory";
let mockRTL=false;
jest.mock("expo-router",()=>({useRouter:()=>({push:jest.fn()})}));
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left",dir:mockRTL?"rtl":"ltr"})}));
jest.mock("../components/directory/PersonalAppointment",()=>()=>null);
afterEach(()=>{cleanup();jest.restoreAllMocks();});
test("presentation adapter never mutates records and preserves curated profiles",()=>{
 const snapshot=JSON.stringify(INSTITUTIONS);
 for(const item of INSTITUTIONS.filter(i=>i.categories.some(c=>c==="school"||c==="nursery"))){
  const shown=educationProfile(item);expect(shown.id).toBe(item.id);expect(shown.observations).toBe(item.observations);
  if(item.publicProfile?.phone||item.publicProfile?.classification||item.publicProfile?.description||item.publicProfile?.services)expect(shown).toBe(item);
 }
 expect(JSON.stringify(INSTITUTIONS)).toBe(snapshot);
 const help=educationProfile(INSTITUTIONS.find(i=>i.id==="kw-s-help")!);
 expect(help.publicProfile?.phone).toBe("22286811");expect(help.publicProfile?.extraPhones?.map(p=>p.phone)).toEqual(["22286812","22286813"]);
 expect(help.publicProfile?.address?.ar).toContain("قطعة 63");expect(help.publicProfile?.supportedConditions?.ar).toHaveLength(1);
});
test.each(["kw-s-future","kw-s-help","kw-s-hope","kw-s-noor","kw-n-bustan","kw-n-dream"])("shared bilingual profile: %s",id=>{
 jest.replaceProperty(Platform,"OS","web");const item=INSTITUTIONS.find(i=>i.id===id)!;
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getByText(item.categories.includes("nursery")?(rtl?"تفاصيل الحضانة":"Nursery Details"):(rtl?"تفاصيل المدرسة":"School Details"))).toBeTruthy();
 expect(page.getByLabelText(rtl?"نبذة":"About")).toBeTruthy();fireEvent.press(page.getByRole("tab",{name:rtl?"الموقع":"Location"}));
 expect(page.queryByText(/بيانات مرجعية|تفاصيل المصادر|Capacity as Reported|Reference data/)).toBeNull();cleanup();
 }
});

test.each(["ios","android"] as const)("education contact buttons reuse native Linking on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const page=render(<EducationProfileScreen item={INSTITUTIONS.find(i=>i.id==="kw-n-bustan")!}/>);
 fireEvent.press(page.getByLabelText("Call 24822086"));expect(open).toHaveBeenCalledWith("tel:+96524822086");
});

test.each(["web","ios","android"] as const)("compact phone rows preserve order and targets on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const page=render(<EducationProfileScreen item={INSTITUTIONS.find(i=>i.id==="kw-s-irshad")!}/>);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 const phones=["24731580","24767129","97900405","24767128"];
 for(const phone of phones){const row=page.getByLabelText(new RegExp("^Call "+phone));if(platform==="web")expect(row.props.href).toBe("tel:+965"+phone);else{fireEvent.press(row);expect(open).toHaveBeenLastCalledWith("tel:+965"+phone);}}
 expect(page.queryByText("Additional contact")).toBeNull();
});

test("Ajyal additions preserve all legacy contact, address and service presentation",()=>{
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-ajyal")!;
 const original=educationProfile({...item,mainImage:undefined,publicProfile:undefined});
 const updated=educationProfile(item);
 for(const field of ["phone","extraPhones","address","area","ages","supportedConditions"] as const)expect(updated.publicProfile?.[field]).toEqual(original.publicProfile?.[field]);
 for(const locale of ["ar","en"] as const)expect(updated.publicProfile?.services?.[locale]).toEqual([...original.publicProfile!.services![locale],...item.publicProfile!.additionalServices![locale]]);
 expect(updated.observations).toBe(item.observations);
});

test.each(["web","ios","android"] as const)("UCA uses only replacement contacts while retaining educational information on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-hadarat")!;
 const previous=educationProfile({...item,publicProfile:undefined});
 for(const field of ["address","area","services","supportedConditions","ages"] as const)expect(educationProfile(item).publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 expect(page.queryByText(/22630394/)).toBeNull();
 for(const phone of ["+96522639681","+96522639682"]){const row=page.getByLabelText("Call "+phone);if(platform==="web")expect(row.props.href).toBe("tel:"+phone);else{fireEvent.press(row);expect(open).toHaveBeenLastCalledWith("tel:"+phone);}}
});

test("Al-Bayan building gallery stays visible on About and Location without replacing the profile image",()=>{
 mockRTL=false;
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-bayan")!;
 const previousImage=item.mainImage;
 const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getAllByTestId("institution-photo-gallery")).toHaveLength(1);
 fireEvent.press(page.getByLabelText("Location"));
 expect(page.getAllByTestId("institution-photo-gallery")).toHaveLength(1);
 expect(item.mainImage).toBe(previousImage);
});

test.each(["web","ios","android"] as const)("Manarat preserves contacts without duplicates on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-manarat")!;
 const original=educationProfile({...item,publicProfile:undefined});
 expect(item.publicProfile?.services).toEqual(original.publicProfile?.services);
 expect(item.publicProfile?.supportedConditions).toEqual(original.publicProfile?.supportedConditions);
 expect(item.publicProfile?.address?.ar).toContain(original.publicProfile!.address!.ar);
 const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 for(const phone of ["+96525722083","+96596660920"]){const rows=page.getAllByLabelText("Call "+phone);expect(rows).toHaveLength(1);if(platform==="web")expect(rows[0].props.href).toBe("tel:"+phone);else{fireEvent.press(rows[0]);expect(open).toHaveBeenLastCalledWith("tel:"+phone);}}
 expect(page.getByText("25750792")).toBeTruthy();expect(page.getByText("25750782")).toBeTruthy();
});

test.each(["web","ios","android"] as const)("Khalifa WhatsApp is separate from unchanged phone contacts on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-khalifa")!;
 const previous=educationProfile({...item,publicProfile:undefined});const current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 const page=render(<EducationProfileScreen item={item}/>);const button=page.getByLabelText("Contact via WhatsApp");
 if(platform==="web")expect(button.props.href).toBe("https://wa.me/96597738487");else{fireEvent.press(button);expect(open).toHaveBeenCalledWith("https://wa.me/96597738487");}
});

test.each(["web","ios","android"] as const)("Center 21 preserves source information and keeps dedicated WhatsApp on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-21")!;
 const previous=educationProfile({...item,publicProfile:undefined});const current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 const page=render(<EducationProfileScreen item={item}/>);expect(page.getByText("School Details")).toBeTruthy();
 const button=page.getByLabelText("Contact via WhatsApp");if(platform==="web")expect(button.props.href).toBe("https://wa.me/96550993750");else{fireEvent.press(button);expect(open).toHaveBeenCalledWith("https://wa.me/96550993750");}
});

test.each(["web","ios","android"] as const)("Al Ekhlas adds direct call and WhatsApp without losing existing information on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);mockRTL=false;
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-ekhlas")!;
 const previous=educationProfile({...item,publicProfile:undefined});const current=educationProfile(item);
 for(const field of ["address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect(current.publicProfile?.extraPhones?.map(p=>p.phone)).toEqual(["69910452","25621655"]);
 const page=render(<EducationProfileScreen item={item}/>);expect(page.getByText("School Details")).toBeTruthy();
 for(const [label,url] of [["Call +96560068524","tel:+96560068524"],["Contact via WhatsApp","https://wa.me/96560068524"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
});

test.each(["web","ios","android"] as const)("KSH preserves contacts and uses one localized website on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-day-hawalli")!;
 const previous=educationProfile({...item,publicProfile:undefined});
 for(const field of ["address","area","services","supportedConditions","ages"] as const)expect(item.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect(item.publicProfile?.extraPhones?.map(p=>p.phone)).toEqual(["22631277","22632343"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 expect(page.getByText(rtl?"تفاصيل المدرسة":"School Details")).toBeTruthy();
 const labels=[[rtl?"اتصال 1805005":"Call 1805005","tel:1805005"],[rtl?"الموقع الإلكتروني":"Website",rtl?"https://ksh.org.kw/ar/":"https://www.ksh.org.kw/"],[rtl?"إنستقرام":"Instagram","https://www.instagram.com/kshkuwait/"]];
 for(const [label,url] of labels){const buttons=page.getAllByLabelText(label);expect(buttons).toHaveLength(1);if(platform==="web")expect(buttons[0].props.href).toBe(url);else{fireEvent.press(buttons[0]);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Model Preparation links preserve existing education information on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-idad")!;
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getByText(rtl?"تفاصيل المدرسة":"School Details")).toBeTruthy();
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/ipe_kwt/"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/T9Crz968M4bjuGbC8"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Conductive Rehabilitation preserves information and adds building gallery and links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-irshad")!;
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getByText(rtl?"تفاصيل المدرسة":"School Details")).toBeTruthy();expect(page.getAllByTestId("institution-photo-gallery")).toHaveLength(1);
 for(const [label,url] of [[rtl?"البريد الإلكتروني":"Email","mailto:info@creh.edu.kw"],[rtl?"الموقع الإلكتروني":"Official Website","http://www.creh.edu.kw/ar/about"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/pbq6mXTNaadzUCcA6"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 fireEvent.press(page.getByLabelText(rtl?"الموقع":"Location"));expect(page.getAllByTestId("institution-photo-gallery")).toHaveLength(1);cleanup();}
});

test.each(["web","ios","android"] as const)("Integrated Care keeps all eight numbers in one card and both branch addresses on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-integrated")!;
 const phones=["22206056","22206055","22206054","99193134","65949355","66852254","63330705","65142000"];
 expect([item.publicProfile?.phone,...item.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(phones);
 expect(item.branches).toHaveLength(2);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 expect(page.getAllByText(rtl?"فرع غرناطة":"Granada branch").length).toBeGreaterThan(0);expect(page.getAllByText(rtl?"فرع المهبولة":"Mahboula branch").length).toBeGreaterThan(0);
 for(const branch of item.branches!)expect(page.getByText(educationProfile(branch).publicProfile!.address![rtl?"ar":"en"])).toBeTruthy();
 for(const phone of phones){const rows=page.getAllByLabelText(new RegExp("^"+(rtl?"اتصال ":"Call ")+phone));expect(rows).toHaveLength(1);if(platform==="web")expect(rows[0].props.href).toBe("tel:+965"+phone);else{fireEvent.press(rows[0]);expect(open).toHaveBeenLastCalledWith("tel:+965"+phone);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("ICAN additions preserve the merge and exact contact targets on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-integrated")!;
 expect(item.mainImage).toBe("ican");expect(INSTITUTIONS.some(i=>i.id==="kw-r-integrated-2")).toBe(false);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/ican2_kuwait/"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/d3iL44gkif7bxCvdA"]]){for(const button of page.getAllByLabelText(label)){if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Dyslexia additions preserve existing information and leave uncertain maps unassigned on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-r-dyslexia")!;
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect(item.publicProfile?.mapUrl).toBeUndefined();expect(item.mainImage).toBe("dyslexia");
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/dyslexiakuwait/"],[rtl?"الموقع الإلكتروني":"Official Website","https://q8da.com/"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("AMEBS replaces active phones and preserves educational information on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-s-middle-east")!;
 const previous=educationProfile({...item,publicProfile:undefined});
 for(const field of ["address","area","services","supportedConditions","ages"] as const)expect(item.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);expect(page.queryByText(/24866850/)).toBeNull();
 for(const [label,url] of [[rtl?"اتصال +96599009251":"Call +96599009251","tel:+96599009251"],[rtl?"اتصال +96524866950":"Call +96524866950","tel:+96524866950"],[rtl?"إنستقرام":"Instagram","https://www.instagram.com/amebs_kwt/"],[rtl?"البريد الإلكتروني":"Email","mailto:amebs.edu@gmail.com"],[rtl?"فتح الموقع في Google Maps":"Open in Google Maps","https://maps.app.goo.gl/PgeE8JfzBAKsis74A"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Al Bustan updates one existing nursery without losing information on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-n-bustan")!;expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect(item.publicProfile?.website).toBeUndefined();expect(item.publicProfile?.whatsapp).toBeUndefined();
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:item.nameEn!).length).toBeGreaterThan(0);expect(page.getByText(item.publicProfile!.specialization![rtl?"ar":"en"])).toBeTruthy();
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/albustan1997/"],[rtl?"التسجيل للعام الدراسي 2026–2027":"Registration for Academic Year 2026–2027","https://forms.gle/v62wQTgREg6KufvDA"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/rhHVy2zS3JJPEump8"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole!=="tab")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Kuwait Dream preserves existing nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const item=INSTITUTIONS.find(i=>i.id==="kw-n-dream")!;expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toContain("nursery");expect(item.mainImage).toBe("kuwaitdream");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);
 for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect(item.publicProfile?.website).toBeUndefined();expect(item.publicProfile?.whatsapp).toBeUndefined();
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Kuwait Dream Centre for Special Needs").length).toBeGreaterThan(0);expect(page.getByText(item.publicProfile!.specialization![rtl?"ar":"en"])).toBeTruthy();
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/kuwaitdreamcentre/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/RB6pjdAtikXkWK8U7"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole!=="tab")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Bait Nasser has one compact bilingual contact section on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-nasser")!;
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 for(const phone of ["22259590","60050735","96926826","55081912","62220012","55916205","64445953"]){const row=page.getByLabelText(new RegExp((rtl?"اتصال ":"Call ")+phone));if(platform==="web")expect(row.props.href).toBe("tel:+965"+phone);else{fireEvent.press(row);expect(open).toHaveBeenLastCalledWith("tel:+965"+phone);}}
 const instagram=page.getAllByLabelText(rtl?"إنستقرام":"Instagram");expect(instagram).toHaveLength(1);if(platform==="web")expect(instagram[0].props.href).toBe("https://www.instagram.com/bnkuw/");else{fireEvent.press(instagram[0]);expect(open).toHaveBeenLastCalledWith("https://www.instagram.com/bnkuw/");}
 for(const branch of item.branches!)for(const address of new Set(branch.observations.map(o=>o.addressAr).filter(Boolean)))expect(page.getAllByText(new RegExp(address!.replace(/[.*+?^$()|[\]\\]/g,"\\$&"))).length).toBeGreaterThan(0);
 cleanup();}
});

test.each(["web","ios","android"] as const)("Bait Nasser branch locations have exact bilingual destinations on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-nasser")!;
 const urls=["https://maps.app.goo.gl/et9tdWmXJTQXBtsZ9","https://maps.app.goo.gl/FrMyArr6fREqscKd7","https://maps.app.goo.gl/AkZ2cNjhLStsPBFt5"];
 expect(item.publicProfile!.branchLocations!.map(b=>b.mapUrl)).toEqual(urls);expect(item.publicProfile!.branchLocations!.map(b=>b.branchId)).toEqual(["kw-n-nasser","kw-n-nasser-2","kw-n-nasser-3"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getByText(rtl?"مواقع الفروع":"Branch Locations")).toBeTruthy();
 const buttons=page.getAllByLabelText(rtl?"الموقع":"Location").filter(b=>b.props.accessibilityRole==="link");expect(buttons).toHaveLength(3);
 buttons.forEach((button,index)=>{if(platform==="web")expect(button.props.href).toBe(urls[index]);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(urls[index]);}});
 for(const branch of item.publicProfile!.branchLocations!)expect(page.getAllByText(branch.name[rtl?"ar":"en"]).length).toBeGreaterThan(0);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);cleanup();}
});

test.each(["web","ios","android"] as const)("Nada preserves nursery data and opens bilingual contact links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-nada")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("nada");expect(item.nameAr).toBe("حضانة الندى لذوي الاحتياجات الخاصة");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["50311309","22547016"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/nadacenter2015/"],[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp","https://wa.me/96597163315"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/eB8qZ86U3xqJoyoD8"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Al Ghad preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-ghad")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("alghad");expect(item.nameAr).toBe("حضانة الغد المشرق");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["25242460","60352111"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Al Ghad Al Moshriq Nursery").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/alghad.almoshriq/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/U41tGHh7B9vtgqG87"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Bayt Alatfal preserves nursery data and opens bilingual contact links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-children")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("baytalatfal");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["25350358","25350359","97223077"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?"حضانة بيت الأطفال لذوي الاحتياجات الخاصة":"Bayt Alatfal 4SN").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/childrenhomekwt/"],[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp","https://wa.me/96597223077"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/pxFNHF7J2nogESv5A"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Al Basma preserves existing nursery data and opens its bilingual location on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-basma")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.nameAr).toBe("حضانة البسمة");expect(item.publicProfile).toEqual({mapUrl:"https://maps.app.goo.gl/aYaVwS88Xa1B5nfQ8"});
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);const button=page.getAllByLabelText(rtl?"الموقع":"Location").find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe("https://maps.app.goo.gl/aYaVwS88Xa1B5nfQ8");else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith("https://maps.app.goo.gl/aYaVwS88Xa1B5nfQ8");}cleanup();}
});

test.each(["web","ios","android"] as const)("Maharat preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-maharat")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("maharat");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);
 expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["99680656","25244894","60901962"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?"حضانة مهارات للاحتياجات الخاصة":"Maharat Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/maharat.nursery/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/wYNiTPACVpyLFxX98"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Milestone preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-milestone")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("milestone");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect(current.publicProfile?.phone).toBe("69006591");
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?"حضانة مايلستون للاحتياجات الخاصة":"Milestone by Reborn").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/milestone_q8/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/Jum3sux5wMiWj1SS6"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Royal British preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-royal")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("royalbritish");expect(item.nameAr).toBe("الحضانة الملكية البريطانية ثنائية اللغة");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["98009696","25239696"]);expect(item.publicProfile?.mapUrl).toBeUndefined();
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/rbkedu/"],[rtl?"الموقع الإلكتروني":"Official Website","http://www.rb.edu.kw/"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});

test.each(["web","ios","android"] as const)("Sunshine replaces only active phones and opens bilingual contact links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-shams")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("sunshine");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["+96560669545","+96560788391"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);for(const old of ["24385524","24385523"])expect(page.queryByText(new RegExp(old))).toBeNull();
 for(const [label,url] of [[rtl?"اتصال +96560669545":"Call +96560669545","tel:+96560669545"],[rtl?"اتصال +96560788391 رقم إضافي":"Call +96560788391 Additional contact","tel:+96560788391"],[rtl?"إنستقرام":"Instagram","https://www.instagram.com/sunshineidealnursery/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/dE562Jvv2emv4HvK6"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});

test.each(["web","ios","android"] as const)("Al Heba unified contacts and branch details work in both languages on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-heba")!;
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 for(const phone of ["97446577","97446477","51142276"]){const button=page.getByLabelText(new RegExp((rtl?"اتصال ":"Call ")+phone));if(platform==="web")expect(button.props.href).toBe("tel:+965"+phone);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith("tel:+965"+phone);}}
 const email=page.getByLabelText((rtl?"البريد الإلكتروني: ":"Email: ")+"Alheba2nursery@gmail.com");if(platform==="web")expect(email.props.href).toBe("mailto:Alheba2nursery@gmail.com");else{fireEvent.press(email);expect(open).toHaveBeenLastCalledWith("mailto:Alheba2nursery@gmail.com");}
 for(const branch of item.branches!){const profile=educationProfile(branch).publicProfile!;expect(page.getByText(profile.address![rtl?"ar":"en"])).toBeTruthy();}
 cleanup();}
});

test.each(["web","ios","android"] as const)("Al Heba branch locations and WhatsApp remain correctly paired on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-heba")!;
 expect(item.mainImage).toBe("alheba");expect(item.publicProfile!.branchLocations).toEqual([
 {branchId:"kw-n-heba",name:{ar:"مبارك الكبير",en:"Mubarak Al-Kabeer"},mapUrl:"https://kwfinder.page.link/13XZn",whatsapp:{phone:"+96597446577",url:"https://wa.me/96597446577"}},
 {branchId:"kw-n-heba-2",name:{ar:"الأندلس",en:"Al Andalus"},mapUrl:"https://kwfinder.page.link/Mpj8M",whatsapp:{phone:"+96551142276",url:"https://wa.me/96551142276"}}]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("branch-locations")).toHaveLength(1);
 for(const [label,urls] of [[rtl?"الموقع":"Location",["https://kwfinder.page.link/13XZn","https://kwfinder.page.link/Mpj8M"]],[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp",["https://wa.me/96597446577","https://wa.me/96551142276"]],[rtl?"إنستقرام":"Instagram",["https://www.instagram.com/alheba_nursery/"]]] as [string,string[]][]){const buttons=page.getAllByLabelText(label).filter(b=>b.props.accessibilityRole==="link");expect(buttons).toHaveLength(urls.length);buttons.forEach((button,index)=>{if(platform==="web")expect(button.props.href).toBe(urls[index]);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(urls[index]);}});}cleanup();}
});

test.each(["web","ios","android"] as const)("Al Nowair preserves nursery data and opens bilingual contact links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-nuwair")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("alnowair");expect(item.publicProfile?.mapUrl).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect(current.publicProfile?.phone).toBe("55544069");expect(current.publicProfile?.extraPhones).toEqual([]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Al Nowair Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/alnowairnurserygroup/"],[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp","https://wa.me/96555544069"]]){const button=page.getByLabelText(label);if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});

test.each(["web","ios","android"] as const)("Special Smart preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-smart")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("specialsmart");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["95002006","94002004"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?"حضانة سبيشل سمارت أكاديمي":"Special Smart Academy").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/s.academy.kw/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/yTB8QHQsYXF2Roqe8"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});

test.each(["web","ios","android"] as const)("Al Maha preserves contacts and clearly flags unverified WhatsApp branches on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-maha")!;
 expect(item.mainImage).toBe("almaha");expect(item.publicProfile!.branchLocations!.map(b=>[b.branchId,b.whatsapp!.url])).toEqual([["kw-n-maha-2","https://wa.me/96550999405"],["kw-n-maha","https://wa.me/96560484449"]]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);
 for(const phone of ["50999405","66569293","60484449"]){const button=page.getByLabelText(new RegExp((rtl?"اتصال ":"Call ")+phone));if(platform==="web")expect(button.props.href).toBe("tel:+965"+phone);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith("tel:+965"+phone);}}
 const buttons=page.getAllByLabelText(rtl?"تواصل عبر الواتساب":"Contact via WhatsApp");expect(buttons).toHaveLength(2);buttons.forEach((button,index)=>{const url=["https://wa.me/96560484449","https://wa.me/96550999405"][index];if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}});
 for(const location of item.publicProfile!.branchLocations!){expect(page.getByText(location.address![rtl?"ar":"en"])).toBeTruthy();expect(page.getByText(location.verificationNote![rtl?"ar":"en"])).toBeTruthy();}
 for(const branch of item.branches!)expect(page.getByText(educationProfile(branch).publicProfile!.address![rtl?"ar":"en"])).toBeTruthy();
 expect(page.queryAllByLabelText(rtl?"الموقع":"Location").filter(b=>b.props.accessibilityRole==="link")).toHaveLength(0);cleanup();}
});

test.each(["web","ios","android"] as const)("Jack and Jill preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-jack")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("jackjill");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["69018209","69624824","97712272"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Jack & Jill Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/jack.jill.kw/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/XR6uE7MZmcdMXitu5"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("Al-Amal preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-amal")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("alamal");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["99107631","99108345"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Al-Amal Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"الموقع الإلكتروني":"Official Website","http://www.hopenurserykw.com/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/UC1cutUUVgb5fyFh8"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("Best Dream preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-best")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("bestdream");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["99220249","55704473","+96541149088"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Best Dream Nursery for Special Needs").length).toBeGreaterThan(0);
 expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);const call=page.getByLabelText(new RegExp((rtl?"اتصال ":"Call ")+"\\+96541149088"));if(platform==="web")expect(call.props.href).toBe("tel:+96541149088");else{fireEvent.press(call);expect(open).toHaveBeenLastCalledWith("tel:+96541149088");}
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/bestdreamkw/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/hQ21G6XeBWwYqPwd6"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("Dar Abdullah preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-abdullah")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("darabdullah");expect(item.publicProfile?.whatsapp?.phone).toBe("+96566110660");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["22072244","66110660"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Dar Abdullah Special Needs Nursery").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp","https://wa.me/96566110660"],[rtl?"إنستقرام":"Instagram","https://www.instagram.com/darabdullahnursery/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/6jUoran1ggrKdyx56"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("Yanmo preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-yanmo")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("yanmo");expect(item.publicProfile?.whatsapp?.phone).toBe("+96541111588");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["41111577","41111588"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Yanmo Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"تواصل عبر الواتساب":"Contact via WhatsApp","https://wa.me/96541111588"],[rtl?"إنستقرام":"Instagram","https://www.instagram.com/yanmo_ideal_nursery/"],[rtl?"الموقع":"Location","https://maps.google.com/?q=29.177370,48.094494"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("EEK replaces only active phones and opens bilingual contact links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-energy")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("eek");
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["+96560006383","+96566700017"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByTestId("education-phone-card")).toHaveLength(1);for(const old of ["55992218","50031300"])expect(page.queryByText(new RegExp(old))).toBeNull();
 for(const [label,url] of [[rtl?"اتصال +96560006383":"Call +96560006383","tel:+96560006383"],[rtl?"اتصال +96566700017 رقم إضافي":"Call +96566700017 Additional contact","tel:+96566700017"],[rtl?"إنستقرام":"Instagram","https://www.instagram.com/energyeek/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/YKhQTiRJmwYtA1aBA"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});

test.each(["web","ios","android"] as const)("Ghali preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-ghali")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("ghali");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["23746758","23741289","99942901"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Ghali Ideal Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/ghali_nursery2/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/opg8qT4DfKjMQTNy9"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});

test.each(["web","ios","android"] as const)("Insan preserves branch contacts and bilingual locations on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-insan-1")!;
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);
 for(const phone of ["60041147","60031132","65502770","23908080","52226632","99721356","65779046"]){const button=page.getAllByLabelText((rtl?"اتصال ":"Call ")+phone)[0];expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe("tel:+965"+phone);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith("tel:+965"+phone);}}
 const maps=page.getAllByLabelText(rtl?"الموقع":"Location").filter(b=>b.props.accessibilityRole==="link");expect(maps).toHaveLength(2);maps.forEach((button,index)=>{const url=item.publicProfile!.branchLocations![index].mapUrl;if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}});
 const instagram=page.getByLabelText(rtl?"إنستقرام":"Instagram");if(platform==="web")expect(instagram.props.href).toBe("https://www.instagram.com/insan_kuw/");else{fireEvent.press(instagram);expect(open).toHaveBeenLastCalledWith("https://www.instagram.com/insan_kuw/");}
 for(const branch of item.branches!){for(const value of [...new Set(branch.observations.map(o=>o.needsAr))])if(value)expect(page.getAllByText(value).length).toBeGreaterThan(0);}cleanup();}
});
test.each(["web","ios","android"] as const)("Little Fingers preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-little")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("littlefingers");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["51678168","55996615","24554130"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Little Fingers Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/littlefingers_nursery/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/AQyNovaPtwJBLU898"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("Somya preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-sumaya")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("somya");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["66677126","55299862","24563356","24563358"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Somya Nursery").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/somya_jahra/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/HN9pmxqPzfetrRhT7"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
test.each(["web","ios","android"] as const)("Dima preserves nursery data and opens bilingual links on %s",platform=>{
 jest.replaceProperty(Platform,"OS",platform);const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const item=INSTITUTIONS.find(i=>i.id==="kw-n-dima")!;
 expect(INSTITUTIONS.filter(i=>i.id===item.id)).toHaveLength(1);expect(item.categories).toEqual(["nursery"]);expect(item.mainImage).toBe("dima");expect(item.publicProfile?.whatsapp).toBeUndefined();
 const previous=educationProfile({...item,publicProfile:undefined}),current=educationProfile(item);for(const field of ["phone","extraPhones","address","area","services","supportedConditions","ages"] as const)expect(current.publicProfile?.[field]).toEqual(previous.publicProfile?.[field]);expect([current.publicProfile?.phone,...current.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["55507189","24534954","24534955"]);
 for(const rtl of [false,true]){mockRTL=rtl;const page=render(<EducationProfileScreen item={item}/>);expect(page.getAllByText(rtl?item.nameAr:"Dima Nursery for Special Needs").length).toBeGreaterThan(0);
 for(const [label,url] of [[rtl?"إنستقرام":"Instagram","https://www.instagram.com/dima_nursery/"],[rtl?"الموقع":"Location","https://maps.app.goo.gl/6UDHCcQdXLv5uN1q9"]]){const button=page.getAllByLabelText(label).find(b=>b.props.accessibilityRole==="link")!;expect(button).toBeTruthy();if(platform==="web")expect(button.props.href).toBe(url);else{fireEvent.press(button);expect(open).toHaveBeenLastCalledWith(url);}}cleanup();}
});
