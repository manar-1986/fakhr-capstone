import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { MainTabBar } from "../../components/navigation/MainTabBar";

export const unstable_settings = {
  initialRouteName: "home",
};

/**
 * Main tabs: Home, Plan, Activities (services), Profile.
 * Discover stays available as a hidden route; services is the Activities tab.
 */
export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="plan" options={{ title: t("tabs.plan") }} />
      <Tabs.Screen name="discover" options={{ href: null, title: t("tabs.explore") }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
        }}
      />

      <Tabs.Screen name="directory" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="bookings" options={{ href: null }} />
      <Tabs.Screen name="library" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="resources" options={{ href: null }} />
      <Tabs.Screen name="services" options={{ title: t("tabs.activities") }} />
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="professionals" options={{ href: null }} />
    </Tabs>
  );
}
