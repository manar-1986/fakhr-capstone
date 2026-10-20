import React from "react";
import { Alert } from "react-native";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EditProfile from "../app/(tabs)/profile/edit-profile";
import { getCurrentUser, updateUser } from "../api/users.api";
import { getChildren, updateChild } from "../api/children.api";

const mockUser = { id: "507f1f77bcf86cd799439011", name: "Synthetic parent", email: "parent@example.invalid", role: "parent" };
const mockSetUser = jest.fn();
let mockLocale = "en";
jest.mock("../api/users.api", () => ({ getCurrentUser: jest.fn(), updateUser: jest.fn() }));
jest.mock("../api/children.api", () => ({ getChildren: jest.fn(), updateChild: jest.fn() }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, setUser: mockSetUser }) }));
jest.mock("../context/LanguageContext", () => ({ useLanguage: () => ({ locale: mockLocale }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: () => null }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("@react-native-community/datetimepicker", () => () => null);
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View" }));
let client: QueryClient;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
  jest.mocked(getCurrentUser).mockResolvedValue(mockUser);
  jest.mocked(getChildren).mockResolvedValue([]);
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
});
afterEach(() => { cleanup(); client.clear(); jest.restoreAllMocks(); });
const screen = () => render(<QueryClientProvider client={client}><EditProfile /></QueryClientProvider>);

test.each(["ar", "en"])("%s profile save uses the authenticated ID and updates the local account", async locale => {
  mockLocale = locale;
  jest.mocked(updateUser).mockResolvedValue({ ...mockUser, name: "Edited parent" });
  const ui = screen();
  const name = await ui.findByPlaceholderText("editProfile.fullNamePlaceholder");
  fireEvent.changeText(name, " Edited parent ");
  fireEvent.press(ui.getByText("editProfile.saveChanges"));
  await waitFor(() => expect(updateUser).toHaveBeenCalledWith(mockUser.id, { name: "Edited parent", email: mockUser.email }));
  await waitFor(() => expect(mockSetUser).toHaveBeenCalledWith({ id: mockUser.id, name: "Edited parent", email: mockUser.email }));
  expect(updateChild).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith("editProfile.saved", "editProfile.savedBody");
});

test("failed profile save preserves the session and reports failure without retrying", async () => {
  jest.mocked(updateUser).mockRejectedValue(new Error("Profile update unavailable"));
  const ui = screen();
  await ui.findByPlaceholderText("editProfile.fullNamePlaceholder");
  fireEvent.press(ui.getByText("editProfile.saveChanges"));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith("common.error", "Profile update unavailable"));
  expect(updateUser).toHaveBeenCalledTimes(1);
  expect(mockSetUser).not.toHaveBeenCalled();
  expect(updateChild).not.toHaveBeenCalled();
});
