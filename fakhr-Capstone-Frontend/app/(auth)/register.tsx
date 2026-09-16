import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "../../utils/secureStorage";
import { useState } from "react";
import {
  Alert,
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

// Design system colors
const colors = {
  bgApp: "#FAF9F6",
  bgCard: "rgba(255, 255, 255, 0.6)",
  primary: "#7FB77E",
  primaryHover: "#6A9E69",
  primarySoft: "#E8F0E8",
  text: "#2F2F2F",
  textSecondary: "#4A4A4A",
  textTertiary: "#8A8A8A",
  border: "rgba(0, 0, 0, 0.06)",
};

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      if (!data?.token || !data?.user) {
        Alert.alert(
          "Something went wrong",
          "We could not save your session. Please sign in with your new account."
        );
        router.replace("/(auth)/login");
        return;
      }
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync(
        USER_PROFILE_CACHE_KEY,
        JSON.stringify(data.user)
      );
      setUser(data.user);
      router.replace("/(tabs)/home");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to create account. Please try again.";
      Alert.alert("Registration Failed", errorMessage);
    },
  });

  const handleCreateAccount = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      Alert.alert("Error", "Please agree to the terms and conditions");
      return;
    }

    // Call register API
    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable
            style={({ pressed }) => [
              styles.authBack,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.authBackText}>←</Text>
          </Pressable>

          {/* Title - smaller, bold */}
          <Text style={styles.authTitle}>Create Account</Text>

          {/* Welcome - LARGE and prominent */}
          <Text style={styles.authWelcome}>Welcome to Fakhr</Text>

          {/* Subtext - smaller */}
          <Text style={styles.authSub}>
            Create your account and we&apos;ll support you step by step. You&apos;re not
            alone.
          </Text>

          {/* Form */}
          <View style={styles.authForm}>
            <View style={styles.authError} />

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.inputInWrap}
                  placeholder="Create a secure password"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.togglePassword,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setShowPassword((p) => !p)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.inputInWrap}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.togglePassword,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setShowConfirmPassword((p) => !p)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="For helpful reminders"
                placeholderTextColor={colors.textTertiary}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            {/* Checkbox and Terms */}
            <View style={styles.checkboxRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setAgreedToTerms((v) => !v)}
              >
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
              <View style={styles.checkboxLabelContainer}>
                <Text style={styles.checkboxLabel}>I agree to Fakhr </Text>
                <Pressable
                  onPress={() =>
                    Alert.alert("Community Guidelines", "Guidelines content")
                  }
                >
                  <Text style={styles.checkboxLink}>community guidelines</Text>
                </Pressable>
                <Text style={styles.checkboxLabel}> and </Text>
                <Pressable
                  onPress={() =>
                    Alert.alert("Privacy Policy", "Privacy policy content")
                  }
                >
                  <Text style={styles.checkboxLink}>privacy policy</Text>
                </Pressable>
                <Text style={styles.checkboxLabel}>.</Text>
              </View>
            </View>

            {/* Create Account Button */}
            <Pressable
              style={({ pressed }) => [
                styles.btnPrimary,
                (registerMutation.isPending || !agreedToTerms) && styles.btnPrimaryDisabled,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleCreateAccount}
              disabled={registerMutation.isPending || !agreedToTerms}
            >
              <Text style={styles.btnPrimaryText}>
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={({ pressed }) => pressed && { opacity: 0.7 }}
          >
            <Text style={styles.authFooter}>
              Already have an account?{" "}
              <Text style={styles.authFooterLink}>Sign in</Text>
            </Text>
          </Pressable>

          {/* Note */}
          <Text style={styles.authNote}>
            You can update your details anytime in settings
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    padding: 28,
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  // Back button
  authBack: {
    alignSelf: "flex-start",
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  authBackText: {
    fontSize: 20,
    color: colors.text,
  },
  // Title - smaller than welcome
  authTitle: {
    fontSize: 22.4, // 1.4rem
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    color: colors.text,
    letterSpacing: -0.448, // -0.02em
  },
  // Welcome - LARGE and prominent
  authWelcome: {
    fontSize: 24, // 1.5rem - LARGE
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: colors.text,
    letterSpacing: -0.48, // -0.02em
  },
  // Subtext - smaller
  authSub: {
    fontSize: 15.2, // 0.95rem
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 320,
    lineHeight: 22.8, // 1.5 line-height
  },
  // Form container
  authForm: {
    width: "100%",
    maxWidth: 360,
  },
  // Error (hidden)
  authError: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
  },
  // Form group
  formGroup: {
    marginBottom: 20, // Clear spacing between fields
  },
  // Label - bold, larger than body text
  label: {
    fontSize: 14.4, // 0.9rem
    fontWeight: "600",
    marginBottom: 8,
    color: colors.text,
  },
  optional: {
    fontWeight: "400",
    color: colors.textTertiary,
  },
  // Input - rounded corners
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12, // Rounded inputs
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16, // 1rem
    backgroundColor: colors.bgCard, // Semi-transparent
    color: colors.text,
  },
  // Input wrap for password
  inputWrap: {
    position: "relative",
  },
  inputInWrap: {
    width: "100%",
    paddingVertical: 14,
    paddingRight: 48,
    paddingLeft: 16,
    borderRadius: 12, // Rounded inputs
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16, // 1rem
    backgroundColor: colors.bgCard, // Semi-transparent
    color: colors.text,
  },
  // Password toggle
  togglePassword: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    borderRadius: 6,
    padding: 6,
  },
  // Checkbox row
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 26, // Clear spacing above button
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  checkboxLabelContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14.4, // 0.9rem
    color: colors.text,
    lineHeight: 20.88, // 1.45 line-height
  },
  checkboxLink: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  // Button - rounded, pill-like
  btnPrimary: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 24, // Rounded button
    alignItems: "center",
    marginBottom: 20, // Clear spacing below
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16, // 1rem
    fontWeight: "600",
  },
  btnPrimaryDisabled: {
    opacity: 0.6,
  },
  // Footer
  authFooter: {
    textAlign: "center",
    fontSize: 14.4, // 0.9rem
    color: colors.textSecondary,
  },
  authFooterLink: {
    color: colors.primary,
    fontWeight: "600",
  },
  // Note
  authNote: {
    fontSize: 12.8, // 0.8rem
    color: colors.textTertiary,
    marginTop: 12,
    textAlign: "center",
  },
});
