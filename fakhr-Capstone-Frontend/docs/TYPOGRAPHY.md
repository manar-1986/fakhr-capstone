# Typography Guide

Clear hierarchy, comfortable line heights, and consistent font sizes across all screens.

---

## Hierarchy

### 1. Screen Titles

**Use:** Main page headings  
**Token:** `typography.display` (28px)  
**Line Height:** `typography.displayLineHeight` (34px)  
**Weight:** `typography.weightBold` (700)

```tsx
screenTitle: {
  fontSize: typography.display,
  lineHeight: typography.displayLineHeight,
  fontWeight: typography.weightBold,
  color: colors.text,
}
```

**Examples:**

- "Weekly Care Plan"
- "Settings"
- "Manage Children"
- "Daily Check-In"

---

### 2. Section Headers

**Use:** Major sections within a screen  
**Tokens:**

- `typography.h1` (24px) — primary sections
- `typography.h2` (20px) — subsections
- `typography.h3` (18px) — smaller sections
  **Line Heights:** `h1LineHeight` (30px), `h2LineHeight` (26px), `h3LineHeight` (24px)  
  **Weight:** `typography.weightBold` or `typography.weightSemibold`

```tsx
sectionHeader: {
  fontSize: typography.h1,
  lineHeight: typography.h1LineHeight,
  fontWeight: typography.weightBold,
  color: colors.text,
}
```

**Examples:**

- "This week's plan" (h3)
- "Today's focus" (h3)
- "Recommended for you" (h3)
- "Quick actions" (h3)

---

### 3. Body Text

**Use:** Primary content, descriptions, paragraphs  
**Tokens:**

- `typography.body` (16px) — standard body text
- `typography.bodySmall` (15px) — slightly smaller body text
  **Line Heights:** `bodyLineHeight` (24px), `bodySmallLineHeight` (22px)  
  **Weight:** `typography.weightRegular` (400) or `typography.weightMedium` (500)

```tsx
bodyText: {
  fontSize: typography.body,
  lineHeight: typography.bodyLineHeight,
  color: colors.text,
}
```

**Examples:**

- Card descriptions
- Form field values
- Task descriptions
- Content paragraphs

---

### 4. Helper / Caption Text

**Use:** Supporting text, labels, metadata, hints  
**Token:** `typography.caption` (14px) — **minimum readable size**  
**Line Height:** `typography.captionLineHeight` (20px)  
**Weight:** `typography.weightMedium` (500) or `typography.weightSemibold` (600)

```tsx
helperText: {
  fontSize: typography.caption,
  lineHeight: typography.captionLineHeight,
  color: colors.textMuted,
}
```

**Examples:**

- Form labels
- Metadata ("5 min read · Dr. Amina Hassan")
- Progress labels ("3 of 4 completed")
- Button labels (small actions)
- Section labels ("HOW ARE YOU FEELING?")

---

## Minimum Font Sizes

### ✅ Readable Text (14px minimum)

- All user-facing text must be **at least 14px** (`typography.caption`)
- This ensures accessibility and readability

### ⚠️ UI-Only Elements (12–13px)

- `typography.overline` (12px) — **tab bar labels only**
- `typography.label` (13px) — **badges, tiny UI elements only**

**Never use these for readable content.**

---

## Line Heights

**Always pair `fontSize` with `lineHeight`** for comfortable reading.

| Size       | Font Size | Line Height | Ratio |
| ---------- | --------- | ----------- | ----- |
| Display    | 28px      | 34px        | ~1.21 |
| H1         | 24px      | 30px        | 1.25  |
| H2         | 20px      | 26px        | 1.3   |
| H3         | 18px      | 24px        | 1.33  |
| Body       | 16px      | 24px        | 1.5   |
| Body Small | 15px      | 22px        | ~1.47 |
| Caption    | 14px      | 20px        | ~1.43 |

---

## Usage Examples

### Screen Title

```tsx
const styles = StyleSheet.create({
  screenTitle: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
});
```

### Section Header

```tsx
const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
});
```

### Body Text

```tsx
const styles = StyleSheet.create({
  description: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textSecondary,
  },
});
```

### Helper Text

```tsx
const styles = StyleSheet.create({
  label: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
```

---

## Consistency Checklist

When creating or updating screens, ensure:

- ✅ Screen titles use `display` (28px)
- ✅ Section headers use `h1`, `h2`, or `h3` (24px, 20px, 18px)
- ✅ Body text uses `body` or `bodySmall` (16px, 15px)
- ✅ Helper text uses `caption` (14px) minimum
- ✅ All text has matching `lineHeight`
- ✅ No fonts smaller than 14px for readable content
- ✅ Font weights are consistent (`weightBold` for titles, `weightSemibold` for emphasis, `weightRegular`/`weightMedium` for body)

---

## Common Patterns

### Card Title + Description

```tsx
cardTitle: {
  fontSize: typography.body,
  lineHeight: typography.bodyLineHeight,
  fontWeight: typography.weightSemibold,
  color: colors.text,
  marginBottom: spacing.xs,
},
cardDescription: {
  fontSize: typography.caption,
  lineHeight: typography.captionLineHeight,
  color: colors.textMuted,
},
```

### Form Label + Input

```tsx
label: {
  fontSize: typography.caption,
  lineHeight: typography.captionLineHeight,
  fontWeight: typography.weightSemibold,
  color: colors.text,
  marginBottom: spacing.sm,
},
input: {
  fontSize: typography.body,
  lineHeight: typography.bodyLineHeight,
  color: colors.text,
  backgroundColor: colors.backgroundCard,
},
```

### Button Text

```tsx
buttonText: {
  fontSize: typography.body,
  lineHeight: typography.bodyLineHeight,
  fontWeight: typography.weightSemibold,
  color: colors.backgroundCard,
},
```

---

## Reference

See `constants/theme.ts` for the complete typography system:

```ts
export const typography = {
  // Screen titles
  display: 28,
  displayLineHeight: 34,

  // Section headers
  h1: 24,
  h1LineHeight: 30,
  h2: 20,
  h2LineHeight: 26,
  h3: 18,
  h3LineHeight: 24,

  // Body text
  body: 16,
  bodyLineHeight: 24,
  bodySmall: 15,
  bodySmallLineHeight: 22,

  // Helper/caption (minimum readable size)
  caption: 14,
  captionLineHeight: 20,

  // UI-only (not for readable text)
  label: 13,
  labelLineHeight: 18,
  overline: 12,
  overlineLineHeight: 16,

  // Font weights
  weightRegular: "400",
  weightMedium: "500",
  weightSemibold: "600",
  weightBold: "700",
};
```
