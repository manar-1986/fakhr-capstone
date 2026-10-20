import { useRouter, type Href } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { ACCOUNT_REQUIRED_HREF, setPendingAuthHref } from "../utils/authRedirect";

/** Public browsing stays open; protected actions open Login and remember their destination in memory. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const requireAuth = (returnTo: Href): boolean => {
    if (loading) return false;
    if (user) return true;
    setPendingAuthHref(returnTo);
    router.push(ACCOUNT_REQUIRED_HREF);
    return false;
  };

  return { user, loading, requireAuth };
}
