import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import Profile from "../app/(tabs)/profile";
const mockRouter = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), canGoBack: () => false };
let mockUser: {id: string; name: string} | null = null;
let mockRTL = false;
jest.mock("expo-router", () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => ({}) }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: undefined }) }));
jest.mock("../api/users.api", () => ({ getCurrentUser: jest.fn() }));
jest.mock("../utils/authRedirect", () => ({ setPendingAuthHref: jest.fn() }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, loading: false }) }));
jest.mock("../context/LanguageContext", () => ({ useLanguage: () => ({ locale: mockRTL ? "ar" : "en", setLocale: jest.fn() }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr", tabRow: mockRTL ? "row-reverse" : "row" }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View", useSafeAreaInsets: () => ({ bottom: 0 }) }));
beforeEach(() => { jest.clearAllMocks(); mockUser=null; });
test.each([true,false])("Account shows only the three approved settings sections, RTL=%s", rtl => {
 mockRTL=rtl;
 for (const authenticated of [false,true]) {
  mockUser=authenticated ? {id:"synthetic-parent",name:"Test Parent"} : null;
  const ui=render(<Profile />);
  for(const label of rtl ? ["تفضيلات التطبيق","الأمان والخصوصية","إدارة الحساب"] : ["Application preferences","Security & privacy","Account management"]) expect(ui.getAllByText(label)).toHaveLength(1);
  for(const label of ["حسابك وخدماتك","Your account & services","Fakhr Guest","ضيف فخر","ui.myChildren","ui.myAppointments","ui.offers","ui.helpSupport","ui.aboutFakhr","auth.signOut"]) expect(ui.queryByText(label)).toBeNull();
  for(const id of ["language","notifications","accessibility","password","permissions","sharing","privacy","terms","export","delete"]) expect(ui.getAllByTestId('settings-'+id)).toHaveLength(1);
  fireEvent.press(ui.getByTestId("settings-delete"));
  expect(ui.getByText(rtl ? /حذف الحساب غير مفعّل إلى/ : /Account deletion remains inactive/)).toBeTruthy();
  expect(mockRouter.push).not.toHaveBeenCalled();
  ui.unmount();
 }
});
