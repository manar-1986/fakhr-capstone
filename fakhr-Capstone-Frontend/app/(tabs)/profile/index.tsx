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

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#8B91AF",
  icon: "#6E7CAF",
  chevron: "#C5CAD8",
  divider: "#EEF0F5",
  logoutBg: "#EEF1F8",
  badge: "#E23D3D",
  white: "#FFFFFF",
};

const DESIGN_W = 388;
const avatarPhoto = require("../../../assets/images/profile-avatar.png");

const ROLE_LABELS: Record<string, string> = {
  parent: "ولي أمر",
  individual: "مستخدم فردي",
  organization: "جهة / مركز",
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

  const displayName = currentUser?.name || user?.name || "شيخة أحمد";
  const roleLabel = useMemo(() => {
    const role = (currentUser as { role?: string } | undefined)?.role;
    if (role && ROLE_LABELS[role]) return ROLE_LABELS[role];
    return "ولي أمر";
  }, [currentUser]);

  const openNotifications = () => {
    Alert.alert(t("home.notifications"), t("home.newNotifications"));
  };

  const handleLogout = () => {
    router.push("/(tabs)/profile/logout");
  };

  const items: MenuItem[] = [
    {
      key: "personal",
      label: "بياناتي الشخصية",
      icon: "person-outline",
      onPress: () => router.push("/(tabs)/profile/edit-profile"),
    },
    {
      key: "children",
      label: "أطفالي",
      icon: "people-outline",
      onPress: () => router.push("/(tabs)/profile/manage-children"),
    },
    {
      key: "bookings",
      label: "مواعيدي",
      icon: "calendar-outline",
      onPress: () => router.navigate("/bookings"),
    },
    {
      key: "advice",
      label: "استشاراتي",
      icon: "chatbubbles-outline",
      onPress: () => router.navigate("/community/advice"),
    },
    {
      key: "notifications",
      label: "الإشعارات",
      icon: "notifications-outline",
      badge: true,
      onPress: openNotifications,
    },
    {
      key: "offers",
      label: "العروض والخصومات",
      icon: "pricetag-outline",
      onPress: () => router.navigate("/services"),
    },
    {
      key: "settings",
      label: "الإعدادات",
      icon: "settings-outline",
      onPress: () => router.push("/(tabs)/profile/settings"),
    },
    {
      key: "help",
      label: "المساعدة والدعم",
      icon: "headset-outline",
      onPress: () => router.push("/(tabs)/profile/help-support"),
    },
    {
      key: "about",
      label: "عن فخر",
      icon: "information-circle-outline",
      onPress: () => Alert.alert("عن فخر"),
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
          accessibilityLabel="تسجيل الخروج"
        >
          <Ionicons name="log-out-outline" size={ms(20)} color={colors.icon} />
          <Text style={[styles.logoutText, { fontSize: ms(16) }]}>
            تسجيل الخروج
          </Text>
        </Pressable>
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
    borderColor: "#EEF0F5",
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
