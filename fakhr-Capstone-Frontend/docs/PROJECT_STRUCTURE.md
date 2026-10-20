# Fakhr — Project structure

React Native (Expo + Expo Router). Originally static HTML; UI migrated to RN screens.

---

## Stack

- **Expo** + **Expo Router** (file-based routing)
- **React Native** (iOS/Android)
- **Design system:** `constants/theme.ts` (health-tech, calm, minimal)

---

## Tabs (bottom navigation)

**Defined in:** `app/(tabs)/_layout.tsx`

| Route       | Tab label | Main screen                      | In tab bar        |
| ----------- | --------- | -------------------------------- | ----------------- |
| `home`      | Home      | `app/(tabs)/home/index.tsx`      | ✓                 |
| `plan`      | Care Path | `app/(tabs)/plan/index.tsx`      | ✓                 |
| `resources` | Documents | `app/(tabs)/resources/index.tsx` | ✓                 |
| `community` | Community | `app/(tabs)/community/index.tsx` | ✓                 |
| `profile`   | Profile   | `app/(tabs)/profile/index.tsx`   | ✓                 |
| `directory` | Directory | `app/(tabs)/directory/`          | No (`href: null`) |

Directory is reachable from Home (e.g. “Find centers”) but not shown in the tab bar.

---

## Tab screens and nested routes

### Home

`app/(tabs)/home/index.tsx`  
Dashboard: greeting, mood, child card, this week’s plan, today’s focus, recommended, quick actions.

### Care Path (plan)

- **Main:** `app/(tabs)/plan/index.tsx` — weekly plan / placeholder
- **Nested:** `task-details.tsx`, `progress.tsx`, `check-in.tsx`

### Documents (resources)

- **Main:** `app/(tabs)/resources/index.tsx` — Documents placeholder
- **Nested:** `content-details.tsx`

### Community

- **Main:** `app/(tabs)/community/index.tsx` — Community placeholder
- **Nested:** `create-post.tsx`, `events.tsx`

### Profile

- **Main:** `app/(tabs)/profile/index.tsx` — account details, sign out
- **Nested:** `manage-children.tsx`, `settings.tsx`

### Directory (no tab)

- **Screens:** `centers.tsx`, `center-details.tsx`, `professionals.tsx`, `professional-details.tsx`
- **Entry:** e.g. `router.push("/(tabs)/directory/centers")` from Home.

---

## Other route groups

- **Auth:** `app/(auth)/` — `login`, `register`, `forgot-password` (Stack, no tabs).
- **Onboarding:** `app/(onboarding)/` — parent profile, child flows, generate plan.
- **Root:** `app/index.tsx` — auth gate; redirects to `/(auth)/login` or `/(tabs)/home`.

---

## Quick reference

- **Tabs layout:** `app/(tabs)/_layout.tsx`
- **Theme:** `constants/theme.ts`
- **Auth context:** `context/AuthContext.tsx`
- **API modules:** `api/*.api.ts` (frontend-only; no backend required for current UI).
