# Shared UI Components

Reusable components for consistent UI across the app.

---

## Card

Used everywhere for consistent card styling.

```tsx
import { Card } from "../../components/ui";

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Pressable card
<Card onPress={() => console.log("Pressed")}>
  <Text>Clickable card</Text>
</Card>

// Card without shadow
<Card noShadow>
  <Text>Flat card</Text>
</Card>
```

**Props:**

- `children` - Card content
- `onPress?` - Make card pressable
- `subtle?` - Use subtle shadow (same as default currently)
- `noShadow?` - Remove shadow
- `style?` - Additional styles

---

## Button

Primary, secondary, and ghost variants. Meets 44px minimum touch target.

```tsx
import { Button } from "../../components/ui";

// Primary button (default)
<Button title="Sign In" onPress={handleSignIn} />

// Secondary button
<Button title="Cancel" onPress={handleCancel} variant="secondary" />

// Ghost button
<Button title="Skip" onPress={handleSkip} variant="ghost" />

// Loading state
<Button title="Submit" onPress={handleSubmit} loading />

// Disabled state
<Button title="Submit" onPress={handleSubmit} disabled />

// Full width
<Button title="Continue" onPress={handleContinue} fullWidth />
```

**Props:**

- `title` - Button text
- `onPress` - Press handler
- `variant?` - `"primary"` | `"secondary"` | `"ghost"` (default: `"primary"`)
- `disabled?` - Disable button
- `loading?` - Show loading spinner
- `fullWidth?` - Full width button
- `style?` - Additional styles

---

## SectionHeader

Consistent section titles with optional metadata.

```tsx
import { SectionHeader } from "../../components/ui";

// Basic section header
<SectionHeader title="This week's plan" />

// With metadata
<SectionHeader title="This week's plan" meta="Week 2" />

// Different sizes
<SectionHeader title="Large Section" size="h1" />
<SectionHeader title="Medium Section" size="h2" />
<SectionHeader title="Small Section" size="h3" />
```

**Props:**

- `title` - Section title
- `meta?` - Optional metadata (e.g., "Week 2")
- `size?` - `"h1"` | `"h2"` | `"h3"` (default: `"h3"`)
- `style?` - Additional styles

---

## Chip

Toggleable chip for mood selection and similar use cases.

```tsx
import { Chip } from "../../components/ui";

// Basic chip
<Chip
  label="Great"
  icon="happy-outline"
  selected={mood === "great"}
  onPress={() => setMood("great")}
/>

// Chip without icon
<Chip
  label="Option"
  selected={selected}
  onPress={() => setSelected(!selected)}
/>
```

**Props:**

- `label` - Chip text
- `icon?` - Ionicons name
- `selected?` - Selected state
- `onPress` - Press handler
- `style?` - Additional styles

---

## Avatar

Circle placeholder with initials or icon.

```tsx
import { Avatar } from "../../components/ui";

// With initials
<Avatar initials="JD" />

// With icon
<Avatar icon="person" />

// Different sizes
<Avatar initials="AB" size="sm" />
<Avatar initials="AB" size="md" />
<Avatar initials="AB" size="lg" />

// Custom background
<Avatar initials="JD" backgroundColor="#E8F0EB" />
```

**Props:**

- `initials?` - Initials to display (e.g., "JD")
- `icon?` - Ionicons name (default: `"person"`)
- `size?` - `"sm"` | `"md"` | `"lg"` (default: `"md"`)
- `backgroundColor?` - Background color override
- `style?` - Additional styles

---

## EmptyState

Icon + title + description + optional CTA.

```tsx
import { EmptyState } from "../../components/ui";

// Basic empty state
<EmptyState
  icon="document-text"
  title="Documents"
  description="Keep your reports and important papers in one place."
/>

// Without card wrapper
<EmptyState
  icon="people"
  title="Community"
  description="Connect with other families."
  card={false}
/>

// With CTA button
<EmptyState
  icon="trail-sign"
  title="Care Path"
  description="Your personalized care journey will appear here."
  cta={{
    label: "Get Started",
    onPress: () => router.push("/onboarding"),
  }}
/>
```

**Props:**

- `icon` - Ionicons name
- `title` - Title text
- `description` - Description text
- `iconColor?` - Icon color (default: `colors.primary`)
- `card?` - Wrap in card (default: `true`)
- `cta?` - Optional CTA button `{ label, onPress }`
- `style?` - Additional styles

---

## IconBadge

Bell + notification badge. Meets 44px minimum touch target.

```tsx
import { IconBadge } from "../../components/ui";

// With badge count
<IconBadge
  icon="notifications-outline"
  badgeCount={5}
  onPress={handleNotifications}
/>

// Without badge (count = 0)
<IconBadge
  icon="notifications-outline"
  badgeCount={0}
  onPress={handleNotifications}
/>

// Custom colors
<IconBadge
  icon="mail-outline"
  badgeCount={3}
  iconColor={colors.secondary}
  badgeColor={colors.info}
  onPress={handleMail}
/>

// Custom accessibility label
<IconBadge
  icon="chatbubble-outline"
  badgeCount={2}
  onPress={handleMessages}
  accessibilityLabel="Messages"
/>
```

**Props:**

- `icon` - Ionicons name (default: `"notifications-outline"`)
- `badgeCount?` - Badge count (0 hides badge, default: `0`)
- `iconColor?` - Icon color (default: `colors.text`)
- `badgeColor?` - Badge color (default: `colors.error`)
- `onPress` - Press handler
- `accessibilityLabel?` - Accessibility label (default: `"Notifications"`)
- `style?` - Additional styles

---

## Usage Examples

### Card with Button

```tsx
<Card>
  <Text style={styles.title}>Welcome</Text>
  <Text style={styles.description}>Get started with your care plan.</Text>
  <Button title="Get Started" onPress={handleStart} fullWidth />
</Card>
```

### Section with Chips

```tsx
<SectionHeader title="How are you feeling?" />
<View style={styles.chipRow}>
  <Chip
    label="Great"
    icon="happy-outline"
    selected={mood === "great"}
    onPress={() => setMood("great")}
  />
  <Chip
    label="Okay"
    icon="remove-outline"
    selected={mood === "okay"}
    onPress={() => setMood("okay")}
  />
  <Chip
    label="Tired"
    icon="sad-outline"
    selected={mood === "tired"}
    onPress={() => setMood("tired")}
  />
</View>
```

### Header with Avatar and IconBadge

```tsx
<View style={styles.header}>
  <Avatar initials="JD" />
  <View style={styles.headerContent}>
    <Text>John Doe</Text>
  </View>
  <IconBadge
    icon="notifications-outline"
    badgeCount={3}
    onPress={handleNotifications}
  />
</View>
```

---

## Import All Components

```tsx
import {
  Card,
  Button,
  SectionHeader,
  Chip,
  Avatar,
  EmptyState,
  IconBadge,
} from "../../components/ui";
```

Or import individually:

```tsx
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
```

---

## Component Checklist

When creating new screens, use these components:

- ✅ **Card** - For all card containers
- ✅ **Button** - For all buttons (primary/secondary/ghost)
- ✅ **SectionHeader** - For section titles
- ✅ **Chip** - For toggleable selections (mood, filters)
- ✅ **Avatar** - For user/profile images
- ✅ **EmptyState** - For empty/placeholder screens
- ✅ **IconBadge** - For notification icons with badges
