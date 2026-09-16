import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { MainTabBar } from "../../components/navigation/MainTabBar";

export const unstable_settings = {
  initialRouteName: "home",
};

/**
 * Main tabs: Home, Discover, Library, Profile.
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
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
        }}
      />

      <Tabs.Screen name="community" options={{ title: "المجتمع" }} />
      <Tabs.Screen name="directory" options={{ title: "الدليل" }} />
      <Tabs.Screen name="bookings" options={{ title: "مواعيدي" }} />
      <Tabs.Screen name="library" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ title: "المستندات" }} />
      <Tabs.Screen name="plan" options={{ title: "الخطة" }} />
      <Tabs.Screen name="resources" options={{ title: "فئات الإعاقة" }} />
      <Tabs.Screen name="services" options={{ title: "الخدمات المنزلية" }} />
      <Tabs.Screen name="products" options={{ title: "المنتجات" }} />
      <Tabs.Screen name="professionals" options={{ title: "المتخصصون" }} />
    </Tabs>
  );
}
