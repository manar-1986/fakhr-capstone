import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { CreateAccountScreen } from "../components/screens/CreateAccountScreen";
import ar from "../i18n/locales/ar.json";
import en from "../i18n/locales/en.json";
let mockRTL = false;
let mockPending = false;
let mockOptions: any;
const mockMutate = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockCanGoBack = true;
jest.mock("../api/auth.api", () => ({ register: jest.fn(() => { throw new Error("Real registration forbidden in this test"); }) }));
jest.mock("@tanstack/react-query", () => ({ useMutation: (options: any) => { mockOptions = options; return { mutate: mockMutate, isPending: mockPending }; } }));
jest.mock("expo-router", () => ({ useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: mockBack, canGoBack: () => mockCanGoBack }) }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ setUser: jest.fn() }), USER_PROFILE_CACHE_KEY: "test-cache" }));
jest.mock("../utils/secureStorage", () => ({ setItemAsync: jest.fn() }));
jest.mock("../utils/authRedirect", () => ({ consumePendingAuthHref: () => null }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key.split('.').reduce((value: any, part) => value?.[part], mockRTL ? require('../i18n/locales/ar.json') : require('../i18n/locales/en.json')) || key }) }));
beforeEach(() => { mockRTL = false; mockPending = false; mockMutate.mockClear(); mockReplace.mockClear(); });
afterEach(() => { expect(mockMutate).not.toHaveBeenCalled(); cleanup(); });
test.each([false, true])("RTL=%s: empty and invalid fields show inline errors without requests", rtl => {
  mockRTL = rtl;
  const ui = render(<CreateAccountScreen />);
  fireEvent.press(ui.getByTestId("registration-submit"));
  for (const field of ["name", "email", "password", "confirmation", "terms"]) expect(ui.getByTestId(`registration-error-${field}`)).toBeTruthy();
  fireEvent.changeText(ui.getByTestId("registration-email"), "invalid-email");
  expect(ui.getByText((rtl ? ar : en).signup.invalidEmail)).toBeTruthy();
  fireEvent.changeText(ui.getByTestId("registration-password"), "x");
  expect(ui.getByText((rtl ? ar : en).signup.passwordTooShort)).toBeTruthy();
  fireEvent.changeText(ui.getByTestId("registration-confirmation"), "y");
  expect(ui.getByText((rtl ? ar : en).auth.passwordsDontMatch)).toBeTruthy();
  expect(ui.queryByTestId("registration-success")).toBeNull();
});
test("pending state shows progress and disables submission", () => {
  mockPending = true;
  const ui = render(<CreateAccountScreen />);
  expect(ui.getByText("Creating account…")).toBeTruthy();
  expect(ui.getByTestId("registration-submit").props.accessibilityState.disabled).toBe(true);
  fireEvent.press(ui.getByTestId("registration-submit"));
});
test.each([409, 400, 503, undefined])("API status %s produces visible feedback, never success", status => {
  const ui = render(<CreateAccountScreen />);
  act(() => mockOptions.onError({ status }));
  expect(ui.getByTestId("registration-api-error")).toBeTruthy();
  expect(ui.queryByTestId("registration-success")).toBeNull();
  if (!status || status >= 500) expect(ui.getByTestId("registration-submit").props.accessibilityState.disabled).toBe(true);
});
test("confirmed account with missing session shows success and prevents repeat registration", async () => {
  const ui = render(<CreateAccountScreen />);
  await act(async () => { await mockOptions.onSuccess({ user: { id: "mock-only" } }); });
  expect(ui.getByTestId("registration-success")).toBeTruthy();
  expect(ui.getByTestId("registration-api-error")).toBeTruthy();
  expect(ui.getByTestId("registration-submit").props.accessibilityState.disabled).toBe(true);
});

test("phone validation, independent visibility and explicit agreement", () => {
  const ui = render(<CreateAccountScreen />);
  expect(ui.getByTestId("registration-agreement").props.accessibilityState.checked).toBe(false);
  fireEvent.changeText(ui.getByTestId("registration-phone"), "invalid");
  fireEvent.press(ui.getByTestId("registration-submit"));
  expect(ui.getByTestId("registration-error-phone")).toBeTruthy();
  fireEvent.changeText(ui.getByTestId("registration-phone"), "+441234567890");
  expect(ui.queryByTestId("registration-error-phone")).toBeNull();
  fireEvent.press(ui.getByTestId("registration-visibility-password"));
  expect(ui.getByTestId("registration-password").props.secureTextEntry).toBe(false);
  expect(ui.getByTestId("registration-confirmation").props.secureTextEntry).toBe(true);
  fireEvent.press(ui.getByTestId("registration-agreement"));
  expect(ui.getByTestId("registration-agreement").props.accessibilityState.checked).toBe(true);
});

test.each([true, false])("registration Back uses prior screen or Home fallback, history=%s", hasHistory => {
  mockCanGoBack = hasHistory;
  mockBack.mockClear();
  const ui = render(<CreateAccountScreen showBack />);
  fireEvent.press(ui.getByTestId("registration-back"));
  if (hasHistory) expect(mockBack).toHaveBeenCalledTimes(1);
  else expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
});
