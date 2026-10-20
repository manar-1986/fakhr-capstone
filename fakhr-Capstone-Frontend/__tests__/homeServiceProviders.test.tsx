import React from "react";
import { beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import Services from "../app/(tabs)/services";
import Details from "../app/(tabs)/services/service-details";
import Card from "../components/directory/HomeServiceProviderCard";
import { HOME_SERVICE_PROVIDERS, filterHomeServiceProviders, findHomeServiceProvider, homeProviderPhoneUrl } from "../constants/homeServiceProviders";
let mockRTL = true;
let mockId: string | undefined;
const mockPush = jest.fn();
const mockQuery = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => ({ id: mockId }), Redirect: "Redirect" }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View", useSafeAreaInsets: () => ({ bottom: 34 }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: () => null, DisabilityAwareHeaderBackButton: () => null }));
jest.mock("@tanstack/react-query", () => ({ useQuery: (...args: unknown[]) => (mockQuery as any)(...args) }));
jest.mock("../api/services.api", () => ({ getServiceById: jest.fn() }));
const originalOS = Platform.OS;
beforeEach(() => { mockRTL = true; mockId = undefined; mockPush.mockClear(); mockQuery.mockClear(); });
afterEach(() => { cleanup(); jest.restoreAllMocks(); Object.defineProperty(Platform, "OS", { configurable: true, value: originalOS }); });

test("two public providers with exact phones, conservative categories and no fabricated fields", () => {
  expect(HOME_SERVICE_PROVIDERS.map(p => p.phone)).toEqual(["98938009", undefined, "50455583"]);
  expect(new Set(HOME_SERVICE_PROVIDERS.map(p => p.id)).size).toBe(3);
  expect(filterHomeServiceProviders("occupational").map(p=>p.id)).toEqual(["center-speak-clinic"]);
  expect(filterHomeServiceProviders("speech").map(p => p.id)).toEqual(["home-provider-therapy-care", "center-speak-clinic"]);
  expect(findHomeServiceProvider("missing")).toBeUndefined();
  expect(homeProviderPhoneUrl("javascript:bad")).toBeUndefined();
  HOME_SERVICE_PROVIDERS.forEach(p => {
    expect(p.pediatricHomeVisits).toBe("unconfirmed");
    for (const key of ["price", "rating", "reviews", "photo", "address", "hours", "booking", "backendId"]) expect(p).not.toHaveProperty(key);
  });
});
describe.each([true, false])("Home Services RTL=%s", rtl => {
  test("category filters, empty occupational state and stable details navigation", () => {
    mockRTL = rtl;
    const ui = render(<Services />);
    expect(ui.getAllByRole("link")).toHaveLength(2);
    fireEvent.press(ui.getByLabelText(rtl ? "العلاج الطبيعي" : "Physiotherapy"));
    expect(ui.getAllByRole("link")).toHaveLength(1);
    fireEvent.press(ui.getByLabelText(rtl ? "علاج النطق والتخاطب" : "Speech & Language Therapy"));
    expect(ui.getAllByRole("link")).toHaveLength(2);
    fireEvent.press(ui.getByRole("button",{name:rtl ? "ثيرابي كير" : "Therapy Care"}));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/services/service-details", params: { id: "home-provider-therapy-care" } });
    fireEvent.press(ui.getByLabelText(rtl ? "العلاج الوظيفي" : "Occupational Therapy"));
    expect(ui.queryAllByRole("link")).toHaveLength(1);
    fireEvent.press(ui.getByLabelText(rtl ? "الرعاية الصحية المنزلية" : "Home Healthcare"));
    expect(ui.queryByText("51003780")).toBeNull();
    expect(ui.queryAllByRole("link")).toHaveLength(0);
    fireEvent.press(ui.getByLabelText(rtl ? "الكل" : "All"));
    expect(ui.getAllByRole("link")).toHaveLength(2);
  });
  test("each detail retains its own phone and verification note without API lookup", () => {
    mockRTL = rtl;
    for (const provider of HOME_SERVICE_PROVIDERS.filter(p=>p.id!=="center-speak-clinic")) {
      mockId = provider.id;
      const ui = render(<Details />);
      if(provider.phone) expect(ui.getByText(provider.phone)).toBeTruthy();
      if(provider.verification[rtl ? "ar" : "en"]) expect(ui.getByText(provider.verification[rtl ? "ar" : "en"])).toBeTruthy();
      expect(mockQuery).not.toHaveBeenCalled();
      ui.unmount();
    }
  });
});
test.each(["ios", "android", "web"] as const)("%s: call buttons use each provider's own Kuwait number", os => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  for (const provider of HOME_SERVICE_PROVIDERS.filter(p=>p.id!=="center-speak-clinic")) {
    const ui = render(<Card provider={provider} />);
    if(!provider.phone){ui.unmount();continue;}
    const call = ui.getByLabelText(`اتصال ${provider.phone}`);
    if (os === "web") expect(call.props.href).toBe(`tel:+965${provider.phone}`);
    else { fireEvent.press(call); expect(openURL).toHaveBeenLastCalledWith(`tel:+965${provider.phone}`); }
    ui.unmount();
  }
});
test("unknown local provider fails closed and retired home templates redirect", () => {
  mockId = "home-provider-missing";
  const ui = render(<Details />);
  expect(ui.getByText("المزود غير موجود.")).toBeTruthy();
  expect(mockQuery).not.toHaveBeenCalled();
  ui.unmount();
  mockId = "hs-speech";
  const old = render(<Details />);
  expect(old.UNSAFE_getByType("Redirect" as any).props.href).toEqual({ pathname: "/(tabs)/services", params: { category: "speech" } });
});

