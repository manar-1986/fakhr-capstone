import { Stack } from "expo-router";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { colors, typography } from "../../../theme";

/**
 * Resources Stack Layout — Documents screens with back button
 */
export default function ResourcesLayout() {
  const backButton = () => (
    <HeaderBackButton variant="inline" fallbackHref="/(tabs)/resources" />
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
          headerShown: false,
          headerTitle: "Content Details",
          headerTitleAlign: "center",
          headerLeft: backButton,
          headerTitleStyle: {
            fontSize: typography.title,
            fontWeight: typography.weightSemibold,
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
        name="disability-services"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="resource-content"
        options={{
          headerShown: false,
          headerTitle: "",
          headerTitleAlign: "center",
          headerLeft: backButton,
          headerTitleStyle: {
            fontSize: typography.title,
            fontWeight: typography.weightSemibold,
            color: colors.text,
          },
        }}
      />
    </Stack>
  );
}
