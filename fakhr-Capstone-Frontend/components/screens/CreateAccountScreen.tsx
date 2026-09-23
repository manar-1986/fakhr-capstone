import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "../../utils/secureStorage";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { register } from "../../api/auth.api";
import { useAuth, USER_PROFILE_CACHE_KEY } from "../../context/AuthContext";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors as palette } from "../../theme";

const colors = {
  bg: palette.background,
  primary: palette.primary,
  text: palette.text,
  placeholder: palette.textLight,
  border: palette.border,
  white: palette.white,
};

export function CreateAccountScreen() {
  const { t } = useTranslation();
  const { align } = useI18nLayout();
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      if (!data?.token || !data?.user) {
        Alert.alert(t("signup.sessionErrorTitle"), t("signup.sessionError"));
        router.replace("/(auth)/login");
        return;
      }
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync(
        USER_PROFILE_CACHE_KEY,
        JSON.stringify(data.user)
      );
      setUser(data.user);
      router.replace("/(signup)/user-type");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        t("signup.createAccountFailed");
      Alert.alert(t("signup.registrationFailed"), msg);
    },
  });

  const handleSignUp = () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(t("common.error"), t("signup.fillAllFields"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t("common.error"), t("signup.invalidEmail"));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t("common.error"), t("signup.passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), t("auth.passwordsDontMatch"));
      return;
    }
    if (!agreedToTerms) {
      Alert.alert(t("common.error"), t("signup.mustAgreeToTerms"));
      return;
    }
    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../assets/images/fakhr-wordmark-blue.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel={t("ui.brand")}
          />

          <Text style={styles.heading}>{t("signup.headerTitle")}</Text>

          <TextInput
            style={styles.input}
            placeholder={t("auth.fullName")}
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            textAlign={align}
          />

          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textAlign={align}
          />

          <TextInput
            style={styles.input}
            placeholder={t("copy.mobileNumber")}
            placeholderTextColor={colors.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign={align}
          />

          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign={align}
          />

          <TextInput
            style={styles.input}
            placeholder={t("auth.confirmPassword")}
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign={align}
          />

          <Pressable
            style={({ pressed }) => [styles.termsRow, pressed && styles.pressed]}
            onPress={() => setAgreedToTerms((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel={t("copy.agreeTerms")}
          >
            <Text style={styles.termsText}>{t("copy.agreeTerms")}</Text>
            <View
              style={[
                styles.checkbox,
                agreedToTerms && styles.checkboxChecked,
              ]}
            >
              {agreedToTerms ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : null}
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              registerMutation.isPending && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleSignUp}
            disabled={registerMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel={t("auth.createAccount")}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPrimaryText}>{t("auth.createAccount")}</Text>
            )}
          </Pressable>

          <Text style={styles.footer}>
            <Text style={styles.footerMuted}>{t("copy.haveAccount")} </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/login")}
              accessibilityRole="link"
              accessibilityLabel={t("signup.logIn")}
            >
              {t("signup.logIn")}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
    maxWidth: 430,
    width: "100%",
    alignSelf: "center",
  },
  logo: {
    width: 72,
    height: 88,
    alignSelf: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    writingDirection: "rtl",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    minHeight: 54,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
    marginBottom: 12,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
    marginBottom: 18,
  },
  termsText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    writingDirection: "rtl",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnPrimary: {
    width: "100%",
    minHeight: 56,
    backgroundColor: colors.primary,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  footer: {
    marginTop: "auto",
    textAlign: "center",
    writingDirection: "rtl",
  },
  footerMuted: {
    fontSize: 15,
    color: colors.text,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  pressed: {
    opacity: 0.75,
  },
});
