# Fakhr — Design System (MUST MATCH)

**These values are MANDATORY. Do NOT change without explicit approval.**

---

## 🎨 Colors (EXACT VALUES)

### Primary Colors

- **Primary:** `#D99E8E` (warm coral/peach)
- **White:** `#FFFFFF`
- **Background:** `#F6E4DE` (soft warm beige)
- **Text:** `#333333` (dark gray)

### Usage

```typescript
import { colors } from "../theme";

// Primary action
backgroundColor: colors.primary; // #D99E8E

// Background
backgroundColor: colors.background; // #F6E4DE

// Text
color: colors.text; // #333333

// Cards
backgroundColor: colors.backgroundCard; // #FFFFFF
```

---

## 📐 Spacing & Layout (EXACT VALUES FROM CSS)

**CRITICAL: Cards MUST have proper padding, margins, and clear separation. Nothing should feel "flat" or stacked incorrectly.**

### Card Spacing Rules

1. **Card Padding**

   - Standard cards: `padding: 20px` (all sides)
   - Create account CTA: `paddingVertical: 24px`, `paddingHorizontal: 20px`
   - Quick action cards: `paddingVertical: 18px`, `paddingHorizontal: 12px`
   - **NEVER** use less than 20px padding for standard cards

2. **Card Margins**

   - Standard cards: `marginBottom: 16px`
   - Task/Recommendation cards: `marginBottom: 12px`
   - Create account CTA: `marginBottom: 20px`
   - Quick actions container: `marginBottom: 16px`
   - **ALWAYS** provide bottom margin for visual separation

3. **Section Title Spacing**

   - `marginTop: 4px` (from previous section)
   - `marginBottom: 12px` (to card below)
   - Creates clear visual hierarchy between sections

4. **Internal Card Gaps**

   - Profile card: `gap: 14px` (between avatar, info, dropdown)
   - Task/Recommendation cards: `gap: 16px` (between checkbox/icon and content)
   - Quick actions: `gap: 12px` (between action buttons)
   - Progress dots: `gap: 8px`
   - **ALWAYS** use gap for flex layouts to ensure consistent spacing

5. **Card Visual Depth**

   - `borderRadius: 14px` (var(--radius))
   - `borderWidth: 1px`
   - `borderColor: rgba(0, 0, 0, 0.05)` (var(--border))
   - `shadowColor: "#000"`
   - `shadowOffset: { width: 0, height: 1 }`
   - `shadowOpacity: 0.03`
   - `shadowRadius: 3`
   - `elevation: 1` (Android)
   - **NEVER** use flat cards without shadows/borders

6. **Content Spacing**
   - Header margin-bottom: `24px` (to create account CTA)
   - Mood row margin-bottom: `22px`
   - Section spacing: `4px` top + `12px` bottom = `16px` total between sections
   - Card content: Proper internal spacing with margins (e.g., `marginBottom: 6px` for headings, `marginTop: 12px` for "Why this matters")

### Spacing Values (from CSS)

- **2px**: Minimal spacing (e.g., checkbox margin-top)
- **4px**: Small spacing (e.g., section title margin-top, text margin-top)
- **6px**: Small content gap (e.g., "Why this matters" icon gap)
- **8px**: Medium-small gap (e.g., progress dots)
- **10px**: Medium gap (e.g., progress dots margin-bottom)
- **12px**: Standard gap (e.g., section title margin-bottom, quick actions gap)
- **14px**: Profile card gap
- **16px**: Standard card margin-bottom, task/rec card gap
- **18px**: Quick action padding vertical
- **20px**: Standard card padding, create CTA padding horizontal
- **22px**: Mood row margin-bottom
- **24px**: Header margin-bottom, create CTA padding vertical

**Rules:**

- **ALWAYS** use consistent spacing values from the list above
- **NEVER** stack cards without proper margins
- **ALWAYS** ensure cards have shadows/borders for depth
- **ALWAYS** maintain clear separation between sections
- **NEVER** use uniform spacing — vary based on content hierarchy

