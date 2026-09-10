import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function ProfileLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-child-profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="logout" />
      <Stack.Screen name="manage-children" />
      <Stack.Screen name="add-child" />
      <Stack.Screen name="child-details" />
      <Stack.Screen name="edit-child" />
    </Stack>
  );
}
