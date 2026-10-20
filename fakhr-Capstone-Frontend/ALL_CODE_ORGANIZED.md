# Fakhr App - Complete Code Structure

## Project Structure Overview

```
Sanad-Capstone-Fronend/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Entry point (auth gate)
│   ├── (auth)/             # Authentication routes
│   ├── (onboarding)/       # Onboarding flow
│   └── (tabs)/             # Main app tabs
├── components/             # Reusable UI components
│   └── ui/                 # Design system components
├── context/                # React Context providers
├── hooks/                  # Custom React hooks
├── api/                    # API client functions
├── theme/                  # Design system tokens
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── i18n/                   # Internationalization
```

---

## 1. Configuration Files

### 📄 `package.json`

```json
{
  "name": "sanad",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "expo": "~54.0.33",
    "expo-constants": "~18.0.13",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.23",
    "expo-secure-store": "~15.0.8",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "i18n-js": "^4.4.2",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "^5.9.3"
  },
  "private": true
}
```

### 📄 `app.json`

```json
{
  "expo": {
    "name": "Fakhr",
    "slug": "Fakhr",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "sanad",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ],
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}
```

### 📄 `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "module": "ESNext",
    "jsx": "react-native",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### 📄 `.gitignore`

```text
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env
.env*.local
.env.local
.env.development
.env.production

# typescript
*.tsbuildinfo

app-example

# generated native folders
/ios
/android

```

### 📄 `eslint.config.js`

```js
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
]);
```

### 📄 `.env.example`

```text
# Fakhr — Environment Variables
# Copy this file to .env and fill in your values
# DO NOT commit .env to git (it's in .gitignore)

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Add other environment variables here as needed

```

---

## 2. Constants & Theme

### 🎨 `theme/colors.ts`

```typescript
/**
 * Fakhr — Colors
 *
 * DESIGN DIRECTION:
 * - Calm, soft, minimal, mobile-first
 * - Primary: #D99E8E (warm coral/peach)
 * - Background: #F6E4DE (soft warm beige)
 * - Text: #333333 (dark gray)
 */

export const colors = {
  // Surfaces — soft, warm, minimal
  background: "#F6E4DE",
  backgroundCard: "#FFFFFF",
  backgroundElevated: "#FFFFFF",
  backgroundSecondary: "#F0E0DA",

  // Primary (warm coral/peach — calm, soft)
  primary: "#D99E8E",
  primaryLight: "#F5E8E3",
  primaryMuted: "#C88E7E",

  // Secondary (complementary soft tones)
  secondary: "#D99E8E",
  secondaryLight: "#F5E8E3",

  // Text — clear hierarchy
  text: "#333333",
  textSecondary: "#555555",
  textMuted: "#777777",
  textLight: "#999999",

  // UI — soft borders (no sharp contrast)
  border: "#E8D8D2",
  borderLight: "#F0E8E3",

  // Semantic
  success: "#D99E8E",
  error: "#C88E7E",
  errorLight: "#F9EEED",
  warning: "#D99E8E",
  info: "#D99E8E",

  // Specific
  signOut: "#C88E7E",
  accent: "#D99E8E",
} as const;
```

### 🎨 `theme/spacing.ts`

```typescript
/**
 * Fakhr — Spacing
 *
 * 8px base grid — breathable, minimal layout
 */

/** 8px base grid — breathable, minimal layout */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 28,
  pageBottom: 40,
  /** Horizontal padding for screen content */
  screenHorizontal: 20,
} as const;

/** Section spacing — breathable layout */
export const sectionSpacing = {
  tight: 20,
  default: 28,
  loose: 36,
} as const;

/**
 * Touch targets & accessibility
 * - Minimum 44px touch target (iOS/Android guidelines)
 * - Consistent button heights
 * - Clear tap states with activeOpacity
 */
export const touchTargets = {
  /** Minimum touch target size (44px) */
  minimum: 44,
  /** Standard button height */
  button: 52,
  /** Small button height (still meets minimum) */
  buttonSmall: 44,
  /** Card padding — consistent across screens */
  cardPadding: 16, // spacing.lg
} as const;
```

### 🎨 `theme/typography.ts`

```typescript
/**
 * Fakhr — Typography
 *
 * Clear hierarchy with comfortable line heights
 *
 * HIERARCHY:
 * - Screen titles: display (28px) — main page heading
 * - Section headers: h1 (24px) or h2 (20px) — major sections
 * - Body text: body (16px) — primary content
 * - Helper/caption: caption (14px) minimum — supporting text, labels
 *
 * MINIMUM SIZES:
 * - No fonts smaller than 14px for readable text
 * - overline (12px) and label (13px) reserved for UI-only elements (tab bar, badges)
 * - Always pair fontSize with lineHeight for readability
 */

export const typography = {
  // Screen titles — main page heading
  display: 28,
  displayLineHeight: 34,

  // Section headers — major sections
  h1: 24,
  h1LineHeight: 30,
  h2: 20,
  h2LineHeight: 26,
  h3: 18,
  h3LineHeight: 24,

  // Body text — primary content
  body: 16,
  bodyLineHeight: 24,
  bodySmall: 15,
  bodySmallLineHeight: 22,

  // Helper/caption — supporting text (minimum readable size)
  caption: 14,
  captionLineHeight: 20,

  // UI-only — very small elements (tab bar, badges, not for readable text)
  label: 13,
  labelLineHeight: 18,
  overline: 12,
  overlineLineHeight: 16,

  // Aliases for consistency
  title: 28, // Same as display
  titleSmall: 22,
  section: 18, // Same as h3

  // Font weights
  weightRegular: "400" as const,
  weightMedium: "500" as const,
  weightSemibold: "600" as const,
  weightBold: "700" as const,
} as const;
```

### 🎨 `theme/radius.ts`

```typescript
/**
 * Fakhr — Border Radius
 *
 * Rounded corners everywhere — no sharp edges
 */

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;
```

### 🎨 `theme/index.ts`

```typescript
/**
 * Fakhr — Design System
 *
 * Centralized exports for all theme tokens
 */

export * from "./colors";
export * from "./spacing";
export * from "./typography";
export * from "./radius";

// Shadows (Platform-specific, needs Platform import)
import { Platform } from "react-native";
import { colors } from "./colors";

/** Subtle elevation for cards — calm, modern */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
});

export const cardShadowSubtle = Platform.select({
  ios: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  android: { elevation: 1 },
});
```