---

## 📝 Typography (EXACT VALUES FROM CSS)

**CRITICAL: Typography MUST have clear visual hierarchy with different font sizes and weights. NO uniform text sizes.**

### Typography Hierarchy (from styles.css)

1. **Main Greeting** (e.g., "Good afternoon, Sarah")

   - `fontSize: 19.2px` (1.2rem)
   - `fontWeight: "600"` (bold)
   - `color: #3A3A3A` (text)
   - **LARGEST and BOLDEST** — most prominent element

2. **Subtitle** (e.g., "How are you today?")

   - `fontSize: 14px` (0.875rem)
   - `fontWeight: "400"` (regular)
   - `color: #6B6B6B` (textSecondary)
   - **SMALLER** than greeting — clear visual distinction

3. **Section Titles** (e.g., "This week's plan", "Today's focus")

   - `fontSize: 16px` (1rem)
   - `fontWeight: "600"` (bold)
   - `color: #3A3A3A` (text)
   - Medium size, bold — clear hierarchy

4. **Card Headings** (e.g., "Omar", "Practice communication cards", "Building Social Confidence")

   - `fontSize: 16px` (1rem) or `16.8px` (1.05rem) for profile names
   - `fontWeight: "600"` (bold)
   - `color: #3A3A3A` (text)
   - Medium size, bold — distinct from body text

5. **Body Text** (e.g., "7 years old", "10 minutes with picture cards")

   - `fontSize: 14px` (0.875rem)
   - `fontWeight: "400"` (regular)
   - `color: #6B6B6B` (textSecondary)
   - Smaller than headings — clear distinction

6. **Small Text** (e.g., "Week 2", "Why this matters", "5 min read")

   - `fontSize: 12px` (0.75rem) to `12.8px` (0.8rem)
   - `fontWeight: "400"` (regular)
   - `color: #9A9A9A` (textTertiary)
   - Smallest — tertiary information

7. **Links & Actions**
   - `fontSize: 13.6px` (0.85rem)
   - `fontWeight: "600"` for primary actions, `"400"` for secondary
   - Distinct from body text

**Rules:**

- **ALWAYS** pair `fontSize` with `lineHeight` (typically 1.3-1.5x fontSize)
- **NEVER** use uniform text sizes — each level must be visually distinct
- **ALWAYS** use different font weights to create hierarchy (600 for headings, 400 for body)
- Greeting MUST be the largest and boldest element on the screen

---

## 🎯 Design Style

- **Calm** — soft, gentle, supportive
- **Soft** — rounded corners, subtle shadows
- **Minimal** — clean, uncluttered
- **Mobile-first** — optimized for small screens

---

## ⚠️ Rules

1. **DO NOT** change these color values without approval
2. **DO NOT** use hardcoded colors — always use `colors` from theme
3. **DO NOT** use arbitrary spacing — always use `spacing` tokens
4. **DO NOT** use arbitrary font sizes — always use `typography` tokens
5. **MATCH EXACTLY** when designs/screenshots are provided

---

## ✅ Correct Usage

```typescript
import { colors, spacing, typography, radius } from "../theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background, // ✅ Using theme
    padding: spacing.xl, // ✅ Using theme
  },
  title: {
    fontSize: typography.h1, // ✅ Using theme
    lineHeight: typography.h1LineHeight, // ✅ Always pair with lineHeight
    color: colors.text, // ✅ Using theme
  },
});
```

---

## ❌ Incorrect Usage

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6E4DE", // ❌ Hardcoded color
    padding: 20, // ❌ Arbitrary spacing
  },
  title: {
    fontSize: 24, // ❌ Hardcoded size
    color: "#333", // ❌ Hardcoded color
  },
});
```

---

**Last Updated:** February 3, 2026  
**Status:** ACTIVE — Must match exactly
