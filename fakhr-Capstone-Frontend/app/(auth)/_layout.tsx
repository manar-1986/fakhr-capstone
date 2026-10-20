import { usePathname } from 'expo-router';
import MinimumUnavailable from '../../components/screens/MinimumUnavailable';
import { unavailableRoute } from '../../utils/minimumRelease';
import { Stack } from "expo-router";

/**
 * Auth group: app/(auth)/
 * - login: Sign in → on success redirects to (tabs)/home
 * - register: Create account → on success redirects to (auth)/login
 * - forgot-password: Reset password flow
 */
export default function AuthLayout() {
  const pathname = usePathname();
  if (unavailableRoute(pathname)) return <MinimumUnavailable />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
