# Installation Instructions - Fakhr Project

## Problem

```
Cannot determine the project's Expo SDK version because the module `expo` is not installed.
```

## Solution: Install All Dependencies

### Step 1: Clean Install (Recommended)

```bash
# Navigate to project directory
cd /Users/ajayeb/Desktop/Sanad-Capstone-Fronend

# Remove existing node_modules and lock file (if corrupted)
rm -rf node_modules
rm -rf package-lock.json

# Clear npm cache (optional but recommended)
npm cache clean --force

# Install all dependencies
npm install
```

### Step 2: Verify Expo Installation

```bash
# Check if expo is installed
npm list expo

# Should show: expo@54.0.33 (or similar version)
```

### Step 3: Install Expo CLI (if needed)

```bash
# Install Expo CLI globally (optional, but helpful)
npm install -g expo-cli

# Or use npx (recommended, no global install needed)
npx expo --version
```

### Step 4: Fix Dependencies Compatibility

```bash
# Use Expo's install command to ensure compatibility
npx expo install --fix

# This will check and fix any version mismatches
```

### Step 5: Verify Installation

```bash
# Check all dependencies
npm list --depth=0

# Run Expo doctor to check for issues
npx expo-doctor
```

## Quick Commands Summary

```bash
# 1. Clean and install
cd /Users/ajayeb/Desktop/Sanad-Capstone-Fronend
rm -rf node_modules package-lock.json
npm install

# 2. Fix Expo dependencies
npx expo install --fix

# 3. Verify
npx expo-doctor

# 4. Start the app
npm start
```

## If Still Having Issues

### Option A: Use Expo Install for All Packages

```bash
# Install core Expo packages first
npx expo install expo@~54.0.33
npx expo install expo-router@~6.0.23
npx expo install react-native@0.81.5
npx expo install react@19.1.0

# Then install rest
npm install
```

### Option B: Reinstall Everything

```bash
# Complete clean install
rm -rf node_modules package-lock.json .expo
npm cache clean --force
npm install
npx expo install --fix
```

## Expected Result

After installation, you should be able to run:

```bash
npm start
# or
npx expo start
```

And see the Expo development server start without errors.

## Troubleshooting

### If npm install fails:

- Check Node.js version: `node --version` (should be 18+)
- Check npm version: `npm --version` (should be 9+)
- Try using yarn instead: `yarn install`

### If expo still not found:

```bash
# Explicitly install expo
npm install expo@~54.0.33 --save

# Then verify
npx expo --version
```