---

## 3. Contexts

### 🔐 `context/AuthContext.tsx`

```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { User } from "../types/auth.types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        // Token exists, user data will be set via setUser after login
        // For now, just set loading to false
        // In production, you would fetch user data from API here
      }
    } catch (error) {
      // Silently handle error - user will need to login again
      // In production, you might want to log this to an error tracking service
    } finally {
      setLoading(false);
    }
  };

  const setUser = (userData: User | null) => {
    setUserState(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
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
```

### 🔐 `context/LanguageContext.tsx`

```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import i18n, { setLocale } from "../i18n";

interface LanguageContextType {
  locale: "en";
  setLocale: (locale: "en") => void;
  t: (key: string, options?: object) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // English only
  const [locale, setLocaleState] = useState<"en">("en");

  useEffect(() => {
    setLocale("en");
  }, []);

  const handleSetLocale = (newLocale: "en") => {
    setLocaleState(newLocale);
    setLocale(newLocale);
  };

  const t = (key: string, options?: object): string => {
    return i18n.t(key, options);
  };

  return (
    <LanguageContext.Provider
      value={{ locale: "en", setLocale: handleSetLocale, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
```

---

## 4. Hooks

### 🪝 `hooks/useActiveChild.ts`

```typescript
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChildren } from "../api/care-path.api";
import { Child } from "../types/child.types";

export function useActiveChild() {
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const { data: rawChildren } = useQuery({
    queryKey: ["children"],
    queryFn: getChildren,
    retry: false,
  });

  const children = Array.isArray(rawChildren) ? rawChildren : [];
  const activeChild =
    children.find((child: Child) => child.id === activeChildId) || children[0];

  useEffect(() => {
    if (children && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [children, activeChildId]);

  return {
    activeChild,
    activeChildId,
    setActiveChildId,
  };
}
```

### 🪝 `hooks/useAuth.ts`

```typescript
export { useAuth } from "../context/AuthContext";
```

---

## 5. API Layer

### 🌐 `api/axios.ts`

```typescript
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
instance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await SecureStore.deleteItemAsync("token");
    }
    return Promise.reject(error);
  }
);

export default instance;
```

### 🌐 `api/auth.api.ts`

```typescript
import instance from "./axios";
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
} from "../types/auth.types";

export const login = async (data: LoginRequest) => {
  const response = await instance.post("/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await instance.post("/auth/register", data);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest) => {
  const response = await instance.post("/auth/forgot-password", data);
  return response.data;
};

export const logout = async () => {
  await instance.post("/auth/logout");
};
```

### 🌐 `api/care-path.api.ts`

```typescript
import instance from "./axios";
import { WeeklyPlan, Task, Progress, CheckIn } from "../types/care-path.types";
import { Child } from "../types/child.types";

export const getWeeklyPlan = async (): Promise<WeeklyPlan> => {
  const response = await instance.get("/care-path/weekly-plan");
  return response.data;
};

export const getTaskDetails = async (taskId: string): Promise<Task> => {
  const response = await instance.get(`/care-path/tasks/${taskId}`);
  return response.data;
};

export const getProgress = async (): Promise<Progress> => {
  const response = await instance.get("/care-path/progress");
  return response.data;
};

export const submitCheckIn = async (data: {
  notes: string;
  rating: number;
}): Promise<CheckIn> => {
  const response = await instance.post("/care-path/check-in", data);
  return response.data;
};

export const generateCarePath = async (): Promise<WeeklyPlan> => {
  const response = await instance.post("/care-path/generate");
  return response.data;
};

export const getChildren = async (): Promise<Child[]> => {
  const response = await instance.get("/care-path/children");
  return response.data;
};
```

---

## 6. Type Definitions

### 📝 `types/auth.types.ts`

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
```

### 📝 `types/child.types.ts`

```typescript
export interface Child {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis?: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
}

export interface ChildProfile {
  child: Child;
  challenges: string[];
  goals: string[];
}
```

### 📝 `types/care-path.types.ts`

```typescript
export interface Task {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  expectedOutcome?: string;
  completed: boolean;
  dueDate?: string;
}

export interface WeeklyPlan {
  week: number;
  tasks: Task[];
}

export interface Progress {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface CheckIn {
  id: string;
  date: string;
  notes: string;
  rating: number;
}
```

---

## 7. Utilities

### 🔧 `utils/helpers.ts`

```typescript
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
```

### 🔧 `utils/validators.ts`

```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};
```

---

## 8. Internationalization

### 🌍 `i18n/index.ts`

```typescript
import { I18n } from "i18n-js";
import en from "./locales/en.json";

const i18n = new I18n({
  en,
});

// Set default locale to English only
i18n.defaultLocale = "en";
i18n.enableFallback = true;
i18n.locale = "en";

export const setLocale = (locale: "en") => {
  i18n.locale = locale;
};

export const getLocale = (): "en" => {
  return "en";
};

