import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AddChild from "../app/(tabs)/profile/add-child";
import { createChild } from "../api/children.api";

jest.mock("../api/children.api", () => ({ createChild: jest.fn(async data => ({ ...data, id: "test-child" })) }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }) }));
jest.mock("../hooks/useRequireAuth", () => ({ useRequireAuth: () => ({ requireAuth: () => true }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: false, tabRow: "row" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));

beforeEach(() => jest.clearAllMocks());
test.each([false, true])("child save is explicit and supports optional or multiple needs, selected=%s", async selected => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  const ui = render(<QueryClientProvider client={client}><AddChild /></QueryClientProvider>);
  expect(createChild).not.toHaveBeenCalled();
  fireEvent.changeText(ui.getByPlaceholderText("Enter first name"), "Test child");
  fireEvent.press(ui.getByText("Male"));
  fireEvent.press(ui.getByText("Continue"));
  expect(ui.getByText(/A diagnosis is not required/)).toBeTruthy();
  if (selected) {
    fireEvent.press(ui.getByRole("checkbox", { name: "disabilities.autism" }));
    fireEvent.press(ui.getByRole("checkbox", { name: "disabilities.hearing" }));
  }
  fireEvent.press(ui.getByText("Continue"));
  fireEvent.press(ui.getByText("Continue"));
  expect(createChild).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText("Save Child"));
  await waitFor(() => expect(createChild).toHaveBeenCalledTimes(1));
  expect(jest.mocked(createChild).mock.calls[0][0]).toEqual(expect.objectContaining({ name: "Test child", diagnosis: selected ? ["autism", "hearing"] : undefined, dateOfBirth: undefined }));
  ui.unmount(); client.clear();
});
