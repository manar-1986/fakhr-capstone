import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { colors, typography } from "../../../theme";

/**
 * Resources Stack Layout — Documents screens with back button
 */
export default function ResourcesLayout() {
  const router = useRouter();
  const backButton = () => (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 8 })}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={colors.primary} />
    </Pressable>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerBackTitle: "",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="content-details"
        options={{
          headerShown: true,
          headerTitle: "Content Details",
          headerTitleAlign: "center",
          headerLeft: backButton,
          headerTitleStyle: {
            fontSize: typography.h2,
            fontWeight: typography.weightBold,
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="disability-details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="resource-content"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTitleAlign: "center",
          headerLeft: backButton,
          headerTitleStyle: {
            fontSize: typography.h2,
            fontWeight: typography.weightBold,
            color: colors.text,
          },
        }}
      />
    </Stack>
  );
}
