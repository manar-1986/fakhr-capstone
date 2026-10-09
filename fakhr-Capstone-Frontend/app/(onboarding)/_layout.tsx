import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="landing" />
      <Stack.Screen name="parent-profile" />
      <Stack.Screen name="child-basic" />
      <Stack.Screen name="child-medical" />
      <Stack.Screen name="child-diagnosis" />
      <Stack.Screen name="child-challenges" />
      <Stack.Screen name="child-goals" />
      <Stack.Screen name="generate-plan" />
    </Stack>
  );
}
