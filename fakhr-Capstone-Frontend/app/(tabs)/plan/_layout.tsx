import { Stack } from "expo-router";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { colors, typography } from "../../../theme";

export const unstable_settings = {
  initialRouteName: "index",
};

/**
 * Plan stack: weekly child plan is the tab root (index).
 * Nested English Progress / Check-in screens stay available from the plan itself.
 */
export default function PlanLayout() {
  const backButton = () => (
    <HeaderBackButton variant="inline" fallbackHref="/(tabs)/plan" />
  );

  return (
    <Stack
      initialRouteName="index"
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="task-details"
        options={{
          headerShown: true,
          headerTitle: "Task Details",
          headerLeft: backButton,
          headerTitleStyle: {
            fontSize: typography.h2,
            fontWeight: typography.weightBold,
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="check-in"
        options={{
          headerShown: true,
          headerTitle: "Daily Check-In",
          headerLeft: backButton,
          headerTitleStyle: {
            fontSize: typography.h2,
            fontWeight: typography.weightBold,
            color: colors.text,
          },
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          headerShown: true,
          headerTitle: "Progress",
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
