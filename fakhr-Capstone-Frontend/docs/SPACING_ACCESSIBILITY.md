# Spacing & Accessibility Guide

8pt spacing system, generous vertical spacing, consistent card padding, and accessibility best practices.

---

## Spacing System

### 8pt Base Grid

All spacing uses multiples of 8px for consistency:

| Token  | Size | Use Case                       |
| ------ | ---- | ------------------------------ |
| `xxs`  | 2px  | Tiny gaps                      |
| `xs`   | 4px  | Very small spacing             |
| `sm`   | 8px  | Small spacing                  |
| `md`   | 12px | Medium spacing                 |
| `lg`   | 16px | Standard spacing, card padding |
| `xl`   | 20px | Large spacing, screen padding  |
| `xxl`  | 24px | Extra large spacing            |
| `xxxl` | 32px | Maximum spacing                |

### Section Spacing

Generous vertical spacing between major sections:

| Token     | Size | Use Case                          |
| --------- | ---- | --------------------------------- |
| `tight`   | 20px | Between related items             |
| `default` | 28px | Between major sections (standard) |
| `loose`   | 36px | Between very distinct sections    |

### Card Padding

**Consistent:** `spacing.lg` (16px) for all cards

```tsx
card: {
  backgroundColor: colors.backgroundCard,
  borderRadius: radius.lg,
  padding: spacing.lg, // 16px - consistent
  marginBottom: spacing.lg,
}
```

---

## Touch Targets

### Minimum Size: 44px

All interactive elements must meet **44px minimum** touch target (iOS/Android guidelines).

### Button Heights

- **Standard buttons:** `minHeight: 52px` (comfortable, exceeds minimum)
- **Small buttons:** `minHeight: 44px` (meets minimum)
- **Icon buttons:** `minWidth: 44px, minHeight: 44px`

```tsx
// Standard button
button: {
  backgroundColor: colors.primary,
  borderRadius: radius.md,
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52, // Exceeds 44px minimum
}

// Icon button
iconButton: {
  padding: spacing.md,
  minWidth: 44,
  minHeight: 44,
  justifyContent: "center",
  alignItems: "center",
}
```

---

## Accessibility

### Contrast Ratios

All text meets WCAG AA standards:

| Text Color            | Background                 | Ratio  | Status           |
| --------------------- | -------------------------- | ------ | ---------------- |
| `text` (#1A2E22)      | `backgroundCard` (#FFFFFF) | 16.8:1 | ✅ AAA           |
| `text` (#1A2E22)      | `background` (#F6F5F3)     | 15.2:1 | ✅ AAA           |
| `textMuted` (#5C6B63) | `backgroundCard` (#FFFFFF) | 6.2:1  | ✅ AA            |
| `primary` (#4A7C59)   | `backgroundCard` (#FFFFFF) | 4.5:1  | ✅ AA            |
| `textLight` (#8A9A92) | `backgroundCard` (#FFFFFF) | 3.1:1  | ⚠️ Use sparingly |

### Tap States

All `TouchableOpacity` components must have `activeOpacity` for clear feedback:

```tsx
// Good - clear tap state
<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  activeOpacity={0.7} // or 0.85 for subtle
>
  <Text>Button</Text>
</TouchableOpacity>

// Bad - no tap feedback
<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Text>Button</Text>
</TouchableOpacity>
```

**Recommended values:**

- **Buttons:** `activeOpacity={0.7}` (clear feedback)
- **Cards/Links:** `activeOpacity={0.85}` (subtle feedback)
- **Icons:** `activeOpacity={0.7}` (clear feedback)

### Accessibility Labels

All interactive elements need accessibility labels:

```tsx
// Icon buttons
<TouchableOpacity
  accessibilityLabel="Notifications"
  accessibilityRole="button"
  activeOpacity={0.7}
>
  <Ionicons name="notifications-outline" />
</TouchableOpacity>

// Buttons with text (text serves as label)
<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  accessibilityRole="button"
  activeOpacity={0.7}
>
  <Text>Sign In</Text>
</TouchableOpacity>
```

### Icons with Labels

Icons should be paired with text labels when possible:

```tsx
// Good - icon + label
<TouchableOpacity style={styles.quickAction}>
  <Ionicons name="cloud-upload-outline" />
  <Text>Upload document</Text>
</TouchableOpacity>

// Acceptable - icon-only with accessibility label
<TouchableOpacity
  accessibilityLabel="Notifications"
  accessibilityRole="button"
>
  <Ionicons name="notifications-outline" />
</TouchableOpacity>
```

---

## Usage Examples

### Card with Consistent Padding

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.lg, // 16px - consistent
    marginBottom: spacing.lg,
    ...cardShadow,
  },
});
```

### Button with Proper Touch Target

```tsx
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52, // Exceeds 44px minimum
  },
});

// Usage
<TouchableOpacity
  style={styles.button}
  onPress={handlePress}
  accessibilityRole="button"
  activeOpacity={0.7}
>
  <Text style={styles.buttonText}>Submit</Text>
</TouchableOpacity>;
```

### Section with Generous Spacing

```tsx
const styles = StyleSheet.create({
  section: {
    marginBottom: sectionSpacing.default, // 28px - generous
  },
  sectionTitle: {
    fontSize: typography.h3,
    marginBottom: spacing.lg, // 16px - between title and content
  },
});
```

### Screen Layout

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl, // 20px - screen padding
    paddingTop: spacing.xl,
    paddingBottom: spacing.pageBottom, // 40px - bottom padding
  },
});
```

---

## Checklist

When creating or updating screens:

- ✅ All spacing uses 8pt grid tokens (`spacing.*`)
- ✅ Cards use consistent padding (`spacing.lg` = 16px)
- ✅ Generous vertical spacing between sections (`sectionSpacing.default` = 28px)
- ✅ All buttons have `minHeight: 44px` (preferably 52px)
- ✅ All `TouchableOpacity` have `activeOpacity`
- ✅ All interactive elements have accessibility labels
- ✅ Icons are paired with text labels when possible
- ✅ Text contrast meets WCAG AA standards (4.5:1 minimum)

---

## Reference

See `constants/theme.ts` for spacing tokens:

```ts
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // Card padding
  xl: 20, // Screen padding
  xxl: 24,
  xxxl: 32,
  section: 28,
  pageBottom: 40,
};

export const sectionSpacing = {
  tight: 20,
  default: 28, // Standard section spacing
  loose: 36,
};

export const touchTargets = {
  minimum: 44,
  button: 52,
  buttonSmall: 44,
  cardPadding: 16,
};
```