export default i18n;
```

### 🌍 `i18n/locales/en.json`

```json
{
  "auth": {
    "signIn": "Sign In",
    "signOut": "Sign Out",
    "signUp": "Create Account",
    "welcomeBack": "Welcome back",
    "welcomeToSanad": "Welcome to Fakhr",
    "email": "Email Address",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "fullName": "Full Name",
    "phone": "Phone Number",
    "forgotPassword": "Forgot Password",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?",
    "createAccount": "Create account",
    "signInToContinue": "Sign in to continue. We're here to support you every step of the way.",
    "createAccountDescription": "Create your account and we'll support you step by step. You're not alone.",
    "enterEmail": "Enter your email",
    "enterPassword": "Enter your password",
    "enterFullName": "Enter your full name",
    "enterPhone": "Enter your phone number",
    "showPassword": "Show password",
    "hidePassword": "Hide password",
    "invalidCredentials": "Invalid credentials",
    "fillAllFields": "Please fill in all fields",
    "passwordsDontMatch": "Passwords do not match",
    "agreeToTerms": "I agree to Fakhr's community guidelines and privacy policy",
    "communityGuidelines": "community guidelines",
    "privacyPolicy": "privacy policy"
  },
  "home": {
    "goodMorning": "Good morning",
    "goodAfternoon": "Good afternoon",
    "goodEvening": "Good evening",
    "howAreYouToday": "How are you today?",
    "howAreYouFeeling": "How are you feeling?",
    "great": "Great",
    "okay": "Okay",
    "tired": "Tired",
    "newToSanad": "New to Fakhr? Create your account and we'll support you step by step.",
    "thisWeeksPlan": "This week's plan",
    "week": "Week",
    "completed": "completed",
    "of": "of",
    "smallStepsCount": "Small steps count! Keep going.",
    "todaysFocus": "Today's focus",
    "recommendedForYou": "Recommended for you",
    "quickActions": "Quick actions",
    "uploadDocument": "Upload document",
    "findCenters": "Find centers",
    "askCommunity": "Ask community",
    "yearsOld": "years old",
    "whyThisMatters": "Why this matters"
  },
  "carePath": {
    "title": "Care Path",
    "weeklyCarePlan": "Weekly Care Plan",
    "loadingPlan": "Loading your care plan...",
    "emptyDescription": "Your personalized care journey will appear here. We'll guide you through each step so you never feel alone.",
    "viewProgress": "View Progress",
    "dailyCheckIn": "Daily Check-In",
    "howDidTodayGo": "How did today go?",
    "enterNotes": "Enter your notes...",
    "submit": "Submit",
    "progressOverview": "Progress Overview",
    "completedTasks": "Completed Tasks",
    "totalTasks": "Total Tasks",
    "completionRate": "Completion Rate"
  },
  "documents": {
    "title": "Documents",
    "emptyDescription": "Keep your reports and important papers in one place. Upload documents to track your child's progress and keep everything organized.",
    "uploadDocument": "Upload document"
  },
  "community": {
    "title": "Community",
    "emptyDescription": "Connect with other families, share experiences, and find support. You're part of a caring community—we're here for each other.",
    "upcomingEvents": "Upcoming Events",
    "createPost": "Create Post",
    "loadingEvents": "Loading events..."
  },
  "profile": {
    "title": "Profile",
    "name": "NAME",
    "email": "EMAIL",
    "phone": "PHONE",
    "manageChildren": "Manage Children",
    "settings": "Settings",
    "loading": "Loading..."
  },
  "onboarding": {
    "parentProfile": "Parent Profile",
    "tellUsAboutYourself": "Tell us about yourself",
    "childBasicInfo": "Child Basic Information",
    "childMedicalInfo": "Medical Information",
    "diagnosisInfo": "Diagnosis Information",
    "challengesNeeds": "Challenges & Needs",
    "goalsExpectations": "Goals & Expectations",
    "generatingPlan": "Generating Your Care Path",
    "generatingDescription": "We're creating a personalized care plan based on your child's information.",
    "generatePlan": "Generate Plan",
    "next": "Next",
    "childsName": "Child's Name",
    "age": "Age",
    "gender": "Gender",
    "address": "Address"
  },
  "directory": {
    "healthCenters": "Health Centers",
    "healthcareProfessionals": "Healthcare Professionals",
    "loadingCenters": "Loading centers...",
    "loadingProfessionals": "Loading professionals..."
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "close": "Close",
    "done": "Done",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "noResults": "No results found",
    "somethingWentWrong": "Something went wrong",
    "tryAgain": "Please try again"
  }
}
```

---

## 9. UI Components

### 🔘 `components/ui/Button.tsx`

```typescript
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, radius, typography, touchTargets } from "../../theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component — primary / secondary / ghost variants
 * Meets 44px minimum touch target
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.backgroundCard : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[styles[`${variant}Text`], isDisabled && styles.disabledText]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.button,
  },
  fullWidth: {
    width: "100%",
  },
  // Primary variant
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.backgroundCard,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
  },
  // Secondary variant
  secondary: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  secondaryText: {
    color: colors.secondary,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
  },
  // Ghost variant
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostText: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
  },
  // Disabled state
  disabled: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
});
```

### 🃏 `components/ui/Card.tsx`

```typescript
import React from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { colors, spacing, radius, cardShadow } from "../../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Make card pressable */
  onPress?: () => void;
  /** Use subtle shadow instead of default */
  subtle?: boolean;
  /** Remove shadow */
  noShadow?: boolean;
}

/**
 * Card component — used everywhere
 * Consistent padding, rounded corners, subtle elevation
 */
export function Card({
  children,
  style,
  onPress,
  subtle,
  noShadow,
}: CardProps) {
  const shadowStyle = noShadow ? undefined : subtle ? cardShadow : cardShadow;

  const cardStyle = [styles.card, shadowStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
```

### 📝 `components/ui/Input.tsx`

```typescript
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  /** Show password toggle icon */
  showPasswordToggle?: boolean;
  /** Password visibility state */
  passwordVisible?: boolean;
  /** Toggle password visibility */
  onTogglePassword?: () => void;
}

/**
 * Input component — reusable text input with label and error handling
 * Accessibility: proper labels, focus states, contrast
 */
export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
  ...textInputProps
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={styles.label}
          nativeID={`${textInputProps.id || "input"}-label`}
        >
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          {...textInputProps}
          style={[styles.input, error && styles.inputError, inputStyle]}
          placeholderTextColor={colors.textLight}
          accessibilityLabel={textInputProps.accessibilityLabel || label}
          accessibilityLabelledBy={
            label ? `${textInputProps.id || "input"}-label` : undefined
          }
          accessibilityState={{ ...textInputProps.accessibilityState }}
        />
        {showPasswordToggle && onTogglePassword && (
          <View style={styles.passwordToggle}>
            {/* Password toggle handled by parent component */}
          </View>
        )}
      </View>
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
    minHeight: 44, // Accessibility: minimum touch target
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordToggle: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  errorText: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
```

### 🔄 `components/ui/Toggle.tsx`

```typescript
import React from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ViewStyle,
  Platform,
} from "react-native";
import { colors, spacing, typography } from "../../theme";

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  style?: ViewStyle;
  /** Accessibility label (defaults to label) */
  accessibilityLabel?: string;
}

/**
 * Toggle component — reusable switch with label
 * Accessibility: proper labels, focus states, contrast, 44px touch target
 */
