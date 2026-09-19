import { Stack } from "expo-router";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { colors, typography } from "../../../theme";

/**
 * Directory stack: Centers & Professionals hub (index), booking flow, and legacy directory screens.
 */
export default function DirectoryLayout() {
  const backButton = () => (
    <HeaderBackButton variant="inline" fallbackHref="/(tabs)/home" />
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="schools" options={{ headerShown: false }} />
      <Stack.Screen name="school-details" options={{ headerShown: false }} />
      <Stack.Screen name="booking" options={{ headerShown: false }} />
      <Stack.Screen name="centers" options={{ headerShown: false }} />
      <Stack.Screen name="professionals" options={{ headerShown: false }} />
      <Stack.Screen
        name="center-details"
        options={{
          headerShown: true,
          headerTitle: "Center Details",
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
        name="professional-details"
        options={{
          headerShown: true,
          headerTitle: "Professional Details",
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
        name="helpCenter"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
