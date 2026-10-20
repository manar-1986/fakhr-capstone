# Simulator Setup Guide

## Quick Start

### iOS Simulator

```bash
# Start Expo development server
npm start

# Or directly open iOS simulator
npm run ios
```

### Android Emulator

```bash
# Start Expo development server
npm start

# Or directly open Android emulator
npm run android
```

## Troubleshooting

### If simulator doesn't update:

1. **Clear Metro cache:**

```bash
npm start -- --clear
```

2. **Reset Expo cache:**

```bash
npx expo start --clear
```

3. **Restart simulator:**

- iOS: Close simulator completely and reopen
- Android: Restart emulator

4. **Rebuild native code (if needed):**

```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

## Configuration

### iOS Simulator Settings

- Device: iPhone 15 Pro (recommended)
- iOS Version: Latest available
- Orientation: Portrait (as configured in app.json)

### Android Emulator Settings

- Device: Pixel 6 (recommended)
- API Level: 33+ (Android 13+)
- Orientation: Portrait

## Notes

- All code is in English ✅
- TypeScript strict mode enabled ✅
- Expo Router configured ✅
- Dependencies are up to date ✅
