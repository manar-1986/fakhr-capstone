# Full Code Extraction Plan

This document outlines the plan for extracting and organizing all code files from the Fakhr Frontend project.

---

## 📋 Extraction Strategy

### Approach

1. **Batch Processing**: Extract code files in logical batches
2. **No Edits**: Present code as-is without modifications
3. **Organized Sections**: Group files by category/functionality
4. **Complete Coverage**: Include all `.tsx`, `.ts`, and configuration files

---

## 📁 File Categories

### Category 1: Configuration Files

- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `app.json`
- [ ] `babel.config.js` (if exists)
- [ ] `.gitignore`
- [ ] `eslint.config.js`
- [ ] `.env.example`

### Category 2: Root Layout & Entry

- [ ] `app/_layout.tsx`
- [ ] `app/index.tsx`

### Category 3: Authentication Routes

- [ ] `app/(auth)/_layout.tsx`
- [ ] `app/(auth)/login.tsx`
- [ ] `app/(auth)/register.tsx`
- [ ] `app/(auth)/forgot-password.tsx`

### Category 4: Onboarding Routes

- [ ] `app/(onboarding)/_layout.tsx`
- [ ] `app/(onboarding)/landing.tsx`
- [ ] `app/(onboarding)/parent-profile.tsx`
- [ ] `app/(onboarding)/child-basic.tsx`
- [ ] `app/(onboarding)/child-medical.tsx`
- [ ] `app/(onboarding)/child-diagnosis.tsx`
- [ ] `app/(onboarding)/child-challenges.tsx`
- [ ] `app/(onboarding)/child-goals.tsx`
- [ ] `app/(onboarding)/generate-plan.tsx`

### Category 5: Main App Tabs - Layouts

- [ ] `app/(tabs)/_layout.tsx`
- [ ] `app/(tabs)/home/_layout.tsx` (if exists)
- [ ] `app/(tabs)/plan/_layout.tsx`
- [ ] `app/(tabs)/resources/_layout.tsx`
- [ ] `app/(tabs)/community/_layout.tsx`
- [ ] `app/(tabs)/profile/_layout.tsx`
- [ ] `app/(tabs)/directory/_layout.tsx`

### Category 6: Main App Tabs - Screens

- [ ] `app/(tabs)/home/index.tsx`
- [ ] `app/(tabs)/plan/index.tsx`
- [ ] `app/(tabs)/plan/task-details.tsx`
- [ ] `app/(tabs)/plan/check-in.tsx`
- [ ] `app/(tabs)/plan/progress.tsx`
- [ ] `app/(tabs)/resources/index.tsx`
- [ ] `app/(tabs)/resources/content-details.tsx`
- [ ] `app/(tabs)/community/index.tsx`
- [ ] `app/(tabs)/community/create-post.tsx`
- [ ] `app/(tabs)/community/events.tsx`
- [ ] `app/(tabs)/profile/index.tsx`
- [ ] `app/(tabs)/profile/manage-children.tsx`
- [ ] `app/(tabs)/profile/settings.tsx`
- [ ] `app/(tabs)/directory/centers.tsx`
- [ ] `app/(tabs)/directory/professionals.tsx`
- [ ] `app/(tabs)/directory/center-details.tsx`
- [ ] `app/(tabs)/directory/professional-details.tsx`

### Category 7: UI Components

- [ ] `components/ui/index.ts`
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Input.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/Toggle.tsx`
- [ ] `components/ui/Chip.tsx`
- [ ] `components/ui/Avatar.tsx`
- [ ] `components/ui/SectionHeader.tsx`
- [ ] `components/ui/EmptyState.tsx`
- [ ] `components/ui/IconBadge.tsx`
- [ ] `components/ui/LanguageSwitcher.tsx`

### Category 8: Design System (Theme)

- [ ] `theme/index.ts`
- [ ] `theme/colors.ts`
- [ ] `theme/spacing.ts`
- [ ] `theme/typography.ts`
- [ ] `theme/radius.ts`
- [ ] `constants/theme.ts` (deprecated)

### Category 9: Context Providers

- [ ] `context/AuthContext.tsx`
- [ ] `context/LanguageContext.tsx`

### Category 10: Custom Hooks

- [ ] `hooks/useAuth.ts`
- [ ] `hooks/useActiveChild.ts`

### Category 11: API Layer

- [ ] `api/axios.ts`
- [ ] `api/auth.api.ts`
- [ ] `api/care-path.api.ts`
- [ ] `api/community.api.ts`
- [ ] `api/content.api.ts`
- [ ] `api/directory.api.ts`

### Category 12: Type Definitions

- [ ] `types/auth.types.ts`
- [ ] `types/child.types.ts`
- [ ] `types/care-path.types.ts`
- [ ] `types/community.types.ts`
- [ ] `types/directory.types.ts`

### Category 13: Utilities

- [ ] `utils/helpers.ts`
- [ ] `utils/validators.ts`

### Category 14: Internationalization

- [ ] `i18n/index.ts`
- [ ] `i18n/locales/en.json`

---

## 📊 Extraction Order

### Phase 1: Foundation (Configuration & Setup)

1. Configuration files
2. Root layout & entry point
3. Design system (theme)

### Phase 2: Core Functionality

4. Context providers
5. Custom hooks
6. Type definitions
7. API layer
8. Utilities

### Phase 3: UI Components

9. UI components (all reusable components)

### Phase 4: Routes - Authentication

10. Authentication routes

### Phase 5: Routes - Onboarding

11. Onboarding routes

### Phase 6: Routes - Main App

12. Tab layouts
13. Tab screens (home, plan, resources, community, profile, directory)

### Phase 7: Internationalization

14. i18n files

---

## 📝 Output Format

Each file will be presented in the following format:

````markdown
## [Category Name]

### [File Path]

```typescript
[Complete file content - no edits]
```
````

```

---

## ✅ Extraction Checklist

### Configuration Files
- [ ] Extract all config files
- [ ] Verify completeness

### Source Code Files
- [ ] Extract all `.tsx` files
- [ ] Extract all `.ts` files
- [ ] Verify no files missed

### Organization
- [ ] Group by category
- [ ] Maintain logical order
- [ ] Include file paths

### Verification
- [ ] All files accounted for
- [ ] No edits made to code
- [ ] Proper formatting maintained

---

## 🎯 Total Files to Extract

**Estimated Count:**
- Configuration files: ~7 files
- React components (`.tsx`): ~50 files
- TypeScript files (`.ts`): ~24 files
- **Total: ~81 files**

---

## 📋 Batch Breakdown

### Batch 1: Configuration & Foundation (10 files)
- All config files
- Root layout
- Design system

### Batch 2: Core Logic (15 files)
- Context providers
- Hooks
- Types
- API layer
- Utils

### Batch 3: UI Components (11 files)
- All UI components

### Batch 4: Authentication Routes (4 files)
- Auth layout + screens

### Batch 5: Onboarding Routes (9 files)
- Onboarding layout + screens

### Batch 6: Tab Layouts (7 files)
- All tab layouts

### Batch 7: Tab Screens - Home & Plan (5 files)
- Home screen
- Plan screens

### Batch 8: Tab Screens - Resources & Community (5 files)
- Resources screens
- Community screens

### Batch 9: Tab Screens - Profile & Directory (7 files)
- Profile screens
- Directory screens

### Batch 10: Internationalization (2 files)
- i18n files

---

## 🚀 Ready to Extract

This plan is ready for execution. Each batch can be extracted independently while maintaining the overall structure and organization.

---

*Plan Created: [Current Date]*
*Status: Ready for Execution*
```
