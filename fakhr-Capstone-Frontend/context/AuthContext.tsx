import { useQueryClient } from '@tanstack/react-query';
import {clearCareNotifications} from '../utils/careNotificationRuntime';
import { logout as revokeSession } from '../api/auth.api';
import { closeSession, beginSignOut, finishSignIn, LOGOUT_PENDING, sessionGeneration, sessionBlocked, type LogoutResult } from '../utils/sessionLifecycle';
import { syncAssistantAccount } from '../utils/assistantSession';
import * as SecureStore from "../utils/secureStorage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../types/auth.types";
import { getCurrentUser } from "../api/users.api";

/** Exported so register/login can await the same writes as bootstrap recovery. */
export const USER_PROFILE_CACHE_KEY = "user_profile_cache";

const TOKEN_KEY = "token";

async function fetchCurrentUserWithRetry(): Promise<User> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await getCurrentUser();
    } catch (e) {
      lastError = e;
      const status = (e as Error & { status?: number })?.status;
      if (status === 401 || (e as {retryAfterSeconds?:number})?.retryAfterSeconds !== undefined || (e as {code?:string})?.code === 'FEATURE_DISABLED') {
        throw e;
      }
      const retryable =
        status === undefined ||
        status === 408 ||
        (typeof status === "number" && status >= 500);
      if (!retryable || attempt === 2) {
        throw e;
      }
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
    }
  }
  throw lastError;
}

function isTransientProfileError(status: number | undefined): boolean {
  return (
    status === undefined ||
    status === 408 ||
    (typeof status === "number" && status >= 500)
  );
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<LogoutResult>;
  signIn: (token: string, user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const generation = sessionGeneration();
    try {
      if (await SecureStore.getItemAsync(LOGOUT_PENDING) === '1') { setUserState(null); return; }
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setUserState(null);
        return;
      }

      try {
        const userData = await fetchCurrentUserWithRetry();
        if (generation !== sessionGeneration() || sessionBlocked()) return;
        setUserState(userData);
        await SecureStore.setItemAsync(USER_PROFILE_CACHE_KEY, JSON.stringify(userData));
      } catch (error) {
        if (generation !== sessionGeneration() || sessionBlocked()) return;
        const status = (error as Error & { status?: number })?.status;
        const tokenAfter = await SecureStore.getItemAsync(TOKEN_KEY);

        // Only clear session on auth failure (401 or token already cleared by axios)
        if (status === 401 || !tokenAfter) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(USER_PROFILE_CACHE_KEY);
          setUserState(null);
          return;
        }

        // Network / timeout / 5xx: keep token and show last known profile
        const cached = await SecureStore.getItemAsync(USER_PROFILE_CACHE_KEY);
        if (cached) {
          try {
            setUserState(JSON.parse(cached) as User);
          } catch {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setUserState(null);
          }
        } else if (isTransientProfileError(status)) {
          // Offline / server blip before cache exists: keep token for next launch
          setUserState(null);
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(USER_PROFILE_CACHE_KEY);
          setUserState(null);
        }
      }
    } catch {
      // SecureStore or unexpected error
    } finally {
      setLoading(false);
    }
  };

  const setUser = (userData: User | null) => {
    if (userData && sessionBlocked()) return;
    if (userData?.id !== user?.id) queryClient.clear();
    setUserState(userData);
    if (userData) {
      void SecureStore.setItemAsync(USER_PROFILE_CACHE_KEY, JSON.stringify(userData)).catch(() => {});
    } else {
      void SecureStore.deleteItemAsync(USER_PROFILE_CACHE_KEY).catch(() => {});
    }
  };

  const signIn = async (token: string, nextUser: User) => {
    if (!token || !nextUser?.id) throw new Error('Incomplete sign-in');
    beginSignOut();
    const attempt = sessionGeneration();
    try {
      await SecureStore.setItemAsync(LOGOUT_PENDING, '1');
      await queryClient.cancelQueries();
      await clearCareNotifications();
      queryClient.clear();
      syncAssistantAccount(undefined);
      setUserState(null);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_PROFILE_CACHE_KEY, JSON.stringify(nextUser));
      if (attempt !== sessionGeneration()) throw new Error('Sign-in interrupted');
      await SecureStore.deleteItemAsync(LOGOUT_PENDING);
      if (attempt !== sessionGeneration()) throw new Error('Sign-in interrupted');
      finishSignIn();
      setUserState(nextUser);
    } catch {
      beginSignOut();
      await Promise.allSettled([SecureStore.setItemAsync(LOGOUT_PENDING, '1'), SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_PROFILE_CACHE_KEY)]);
      queryClient.clear(); setUserState(null);
      throw new Error('Unable to establish a safe session');
    }
  };

  const logout = () => closeSession({
    revoke: revokeSession,
    mark: () => SecureStore.setItemAsync(LOGOUT_PENDING, '1'),
    remove: SecureStore.deleteItemAsync,
    cancel: async () => { await Promise.all([queryClient.cancelQueries(),clearCareNotifications()]); },
    clear: () => { queryClient.clear(); syncAssistantAccount(undefined); },
    clearUser: () => setUserState(null),
  });

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
