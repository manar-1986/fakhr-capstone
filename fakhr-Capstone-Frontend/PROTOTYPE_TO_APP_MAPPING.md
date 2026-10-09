# HTML Prototype to React Native App Mapping

This document maps the HTML prototype files (`sanad-ui/`) to the React Native implementation (`Sanad-Capstone-Fronend/`).

---

## 📋 Prototype Files → React Native Screens

### Landing/Onboarding

| HTML Prototype | React Native Screen                     | Route                            | Status      |
| -------------- | --------------------------------------- | -------------------------------- | ----------- |
| `index.html`   | `app/(onboarding)/landing.tsx`          | `/(onboarding)/landing`          | ✅ Complete |
| -              | `app/(onboarding)/parent-profile.tsx`   | `/(onboarding)/parent-profile`   | ✅ Complete |
| -              | `app/(onboarding)/child-basic.tsx`      | `/(onboarding)/child-basic`      | ✅ Complete |
| -              | `app/(onboarding)/child-medical.tsx`    | `/(onboarding)/child-medical`    | ✅ Complete |
| -              | `app/(onboarding)/child-diagnosis.tsx`  | `/(onboarding)/child-diagnosis`  | ✅ Complete |
| -              | `app/(onboarding)/child-challenges.tsx` | `/(onboarding)/child-challenges` | ✅ Complete |
| -              | `app/(onboarding)/child-goals.tsx`      | `/(onboarding)/child-goals`      | ✅ Complete |
| -              | `app/(onboarding)/generate-plan.tsx`    | `/(onboarding)/generate-plan`    | ✅ Complete |

### Authentication

| HTML Prototype        | React Native Screen              | Route                     | Status      |
| --------------------- | -------------------------------- | ------------------------- | ----------- |
| `login.html`          | `app/(auth)/login.tsx`           | `/(auth)/login`           | ✅ Complete |
| `create-account.html` | `app/(auth)/register.tsx`        | `/(auth)/register`        | ✅ Complete |
| -                     | `app/(auth)/forgot-password.tsx` | `/(auth)/forgot-password` | ✅ Complete |

### Main App Screens

| HTML Prototype                       | React Native Screen              | Route               | Status      |
| ------------------------------------ | -------------------------------- | ------------------- | ----------- |
| `PROMPT_REACT_NATIVE_HOME.md` (Home) | `app/(tabs)/home/index.tsx`      | `/(tabs)/home`      | ✅ Complete |
| `care-path.html`                     | `app/(tabs)/plan/index.tsx`      | `/(tabs)/plan`      | ✅ Complete |
| `documents.html`                     | `app/(tabs)/resources/index.tsx` | `/(tabs)/resources` | ✅ Complete |
| `community.html`                     | `app/(tabs)/community/index.tsx` | `/(tabs)/community` | ✅ Complete |
| `profile.html`                       | `app/(tabs)/profile/index.tsx`   | `/(tabs)/profile`   | ✅ Complete |

---

## 🎨 CSS Styles → Design System

### Prototype CSS (`sanad-ui/css/styles.css`)

The HTML prototype uses CSS for styling. The React Native app uses a centralized design system:

| CSS Concept   | React Native Implementation | Location                          |
| ------------- | --------------------------- | --------------------------------- |
| Colors        | `theme/colors.ts`           | Design system tokens              |
| Spacing       | `theme/spacing.ts`          | 8pt grid system                   |
| Typography    | `theme/typography.ts`       | Font sizes, weights, line heights |
| Border Radius | `theme/radius.ts`           | Consistent radius values          |
| Shadows       | `theme/index.ts`            | Platform-specific shadows         |

### Key Design Tokens

- **Primary Color**: `#D99E8E` (matches prototype)
- **Background**: `#F6E4DE` (matches prototype)
- **Text**: `#333333` (matches prototype)
- **White**: `#FFFFFF` (matches prototype)

---

## 🔧 JavaScript → React Native Logic

### Prototype JS (`sanad-ui/js/`)

| JavaScript File | React Native Implementation                   | Location            |
| --------------- | --------------------------------------------- | ------------------- |
| `auth.js`       | `api/auth.api.ts` + `context/AuthContext.tsx` | API layer + Context |
| `main.js`       | Component logic in respective screens         | `app/` directory    |

### Key Differences

- **Prototype**: Vanilla JS with DOM manipulation
- **React Native**: React hooks, Context API, TanStack Query
- **State Management**: React Native uses Context + React Query instead of global JS variables
- **Navigation**: Expo Router instead of manual route handling

---

## 📁 Project Structure Comparison

### Prototype Structure (`sanad-ui/sanad-app/`)

```
sanad-app/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── create-account.tsx
│   ├── onboarding.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── home/index.tsx
│       ├── plan/index.tsx
│       ├── documents/index.tsx
│       ├── community/index.tsx
│       └── profile/index.tsx
├── constants/theme.ts
├── contexts/AuthContext.tsx
└── hooks/useActiveChild.ts
```

### Current Implementation (`Sanad-Capstone-Fronend/`)