export function Toggle({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  style,
  accessibilityLabel,
}: ToggleProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: colors.border,
            true: colors.primaryLight,
          }}
          thumbColor={value ? colors.primary : colors.borderLight}
          ios_backgroundColor={colors.border}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
          accessibilityLabel={accessibilityLabel || label}
          style={styles.switch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44, // Accessibility: minimum touch target
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
    fontWeight: typography.weightMedium,
  },
  description: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  switch: {
    // Ensure switch meets touch target requirements
    transform: Platform.OS === "ios" ? [{ scaleX: 1 }, { scaleY: 1 }] : [],
  },
});
```

### 🏷️ `components/ui/Chip.tsx`

```typescript
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, cardShadow } from "../../theme";

interface ChipProps {
  label: string;
  /** Icon name from Ionicons */
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Chip component — for mood selection and similar use cases
 * Toggleable, with optional icon
 */
export function Chip({
  label,
  icon,
  selected = false,
  onPress,
  style,
}: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, cardShadow, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={22}
          color={selected ? colors.primary : colors.textMuted}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  labelSelected: {
    color: colors.primary,
  },
});
```

### 👤 `components/ui/Avatar.tsx`

```typescript
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "../../theme";

interface AvatarProps {
  /** Initials to display (e.g., "JD" for John Doe) */
  initials?: string;
  /** Icon name if no initials */
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Background color override */
  backgroundColor?: string;
  style?: ViewStyle;
}

/**
 * Avatar component — circle placeholder
 * Shows initials or icon
 */
export function Avatar({
  initials,
  icon = "person",
  size = "md",
  backgroundColor,
  style,
}: AvatarProps) {
  const bgColor = backgroundColor || colors.borderLight;

  return (
    <View
      style={[styles.avatar, styles[size], { backgroundColor: bgColor }, style]}
    >
      {initials ? (
        <Text style={[styles.initials, styles[`${size}Text`]]}>{initials}</Text>
      ) : (
        <Ionicons
          name={icon}
          size={size === "sm" ? 16 : size === "md" ? 24 : 32}
          color={colors.textMuted}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 52,
    height: 52,
  },
  lg: {
    width: 72,
    height: 72,
  },
  initials: {
    fontWeight: typography.weightSemibold,
    color: colors.textMuted,
  },
  smText: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
  },
  mdText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
  },
  lgText: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
  },
});
```

### 📭 `components/ui/EmptyState.tsx`

```typescript
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, cardShadow } from "../../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  title: string;
  description: string;
  style?: ViewStyle;
  /** Wrap in a soft card for emphasis */
  card?: boolean;
  /** Optional CTA button */
  cta?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Reusable empty/placeholder state for Community, Documents, Care Path, etc.
 * Calm, trustworthy, production-ready.
 */
export function EmptyState({
  icon,
  iconColor = colors.primary,
  title,
  description,
  style,
  card = true,
  cta,
}: EmptyStateProps) {
  const content = (
    <View style={styles.content}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon} size={44} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {cta && (
        <View style={styles.ctaContainer}>
          <Button title={cta.label} onPress={cta.onPress} fullWidth />
        </View>
      )}
    </View>
  );

  if (card) {
    return <View style={[styles.card, cardShadow, style]}>{content}</View>;
  }

  return <View style={[styles.wrapper, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xxxl,
    alignItems: "center",
  },
  card: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.section,
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    textAlign: "center",
  },
  ctaContainer: {
    marginTop: spacing.xl,
    width: "100%",
  },
});
```

### 📑 `components/ui/SectionHeader.tsx`

```typescript
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, typography } from "../../theme";

interface SectionHeaderProps {
  title: string;
  /** Optional metadata (e.g., "Week 2") */
  meta?: string;
  style?: ViewStyle;
  /** Size variant */
  size?: "h1" | "h2" | "h3";
}

/**
 * SectionHeader component — consistent section titles
 */
export function SectionHeader({
  title,
  meta,
  style,
  size = "h3",
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, styles[size]]}>{title}</Text>
      {meta && <Text style={styles.meta}>{meta}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  h1: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
  },
  h2: {
    fontSize: typography.h2,
    lineHeight: typography.h2LineHeight,
  },
  h3: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
  },
  meta: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
    fontWeight: typography.weightMedium,
  },
});
```

### 🔔 `components/ui/IconBadge.tsx`

```typescript
import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography, touchTargets } from "../../theme";

interface IconBadgeProps {
  /** Icon name from Ionicons */
  icon: React.ComponentProps<typeof Ionicons>["name"];
  /** Badge count (0 hides badge) */
  badgeCount?: number;
  /** Icon color */
  iconColor?: string;
  /** Badge color */
  badgeColor?: string;
  onPress: () => void;
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * IconBadge component — bell + notification badge
 * Meets 44px minimum touch target
 */
export function IconBadge({
  icon = "notifications-outline",
  badgeCount = 0,
  iconColor = colors.text,
  badgeColor = colors.error,
  onPress,
  style,
  accessibilityLabel = "Notifications",
}: IconBadgeProps) {
  const showBadge = badgeCount > 0;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        showBadge
          ? `${accessibilityLabel}, ${badgeCount} notifications`
          : accessibilityLabel
      }
    >
      <Ionicons name={icon} size={24} color={iconColor} />
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? "99+" : badgeCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: spacing.md,
    minWidth: touchTargets.minimum,
    minHeight: touchTargets.minimum,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    borderRadius: radius.sm,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: colors.backgroundCard,
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightSemibold,
  },
});
```

### 🌐 `components/ui/LanguageSwitcher.tsx`

```typescript
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, typography } from "../../theme";

interface LanguageSwitcherProps {
  style?: ViewStyle;
}

/**
 * Language Display Component
 * Shows English only (language switching removed)
 */
export function LanguageSwitcher({ style }: LanguageSwitcherProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="language"
        size={20}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>EN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    gap: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.caption,
    fontWeight: typography.weightSemibold,
    color: colors.primary,
  },
});
```

### 📦 `components/ui/index.ts`

```typescript
/**
 * Shared UI Components
 * Reusable components for consistent UI across the app
 *
 * All components include:
 * - Accessibility: proper labels, focus states, contrast
 * - Touch targets: minimum 44px
 * - Consistent styling from design system
 */

