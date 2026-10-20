jest.mock("../i18n",()=>({changeAppLanguage:jest.fn().mockResolvedValue(undefined)}));
import React from "react";
import {StyleSheet} from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import Screen from "../components/screens/PasswordRecoveryScreen";
import ResetRoute from "../app/(auth)/reset-password";
import { resetPassword, forgotPassword } from "../api/auth.api";
import { validResetToken, validNewPassword } from "../utils/passwordReset";
import { isAuthFlowPath } from "../utils/authRedirect";
let mockRTL=false, mockInitialized=true, mockToken: unknown="a".repeat(64);
const mockRouter={replace:jest.fn(),setParams:jest.fn()};
jest.mock("react-i18next",()=>({useTranslation:()=>({i18n:{changeLanguage:jest.fn()}})}));
jest.mock("expo-router",()=>({useRouter:()=>mockRouter,useLocalSearchParams:()=>({token:mockToken})}));
jest.mock("../api/auth.api",()=>({resetPassword:jest.fn(),forgotPassword:jest.fn()}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,initialized:mockInitialized})}));
jest.mock("react-native-safe-area-context",()=>({SafeAreaView:"SafeAreaView"}));
beforeEach(()=>{jest.clearAllMocks();mockRTL=false;mockInitialized=true;mockToken="a".repeat(64);});
function fill(ui:ReturnType<typeof render>){fireEvent.changeText(ui.getByLabelText("New password"),"SafePassword123!");fireEvent.changeText(ui.getByLabelText("Confirm password"),"SafePassword123!");}

