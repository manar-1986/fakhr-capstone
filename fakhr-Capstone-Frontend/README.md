# Fakhr — Frontend Application

A React Native mobile application built with Expo Router for parents of children with special needs. Provides personalized care paths, community support, and resource management.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS Simulator (Mac) or Android Emulator
- Expo CLI (optional, but recommended)

### Installation Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api
   ```

   > Note: `.env` files are gitignored for security.

3. **Start the Development Server**

   ```bash
   npx expo start
   ```

4. **Run on Simulator/Emulator**

   - **iOS Simulator**: Press `i` in the terminal or click "Run on iOS simulator"
   - **Android Emulator**: Press `a` in the terminal or click "Run on Android emulator"
   - **Physical Device**: Scan the QR code with Expo Go app

## 📱 Application Routes

The app uses Expo Router file-based routing. Here are the main routes:

| Route                  | File Path                        | Description                     |
| ---------------------- | -------------------------------- | ------------------------------- |
| `/` (Onboarding)       | `app/(onboarding)/landing.tsx`   | Landing screen with Fakhr intro |
| `/auth/sign-in`        | `app/(auth)/login.tsx`           | Sign in screen                  |
| `/auth/create-account` | `app/(auth)/register.tsx`        | Create account screen           |
| `/home`                | `app/(tabs)/home/index.tsx`      | Home dashboard                  |
| `/care-path`           | `app/(tabs)/plan/index.tsx`      | Care path main screen           |
| `/documents`           | `app/(tabs)/resources/index.tsx` | Documents/resources screen      |
| `/community`           | `app/(tabs)/community/index.tsx` | Community screen                |
| `/profile`             | `app/(tabs)/profile/index.tsx`   | Profile screen                  |

### Additional Routes

- `/auth/forgot-password` - Password reset
- `/care-path/task-details` - Task details
- `/care-path/check-in` - Daily check-in
- `/care-path/progress` - Progress tracking
- `/profile/manage-children` - Manage children
- `/profile/settings` - Settings
- `/community/create-post` - Create post
- `/community/events` - Events list

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **State Management**: React Context + TanStack Query
- **API Client**: Axios
- **Styling**: React Native StyleSheet
- **Icons**: Expo Vector Icons (Ionicons)

## 📁 Project Structure

```
Sanad-Capstone-Fronend/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (onboarding)/      # Onboarding flow
│   └── (tabs)/            # Main app tabs
├── components/             # Reusable components
│   └── ui/                # UI components (Button, Card, Input, etc.)
├── context/               # React Context providers
├── hooks/                  # Custom React hooks
├── api/                    # API client functions
├── theme/                  # Design system tokens
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🎨 Design System

The app uses a centralized design system located in `/theme`:

- **Colors**: Primary (#D99E8E), Background (#F6E4DE), Text (#333333)
- **Spacing**: 8pt grid system
- **Typography**: Clear hierarchy (display, h1-h3, body, caption)
- **Radius**: Consistent border radius values
- **Shadows**: Platform-specific card shadows

## 🔐 Authentication

- Token-based authentication using SecureStore
- Tokens sent as Bearer tokens in API requests
- Automatic token refresh handling
- Protected routes redirect to login if unauthenticated

## 🌐 API Integration

- Base URL: Configured via `EXPO_PUBLIC_API_URL` environment variable
- Default: `http://localhost:8000/api`
- All API calls go through `/api` folder
- Axios interceptors handle authentication and errors

## ♿ Accessibility

All components include:

- Proper `accessibilityLabel` attributes
- Correct `accessibilityRole` values
- `accessibilityState` for interactive elements
- Minimum 44px touch targets
- WCAG AA contrast compliance
- Focus states for keyboard navigation

## 🧪 Development

### Running Tests

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

### Clearing Cache

If you encounter issues, try clearing the cache:

```bash
npx expo start --clear
```

## 📦 Building for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## 🐛 Troubleshooting

### Simulator Not Updating

1. Clear Metro bundler cache: `npx expo start --clear`
2. Restart the simulator
3. Reload the app (Cmd+R on iOS, R+R on Android)

### Dependencies Not Installing

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. If issues persist, try `npm install --legacy-peer-deps`

### API Connection Issues

1. Verify backend is running on `http://localhost:8000`
2. Check `.env` file has correct `EXPO_PUBLIC_API_URL`
3. Ensure no firewall blocking localhost connections

## 📝 Code Style

- TypeScript strict mode enabled
- No `any` types allowed
- Components use functional components with hooks
- Consistent naming: PascalCase for components, camelCase for functions
- All props and state properly typed

## 🤝 Contributing

1. Follow the HARD RULES in `.cursor/rules/HARD_RULES.md`
2. Do not delete/restructure files without approval
3. Match designs exactly as provided
4. Ensure all code is in English
5. Maintain accessibility standards

## 📄 License

Private project - All rights reserved

## 📚 Project Documentation

- **[GRADUATION_PROJECT.md](./GRADUATION_PROJECT.md)**: Comprehensive graduation project documentation
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)**: Executive summary and project highlights
- **[docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)**: Design system documentation
- **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)**: Architecture and structure overview

## 🙏 Support

For issues or questions, please refer to the project documentation or contact the development team.
