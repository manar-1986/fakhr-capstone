import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useTranslation } from "react-i18next";

const colors = {
  bg: "#FFFFFF",
  title: "#3D4A78",
  icon: "#7B88B8",
  logout: "#E45454",
  cancelBg: "#EEF1F8",
  white: "#FFFFFF",
};

const DESIGN_W = 390;

function LogoutDoorIcon({ size }: { size: number }) {
  const doorW = size * 0.4;
  const doorH = size * 0.68;
  const knob = Math.max(9, size * 0.06);
  const stroke = Math.max(3.5, size * 0.032);

  return (
    <View
      style={{
        width: size,
        height: size * 0.8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      <View
        style={{
          width: doorW,
          height: doorH,
          backgroundColor: colors.icon,
          borderRadius: size * 0.07,
          transform: [{ rotate: "-8deg" }],
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            backgroundColor: colors.white,
            alignSelf: "flex-end",
            marginRight: doorW * 0.22,
          }}
        />
      </View>
      <View
        style={{
          width: size * 0.13,
          height: doorH * 0.88,
          borderWidth: stroke,
          borderColor: colors.icon,
          borderLeftWidth: 0,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          marginLeft: -4,
          backgroundColor: colors.white,
        }}
      />
      <View
        style={{
          marginLeft: size * 0.1,
          width: size * 0.28,
          height: size * 0.22,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            width: size * 0.18,
            height: stroke,
            backgroundColor: colors.icon,
            top: "50%",
            marginTop: -stroke / 2,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 0,
            width: size * 0.14,
            height: size * 0.14,
            borderTopWidth: stroke,
            borderRightWidth: stroke,
            borderColor: colors.icon,
            transform: [{ rotate: "45deg" }],
          }}
        />
      </View>
    </View>
  );
}

export default function LogoutConfirmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const confirmLogout = () => {
    void logout().then(() => router.replace("/"));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: ms(24),
            paddingTop: ms(28),
            paddingBottom: ms(32),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { height: ms(44), marginBottom: ms(40) }]}>
            <HeaderBackButton
              color={colors.title}
              fallbackHref="/(tabs)/profile"
            />
            <Text
              style={[
                styles.title,
                { fontSize: ms(32), lineHeight: ms(42) },
              ]}
            >
              {t("auth.signOut")}
            </Text>
          </View>

          <View style={{ alignSelf: "center" }}>
            <LogoutDoorIcon size={ms(186)} />
          </View>

          <Text
            style={[
              styles.message,
              {
                fontSize: ms(22),
                lineHeight: ms(34),
                marginTop: ms(32),
                marginBottom: ms(32),
              },
            ]}
          >
            {t("ui.logoutConfirm")}
          </Text>

          <Pressable
            onPress={confirmLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              {
                minHeight: ms(58),
                borderRadius: ms(18),
                marginBottom: ms(14),
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("auth.signOut")}
          >
            <Text style={[styles.logoutText, { fontSize: ms(22) }]}>
              {t("auth.signOut")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.cancelBtn,
              {
                minHeight: ms(58),
                borderRadius: ms(18),
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
          >
            <Text style={[styles.cancelText, { fontSize: ms(22) }]}>{t("common.cancel")}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  column: {
    flex: 1,
    maxWidth: 430,
  },
  scroll: {
    flex: 1,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
  message: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
  logoutBtn: {
    width: "100%",
    backgroundColor: colors.logout,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: colors.white,
    fontWeight: "800",
    writingDirection: "rtl",
  },
  cancelBtn: {
    width: "100%",
    backgroundColor: colors.cancelBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: colors.title,
    fontWeight: "800",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.9,
  },
});