export { Card } from "./Card";
export { Button } from "./Button";
export { Input } from "./Input";
export { Toggle } from "./Toggle";
export { SectionHeader } from "./SectionHeader";
export { Chip } from "./Chip";
export { Avatar } from "./Avatar";
export { EmptyState } from "./EmptyState";
export { IconBadge } from "./IconBadge";
export { LanguageSwitcher } from "./LanguageSwitcher";
```

---

## 10. App Navigation & Screens

### 🏗️ `app/_layout.tsx` (Root Layout)

```typescript
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
```

### 📍 `app/index.tsx` (Entry Point)

```typescript
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing } from "../theme";

/**
 * Root index: routing gate.
 * - Loading → show spinner.
 * - No user → redirect to onboarding landing.
 * - User → redirect to home.
 */
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(onboarding)/landing" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
  },
});
```

### 🔐 `app/(auth)/_layout.tsx` (Auth Stack Layout)

```typescript
import { Stack } from "expo-router";

/**
 * Auth group: app/(auth)/
 * - login: Sign in → on success redirects to (tabs)/home
 * - register: Create account → on success redirects to (auth)/login
 * - forgot-password: Reset password flow
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

### 🔐 `app/(auth)/login.tsx` (Login Screen)

```typescript
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { login } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth.types";
import { Button } from "../../components/ui";
import {
  colors,
  spacing,
  radius,
  typography,
  sectionSpacing,
} from "../../theme";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data: { token?: string; user?: User }) => {
      if (data?.token) {
        await SecureStore.setItemAsync("token", data.token);
      }
      if (data?.user) {
        setUser(data.user);
      }
      router.replace("/(tabs)/home");
    },
    onError: (err: { message?: string }) => {
      setError(err?.message ?? "Invalid credentials");
    },
  });

  const handleLogin = () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <SafeAreaView style={styles.authPage}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.authTitle}>Sign In</Text>
          <Text style={styles.authWelcome}>Welcome back</Text>
          <Text style={styles.authSub}>
            Sign in to continue. We're here to support you every step of the
            way.
          </Text>

          <View style={styles.authForm}>
            {error ? (
              <View style={styles.authError}>
                <Text style={styles.authErrorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.label} nativeID="email-label">
                Email Address
              </Text>
              <TextInput
                id="email"
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email Address"
                accessibilityLabelledBy="email-label"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label} nativeID="password-label">
                Password
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  id="password"
                  style={[styles.input, styles.inputInWrap]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Password"
                  accessibilityLabelledBy="password-label"
                />
                <TouchableOpacity
                  style={styles.togglePassword}
                  onPress={() => setShowPassword((p) => !p)}
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  accessibilityRole="button"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Keep me signed in checkbox */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setKeepSignedIn((v) => !v)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: keepSignedIn }}
                accessibilityLabel="Keep me signed in"
              >
                <View
                  style={[
                    styles.checkbox,
                    keepSignedIn && styles.checkboxChecked,
                  ]}
                >
                  {keepSignedIn && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.backgroundCard}
                    />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Keep me signed in</Text>
              </TouchableOpacity>

              {/* Forgot password link */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="Forgot password"
              >
                <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              loading={loginMutation.isPending}
              fullWidth
              style={styles.signInButton}
            />
          </View>

          <View style={styles.authFooterWrap}>
            <Text style={styles.authFooter}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              accessibilityRole="link"
            >
              <Text style={styles.authFooterLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authPage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.pageBottom,
  },
  authTitle: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  authWelcome: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  authSub: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginBottom: sectionSpacing.default,
  },
  authForm: {
    marginBottom: sectionSpacing.default,
  },
  authError: {
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  authErrorText: {
    color: colors.error,
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.backgroundCard,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundCard,
  },
  inputInWrap: {
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
  },
  togglePassword: {
    padding: spacing.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.text,
  },
  forgotPasswordLink: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.primary,
    fontWeight: typography.weightMedium,
  },
  signInButton: {
    marginTop: spacing.sm,
  },
  authFooterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  authFooter: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.textMuted,
  },
  authFooterLink: {
    color: colors.primary,
    fontWeight: typography.weightMedium,
  },
});
```

### ✍️ `app/(auth)/register.tsx` (Create Account Screen)

```typescript
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../../api/auth.api";
import { Button } from "../../components/ui";
import {
  colors,
  spacing,
  radius,
  typography,
  sectionSpacing,
} from "../../theme";

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      router.replace("/(auth)/login");
    },
    onError: (error: { message?: string }) => {
      alert(error?.message ?? "Registration failed. Please try again.");
    },
  });

  const handleRegister = () => {
    if (
      !formData.name?.trim() ||
      !formData.email?.trim() ||
      !formData.password?.trim()
    ) {
      alert("Please fill in Full Name, Email, and Password.");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to Fakhr's community guidelines and privacy policy.");
      return;
    }
    registerMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Create Account</Text>
          <Text style={styles.welcome}>Welcome to Fakhr</Text>
          <Text style={styles.instruction}>
            Create your account and we'll support you step by step. You're not
            alone.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textLight}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label} nativeID="password-label">
              Password
            </Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputInWrap]}
                placeholder="Create a secure password"
                placeholderTextColor={colors.textLight}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry={!showPassword}
                accessibilityLabel="Password"
                accessibilityLabelledBy="password-label"
              />
              <TouchableOpacity
                style={styles.togglePassword}
                onPress={() => setShowPassword((p) => !p)}
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="For helpful reminders"
              placeholderTextColor={colors.textLight}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms((v) => !v)}
            activeOpacity={0.8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel="I agree to Fakhr's community guidelines and privacy policy"
          >
            <View
              style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            >
              {agreedToTerms && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.backgroundCard}
                />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to Fakhr's{" "}
              <Text style={styles.link}>community guidelines</Text> and{" "}
              <Text style={styles.link}>privacy policy</Text>.
            </Text>
          </TouchableOpacity>

          <Button
            title="Create Account"
            onPress={handleRegister}
            disabled={registerMutation.isPending}
            loading={registerMutation.isPending}
            fullWidth
            style={styles.createButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingBottom: spacing.pageBottom,
  },
  pageTitle: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  welcome: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: sectionSpacing.default,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputInWrap: {
    flex: 1,
    borderWidth: 0,
  },
  togglePassword: {
    padding: spacing.md,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  createButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: sectionSpacing.default,
  },
  footerText: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.weightMedium,
    textDecorationLine: "underline",
  },
});
```

### 🔑 `app/(auth)/forgot-password.tsx`

```typescript
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../api/auth.api";
import {
  colors,
  spacing,
  radius,
  typography,
  sectionSpacing,
} from "../../theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      router.back();
    },
    onError: (error: { message?: string }) => {
      alert(error?.message ?? "Failed to send reset link");
    },
  });

  const handleSubmit = () => {
    if (!email?.trim()) {
      alert("Please enter your email");
      return;
    }
    forgotPasswordMutation.mutate({ email: email.trim() });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              forgotPasswordMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <ActivityIndicator color={colors.backgroundCard} />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => router.back()}
          >
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.pageBottom,
  },
  title: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginBottom: sectionSpacing.default,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.backgroundCard,
    fontSize: typography.body,
    fontWeight: typography.weightSemibold,
  },
  linkWrap: {
    marginTop: sectionSpacing.default,
    alignItems: "center",
  },
  link: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.primary,
    fontWeight: typography.weightMedium,
  },
});
```

### 🎯 `app/(onboarding)/_layout.tsx` (Onboarding Stack Layout)

```typescript
import { Stack } from "expo-router";

