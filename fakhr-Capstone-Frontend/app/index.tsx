import { Redirect } from "expo-router";

/**
 * Root `/` always opens public Home. Login is only shown for personal actions.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