test.each([false,true])('first form paint waits for saved language RTL=%s',rtl=>{
 mockInitialized=false;mockRTL=!rtl;const ui=render(<Screen reset token={'a'.repeat(64)}/>);
 expect(ui.queryByRole('header')).toBeNull();
 mockInitialized=true;mockRTL=rtl;ui.rerender(<Screen reset token={'a'.repeat(64)}/>);
 expect(ui.getByLabelText(rtl?'كلمة المرور الجديدة':'New password')).toBeTruthy();
});
test('English and Arabic login divider translations exist',()=>{
 expect(require('../i18n/locales/en.json').ui.orSignInWith).toBe('Or sign in with');
 expect(require('../i18n/locales/ar.json').ui.orSignInWith).toBe('أو تسجيل الدخول باستخدام');
});
test.each([false,true])("public reset route supports RTL=%s",rtl=>{mockRTL=rtl;const ui=render(<ResetRoute/>);expect(ui.getByLabelText(rtl?"كلمة المرور الجديدة":"New password")).toBeTruthy();expect(StyleSheet.flatten(ui.getByLabelText(rtl?"كلمة المرور الجديدة":"New password").props.style)).toEqual(expect.objectContaining({writingDirection:rtl?"rtl":"ltr"}));});
test.each([undefined,"bad",["a".repeat(64),"b".repeat(64)]])("rejects malformed or duplicate tokens %s",token=>{mockToken=token;const ui=render(<ResetRoute/>);expect(ui.queryByLabelText("New password")).toBeNull();expect(ui.getByText(/invalid, expired/)).toBeTruthy();expect(resetPassword).not.toHaveBeenCalled();});
test("confirmation mismatch prevents request",()=>{const ui=render(<Screen reset token={"a".repeat(64)}/>);fireEvent.changeText(ui.getByLabelText("New password"),"SafePassword123!");fireEvent.press(ui.getByRole("button",{name:"Reset Password"}));expect(ui.getByText("Passwords do not match.")).toBeTruthy();expect(resetPassword).not.toHaveBeenCalled();});
test("single pending request, success clears fields, manual login",async()=>{let resolve!:()=>void;(resetPassword as jest.Mock).mockImplementation(()=>new Promise<void>(r=>resolve=r));const ui=render(<Screen reset token={"a".repeat(64)}/>);fill(ui);fireEvent.press(ui.getByRole("button",{name:"Reset Password"}));fireEvent.press(ui.getByRole("button",{name:"Reset Password"}));expect(resetPassword).toHaveBeenCalledTimes(1);expect(resetPassword).toHaveBeenCalledWith({token:"a".repeat(64),password:"SafePassword123!"});await act(async()=>resolve());expect(ui.queryByLabelText("New password")).toBeNull();expect(mockRouter.replace).not.toHaveBeenCalled();fireEvent.press(ui.getByText("Return to Login"));expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/login");});
test.each([[400,"invalid, expired"],[429,"Too many requests"],[500,"Check your connection"],[undefined,"Check your connection"]])("safe localized API error %s",async(status,message)=>{(resetPassword as jest.Mock).mockRejectedValue({status,message:"private token detail"});const ui=render(<Screen reset token={"a".repeat(64)}/>);fill(ui);fireEvent.press(ui.getByRole("button",{name:"Reset Password"}));await waitFor(()=>expect(ui.getByText(new RegExp(String(message)))).toBeTruthy());expect(ui.queryByText(/private token detail/)).toBeNull();});
test("language switch preserves entered values",()=>{const ui=render(<Screen reset token={"a".repeat(64)}/>);fill(ui);fireEvent.press(ui.getByText("العربية"));expect(ui.getByLabelText("كلمة المرور الجديدة").props.value).toBe("SafePassword123!");expect(ui.getByText("إظهار كلمات المرور")).toBeTruthy();});
test("forgot password gives neutral confirmation without leaving screen",async()=>{(forgotPassword as jest.Mock).mockResolvedValue({});const ui=render(<Screen/>);fireEvent.changeText(ui.getByLabelText("Email address"),"parent@example.invalid");fireEvent.press(ui.getByRole("button",{name:"Send Reset Link"}));await waitFor(()=>expect(ui.getByText(/If this email is registered/)).toBeTruthy());expect(mockRouter.replace).not.toHaveBeenCalled();});
test("recovery route retains auth-flow navigation and validates UTF8 byte limit",()=>{expect(isAuthFlowPath("/(auth)/reset-password?token=redacted")).toBe(true);expect(validResetToken("a".repeat(64))).toBe(true);expect(validNewPassword("😀".repeat(19))).toBe(false);expect(validNewPassword("12345")).toBe(false);});

 test.each([false,true])("reset primary action uses approved accessible theme RTL=%s", rtl=>{
 mockRTL=rtl;const ui=render(<Screen reset token={"a".repeat(64)}/>);
 const label=rtl?"إعادة تعيين كلمة المرور":"Reset Password";
 expect(StyleSheet.flatten(ui.getByRole("button",{name:label}).props.style)).toEqual(expect.objectContaining({backgroundColor:"#6E7CAF",borderColor:"#6E7CAF",minHeight:48,padding:12}));
 const labels=ui.getAllByText(label);
 expect(StyleSheet.flatten(labels[labels.length-1].props.style)).toEqual(expect.objectContaining({color:"#0B093B"}));
 expect(StyleSheet.flatten(ui.getByTestId("recovery-card").props.style).backgroundColor).toBe("#EBF1FD");
 });

test.each([false,true])("approved transparent logo is shared by recovery screens RTL=%s",rtl=>{
 mockRTL=rtl;
 const ui=render(<Screen reset token={"a".repeat(64)}/>);
 const logo=ui.getByLabelText("Fakhr");
 expect(logo.props.source).toEqual(require("../assets/images/fakhr-wordmark-blue-transparent.png"));
 expect(logo.props.resizeMode).toBe("contain");
 expect(StyleSheet.flatten(logo.props.style)).toEqual(expect.objectContaining({width:100,height:64}));
 ui.unmount();
 const forgot=render(<Screen/>);
 expect(forgot.getByLabelText("Fakhr").props.source).toEqual(require("../assets/images/fakhr-wordmark-blue-transparent.png"));
});
