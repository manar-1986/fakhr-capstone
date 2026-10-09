import { Stack } from "expo-router";

export default function ProfessionalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="professional-details" />
    </Stack>
  );
}
