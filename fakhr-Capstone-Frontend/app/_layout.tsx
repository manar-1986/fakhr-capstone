import { retryQuery } from '../utils/minimumRelease';
import { CareNotificationLifecycle } from '../components/CareNotificationLifecycle';
import { AppNavigationShell } from "../components/navigation/AppNavigationShell";
import "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WebAppShell } from "../components/layout/WebAppShell";
import { TypographyProvider } from "../components/ui/AppText";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import i18n from "../i18n";

const queryClient = new QueryClient({defaultOptions:{queries:{retry:retryQuery},mutations:{retry:false}}});

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <TypographyProvider><SafeAreaProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <CareNotificationLifecycle />
              <WebAppShell>
                <AppNavigationShell><Stack screenOptions={{ headerShown: false }} /></AppNavigationShell>
              </WebAppShell>
            </AuthProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </SafeAreaProvider></TypographyProvider>
    </I18nextProvider>
  );
}