export default function OnboardingLayout() {
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
```

### 🎯 `app/(onboarding)/landing.tsx` (Onboarding/Landing Screen)

```typescript
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button } from "../../components/ui";
import {
  colors,
  spacing,
  typography,
  sectionSpacing,
  radius,
} from "../../theme";

/**
 * Onboarding / Landing Screen
 * - Fakhr title
 * - 3 benefit cards
 * - "Get Started" button
 * - "I already have an account" link
 */
export default function LandingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(onboarding)/parent-profile");
  };

  const handleAlreadyHaveAccount = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fakhr Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Fakhr</Text>
        </View>

        {/* 3 Benefit Cards */}
        <View style={styles.benefitsContainer}>
          <Card style={styles.benefitCard} noShadow>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="heart" size={32} color={colors.primary} />
            </View>
            <Text style={styles.benefitTitle}>Personalized Support</Text>
            <Text style={styles.benefitDescription}>
              Get tailored guidance for your child's unique needs
            </Text>
          </Card>

          <Card style={styles.benefitCard} noShadow>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="people" size={32} color={colors.primary} />
            </View>
            <Text style={styles.benefitTitle}>Community Connection</Text>
            <Text style={styles.benefitDescription}>
              Connect with other families on similar journeys
            </Text>
          </Card>

          <Card style={styles.benefitCard} noShadow>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="trail-sign" size={32} color={colors.primary} />
            </View>
            <Text style={styles.benefitTitle}>Care Path</Text>
            <Text style={styles.benefitDescription}>
              Follow a structured plan designed just for you
            </Text>
          </Card>
        </View>

        {/* Get Started Button */}
        <View style={styles.actionsContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            style={styles.getStartedButton}
          />

          {/* I already have an account */}
          <View style={styles.accountLinkContainer}>
            <Text style={styles.accountLinkText}>
              I already have an account
            </Text>
            <Text
              style={styles.accountLink}
              onPress={handleAlreadyHaveAccount}
              accessibilityRole="link"
              accessibilityLabel="Sign in to existing account"
            >
              Sign in
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl * 2,
    paddingBottom: spacing.pageBottom,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: sectionSpacing.loose,
  },
  title: {
    fontSize: typography.display + 8,
    lineHeight: typography.displayLineHeight + 10,
    fontWeight: typography.weightBold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  benefitsContainer: {
    gap: spacing.lg,
    marginBottom: sectionSpacing.loose,
  },
  benefitCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
  },
  benefitIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  benefitTitle: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  benefitDescription: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    textAlign: "center",
  },
  actionsContainer: {
    marginTop: "auto",
    paddingTop: sectionSpacing.default,
  },
  getStartedButton: {
    marginBottom: spacing.xl,
  },
  accountLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  accountLinkText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
  },
  accountLink: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.primary,
    fontWeight: typography.weightSemibold,
  },
});
```

### 📑 `app/(tabs)/_layout.tsx` (Tab Navigation)

```typescript
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { colors, typography, spacing } from "../../theme";

