jest.mock("../i18n",()=>({changeAppLanguage:jest.fn().mockResolvedValue(undefined)}));
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";
import Login from "../app/(auth)/login";
import ForgotPassword from "../app/(auth)/forgot-password";
import { CreateAccountScreen } from "../components/screens/CreateAccountScreen";
import { AppNavigationShell } from "../components/navigation/AppNavigationShell";

let mockRTL = false, mockPath = "/login", mockCanBack = true;
const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => mockCanBack };
jest.mock("expo-router", () => ({ useGlobalSearchParams: () => ({}), useRouter: () => mockRouter, usePathname: () => mockPath, useSegments: () => ["(auth)"] }));
jest.mock("../api/auth.api", () => ({ login: jest.fn(), register: jest.fn(), forgotPassword: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useMutation: () => ({ mutate: jest.fn(), isPending: false }) }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ setUser: jest.fn() }) }));
jest.mock("../utils/secureStorage", () => ({ setItemAsync: jest.fn() }));
jest.mock("../components/home/HomeDrawer", () => () => null);
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView", SafeAreaProvider: "SafeAreaProvider", useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key === "common.back" ? mockRTL ? "رجوع" : "Back" : key }) }));
const originalOS = Platform.OS;
afterEach(() => { Platform.OS = originalOS; });

test.each(["web", "ios", "android"] as const)("auth navigation has one Back button in both languages on %s", os => {
  Platform.OS = os;
  for (const rtl of [false, true]) {
    jest.clearAllMocks(); mockRTL = rtl; mockPath = "/login"; mockCanBack = true;
    const ui = render(<AppNavigationShell><Login /></AppNavigationShell>);
    expect(ui.getAllByRole("button", { name: rtl ? "رجوع" : "Back" })).toHaveLength(1);
    expect(ui.queryByText("auth.dontHaveAccount")).toBeNull();
    expect(ui.queryByText("auth.createAccount")).toBeNull();
    fireEvent.press(ui.getByText("auth.forgotPassword"));
    expect(mockRouter.push).not.toHaveBeenCalled();
    fireEvent.press(ui.getByRole("link", { name: rtl ? "إنشاء حساب جديد" : "Create New Account" }));
    expect(mockRouter.push).toHaveBeenLastCalledWith("/(signup)/create-account");
    mockPath = "/create-account";
    ui.rerender(<AppNavigationShell><CreateAccountScreen /></AppNavigationShell>);
    expect(ui.getAllByRole("button", { name: rtl ? "رجوع" : "Back" })).toHaveLength(1);
    fireEvent.press(ui.getByTestId("app-header-back"));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    mockCanBack = false;
    fireEvent.press(ui.getByTestId("app-header-back"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/home");
    mockPath = "/forgot-password";
    ui.rerender(<AppNavigationShell><ForgotPassword /></AppNavigationShell>);
    expect(ui.getAllByRole("button", { name: rtl ? "رجوع" : "Back" })).toHaveLength(1);
    expect(ui.queryByText("Back to Login")).toBeNull();
    ui.unmount();
  }
});
