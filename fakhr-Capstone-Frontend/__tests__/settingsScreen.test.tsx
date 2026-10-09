import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import SettingsScreen from "../app/(tabs)/profile/settings";
const mockPush = jest.fn();
const mockLocale = jest.fn();
let mockRTL = true;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, canGoBack: () => false, replace: mockPush }) }));
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
