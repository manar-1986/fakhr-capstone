# Fakhr — Hard Rules (MANDATORY)

**These rules MUST be followed at all times. No exceptions without explicit approval.**

---

## 🚫 Rule 1: Do NOT Invent New Features or Screens

- **DO NOT** add new screens, features, or functionality unless explicitly requested
- **DO NOT** add new routes or navigation paths
- **DO NOT** create new components unless they match existing design patterns
- **ONLY** implement what exists in the provided design/screenshots
- **ASK FIRST** if you're unsure whether something should be added

**Example:**

- ❌ Don't add a "Settings" screen if it's not in the design
- ✅ Only implement screens that are explicitly shown/requested

---

## 🎨 Rule 2: Do NOT Change Design, Wording, Spacing, or Colors

- **DO NOT** modify colors from `theme/colors.ts` without approval
- **DO NOT** change spacing values from `theme/spacing.ts` without approval
- **DO NOT** alter typography sizes or weights from `theme/typography.ts` without approval
- **DO NOT** change wording/text content unless explicitly requested
- **DO NOT** adjust component layouts or spacing unless matching provided design
- **MATCH EXACTLY** what is shown in screenshots/designs provided

**Example:**

- ❌ Don't change `colors.primary` from `#4A7C59` to something else
- ❌ Don't change "Sign In" to "Login" without approval
- ✅ Use exact values from theme files
- ✅ Match text exactly as shown in design

---

## 📁 Rule 3: Do NOT Delete, Rename, or Reorganize Files/Folders

- **DO NOT** delete any existing files without asking first
- **DO NOT** rename files or folders
- **DO NOT** move files to different locations
- **DO NOT** reorganize folder structure
- **ASK FIRST** if you think a file should be removed or moved

**Example:**

- ❌ Don't delete `constants/theme.ts` even if it's deprecated
- ❌ Don't rename `app/(tabs)/home/index.tsx` to `HomeScreen.tsx`
- ✅ Keep all existing files as they are
- ✅ Ask before any file operations

---

## 🧹 Rule 4: Cleanup/Restructure Requires Approval

- **DO NOT** refactor or restructure code without proposing a plan first
- **DO NOT** remove "deprecated" code without approval
- **DO NOT** reorganize imports or code structure
- **PROPOSE FIRST** any cleanup or restructuring changes
- **WAIT FOR APPROVAL** before implementing

**Example:**

- ❌ Don't remove deprecated `constants/theme.ts` file
- ✅ Propose: "I suggest removing deprecated files. Here's the plan..."
- ✅ Wait for approval before proceeding

---

## 🔒 Rule 5: Security — No Secrets in Code

- **DO NOT** commit API keys, tokens, or secrets to git
- **DO NOT** hardcode sensitive values in code
- **USE** `.env` files for environment variables
- **ENSURE** `.env` is in `.gitignore`
- **VERIFY** no secrets are in committed files

**Example:**

- ❌ Don't hardcode `baseURL: "https://api.example.com/api-key-123"`
- ✅ Use `baseURL: process.env.EXPO_PUBLIC_API_URL`
- ✅ Ensure `.env` is gitignored
- ✅ Use `expo-secure-store` for sensitive data

---

## ✅ What TO Do

1. **Match designs exactly** — pixel-for-pixel when screenshots are provided
2. **Use existing theme** — always use values from `theme/` directory
3. **Follow existing patterns** — match code style and structure
4. **Ask before changes** — when in doubt, ask for approval
5. **Preserve functionality** — don't break existing features

---

## 📋 Approval Process

When you want to:

- Add a new feature → **ASK FIRST**
- Change design/colors → **ASK FIRST**
- Delete/rename files → **ASK FIRST**
- Refactor code → **PROPOSE PLAN → WAIT FOR APPROVAL**
- Change wording → **ASK FIRST**

**Format for asking:**

```
I want to [action].
Reason: [why]
Impact: [what changes]
Files affected: [list]
Should I proceed?
```

---

## 🎯 Priority Order

1. **Match provided design exactly** (if screenshots/designs provided)
2. **Preserve existing functionality**
3. **Use existing design system** (theme files)
4. **Maintain code structure** (no reorganization)
5. **Ask before any changes**

---

## ⚠️ Violations

If you violate these rules:

- **STOP immediately**
- **REVERT changes** if possible
- **ASK for guidance** on how to proceed correctly

---

**Last Updated:** February 3, 2026  
**Status:** ACTIVE — Must be followed at all times
