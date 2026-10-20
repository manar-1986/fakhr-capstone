import MinimumUnavailable from '../../components/screens/MinimumUnavailable';
import { unavailableRoute } from '../../utils/minimumRelease';
import { Redirect, usePathname, Stack } from "expo-router";

export default function OnboardingLayout() {
  const pathname = usePathname();
  if (unavailableRoute(pathname)) return <MinimumUnavailable />;
  const legacyForms = ['parent-profile','child-basic','child-medical','child-diagnosis','child-challenges','child-goals'];
  if (legacyForms.includes(pathname.split('/').pop() ?? '')) return <Redirect href="/(tabs)/profile/add-child" />;
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
