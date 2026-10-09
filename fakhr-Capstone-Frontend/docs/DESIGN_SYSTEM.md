# Fakhr Design System

Production-level health-tech UI. Same routes, screen structure, content, and navigation—no routing or backend changes.

---

## Principles

- **Calm, trustworthy, minimal** — health-tech appropriate
- **Single source of truth** — `constants/theme.ts`
- **8px grid** — spacing and section rhythm
- **Clear hierarchy** — display → h1 → h2/h3 → body → caption/overline

---

## Tokens

### Colors (`colors`)

| Use              | Token                                             | Example |
| ---------------- | ------------------------------------------------- | ------- |
| Page background  | `background`                                      | #F5F7F6 |
| Cards, inputs    | `backgroundCard`                                  | #FFFFFF |
| Primary actions  | `primary`                                         | #4A7C59 |
| Primary soft bg  | `primaryLight`                                    | #E8F0EB |
| Links, secondary | `secondary`                                       | #4A90A4 |
| Headings, body   | `text`, `textSecondary`, `textMuted`, `textLight` | —       |
| Borders          | `border`, `borderLight`                           | —       |
| Error            | `error`, `errorLight`                             | —       |
| Sign out link    | `signOut`                                         | #8B7355 |

### Spacing (`spacing`)

8px base: `xxs` (2), `xs` (4), `sm` (8), `md` (12), `lg` (16), `xl` (20), `xxl` (24), `xxxl` (32), `section` (28), `pageBottom` (40).

### Section spacing (`sectionSpacing`)

Between major blocks: `tight` (20), `default` (28), `loose` (36).

### Radius (`radius`)

`xs` (6), `sm` (8), `md` (12), `lg` (16), `xl` (20), `full`.

### Typography (`typography`)

**📖 See [TYPOGRAPHY.md](./TYPOGRAPHY.md) for complete guide**

- **Screen titles** — `display` (28px) — main page headings
- **Section headers** — `h1` (24px), `h2` (20px), `h3` (18px) — major sections
- **Body text** — `body` (16px), `bodySmall` (15px) — primary content
- **Helper/caption** — `caption` (14px) minimum — supporting text, labels
- **UI-only** — `label` (13px), `overline` (12px) — tab bar, badges only
- **Weights** — `weightRegular`, `weightMedium`, `weightSemibold`, `weightBold`

**Rules:**

- Always pair `fontSize` with `lineHeight` for readability
- No fonts smaller than 14px for readable text
- Consistent font sizes across screens

### Shadows

- `cardShadow` — cards, elevated surfaces
- `cardShadowSubtle` — soft elevation

### Touch Targets & Accessibility

**📖 See [SPACING_ACCESSIBILITY.md](./SPACING_ACCESSIBILITY.md) for complete guide**

- **Minimum touch target:** 44px (iOS/Android guidelines)
- **Standard button height:** 52px
- **Card padding:** `spacing.lg` (16px) — consistent across screens
- **Section spacing:** `sectionSpacing.default` (28px) — generous vertical spacing
- **Tap states:** All `TouchableOpacity` use `activeOpacity` for feedback
- **Accessibility:** All interactive elements have labels
- **Contrast:** All text meets WCAG AA standards (4.5:1 minimum)

---

## Usage

```ts
import {
  colors,
  spacing,
  radius,
  typography,
  sectionSpacing,
  cardShadow,
} from "../theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    paddingBottom: spacing.pageBottom,
  },
  title: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  card: {
    ...cardShadow,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
```

---

## Components

- **EmptyState** (`components/ui/EmptyState.tsx`) — placeholder screens (Community, Documents, Care Path empty). Props: `icon`, `iconColor`, `title`, `description`, `card?`.

---

## Screens

All screens use the same design system; no custom hex or magic numbers. Auth (login, register, forgot-password), tabs (home, plan, resources, community, profile), and root index share tokens. Routes and navigation are unchanged.
