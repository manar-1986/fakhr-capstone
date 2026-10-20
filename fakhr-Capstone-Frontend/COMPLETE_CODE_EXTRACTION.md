# Fakhr Frontend - Complete Code Extraction

This document contains all code files from the Fakhr React Native project, organized by category.

---

## 📋 Table of Contents

1. [Configuration Files](#1-configuration-files)
2. [Design System (Theme)](#2-design-system-theme)
3. [Context Providers](#3-context-providers)
4. [Custom Hooks](#4-custom-hooks)
5. [Type Definitions](#5-type-definitions)
6. [API Layer](#6-api-layer)
7. [Utilities](#7-utilities)
8. [UI Components](#8-ui-components)
9. [Internationalization](#9-internationalization)
10. [App Routes - Root](#10-app-routes---root)
11. [App Routes - Authentication](#11-app-routes---authentication)
12. [App Routes - Onboarding](#12-app-routes---onboarding)
13. [App Routes - Main Tabs](#13-app-routes---main-tabs)

---

## 1. Configuration Files

### package.json

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

### tsconfig.json

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

### app.json

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

### .gitignore

```
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

### eslint.config.js

```javascript
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

### .env.example

```
# Fakhr — Environment Variables
# Copy this file to .env and fill in your values
# DO NOT commit .env to git (it's in .gitignore)

# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Add other environment variables here as needed
```

---

## 2. Design System (Theme)

### theme/colors.ts

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

### theme/spacing.ts

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

### theme/typography.ts

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

### theme/radius.ts

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

### theme/index.ts

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

### constants/theme.ts

```typescript
/**
 * @deprecated Use theme/ directory instead
 * This file is kept for backward compatibility
 *
 * Import from theme/ instead:
 * import { colors, spacing, typography, radius } from "../theme";
 */

export * from "../theme";
```

---

_[Document continues with remaining sections...]_

**Note**: This is Part 1 of the complete code extraction. The document will continue with:

- Context Providers
- Custom Hooks
- Type Definitions
- API Layer
- Utilities
- UI Components
- Internationalization
- All App Routes

Would you like me to continue with the remaining sections?
