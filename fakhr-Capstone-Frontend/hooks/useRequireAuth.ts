import { useRouter, type Href } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { setPendingAuthHref } from "../utils/authRedirect";

/** Returns true if the user may continue. Otherwise opens Login and resumes `returnTo` after success. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const requireAuth = (returnTo: Href): boolean => {
    if (loading) return false;
    if (user) return true;
    setPendingAuthHref(returnTo);
    router.push("/(auth)/login");
    return false;
  };

  return { user, loading, requireAuth };
}
