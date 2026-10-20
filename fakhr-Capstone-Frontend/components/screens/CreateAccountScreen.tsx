import { controls as sharedControls } from "../../theme/controls";
import { colors as fakhrColors } from "../../theme/colors";
import { Text, TextInput, ScrollView } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image as VectorImage } from "expo-image";
import * as SecureStore from "../../utils/secureStorage";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from "../../api/auth.api";
import { useAuth, USER_PROFILE_CACHE_KEY } from "../../context/AuthContext";
import { consumePendingAuthHref } from "../../utils/authRedirect";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { HeaderBackButton } from "../navigation/HeaderBackButton";
import { colors as palette } from "../../theme";

const colors = {
  bg: palette.background,
  primary: fakhrColors.primary,
  text: fakhrColors.text,
  placeholder: fakhrColors.textMuted,
  border: fakhrColors.border,
  white: palette.white,
};

export function CreateAccountScreen({ registrationDestination = "/(signup)/user-type", showBack = true }: { showBack?: boolean; registrationDestination?: "/(signup)/user-type" | "/(tabs)/home" }) {
  const { t } = useTranslation();
  const { align, dir, isRTL } = useI18nLayout();
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validated, setValidated] = useState(false);
  const [apiError, setApiError] = useState<"duplicate" | "failed" | "uncertain" | "session" | null>(null);
  const [created, setCreated] = useState(false);
  const submitting = useRef(false);
  const copy = (ar: string, en: string) => isRTL ? ar : en;
  const errors = {
    name: !name.trim() ? copy("يرجى إدخال الاسم الكامل", "Please enter your full name") : "",
    email: !email.trim() ? copy("يرجى إدخال البريد الإلكتروني", "Please enter your email address") : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? t("signup.invalidEmail") : "",
    phone: phone.trim() && !/^\+?[1-9][0-9]{6,14}$/.test(phone.replace(/[ ()-]/g, "")) ? copy("يرجى إدخال رقم هاتف صالح", "Please enter a valid phone number") : "",
    password: !password ? copy("يرجى إدخال كلمة المرور", "Please enter a password") : password.length < 6 ? t("signup.passwordTooShort") : "",
    confirmation: !confirmPassword ? copy("يرجى تأكيد كلمة المرور", "Please confirm your password") : password !== confirmPassword ? t("auth.passwordsDontMatch") : "",
    terms: !agreedToTerms ? t("signup.mustAgreeToTerms") : "",
  };
  const fieldError = (field: keyof typeof errors) => validated && !!errors[field] ?
    <Text testID={`registration-error-${field}`} accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { textAlign: align, writingDirection: dir }]}>{errors[field]}</Text> : null;
  const apiMessage = apiError === "duplicate" ? copy("هذا البريد مسجل بالفعل. يرجى تسجيل الدخول.", "This email is already registered. Please sign in.")
    : apiError === "session" ? t("signup.sessionError")
    : apiError === "uncertain" ? copy("تعذر تأكيد نتيجة التسجيل. تحقق من وجود الحساب قبل المحاولة مجدداً.", "Could not confirm registration. Check whether the account exists before trying again.")
    : copy("تعذر إنشاء الحساب. يرجى المحاولة لاحقاً أو التواصل مع الدعم.", "Registration failed. Please try later or contact support.");

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      setCreated(!!data?.user);
      if (!data?.token || !data?.user) {
        setApiError("session");
        return;
      }
      try {
        await signIn(data.token, data.user);
        const pending = consumePendingAuthHref();
        router.replace(pending ?? registrationDestination);
      } catch {
        // Creation succeeded: use the existing sign-in link, not another registration.
        setApiError("session");
      }
    },
    onError: (error: unknown) => {
      const err = error as { status?: number; response?: { status?: number } };
      const status = err?.status ?? err?.response?.status;
      setApiError(status === 409 ? "duplicate" : !status || status >= 500 ? "uncertain" : "failed");
    },
    onSettled: () => { submitting.current = false; },
  });
  const disabled = registerMutation.isPending || created || apiError === "uncertain" || apiError === "session";

  const handleSignUp = () => {
    if (disabled || submitting.current) return;
    setValidated(true);
    if (Object.values(errors).some(Boolean)) return;
    setApiError(null);
    submitting.current = true;
    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  };

  const rowDirection = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const fields = [
    { key: "name", label: t("auth.fullName"), placeholder: copy("أدخل اسمك الكامل", "Enter your full name"), icon: "person-outline", value: name, change: setName },
    { key: "email", label: t("auth.email"), placeholder: copy("أدخل بريدك الإلكتروني", "Enter your email"), icon: "mail-outline", value: email, change: setEmail },
    { key: "phone", label: copy("رقم الهاتف", "Phone number"), placeholder: copy("أدخل رقم هاتفك", "Enter your phone number"), icon: "call-outline", value: phone, change: setPhone },
    { key: "password", label: t("auth.password"), placeholder: copy("أدخل كلمة المرور", "Enter your password"), icon: "lock-closed-outline", value: password, change: setPassword },
    { key: "confirmation", label: t("auth.confirmPassword"), placeholder: copy("أعد إدخال كلمة المرور", "Re-enter your password"), icon: "lock-closed-outline", value: confirmPassword, change: setConfirmPassword },
  ] as const;
  return <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
    <StatusBar style="dark" />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
        {showBack && <HeaderBackButton testID="registration-back" />}
        <Image source={require("../../assets/images/fakhr-wordmark-blue.png")} style={styles.logo} resizeMode="contain" accessibilityLabel={t("ui.brand")} />
        </View>
        <Text accessibilityRole="header" style={styles.heading}>{copy("إنشاء حساب", "Create Account")}</Text>
        <Text style={styles.subtitle}>{copy("ابدأ رحلتك مع فخر", "Start your journey with Fakhr")}</Text>
        {fields.map(field => <View key={field.key}>
          <View style={[styles.field, rowDirection]}>
            <View style={styles.icon}><Ionicons name={field.icon} size={23} color={colors.primary} /></View>
            <View style={styles.fieldText}>
              <Text style={[styles.label, { textAlign: align }]}>{field.label}</Text>
              <TextInput testID={`registration-${field.key}`} accessibilityLabel={field.label} editable={!disabled} style={[styles.input, { textAlign: align }]} placeholder={field.placeholder} placeholderTextColor={colors.placeholder} value={field.value} onChangeText={field.change} keyboardType={field.key === "email" ? "email-address" : field.key === "phone" ? "phone-pad" : "default"} autoCapitalize={field.key === "name" ? "words" : "none"} autoCorrect={false} secureTextEntry={field.key === "password" ? !showPassword : field.key === "confirmation" ? !showConfirmation : false} />
            </View>
            {field.key === "phone" && !phone.startsWith("+") && <Text style={styles.countryCode}>+965</Text>}
            {(field.key === "password" || field.key === "confirmation") && <Pressable testID={`registration-visibility-${field.key}`} accessibilityRole="button" accessibilityLabel={copy("إظهار أو إخفاء كلمة المرور", "Show or hide password")} accessibilityState={{ checked: field.key === "password" ? showPassword : showConfirmation }} onPress={() => field.key === "password" ? setShowPassword(!showPassword) : setShowConfirmation(!showConfirmation)} style={styles.eye}><Ionicons name={(field.key === "password" ? showPassword : showConfirmation) ? "eye-off-outline" : "eye-outline"} size={23} color={colors.primary} /></Pressable>}
          </View>
          {fieldError(field.key)}
          {field.key === "phone" && <Text style={[styles.hint, { textAlign: align }]}>{copy("اختياري · لا يُحفظ رقم الهاتف في الحساب حالياً", "Optional · Phone numbers are not saved to accounts yet")}</Text>}
        </View>)}
        <View style={[styles.termsRow, rowDirection]}>
          <Pressable testID="registration-agreement" onPress={() => setAgreedToTerms(value => !value)} disabled={disabled} accessibilityRole="checkbox" accessibilityState={{ checked: agreedToTerms, disabled }} accessibilityLabel={t("copy.agreeTerms")} style={styles.checkTarget}><View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>{agreedToTerms && <Ionicons name="checkmark" size={16} color="white" />}</View></Pressable>
          <View style={[styles.agreementText, rowDirection]}><Text style={styles.termsText}>{copy("أوافق على", "I agree to")}</Text><Pressable testID="registration-terms" accessibilityRole="link" onPress={() => router.push({ pathname: "/(auth)/terms-conditions", params: { fromRegistration: "1" } })}><Text style={styles.link}>{copy("الشروط والأحكام", "Terms & Conditions")}</Text></Pressable><Text style={styles.termsText}>{copy("و", "and")}</Text><Pressable testID="registration-privacy" accessibilityRole="link" onPress={() => router.push({ pathname: "/(auth)/privacy-policy", params: { fromRegistration: "1" } })}><Text style={styles.link}>{copy("سياسة الخصوصية", "Privacy Policy")}</Text></Pressable></View>
        </View>
        {fieldError("terms")}
        <Text style={[styles.hint, { textAlign: align }]}>{copy("المستندات القانونية مسودات بانتظار المراجعة والاعتماد.", "Legal documents are drafts awaiting review and approval.")}</Text>
        {apiError && <Text testID="registration-api-error" accessibilityRole="alert" accessibilityLiveRegion="assertive" style={[styles.error, { textAlign: align, writingDirection: dir }]}>{apiMessage}</Text>}
        {created && <Text testID="registration-success" accessibilityLiveRegion="polite" style={styles.status}>{copy("تم إنشاء الحساب بنجاح.", "Account created successfully.")}</Text>}
        <Pressable testID="registration-submit" style={({ pressed }) => [styles.btnPrimary, disabled && { opacity: .55 }, pressed && { opacity: .8 }]} onPress={handleSignUp} disabled={disabled} accessibilityState={{ disabled, busy: registerMutation.isPending }} accessibilityRole="button" accessibilityLabel={t("auth.createAccount")}>
          {registerMutation.isPending ? <View style={styles.loadingRow}><ActivityIndicator color="white" /><Text style={styles.btnPrimaryText}>{copy("جارٍ إنشاء الحساب…", "Creating account…")}</Text></View> : <View style={[styles.loadingRow, rowDirection]}><Text style={styles.btnPrimaryText}>{t("auth.createAccount")}</Text><Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} color="white" size={23} /></View>}
        </Pressable>
        <View style={[styles.footer, rowDirection]}><Text style={styles.termsText}>{t("copy.haveAccount")}</Text><Pressable accessibilityRole="link" onPress={() => router.push("/(auth)/login")}><Text style={styles.link}>{t("signup.logIn")}</Text></Pressable></View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: fakhrColors.background }, flex: { flex: 1 }, scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 30, width: "100%", maxWidth: 430, alignSelf: "center" }, logo: { width: 54, height: 70, alignSelf: "center", marginBottom: 14 }, heading: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.text, textAlign: "center" }, subtitle: { fontSize: typography.body, color: colors.placeholder, textAlign: "center", marginBottom: 23 },
  field: { minHeight: 72, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 9, marginBottom: 12 }, icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: fakhrColors.backgroundWash, alignItems: "center", justifyContent: "center" }, fieldText: { flex: 1, minWidth: 0 }, label: { fontSize: typography.body, fontWeight: typography.weightRegular, color: colors.text }, input: { padding: 0, minHeight: 27, fontSize: typography.body, color: colors.text, width: "100%" }, countryCode: { fontSize: typography.cardTitle, color: colors.text, writingDirection: "ltr", paddingHorizontal: 5 }, eye: { width: 40, minHeight: 44, justifyContent: "center", alignItems: "center" },
  error: { color: "#B54259", fontSize: typography.helper, marginBottom: 12 }, hint: { fontSize: typography.helper, color: colors.placeholder, marginBottom: 12 }, status: { color: colors.text, fontSize: typography.body, marginBottom: 12 }, termsRow: { alignItems: "center", gap: 4, marginTop: 2, marginBottom: 8 }, checkTarget: { width: 42, minHeight: 44, alignItems: "center", justifyContent: "center" }, checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center" }, checkboxChecked: { backgroundColor: colors.primary }, agreementText: { flex: 1, flexWrap: "wrap", alignItems: "center", gap: 4 }, termsText: { fontSize: typography.body, color: colors.placeholder }, link: { fontSize: typography.button, color: colors.text, textDecorationLine: "underline" },
  btnPrimary: {  padding: 12,  backgroundColor: colors.primary, borderTopWidth: 1, borderTopColor: fakhrColors.secondary,   marginBottom: 18 , ...sharedControls.button }, btnPrimaryText: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium }, loadingRow: { flexDirection: "row", gap: 14, alignItems: "center", justifyContent: "center" }, footer: { justifyContent: "center", flexWrap: "wrap", gap: 6 },
});



