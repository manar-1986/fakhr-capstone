import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Welcome from "../app/(auth)/welcome";
import Index from "../app/index";
const mockReplace = jest.fn();
let mockUser: object | null = null, mockComplete = false, mockRTL = true;
jest.mock("expo-router", () => ({ useRouter: () => ({ replace: mockReplace }), Redirect: ({ href }: { href: string }) => { const { Text } = require("react-native"); return <Text>{href}</Text>; } }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, loading: false }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
jest.mock("../utils/welcome", () => ({ hasCompletedWelcome: async () => mockComplete, completeWelcome: async () => { mockComplete = true; } }));
beforeEach(() => { mockReplace.mockClear(); mockUser = null; mockComplete = false; });
test.each([true, false])("welcome has only Get Started and allows guest Home, RTL=%s", async rtl => {
  mockRTL = rtl;
  const ui = render(<Welcome />);
  expect(ui.getAllByRole("button")).toHaveLength(1);
  expect(ui.queryByText("لدي حساب بالفعل")).toBeNull();
  expect(ui.queryByText("I Already Have an Account")).toBeNull();
  fireEvent.press(ui.getByTestId("welcome-start"));
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home"));
  expect(mockComplete).toBe(true);
});
test.each([ [false, false, "/(auth)/welcome"], [true, false, "/(tabs)/home"], [false, true, "/(tabs)/home"] ])("launch: completed=%s authenticated=%s", async (completed, authenticated, route) => {
  mockComplete = Boolean(completed); mockUser = authenticated ? { id: "existing" } : null;
  const ui = render(<Index />);
  await waitFor(() => expect(ui.getByText(String(route))).toBeTruthy());
});
