import React, { useRef } from 'react';
import { Alert } from 'react-native';
import { useI18nLayout } from '../../../hooks/useI18nLayout';
import { Text, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useTranslation } from "react-i18next";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  icon: palette.primary,
  logout: "#E45454",
  cancelBg: palette.borderLight,
  white: palette.white,
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
  const { isRTL } = useI18nLayout();
  const submitting = useRef(false);
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const confirmLogout = () => {
    if (submitting.current) return;
    submitting.current = true;
    void logout().then(result => {
      router.replace('/');
      if (!result.cleanupComplete || !result.revoked) Alert.alert(isRTL?'تسجيل الخروج':'Logout', !result.cleanupComplete ? (isRTL?'تعذر إكمال إزالة بيانات الجلسة من الجهاز. أغلق التطبيق وأعد المحاولة.':'Device session cleanup could not be completed. Close the app and try again.') : (isRTL?'تم تسجيل الخروج من الجهاز، لكن تعذر تأكيد إلغاء الجلسة على الخادم.':'Signed out on this device, but server session revocation could not be confirmed.'));
    }).finally(() => { submitting.current = false; });
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
          <View style={[[styles.header, { height: ms(44), marginBottom: ms(40) }], { height: undefined, minHeight: 56, paddingHorizontal: 44 }]}>
            <HeaderBackButton
              color={colors.title}
              fallbackHref="/(tabs)/profile"
            />
            <Text
              style={[
                styles.title,
                { fontSize: typography.title, lineHeight: typography.titleLineHeight },
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
                fontSize: typography.title,
                lineHeight: typography.titleLineHeight,
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
            <Text style={[styles.logoutText, { fontSize: typography.title }]}>
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
            <Text style={[styles.cancelText, { fontSize: typography.title }]}>{t("common.cancel")}</Text>
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
    fontWeight: typography.weightSemibold,
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
  message: {
    fontWeight: typography.weightRegular,
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
    color: "#0B093B",
    fontWeight: typography.weightMedium,
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
    fontWeight: typography.weightMedium,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.9,
  },
});
