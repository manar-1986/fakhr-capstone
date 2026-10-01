import { Stack } from "expo-router";
import React from "react";

/**
 * Fakhr Community: API-backed feed, composer and discussions. Legacy advice route retained for existing callers.
 */
export default function CommunityStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F9F9F9" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="post" />
      <Stack.Screen name="advice" />
    </Stack>
  );
}
