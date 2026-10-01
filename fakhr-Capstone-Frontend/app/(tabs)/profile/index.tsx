import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentUser } from "../../../api/users.api";
import { useAuth } from "../../../context/AuthContext";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { setPendingAuthHref } from "../../../utils/authRedirect";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  subtitle: palette.textMuted,
  icon: palette.primary,
  chevron: palette.chevron,
  divider: palette.divider,
  logoutBg: palette.borderLight,
  badge: "#E23D3D",
  white: palette.white,
};

const DESIGN_W = 388;
const avatarPhoto = require("../../../assets/images/profile-avatar.png");

const ROLE_KEYS: Record<string, string> = {
  parent: "ui.parent",
  individual: "ui.individualUser",
  organization: "ui.organization",
};

type MenuItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  badge?: boolean;
  onPress: () => void;
};

export default function ProfileTabScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!user,
    retry: false,
  });

  const displayName = currentUser?.name || user?.name || t("ui.demoFullName");
  const roleLabel = useMemo(() => {
    const role = (currentUser as { role?: string } | undefined)?.role;
    if (role && ROLE_KEYS[role]) return t(ROLE_KEYS[role]);
    return t("ui.parent");
  }, [currentUser, t]);

  const openNotifications = () => {
    Alert.alert(t("home.notifications"), t("home.newNotifications"));
  };

  const handleLogout = () => {
    router.push("/(tabs)/profile/logout");
  };

  const items: MenuItem[] = [
    {
      key: "personal",
      label: t("ui.myDetails"),
      icon: "person-outline",
      onPress: () => {
        if (!requireAuth("/(tabs)/profile/edit-profile")) return;
        router.push("/(tabs)/profile/edit-profile");
      },
    },
    {
      key: "children",
      label: t("ui.myChildren"),
      icon: "people-outline",
      onPress: () => {
        if (!requireAuth("/(tabs)/profile/edit-child-profile")) return;
        router.push("/(tabs)/profile/edit-child-profile");
      },
    },
    {
      key: "bookings",
      label: t("ui.myAppointments"),
      icon: "calendar-outline",
      onPress: () => {
        if (!requireAuth("/(tabs)/bookings")) return;
        router.navigate("/bookings");
      },
    },
    {
      key: "advice",
      label: t("ui.myConsultations"),
      icon: "chatbubbles-outline",
      onPress: () => {
        if (!requireAuth("/(tabs)/community/advice")) return;
        router.navigate("/community/advice");
      },
    },
    {
      key: "notifications",
      label: t("ui.notifications"),
      icon: "notifications-outline",
      badge: true,
      onPress: openNotifications,
    },
    {
      key: "offers",
      label: t("ui.offers"),
      icon: "pricetag-outline",
      onPress: () => router.navigate("/services"),
    },
    {
      key: "settings",
      label: t("settings.title"),
      icon: "settings-outline",
      onPress: () => router.push("/(tabs)/profile/settings"),
    },
    {
      key: "help",
      label: t("ui.helpSupport"),
      icon: "headset-outline",
      onPress: () => router.push("/(tabs)/profile/help-support"),
    },
    {
      key: "about",
      label: t("ui.aboutFakhr"),
      icon: "information-circle-outline",
      onPress: () => Alert.alert(t("ui.aboutFakhr")),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          width: contentW,
          alignSelf: "center",
          paddingHorizontal: ms(18),
          paddingTop: ms(8),
          paddingBottom: ms(108),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileRow, { gap: ms(12), marginBottom: ms(18) }]}>
          <Image
            source={avatarPhoto}
            style={{
              width: ms(72),
              height: ms(72),
              borderRadius: ms(36),
            }}
          />
          <View style={styles.profileText}>
            <Text style={[styles.name, { fontSize: ms(22), lineHeight: ms(30) }]}>
              {displayName}
            </Text>
            <Text style={[styles.role, { fontSize: ms(13), lineHeight: ms(20) }]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        <View style={styles.menu}>
          {items.map((item, index) => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.row,
                {
                  minHeight: ms(52),
                  paddingHorizontal: ms(14),
                },
                index < items.length - 1 && styles.rowBorder,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Ionicons name={item.icon} size={ms(22)} color={colors.icon} />
              <Text style={[styles.rowLabel, { fontSize: ms(15) }]}>
                {item.label}
              </Text>
              {item.badge ? (
                <View
                  style={[
                    styles.badge,
                    {
                      minWidth: ms(18),
                      height: ms(18),
                      borderRadius: ms(9),
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { fontSize: ms(10) }]}>3</Text>
                </View>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={ms(16)}
                  color={colors.chevron}
                />
              )}
            </Pressable>
          ))}
        </View>

        {user ? (
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logout,
            {
              minHeight: ms(52),
              borderRadius: ms(16),
              marginTop: ms(16),
            },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("auth.signOut")}
        >
          <Ionicons name="log-out-outline" size={ms(20)} color={colors.icon} />
          <Text style={[styles.logoutText, { fontSize: ms(16) }]}>
            {t("auth.signOut")}
          </Text>
        </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => {
                setPendingAuthHref("/(tabs)/profile");
                router.push("/(auth)/login");
              }}
              style={({ pressed }) => [
                styles.logout,
                {
                  minHeight: ms(52),
                  borderRadius: ms(16),
                  marginTop: ms(16),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("auth.signIn")}
            >
              <Ionicons name="log-in-outline" size={ms(20)} color={colors.icon} />
              <Text style={[styles.logoutText, { fontSize: ms(16) }]}>
                {t("auth.signIn")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setPendingAuthHref("/(tabs)/profile");
                router.push("/(signup)");
              }}
              style={({ pressed }) => [
                styles.logout,
                {
                  minHeight: ms(52),
                  borderRadius: ms(16),
                  marginTop: ms(10),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("auth.createAccount")}
            >
              <Ionicons name="person-add-outline" size={ms(20)} color={colors.icon} />
              <Text style={[styles.logoutText, { fontSize: ms(16) }]}>
                {t("auth.createAccount")}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
  },
  profileText: {
    flex: 1,
    alignItems: "flex-start",
  },
  name: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "left",
  },
  role: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "left",
  },
  menu: {
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowLabel: {
    flex: 1,
    fontWeight: "700",
    color: colors.title,
    textAlign: "left",
    writingDirection: "rtl",
  },
  badge: {
    backgroundColor: colors.badge,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontWeight: "700",
  },
  logout: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.logoutBg,
  },
  logoutText: {
    fontWeight: "700",
    color: colors.icon,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
