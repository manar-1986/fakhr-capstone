import { Stack } from "expo-router";

/**
 * Auth group: app/(auth)/
 * - login: Sign in → on success redirects to (tabs)/home
 * - register: Create account → on success redirects to (auth)/login
 * - forgot-password: Reset password flow
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
