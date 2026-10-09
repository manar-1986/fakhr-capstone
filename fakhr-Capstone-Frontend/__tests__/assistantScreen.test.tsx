import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import HelpCenterScreen from "../app/(tabs)/directory/helpCenter";
import { sendHelpMessage } from "../api/helpCenter.api";
const mockBack = jest.fn(), mockReplace = jest.fn();
let mockRTL = true;
jest.mock("expo-router", () => ({ useRouter: () => ({ canGoBack: () => false, back: mockBack, replace: mockReplace }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: { id: "parent-test" } }) }));
jest.mock("../api/children.api", () => ({ getChildren: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [{ id: "one", name: "First child" }, { id: "two", name: "Second child" }] }) }));
jest.mock("../api/helpCenter.api", () => ({ sendHelpMessage: jest.fn() }));
beforeEach(() => { jest.clearAllMocks(); mockRTL = true; });
test("pending requests cannot duplicate; replies and history stay with the selected child", async () => {
  let resolve!: (value: { message: string }) => void;
  (sendHelpMessage as jest.Mock).mockReturnValue(new Promise(r => { resolve = r; }));
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId("assistant-input"), "General question");
  fireEvent.press(ui.getByTestId("assistant-send"));
  fireEvent.press(ui.getByTestId("assistant-send"));
  expect(sendHelpMessage).toHaveBeenCalledTimes(1);
  expect(sendHelpMessage).toHaveBeenCalledWith({ message: "General question" });
  expect(ui.getByTestId("assistant-loading")).toBeTruthy();
  await act(async () => resolve({ message: "Actual API reply" }));
  expect(ui.getByText("Actual API reply")).toBeTruthy();
  fireEvent.press(ui.getByTestId("assistant-child"));
  fireEvent.press(ui.getByTestId("assistant-child-two"));
  expect(ui.queryByText("Actual API reply")).toBeNull();
  fireEvent.press(ui.getByTestId("assistant-child"));
  fireEvent.press(ui.getByTestId("assistant-child-one"));
  expect(ui.getByText("Actual API reply")).toBeTruthy();
  fireEvent.press(ui.getByTestId("assistant-history"));
  expect(ui.getByTestId("assistant-panel-close")).toBeTruthy();
});
test("API failure is visible and restores the draft without a fabricated response", async () => {
  (sendHelpMessage as jest.Mock).mockRejectedValue(new Error("offline"));
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId("assistant-input"), "Retry me");
  fireEvent.press(ui.getByTestId("assistant-send"));
  await waitFor(() => expect(ui.getByTestId("assistant-error")).toBeTruthy());
  expect(ui.getByTestId("assistant-input").props.value).toBe("Retry me");
  expect(ui.queryByTestId("assistant-loading")).toBeNull();
});
test.each([true, false])("all suggestions send real prompts and back has a Home fallback, RTL=%s", async rtl => {
  mockRTL = rtl;
  (sendHelpMessage as jest.Mock).mockResolvedValue({ message: "API reply" });
  const ui = render(<HelpCenterScreen />);
  for (let index = 0; index < 4; index++) {
    fireEvent.press(ui.getByTestId(`assistant-action-${index}`));
    await waitFor(() => expect(ui.queryByTestId("assistant-loading")).toBeNull());
  }
  expect(sendHelpMessage).toHaveBeenCalledTimes(4);
  fireEvent.press(ui.getByTestId("assistant-back"));
  expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
});
