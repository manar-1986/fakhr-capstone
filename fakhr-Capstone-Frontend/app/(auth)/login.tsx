import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as SecureStore from "../../utils/secureStorage";
import { useState } from "react";
import {
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
import { login } from "../../api/auth.api";
import { useAuth, USER_PROFILE_CACHE_KEY } from "../../context/AuthContext";

const colors = {
  bg: "#FFFFFF",
  primary: "#6E81BB",
  text: "#1E2030",
  textMuted: "#8A8D99",
  placeholder: "#A8ABB4",
  border: "#E6E6EA",
  socialBorder: "#E0E0E4",
  forgot: "#6A6B82",
  white: "#FFFFFF",
};

/** RN Alert.alert is a no-op on web, so failed login looked like the button did nothing. */
function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data.token) {
        await SecureStore.setItemAsync("token", data.token);
      }
      if (data.user) {
        await SecureStore.setItemAsync(
          USER_PROFILE_CACHE_KEY,
          JSON.stringify(data.user)
        );
        setUser(data.user);
      }
      router.replace("/(tabs)/home");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || "Invalid credentials. Please try again.";
      notify("Login Failed", errorMessage);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      notify("خطأ", "يرجى تعبئة جميع الحقول");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleBack = () => {
    try {
      if (typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      /* fall through */
    }
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="رجوع"
            >
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
            <Image
              source={require("../../assets/images/fakhr-wordmark-blue.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="فخر"
            />
          </View>

          <Text style={styles.heading}>مرحباً بعودتك</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />

            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="كلمة المرور"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                textAlign="right"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.togglePassword,
                  pressed && styles.pressed,
                ]}
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                accessibilityLabel={
                  isPasswordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.placeholder}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              style={({ pressed }) => [
                styles.forgotWrap,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="نسيت كلمة المرور؟"
            >
              <Text style={styles.forgotPassword}>نسيت كلمة المرور؟</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btnPrimary,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="تسجيل الدخول"
            >
              <Text style={styles.btnPrimaryText}>
                {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Text>
            </Pressable>

            <Text style={styles.dividerText}>أو الدخول عبر</Text>

            <View style={styles.socialRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  Alert.alert("Google", "تسجيل الدخول عبر Google غير متاح حالياً.")
                }
                accessibilityRole="button"
                accessibilityLabel="Google"
              >
                <Text style={styles.googleG}>G</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  Alert.alert("Apple", "تسجيل الدخول عبر Apple غير متاح حالياً.")
                }
                accessibilityRole="button"
                accessibilityLabel="Apple"
              >
                <Ionicons name="logo-apple" size={26} color="#111111" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.socialBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  Alert.alert("الحساب", "تسجيل الدخول عبر هذا الخيار غير متاح حالياً.")
                }
                accessibilityRole="button"
                accessibilityLabel="تسجيل الدخول بالحساب"
              >
                <View style={styles.personBadge}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            <Text style={styles.footerMuted}>ليس لديك حساب؟ </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(signup)")}
              accessibilityRole="link"
              accessibilityLabel="إنشاء حساب"
            >
              إنشاء حساب
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
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 28,
    maxWidth: 430,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logo: {
    width: 72,
    height: 96,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    writingDirection: "rtl",
    marginBottom: 28,
  },
  form: {
    width: "100%",
  },
  input: {
    width: "100%",
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
    marginBottom: 16,
  },
  passwordWrap: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    width: "100%",
    minHeight: 56,
    paddingVertical: 16,
    paddingRight: 18,
    paddingLeft: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
  },
  togglePassword: {
    position: "absolute",
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  forgotWrap: {
    width: "100%",
    marginBottom: 20,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.forgot,
    textAlign: "right",
    writingDirection: "rtl",
  },
  btnPrimary: {
    width: "100%",
    minHeight: 56,
    backgroundColor: colors.primary,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  dividerText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
    writingDirection: "rtl",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    marginBottom: 36,
  },
  socialBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: colors.socialBorder,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 26,
    fontWeight: "700",
    color: "#4285F4",
  },
  personBadge: {
    width: 26,
    height: 30,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
    opacity: 0.7,
  },
});