test.each(["ios","android","web"] as const)("Therapy Care replacement content and website work on %s",os=>{
 Object.defineProperty(Platform,"OS",{configurable:true,value:os});const openURL=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const provider=findHomeServiceProvider("home-provider-therapy-care")!;
 expect(provider.sections).toHaveLength(2);expect(provider.sections![0].items!.en).toEqual(["Delayed motor development","Musculoskeletal deformities","Peripheral nerve disorders","Cerebral palsy","Motor disabilities"]);expect(provider.image).toBe("therapyKw");
 for(const rtl of [true,false]){mockRTL=rtl;const ui=render(<Card provider={provider} showSources/>);expect(ui.getAllByText("THERAPY KW").length).toBeGreaterThan(0);expect(ui.getByLabelText("THERAPY KW pediatric physiotherapy").props.resizeMode).toBe("contain");for(const section of provider.sections!){expect(ui.getAllByText(section.title[rtl?"ar":"en"]).length).toBeGreaterThan(0);for(const value of section.items?.[rtl?"ar":"en"]||[])expect(ui.getByText(value)).toBeTruthy();if(section.description)expect(ui.getByText(section.description[rtl?"ar":"en"])).toBeTruthy();}
 expect(ui.queryByText(/occupational|العلاج الوظيفي/i)).toBeNull();const website=ui.getByLabelText(rtl?"الموقع الإلكتروني":"Official Website");if(os==="web")expect(website.props.href).toBe("https://www.therapy-kw.com");else{fireEvent.press(website);expect(openURL).toHaveBeenLastCalledWith("https://www.therapy-kw.com");}ui.unmount();}
});

test.each(["ios","android","web"] as const)("Human Touch replacement has WhatsApp only and the original logo on %s",os=>{
 Object.defineProperty(Platform,"OS",{configurable:true,value:os});const openURL=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);const provider=findHomeServiceProvider("home-provider-human-touch")!;expect(provider.phone).toBeUndefined();expect(provider.categories).toEqual(["home-rehabilitation"]);expect(provider.sources).toEqual([{title:"Human Touch Center",url:"https://humantouch-homecare.com/"}]);
 for(const rtl of [true,false]){mockRTL=rtl;for(const showSources of [false,true]){const ui=render(<Card provider={provider} showSources={showSources}/>);expect(ui.getByText(provider.description[rtl?"ar":"en"])).toBeTruthy();expect(ui.getAllByLabelText(provider.name[rtl?"ar":"en"]).some(i=>i.props.resizeMode==="contain")).toBe(true);expect(ui.queryAllByLabelText(/^(Call|اتصال) /)).toHaveLength(0);const wa=ui.getByLabelText(rtl?"تواصل عبر الواتساب":"Contact via WhatsApp");if(os==="web")expect(wa.props.href).toBe("https://wa.me/96550055510");else{fireEvent.press(wa);expect(openURL).toHaveBeenLastCalledWith("https://wa.me/96550055510");}if(showSources){const website=ui.getByLabelText(rtl?"الموقع الإلكتروني":"Official Website");if(os==="web")expect(website.props.href).toBe("https://humantouch-homecare.com/");else{fireEvent.press(website);expect(openURL).toHaveBeenLastCalledWith("https://humantouch-homecare.com/");}}ui.unmount();}}
});


test("moved Let's Speech is absent from Home Services and its old deep link redirects",()=>{
 expect(findHomeServiceProvider("home-provider-lets-speech")).toBeUndefined();
 mockId="home-provider-lets-speech";const ui=render(<Details/>);
 expect(ui.UNSAFE_getByType("Redirect" as any).props.href).toEqual({pathname:"/(tabs)/directory/institution-details",params:{id:mockId}});
});


test.each(["web","ios","android"])("compact listing keeps treatment lists and full contacts inside profiles on %s",os=>{
 Object.defineProperty(Platform,"OS",{configurable:true,value:os});
 const open=jest.spyOn(Linking,"openURL").mockResolvedValue(undefined);
 const ui=render(<Services/>);
 expect(ui.queryByText("98938009")).toBeNull();expect(ui.queryByText("تأخر النمو الحركي")).toBeNull();
 expect(ui.getByRole("button",{name:"ثيرابي كير"})).toBeTruthy();expect(ui.getByRole("button",{name:"مركز هيومن تاتش"})).toBeTruthy();
 const call=ui.getAllByRole("link",{name:"اتصال"})[0];if(os==="web")expect(call.props.href).toBe("tel:+96598938009");else{fireEvent.press(call,{stopPropagation:()=>{}});expect(open).toHaveBeenCalledWith("tel:+96598938009");}
});