/**
 * Tabs Layout — Bottom navigation
 *
 * Bottom tab bar with: Home, Care Path, Documents, Community, Profile
 * - Clear active vs inactive states
 * - Properly aligned icons + labels
 * - Consistent spacing and icon sizes
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.md,
          paddingHorizontal: spacing.xs,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: typography.overline,
          lineHeight: typography.overlineLineHeight,
          fontWeight: typography.weightMedium,
          marginTop: spacing.xxs,
        },
        tabBarIconStyle: {
          marginTop: spacing.xs,
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Care Path",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trail-sign" : "trail-sign-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Documents",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          href: null,
          title: "Directory",
          tabBarIcon: ({ color }) => (
            <Ionicons name="location-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 🏠 `app/(tabs)/home/index.tsx` (Home Screen)

```typescript
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useActiveChild } from "../../../hooks/useActiveChild";
import { colors, spacing, sectionSpacing, typography } from "../../../theme";
import {
  Card,
  Button,
  SectionHeader,
  Chip,
  Avatar,
  IconBadge,
} from "../../../components/ui";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeChild } = useActiveChild();
  const [mood, setMood] = useState<string | null>(null);

  const displayName = user?.name?.split(" ")[0] || "there";
  const greeting = getGreeting();
  const childName = activeChild?.name ?? "Omar";
  const childAge = activeChild?.age ?? 7;

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  // Get user initials for avatar
  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || undefined;

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Polished greeting header */}
        <Card style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              initials={userInitials}
              size="md"
              style={styles.headerAvatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {greeting}, {displayName}
              </Text>
              <Text style={styles.headerSub}>How are you today?</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {!user ? (
              <>
                <TouchableOpacity
                  style={styles.headerLinkWrap}
                  onPress={() => router.push("/(auth)/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkSignIn}>Sign in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerLinkWrap}
                  onPress={() => router.push("/(auth)/register")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkCreate}>Create account</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.headerLinkWrap}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <Text style={styles.linkSignOut}>Sign out</Text>
              </TouchableOpacity>
            )}
            <IconBadge
              icon="notifications-outline"
              badgeCount={2}
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* Create account CTA (when not logged in) */}
        {!user && (
          <Card style={styles.createCta}>
            <View style={styles.createCtaIconWrap}>
              <Ionicons name="heart" size={28} color={colors.primary} />
            </View>
            <Text style={styles.createCtaText}>
              New to Fakhr? Create your account and we'll support you step by
              step.
            </Text>
            <Button
              title="Create account"
              onPress={() => router.push("/(auth)/register")}
              fullWidth
            />
          </Card>
        )}

        {/* Mood selector using Chips */}
        <Text style={styles.sectionLabel}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          <Chip
            label="Great"
            icon="happy-outline"
            selected={mood === "great"}
            onPress={() => setMood(mood === "great" ? null : "great")}
          />
          <Chip
            label="Okay"
            icon="remove-outline"
            selected={mood === "okay"}
            onPress={() => setMood(mood === "okay" ? null : "okay")}
          />
          <Chip
            label="Tired"
            icon="sad-outline"
            selected={mood === "tired"}
            onPress={() => setMood(mood === "tired" ? null : "tired")}
          />
        </View>

        {/* Child profile card */}
        <Card
          onPress={() => router.push("/(tabs)/profile/manage-children")}
          style={styles.profileCard}
        >
          <Avatar
            icon="person"
            size="md"
            backgroundColor={colors.primaryLight}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileCardName}>{childName}</Text>
            <Text style={styles.profileCardMeta}>{childAge} years old</Text>
          </View>
          <Ionicons name="chevron-down" size={22} color={colors.textMuted} />
        </Card>

        {/* Weekly plan progress card */}
        <SectionHeader title="This week's plan" meta="Week 2" />
        <Card
          onPress={() => router.push("/(tabs)/plan")}
          style={styles.planCard}
        >
          <View style={styles.progressRow}>
            <View style={styles.progressDots}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.progressDot,
                    i === 4 && styles.progressDotPending,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressLabel}>3 of 4 completed</Text>
          </View>
          <Text style={styles.planSummary}>Small steps count! Keep going.</Text>
        </Card>

        {/* Today's focus task card */}
        <SectionHeader title="Today's focus" />
        <Card
          onPress={() => router.push("/(tabs)/plan/task-details?id=today")}
          style={styles.taskCard}
        >
          <View style={styles.taskCheckbox}>
            <Ionicons name="ellipse-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskCardTitle}>
              Practice communication cards
            </Text>
            <Text style={styles.taskCardDesc}>
              10 minutes with picture cards
            </Text>
            <TouchableOpacity
              style={styles.whyLink}
              onPress={(e) => e.stopPropagation()}
              accessibilityRole="button"
              accessibilityLabel="Why this matters"
              activeOpacity={0.7}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.whyLinkText}>Why this matters</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </Card>

        {/* Recommended content card */}
        <SectionHeader title="Recommended for you" />
        <Card
          onPress={() => router.push("/(tabs)/resources")}
          style={styles.recCard}
        >
          <View style={styles.recIcon}>
            <Ionicons name="play-circle" size={36} color={colors.primary} />
          </View>
          <View style={styles.recContent}>
            <Text style={styles.recCardTitle}>Building Social Confidence</Text>
            <Text style={styles.recCardDesc}>
              Simple strategies for everyday interactions
            </Text>
            <Text style={styles.recMeta}>5 min read · Dr. Amina Hassan</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </Card>

        {/* Quick actions grid */}
        <SectionHeader title="Quick actions" />
        <View style={styles.quickActions}>
          <Card onPress={() => {}} style={styles.quickAction}>
            <View style={[styles.iconWrap, styles.iconWrapPrimary]}>
              <Ionicons
                name="cloud-upload-outline"
                size={26}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionLabel}>Upload document</Text>
          </Card>
          <Card
            onPress={() => router.push("/(tabs)/directory/centers")}
            style={styles.quickAction}
          >
            <View style={[styles.iconWrap, styles.iconWrapPrimary]}>
              <Ionicons
                name="location-outline"
                size={26}
                color={colors.primary}
              />
            </View>
            <Text style={styles.quickActionLabel}>Find centers</Text>
          </Card>
          <Card
            onPress={() => router.push("/(tabs)/community")}
            style={styles.quickAction}
          >
            <View style={[styles.iconWrap, styles.iconWrapGreen]}>
              <Ionicons name="people-outline" size={26} color={colors.accent} />
            </View>
            <Text style={styles.quickActionLabel}>Ask community</Text>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.pageBottom,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: sectionSpacing.default,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.xxs,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.textMuted,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerLinkWrap: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 2,
  },
  linkSignIn: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.primary,
    fontWeight: typography.weightSemibold,
  },
  linkCreate: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.primary,
    fontWeight: typography.weightSemibold,
  },
  linkSignOut: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.textMuted,
    fontWeight: typography.weightMedium,
  },
  createCta: {
    marginBottom: sectionSpacing.default,
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  createCtaIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  createCtaText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  moodRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: sectionSpacing.default,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sectionSpacing.default,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileCardName: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  profileCardMeta: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
  },
  planCard: {
    marginBottom: sectionSpacing.default,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  progressDots: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  progressDotPending: {
    backgroundColor: colors.border,
  },
  progressLabel: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.textMuted,
  },
  planSummary: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.text,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sectionSpacing.default,
  },
  taskCheckbox: {
    marginRight: spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskCardDesc: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  whyLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
  },
  whyLinkText: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.primary,
    fontWeight: typography.weightMedium,
  },
  recCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  recIcon: {
    marginRight: spacing.md,
  },
  recContent: {
    flex: 1,
  },
  recCardTitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recCardDesc: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  recMeta: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textLight,
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: sectionSpacing.default,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    paddingVertical: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconWrapPrimary: {
    backgroundColor: colors.primaryLight,
  },
  iconWrapGreen: {
    backgroundColor: colors.primaryLight,
  },
  quickActionLabel: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.text,
    textAlign: "center",
  },
  bottomSpacer: {
    height: spacing.section,
  },
});
```

### 📋 `app/(tabs)/plan/index.tsx` (Care Path Screen)

```typescript
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWeeklyPlan } from "../../../api/care-path.api";
import { EmptyState, Card, Button } from "../../../components/ui";
import { colors, spacing, typography, sectionSpacing } from "../../../theme";

