// Legacy navigation wiring in isolation; minimumScreens/minimumCompatibility test real release gates.
jest.mock('../utils/minimumRelease', () => ({ unavailableRoute: () => false, unavailableText: () => 'Unavailable' }));
import React from "react";
import { fireEvent, render, act } from "@testing-library/react-native";
import HomeDrawer from "../components/home/HomeDrawer";
const mockPush = jest.fn();
const mockClose = jest.fn();
let mockRTL = false;
let mockUser: { id: string } | null = { id: "parent" };
const mockChildren = [{ id: "one", name: "First child" }, { id: "two", name: "Second child" }];
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: mockUser ? mockChildren : [], refetch: jest.fn() }) }));
jest.mock("../api/children.api", () => ({ getChildren: jest.fn() }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));
jest.mock("../hooks/useRequireAuth", () => ({ useRequireAuth: () => ({ requireAuth: () => !!mockUser }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
beforeEach(() => { jest.useFakeTimers(); mockPush.mockClear(); mockClose.mockClear(); mockUser = { id: "parent" }; });
afterEach(() => { act(() => jest.runOnlyPendingTimers()); jest.useRealTimers(); });
test.each([false, true])("real children and existing destinations work, RTL=%s", rtl => {
  mockRTL = rtl;
  const ui = render(<HomeDrawer visible onClose={mockClose} />);
  fireEvent.press(ui.getByTestId("drawer-child-selector"));
  fireEvent.press(ui.getByTestId("drawer-child-two"));
  expect(ui.getByText("Second child")).toBeTruthy();
  fireEvent.press(ui.getByTestId("drawer-child-selector"));
  expect(ui.getByTestId("drawer-child-two").props.accessibilityState.selected).toBe(true);
  fireEvent.press(ui.getByTestId("drawer-settings"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/profile/settings");
  fireEvent.press(ui.getByTestId("drawer-about"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/profile/about");
  fireEvent.press(ui.getByTestId("drawer-help"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/profile/help-support");
  fireEvent.press(ui.getByTestId("drawer-add-child"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/profile/add-child");
  fireEvent.press(ui.getByTestId("drawer-logout"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/profile/logout");
});
test("messages opens the authenticated administration inbox",()=>{const ui=render(<HomeDrawer visible onClose={mockClose}/>);fireEvent.press(ui.getByTestId("drawer-messages"));expect(mockPush).toHaveBeenCalledWith("/(tabs)/messages");});

test.each(["drawer-close", "drawer-overlay"])("closes with %s", id => {
  const ui = render(<HomeDrawer visible onClose={mockClose} />);
  act(() => jest.runAllTimers());
  fireEvent.press(ui.getByTestId(id));
  act(() => jest.runAllTimers());
  expect(mockClose).toHaveBeenCalled();
});
test("a guest cannot see a previous parent's selected child", () => {
  const ui = render(<HomeDrawer visible onClose={mockClose} />);
  fireEvent.press(ui.getByTestId("drawer-child-selector"));
  fireEvent.press(ui.getByTestId("drawer-child-two"));
  mockUser = null;
  ui.rerender(<HomeDrawer visible onClose={mockClose} />);
  expect(ui.queryByText("Second child")).toBeNull();
  expect(ui.queryByTestId("drawer-logout")).toBeNull();
  fireEvent.press(ui.getByTestId("drawer-login"));
  expect(mockPush).toHaveBeenLastCalledWith("/(auth)/login");
});

test.each([false,true])("exactly one auth item follows account state, RTL=%s", rtl => { mockRTL=rtl; mockUser=null; const ui=render(<HomeDrawer visible onClose={mockClose} />); expect(ui.getAllByText(rtl ? "تسجيل الدخول" : "Login")).toHaveLength(1); expect(ui.queryByTestId("drawer-logout")).toBeNull(); fireEvent.press(ui.getByTestId("drawer-login")); expect(mockPush).toHaveBeenLastCalledWith("/(auth)/login"); fireEvent.press(ui.getByTestId("drawer-register")); expect(mockPush).toHaveBeenLastCalledWith("/(auth)/register"); mockUser={id:"parent"}; ui.rerender(<HomeDrawer visible onClose={mockClose} />); expect(ui.queryByText(rtl ? "تسجيل الدخول" : "Login")).toBeNull(); expect(ui.getAllByText(rtl ? "تسجيل الخروج" : "Log out")).toHaveLength(1); fireEvent.press(ui.getByTestId("drawer-logout")); expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/profile/logout"); });

test.each([false,true])("personal services require login, RTL=%s",rtl=>{
 mockRTL=rtl;mockUser=null;const ui=render(<HomeDrawer visible onClose={mockClose}/>);
 fireEvent.press(ui.getByTestId("drawer-bookings"));fireEvent.press(ui.getByTestId("drawer-favorites"));fireEvent.press(ui.getByTestId("drawer-messages"));expect(mockPush).not.toHaveBeenCalled();
 mockUser={id:"parent"};ui.rerender(<HomeDrawer visible onClose={mockClose}/>);
 fireEvent.press(ui.getByTestId("drawer-bookings"));expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/bookings");
 fireEvent.press(ui.getByTestId("drawer-favorites"));expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/favorites");
});

test.each([false,true])("drawer preserves directional rows and dark navigation labels, RTL=%s",rtl=>{
 mockRTL=rtl;const ui=render(<HomeDrawer visible onClose={mockClose}/>);
 for(const id of ["bookings","favorites","messages","settings","help","about"]){
  expect(ui.getByTestId("drawer-"+id)).toHaveStyle({flexDirection:rtl?"row-reverse":"row"});
 }
 expect(ui.getByText(rtl?"الإعدادات والخصوصية":"Settings & privacy")).toHaveStyle({color:"#0B093B"});
 expect(ui.getByTestId("drawer-logout")).toHaveStyle({flexDirection:rtl?"row-reverse":"row"});
});
