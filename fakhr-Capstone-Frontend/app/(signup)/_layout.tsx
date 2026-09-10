import { Stack } from "expo-router";
import React from "react";

/**
 * Signup stack (React Navigation Stack via Expo Router):
 * Create Account → User Type → Welcome Intro → Interests → Child Profile → Step 3.
 */
export default function SignupStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F9F9F9" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="user-type" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="child-profile-setup" />
      <Stack.Screen name="step-three" />
    </Stack>
  );
}