```
Sanad-Capstone-Fronend/
├── app/
│   ├── _layout.tsx                    ✅ Matches
│   ├── index.tsx                      ✅ Matches
│   ├── (auth)/                        ✅ Enhanced (grouped)
│   │   ├── _layout.tsx
│   │   ├── login.tsx                  ✅ Matches
│   │   ├── register.tsx               ✅ (create-account)
│   │   └── forgot-password.tsx        ✅ Additional
│   ├── (onboarding)/                  ✅ Enhanced (multi-step)
│   │   ├── _layout.tsx
│   │   ├── landing.tsx                ✅ (onboarding)
│   │   ├── parent-profile.tsx         ✅ Additional
│   │   ├── child-basic.tsx            ✅ Additional
│   │   ├── child-medical.tsx         ✅ Additional
│   │   ├── child-diagnosis.tsx       ✅ Additional
│   │   ├── child-challenges.tsx      ✅ Additional
│   │   ├── child-goals.tsx           ✅ Additional
│   │   └── generate-plan.tsx         ✅ Additional
│   └── (tabs)/                        ✅ Matches
│       ├── _layout.tsx                ✅ Matches
│       ├── home/index.tsx             ✅ Matches
│       ├── plan/index.tsx             ✅ Matches (care-path)
│       ├── resources/index.tsx        ✅ Matches (documents)
│       ├── community/index.tsx        ✅ Matches
│       └── profile/index.tsx          ✅ Matches
├── theme/                              ✅ Enhanced (modular)
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   └── index.ts
├── context/                            ✅ Matches (renamed from contexts)
│   ├── AuthContext.tsx                ✅ Matches
│   └── LanguageContext.tsx            ✅ Additional
├── hooks/                              ✅ Matches
│   ├── useActiveChild.ts              ✅ Matches
│   └── useAuth.ts                     ✅ Additional
└── constants/theme.ts                  ⚠️ Deprecated (use theme/)
```

---

## 🔄 Route Mapping

### Prototype Routes (Expected)

- `/` → Onboarding
- `/auth/sign-in` → Login
- `/auth/create-account` → Register
- `/home` → Home Dashboard
- `/care-path` → Care Path
- `/documents` → Documents
- `/community` → Community
- `/profile` → Profile

### React Native Routes (Expo Router)

- `/` → `app/index.tsx` (redirects to onboarding or home)
- `/(onboarding)/landing` → Landing screen
- `/(auth)/login` → Login screen
- `/(auth)/register` → Create account screen
- `/(tabs)/home` → Home dashboard
- `/(tabs)/plan` → Care Path
- `/(tabs)/resources` → Documents
- `/(tabs)/community` → Community
- `/(tabs)/profile` → Profile

**Note**: Expo Router uses file-based routing with route groups `(auth)`, `(onboarding)`, `(tabs)` for organization.

---

## ✅ Implementation Status

### Core Features

- [x] All prototype screens implemented
- [x] Design system matches prototype colors/spacing
- [x] Navigation structure matches
- [x] Authentication flow complete
- [x] Onboarding flow complete (enhanced with multi-step)
- [x] All main tabs implemented

### Enhancements Over Prototype

- [x] Multi-step onboarding (8 screens vs 1)
- [x] Forgot password flow
- [x] Additional sub-screens (task details, check-in, progress, etc.)
- [x] Modular design system (theme/ directory)
- [x] TypeScript strict mode
- [x] Comprehensive error handling
- [x] Accessibility features
- [x] Loading states
- [x] Form validation

---

## 📝 Component Mapping

### HTML Elements → React Native Components

| HTML Element                          | React Native Component | Location                          |
| ------------------------------------- | ---------------------- | --------------------------------- |
| `<button>`                            | `<Button>`             | `components/ui/Button.tsx`        |
| `<input>`                             | `<Input>`              | `components/ui/Input.tsx`         |
| `<div class="card">`                  | `<Card>`               | `components/ui/Card.tsx`          |
| `<label>` + `<input type="checkbox">` | `<Toggle>`             | `components/ui/Toggle.tsx`        |
| Custom chips                          | `<Chip>`               | `components/ui/Chip.tsx`          |
| Avatar div                            | `<Avatar>`             | `components/ui/Avatar.tsx`        |
| Section headers                       | `<SectionHeader>`      | `components/ui/SectionHeader.tsx` |
| Empty states                          | `<EmptyState>`         | `components/ui/EmptyState.tsx`    |

---

## 🎯 Key Differences

### 1. File Organization

- **Prototype**: Flat structure, single onboarding file
- **Current**: Grouped routes `(auth)`, `(onboarding)`, `(tabs)` for better organization

### 2. Onboarding Flow

- **Prototype**: Single `onboarding.tsx` file
- **Current**: Multi-step flow with 8 screens for better UX

### 3. Design System

- **Prototype**: `constants/theme.ts` (single file)
- **Current**: Modular `theme/` directory (colors, spacing, typography, radius)

### 4. Context Organization

- **Prototype**: `contexts/` directory
- **Current**: `context/` directory (singular, matches React convention)

### 5. Additional Features

- **Current**: More screens, better error handling, accessibility, TypeScript

---

## 🚀 Migration Notes

If migrating from prototype structure to current structure:

1. **Routes**: Update route paths to use Expo Router groups
2. **Imports**: Update theme imports from `constants/theme` to `theme/`
3. **Context**: Update import paths from `contexts/` to `context/`
4. **Onboarding**: Split single onboarding into multi-step flow
5. **Components**: Use reusable UI components instead of inline styles

---

## ✅ Verification Checklist

- [x] All prototype screens have React Native equivalents
- [x] Design system matches prototype colors
- [x] Navigation structure aligns with prototype
- [x] Component functionality matches prototype behavior
- [x] All routes are accessible
- [x] UI matches prototype design
- [x] Enhanced features don't break prototype flow

---

_Last Updated: [Current Date]_
_Status: ✅ Complete - All prototype screens implemented with enhancements_
