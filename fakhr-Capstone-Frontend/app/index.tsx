import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

/**
 * Root `/` is only an auth gate. Thursday Home lives at `/(tabs)/home`
 * so it does not collide with this file on web.
 */
export default function Index() {
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(signup)" />;
}