export default function PlanScreen() {
  const router = useRouter();
  const { data: plan, isLoading } = useQuery({
    queryKey: ["weeklyPlan"],
    queryFn: getWeeklyPlan,
    retry: false,
  });

  const hasTasks =
    plan?.tasks && Array.isArray(plan.tasks) && plan.tasks.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your care plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasTasks) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.emptyWrap}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState
            icon="trail-sign"
            iconColor={colors.primary}
            title="Care Path"
            description="Your personalized care journey will appear here. We'll guide you through each step so you never feel alone."
            card
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.screenTitle}>Weekly Care Plan</Text>
        {plan.tasks.map(
          (
            task: { id: string; title: string; description?: string },
            index: number
          ) => (
            <Card
              key={task.id || index}
              onPress={() =>
                router.push(`/(tabs)/plan/task-details?id=${task.id}`)
              }
              style={styles.taskCard}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              {task.description ? (
                <Text style={styles.taskDescription}>{task.description}</Text>
              ) : null}
            </Card>
          )
        )}
        <Button
          title="View Progress"
          onPress={() => router.push("/(tabs)/plan/progress")}
          style={styles.progressButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: sectionSpacing.default,
    paddingHorizontal: spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.pageBottom,
  },
  screenTitle: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  taskCard: {
    marginBottom: spacing.md,
  },
  taskTitle: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskDescription: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
  },
  progressButton: {
    marginTop: sectionSpacing.tight,
  },
});
```

### 📄 `app/(tabs)/resources/index.tsx` (Documents Screen)

```typescript
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { EmptyState } from "../../../components/ui";
import { colors, spacing, sectionSpacing } from "../../../theme";

export default function ResourcesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState
          icon="document-text"
          iconColor={colors.primary}
          title="Documents"
          description="Keep your reports and important papers in one place. Upload documents to track your child's progress and keep everything organized."
          card
          cta={{
            label: "Upload document",
            onPress: () => {
              // Navigate to upload or show upload modal
              // For now, can navigate back to home where upload action exists
            },
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: sectionSpacing.default,
    paddingHorizontal: spacing.xl,
  },
});
```

### 👥 `app/(tabs)/community/index.tsx` (Community Screen)

```typescript
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../../components/ui";
import { colors, spacing, sectionSpacing } from "../../../theme";

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState
          icon="people"
          iconColor={colors.primary}
          title="Community"
          description="Connect with other families, share experiences, and find support. You're part of a caring community—we're here for each other."
          card
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: sectionSpacing.default,
    paddingHorizontal: spacing.xl,
  },
});
```

### 👤 `app/(tabs)/profile/index.tsx` (Profile Screen)

```typescript
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useActiveChild } from "../../../hooks/useActiveChild";
import { Card, Button, Avatar } from "../../../components/ui";
import {
  colors,
  spacing,
  radius,
  typography,
  sectionSpacing,
} from "../../../theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeChild } = useActiveChild();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  // Get user initials for avatar
  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || undefined;

  const childName = activeChild?.name ?? "No child selected";
  const childAge = activeChild?.age;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.userCard}>
          <Avatar initials={userInitials} size="lg" style={styles.userAvatar} />
          <Text style={styles.userName}>{user?.name ?? "User"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
        </Card>

        {/* Manage Children Card */}
        <Card
          onPress={() => router.push("/(tabs)/profile/manage-children")}
          style={styles.manageChildrenCard}
        >
          <View style={styles.manageChildrenContent}>
            <View style={styles.manageChildrenLeft}>
              <Ionicons
                name="people-outline"
                size={24}
                color={colors.primary}
              />
              <View style={styles.manageChildrenText}>
                <Text style={styles.manageChildrenTitle}>Manage Children</Text>
                <Text style={styles.manageChildrenSubtitle}>
                  {childName}
                  {childAge ? ` • ${childAge} years old` : ""}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </View>
        </Card>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>

        {/* Notifications Toggle */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.text}
              />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={
                notificationsEnabled ? colors.primary : colors.borderLight
              }
              ios_backgroundColor={colors.border}
            />
          </View>
        </Card>

        {/* Email Updates Toggle */}
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color={colors.text} />
              <Text style={styles.settingLabel}>Email Updates</Text>
            </View>
            <Switch
              value={emailUpdatesEnabled}
              onValueChange={setEmailUpdatesEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={
                emailUpdatesEnabled ? colors.primary : colors.borderLight
              }
              ios_backgroundColor={colors.border}
            />
          </View>
        </Card>

        {/* List Items */}
        <Card style={styles.listCard}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push("/(tabs)/profile/settings")}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <Ionicons name="settings-outline" size={22} color={colors.text} />
              <Text style={styles.listItemLabel}>Settings</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </TouchableOpacity>

          <View style={styles.listItemDivider} />

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={colors.text}
              />
              <Text style={styles.listItemLabel}>Help & Support</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </TouchableOpacity>

          <View style={styles.listItemDivider} />

          <TouchableOpacity
            style={styles.listItem}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color={colors.text}
              />
              <Text style={styles.listItemLabel}>Privacy Policy</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sign out"
          onPress={handleSignOut}
          variant="ghost"
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.pageBottom,
  },
  userCard: {
    alignItems: "center",
    marginBottom: sectionSpacing.default,
    paddingVertical: spacing.xxl,
  },
  userAvatar: {
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.bodySmall,
    lineHeight: typography.bodySmallLineHeight,
    color: colors.textMuted,
  },
  manageChildrenCard: {
    marginBottom: sectionSpacing.default,
  },
  manageChildrenContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manageChildrenLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  manageChildrenText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  manageChildrenTitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.xxs,
  },
  manageChildrenSubtitle: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  settingCard: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
  },
  listCard: {
    marginBottom: sectionSpacing.default,
    paddingVertical: 0,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  listItemLabel: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
  },
  listItemDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.md + 22 + spacing.md, // icon size (22) + gap (md) + icon size (22)
    marginRight: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.sm,
    borderColor: colors.border,
  },
});
```
