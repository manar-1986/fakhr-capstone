import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import SettingsScreen from "../app/(tabs)/profile/settings";
jest.mock("../components/home/HomeDrawer", () => {
 const React=jest.requireActual("react"), {Pressable,Text}=jest.requireActual("react-native");
 return ({onClose}: {onClose:()=>void}) => React.createElement(Pressable,{testID:"existing-drawer-close",onPress:onClose},React.createElement(Text,null,"Existing HomeDrawer"));
});
const mockPush = jest.fn();
const mockLocale = jest.fn();
const mockBack = jest.fn();
let mockHistory = false;
let mockRTL = true;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, canGoBack: () => mockHistory, back: mockBack, replace: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../context/LanguageContext", () => ({ useLanguage: () => ({ locale: mockRTL ? "ar" : "en", setLocale: mockLocale }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View", useSafeAreaInsets: () => ({ bottom: 0 }) }));
beforeEach(() => { mockPush.mockClear(); mockLocale.mockClear(); });
test.each([true, false])("all nine controls are accessible, RTL=%s", rtl => {
  mockRTL = rtl;
  const ui = render(<SettingsScreen />);
  ["language", "notifications", "accessibility", "password", "permissions", "sharing", "privacy", "export", "delete"].forEach(id => expect(ui.getByTestId(`settings-${id}`).props.accessibilityRole).toBe("button"));
  fireEvent.press(ui.getByTestId("settings-language"));
  fireEvent.press(ui.getByTestId(`settings-locale-${rtl ? "en" : "ar"}`));
  expect(mockLocale).toHaveBeenCalledWith(rtl ? "en" : "ar");
  fireEvent.press(ui.getByTestId("settings-password"));
  expect(mockPush).toHaveBeenLastCalledWith("/(auth)/forgot-password");
});
test.each(["notifications", "accessibility", "permissions", "sharing", "export", "delete"])("%s exposes guidance without a destructive or fake action", id => {
  const ui = render(<SettingsScreen />);
  fireEvent.press(ui.getByTestId(`settings-${id}`));
  expect(ui.getByTestId("settings-panel-description").props.children).toBeTruthy();
  expect(mockPush).not.toHaveBeenCalled();
  fireEvent.press(ui.getByTestId("settings-panel-close"));
  expect(ui.queryByTestId("settings-panel-description")).toBeNull();
});


test("legal documents open their own routes", () => {
  const ui = render(<SettingsScreen />);
  fireEvent.press(ui.getByTestId("settings-privacy"));
  expect(mockPush).toHaveBeenLastCalledWith("/(auth)/privacy-policy");
  fireEvent.press(ui.getByTestId("settings-terms"));
  expect(mockPush).toHaveBeenLastCalledWith("/(auth)/terms-conditions");
});

test.each([true, false])("deletion remains inactive, RTL=%s", rtl => { mockRTL=rtl; const ui=render(<SettingsScreen><React.Fragment /></SettingsScreen>); fireEvent.press(ui.getByTestId("settings-delete")); expect(ui.getByText(rtl ? /حذف الحساب غير مفعّل إلى/ : /Account deletion remains inactive/)).toBeTruthy(); expect(mockPush).not.toHaveBeenCalled(); });

test.each([true, false])("Settings has independent directional Back and existing drawer controls, RTL=%s", rtl => {
 mockRTL=rtl; mockHistory=true; mockBack.mockClear();
 const ui=render(<SettingsScreen />);
 expect(ui.getAllByTestId("settings-back")).toHaveLength(1);
 expect(ui.queryByTestId("app-header-menu")).toBeNull();
 expect(ui.getAllByTestId("settings-menu")).toHaveLength(1);
 expect(ui.getByTestId("settings-menu")).toHaveStyle(rtl ? {left:0} : {right:0});
 fireEvent.press(ui.getByTestId("settings-menu"));
 expect(ui.getAllByText("Existing HomeDrawer")).toHaveLength(1);
 expect(mockBack).not.toHaveBeenCalled(); expect(mockPush).not.toHaveBeenCalled();
 fireEvent.press(ui.getByTestId("existing-drawer-close")); expect(ui.queryByText("Existing HomeDrawer")).toBeNull();
 expect(ui.getByTestId("settings-back")).toHaveStyle(rtl ? {right:0} : {left:0});
 fireEvent.press(ui.getByTestId("settings-back"));expect(mockBack).toHaveBeenCalledTimes(1);expect(mockPush).not.toHaveBeenCalled();
 mockHistory=false;fireEvent.press(ui.getByTestId("settings-back"));expect(mockPush).toHaveBeenCalledWith("/(tabs)/home");
});
