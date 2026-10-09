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

test("four unique providers with exact phones, conservative categories and no fabricated fields", () => {
  expect(HOME_SERVICE_PROVIDERS.map(p => p.phone)).toEqual(["98938009", "50055510", "97944756", "51003780"]);
  expect(new Set(HOME_SERVICE_PROVIDERS.map(p => p.id)).size).toBe(4);
  expect(filterHomeServiceProviders("occupational")).toHaveLength(0);
  expect(filterHomeServiceProviders("speech").map(p => p.id)).toEqual(["home-provider-lets-speech"]);
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
    expect(ui.getAllByRole("link")).toHaveLength(4);
    fireEvent.press(ui.getByLabelText(rtl ? "العلاج الطبيعي" : "Physiotherapy"));
    expect(ui.getAllByRole("link")).toHaveLength(2);
    fireEvent.press(ui.getByLabelText(rtl ? "علاج النطق والتخاطب" : "Speech & Language Therapy"));
    expect(ui.getAllByRole("link")).toHaveLength(1);
    fireEvent.press(ui.getByLabelText(rtl ? "تفاصيل المزود: Let's Speech" : "Provider details: Let's Speech"));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/services/service-details", params: { id: "home-provider-lets-speech" } });
    fireEvent.press(ui.getByLabelText(rtl ? "العلاج الوظيفي" : "Occupational Therapy"));
    expect(ui.queryAllByRole("link")).toHaveLength(0);
    fireEvent.press(ui.getByLabelText(rtl ? "الرعاية الصحية المنزلية" : "Home Healthcare"));
    expect(ui.getByText("51003780")).toBeTruthy();
    fireEvent.press(ui.getByLabelText(rtl ? "الكل" : "All"));
    expect(ui.getAllByRole("link")).toHaveLength(4);
  });
  test("each detail retains its own phone and verification note without API lookup", () => {
    mockRTL = rtl;
    for (const provider of HOME_SERVICE_PROVIDERS) {
      mockId = provider.id;
      const ui = render(<Details />);
      expect(ui.getByText(provider.phone)).toBeTruthy();
      expect(ui.getByText(provider.verification[rtl ? "ar" : "en"])).toBeTruthy();
      expect(mockQuery).not.toHaveBeenCalled();
      ui.unmount();
    }
  });
});
test.each(["ios", "android", "web"] as const)("%s: call buttons use each provider's own Kuwait number", os => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  for (const provider of HOME_SERVICE_PROVIDERS) {
    const ui = render(<Card provider={provider} />);
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
