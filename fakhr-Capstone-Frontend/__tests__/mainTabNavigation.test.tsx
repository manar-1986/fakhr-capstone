// Legacy navigation wiring in isolation; minimumScreens/minimumCompatibility test real release gates.
jest.mock('../utils/minimumRelease', () => ({ unavailableRoute: () => false, unavailableText: () => 'Unavailable' }));
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { MainTabBar } from "../components/navigation/MainTabBar";
const mockNavigate = jest.fn();
const mockEmit = jest.fn(() => ({ defaultPrevented: false }));
let mockPath = "/home";
jest.mock("expo-router", () => ({ useRouter: () => ({ navigate: mockNavigate }), usePathname: () => mockPath }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon", MaterialCommunityIcons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ tabRow: "row-reverse", dir: "rtl" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const routes = ["home", "products", "plan", "profile"].map(name => ({ name, key: name }));
beforeEach(() => { mockNavigate.mockClear(); mockEmit.mockClear(); });
test.each(["/home", "/products", "/plan", "/profile", "/profile/settings"])("all four tabs navigate from %s without replacing history", path => {
  mockPath = path;
  const ui = render(<MainTabBar {...({ state: { routes, index: 3 }, navigation: { emit: mockEmit } } as any)} />);
  for (const [id, destination] of [["home", "home"], ["store", "products"], ["plan", "plan"], ["profile", "profile"]]) {
    fireEvent.press(ui.getByTestId(`main-tab-${id}`));
    expect(mockNavigate).toHaveBeenLastCalledWith(`/(tabs)/${destination}`);
  }
});
test("temporarily missing route metadata does not silently drop a tab press", () => {
  mockPath = "/profile";
  const ui = render(<MainTabBar {...({ state: { routes: [], index: 0 }, navigation: { emit: mockEmit } } as any)} />);
  fireEvent.press(ui.getByTestId("main-tab-home"));
  expect(mockNavigate).toHaveBeenCalledWith("/(tabs)/home");
});

test("registration reuses all four tabs without a tab navigator or synthetic route state", () => {
  mockPath = "/register";
  const ui = render(<MainTabBar inline />);
  for (const [id, destination] of [["home", "home"], ["store", "products"], ["plan", "plan"], ["profile", "profile"]]) {
    fireEvent.press(ui.getByTestId(`main-tab-${id}`));
    expect(mockNavigate).toHaveBeenLastCalledWith(`/(tabs)/${destination}`);
  }
  expect(mockEmit).not.toHaveBeenCalled();
});

test("Categories highlights Home without changing destinations or other active tabs", () => { mockPath="/resources"; const ui=render(<MainTabBar />); expect(ui.getByTestId("main-tab-home").props.accessibilityState.selected).toBe(true); expect(ui.getByTestId("main-tab-store").props.accessibilityState.selected).toBe(false); fireEvent.press(ui.getByTestId("main-tab-store")); expect(mockNavigate).toHaveBeenCalledWith("/(tabs)/products"); mockPath="/resources/disability-services"; ui.rerender(<MainTabBar />); expect(ui.getByTestId("main-tab-home").props.accessibilityState.selected).toBe(false); });
test("Approved navigation palette is consistent on Home, Products and Settings",()=>{
 const {StyleSheet}=require("react-native");
 const {homeTheme}=require("../theme/home");
 mockPath="/home";const ui=render(<MainTabBar/>);
 expect(StyleSheet.flatten(ui.getByText("tabs.home").props.style).color).toBe("#5E6486");
 mockPath="/products";ui.rerender(<MainTabBar/>);
 expect(StyleSheet.flatten(ui.getByText("tabs.home").props.style).color).toBe(homeTheme.muted);
 mockPath="/profile/settings";ui.rerender(<MainTabBar/>);
 expect(StyleSheet.flatten(ui.getByText("tabs.account").props.style).color).toBe("#0B093B");
 ui.unmount();
});
