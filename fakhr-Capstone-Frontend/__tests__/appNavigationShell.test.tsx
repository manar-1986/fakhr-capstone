import React from "react";
import { View } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { AppNavigationShell } from "../components/navigation/AppNavigationShell";
import Home from "../app/(tabs)/home";

let mockPath = "/home", mockRTL = false;
let mockOrigin: string | undefined;
const mockRouter = { dismissTo: jest.fn(), push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => true };
jest.mock("expo-router", () => ({ useGlobalSearchParams: () => ({origin:mockOrigin}), useRouter: () => mockRouter, usePathname: () => mockPath, useSegments: () => ["(tabs)"] }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: undefined }) }));
jest.mock("../api/users.api", () => ({ getCurrentUser: jest.fn() }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("react-native-safe-area-context", () => {
  const { View } = jest.requireActual("react-native");
  return { SafeAreaProvider: View, SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) };
});
jest.mock("../components/home/HomeGlobalSearch", () => () => null);
jest.mock("../components/home/HomeAdCarousel", () => () => null);
jest.mock("../components/home/HomeDiscoverySections", () => () => null);
jest.mock("../components/home/HomeDrawer", () => {
  const React = jest.requireActual("react");
  const { Pressable, Text } = jest.requireActual("react-native");
  return function Drawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    return visible ? React.createElement(Pressable, { testID: "test-drawer-close", onPress: onClose }, React.createElement(Text, null, "Drawer open")) : null;
  };
});

test.each([false, true])("Home owns exactly one menu and drawer with no shared header space, RTL=%s", rtl => {
  mockPath = "/home"; mockRTL = rtl;
  const ui = render(<AppNavigationShell><Home /></AppNavigationShell>);
  expect(ui.queryByTestId("app-header")).toBeNull();
  expect(ui.getAllByRole("button", { name: rtl ? "القائمة" : "Menu" })).toHaveLength(1);
  fireEvent.press(ui.getByRole("button", { name: rtl ? "القائمة" : "Menu" }));
  expect(ui.getAllByText("Drawer open")).toHaveLength(1);
  fireEvent.press(ui.getByTestId("test-drawer-close"));
  expect(ui.queryByText("Drawer open")).toBeNull();
});

test.each(["/products", "/plan", "/profile/edit-profile", "/resources/disability-services"])("%s keeps one shared header and working drawer across route changes", route => {
  for (const rtl of [false, true]) {
    mockPath = route; mockRTL = rtl;
    const ui = render(<AppNavigationShell><View /></AppNavigationShell>);
    expect(ui.getAllByTestId("app-header")).toHaveLength(1);
    expect(ui.getAllByRole("button", { name: rtl ? "القائمة" : "Menu" })).toHaveLength(1);
    fireEvent.press(ui.getByTestId("app-header-menu"));
    expect(ui.getByText("Drawer open")).toBeTruthy();
    fireEvent.press(ui.getByTestId("test-drawer-close"));
    expect(ui.queryByText("Drawer open")).toBeNull();
    mockPath = "/home";
    ui.rerender(<AppNavigationShell><Home /></AppNavigationShell>);
    expect(ui.queryByTestId("app-header")).toBeNull();
    expect(ui.getAllByRole("button", { name: rtl ? "القائمة" : "Menu" })).toHaveLength(1);
    ui.unmount();
  }
});

 test.each([false, true])("Ask Fakhr owns its header without changing adjacent directory routes, RTL=%s", rtl => {
  mockRTL = rtl; mockPath = "/directory/helpCenter";
  const ui = render(<AppNavigationShell><View /></AppNavigationShell>);
  expect(ui.queryByTestId("app-header")).toBeNull();
  for (const path of ["/directory/professionals", "/directory/schools", "/directory/helpCenter-details"]) {
    mockPath = path; ui.rerender(<AppNavigationShell><View /></AppNavigationShell>);
    expect(ui.getAllByTestId("app-header")).toHaveLength(1);
    fireEvent.press(ui.getByTestId("app-header-back"));
    expect(mockRouter.back).toHaveBeenCalled();
  }
 });

 test.each([false,true])('Ask Fakhr Details return dismisses without pushing, RTL=%s', rtl=>{
  mockRTL=rtl;
  for(const category of ['school','doctor','rehabilitation','nursery','sports-club']) {
    mockPath=category==='doctor'?'/directory/professional-details':'/directory/institution-details';
    mockOrigin='ask-fakhr'; jest.clearAllMocks();
    const ui=render(<AppNavigationShell><View/></AppNavigationShell>);
    for(let i=0;i<3;i++)fireEvent.press(ui.getByTestId('app-header-back'));
    expect(mockRouter.dismissTo).toHaveBeenCalledTimes(3);
    expect(mockRouter.dismissTo).toHaveBeenLastCalledWith('/(tabs)/directory/helpCenter');
    expect(mockRouter.push).not.toHaveBeenCalled(); expect(mockRouter.back).not.toHaveBeenCalled();
    mockOrigin=undefined;ui.rerender(<AppNavigationShell><View/></AppNavigationShell>);
    fireEvent.press(ui.getByTestId('app-header-back'));expect(mockRouter.back).toHaveBeenCalledTimes(1);
    ui.unmount();
  }
 });

test("Categories owns its reference header without changing its nested services header", () => { mockPath="/resources"; const ui=render(<AppNavigationShell><View testID="categories-content" /></AppNavigationShell>); expect(ui.queryByTestId("app-header")).toBeNull(); expect(ui.getByTestId("categories-content")).toBeTruthy(); });

test.each(["/profile", "/profile/settings"])("%s owns its branded settings header", route => { mockPath=route; const ui=render(<AppNavigationShell><View /></AppNavigationShell>); expect(ui.queryByTestId("app-header")).toBeNull(); });

 test("leaving Login through navigation clears its pending protected destination", () => {
  const { setPendingAuthHref, consumePendingAuthHref } = jest.requireActual<typeof import("../utils/authRedirect")>("../utils/authRedirect");
  setPendingAuthHref("/(tabs)/profile/add-child");
  mockPath="/login";
  const ui=render(<AppNavigationShell><View /></AppNavigationShell>);
  mockPath="/forgot-password";ui.rerender(<AppNavigationShell><View /></AppNavigationShell>);
  mockPath="/login";ui.rerender(<AppNavigationShell><View /></AppNavigationShell>);
  mockPath="/home";ui.rerender(<AppNavigationShell><View /></AppNavigationShell>);
  expect(consumePendingAuthHref()).toBeNull();
 });
