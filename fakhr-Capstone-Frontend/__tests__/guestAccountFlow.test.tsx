import React from "react";
import { fireEvent, render, renderHook, waitFor } from "@testing-library/react-native";
import UserType from "../app/(signup)/user-type";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { ACCOUNT_REQUIRED_HREF, consumePendingAuthHref, finishAuthRedirect, setPendingAuthHref, clearCancelledAuthDestination } from "../utils/authRedirect";
const mockRouter = { push: jest.fn(), replace: jest.fn(), navigate: jest.fn() };
let mockUser: { id: string; name: string } | null = null;
let mockLoading=false;
let mockRTL=false;
jest.mock("expo-router", () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => ({}) }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, loading: mockLoading }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../utils/welcome", () => ({ completeWelcome: jest.fn(async () => {}) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: () => null }));
beforeEach(() => { jest.clearAllMocks(); consumePendingAuthHref(); mockUser=null; mockLoading=false; });
test.each([false,true])("guest goes directly to Login and returns to intended feature, RTL=%s", rtl => {
 mockRTL=rtl; const {result}=renderHook(()=>useRequireAuth());
 expect(result.current.requireAuth("/(tabs)/profile/add-child")).toBe(false);
 expect(ACCOUNT_REQUIRED_HREF).toBe("/(auth)/login"); expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/login");
 finishAuthRedirect(mockRouter); expect(mockRouter.replace).toHaveBeenLastCalledWith("/(tabs)/profile/add-child"); expect(consumePendingAuthHref()).toBeNull();
});
test("authenticated users proceed without redirects; loading waits",()=>{
 mockUser={id:"parent",name:"Test"}; const {result,rerender}=renderHook(()=>useRequireAuth()); expect(result.current.requireAuth("/(tabs)/bookings")).toBe(true);
 mockUser=null;mockLoading=true;rerender(undefined);expect(result.current.requireAuth("/(tabs)/bookings")).toBe(false);expect(mockRouter.push).not.toHaveBeenCalled();expect(consumePendingAuthHref()).toBeNull();
});
test("destination parameters survive recovery and registration, and failed attempts do not consume them",()=>{
 const target={pathname:"/(tabs)/directory/booking" as const,params:{item:"synthetic-listing"}};setPendingAuthHref(target);
 clearCancelledAuthDestination("/login","/forgot-password");clearCancelledAuthDestination("/forgot-password","/login");clearCancelledAuthDestination("/login","/create-account");clearCancelledAuthDestination("/create-account","/privacy-policy");
 finishAuthRedirect(mockRouter);expect(mockRouter.replace).toHaveBeenLastCalledWith(target);
});
test.each(["/home","/profile","/resources"])("cancelling through Back to %s clears stale destination",path=>{
 setPendingAuthHref("/(tabs)/profile/add-child");clearCancelledAuthDestination("/login",path);finishAuthRedirect(mockRouter);expect(mockRouter.replace).toHaveBeenLastCalledWith("/(tabs)/home");
});
test("a new protected action replaces cancelled intent and login cannot be its own destination",()=>{
 setPendingAuthHref("/(tabs)/profile/add-child");clearCancelledAuthDestination("/login","/home");setPendingAuthHref("/(tabs)/plan");finishAuthRedirect(mockRouter);expect(mockRouter.replace).toHaveBeenLastCalledWith("/(tabs)/plan");
 setPendingAuthHref("/(auth)/login");finishAuthRedirect(mockRouter);expect(mockRouter.replace).toHaveBeenLastCalledWith("/(tabs)/home");
});
test("guest onboarding still completes into Home",async()=>{const ui=render(<UserType/>);fireEvent.press(ui.getByText("ui.parent"));await waitFor(()=>expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/home"));});
