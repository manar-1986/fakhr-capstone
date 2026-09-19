import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../../context/LanguageContext";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import type { AppLanguage } from "../../../i18n";

const colors = {
  bg: "#FFFFFF",
  title: "#3D4A78",
  label: "#3D4A78",
  icon: "#6E7CAF",
  chevron: "#C5CAD8",
  muted: "#8B91AF",
  divider: "#EEF0F5",
  delete: "#D95B73",
  white: "#FFFFFF",
  overlay: "rgba(26, 28, 41, 0.4)",
};

const DESIGN_W = 390;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type SettingsRow = {
  key: string;
  label: string;
  icon: IoniconName;
  iconColor?: string;
  showLanguage?: boolean;
  onPress: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguage();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languageLabel =
    locale === "ar"
      ? t("settings.arabic", { lng: "ar" })
      : t("settings.english", { lng: "en" });

  const selectLanguage = (next: AppLanguage) => {
    setLanguageModalVisible(false);
    if (next !== locale) {
      setLocale(next);
    }
  };

  const rows: SettingsRow[] = [
    {
      key: "general",
      label: "الإعدادات العامة",
      icon: "settings-outline",
      onPress: () => router.push("/(tabs)/profile/edit-profile"),
    },
    {
      key: "privacy",
      label: "الخصوصية والأمان",
      icon: "lock-closed-outline",
      onPress: () =>
        Alert.alert(t("settings.privacy"), t("community.privacyAlert")),
    },
    {
      key: "language",
      label: "اللغة",
      icon: "globe-outline",
      showLanguage: true,
      onPress: () => setLanguageModalVisible(true),
    },
    {
      key: "notifications",
      label: "تفضيلات الإشعارات",
      icon: "notifications-outline",
      onPress: () =>
        Alert.alert(t("home.notifications"), t("home.newNotifications")),
    },
    {
      key: "password",
      label: "تغيير كلمة المرور",
      icon: "person-circle-outline",
      onPress: () => router.push("/(auth)/forgot-password"),
    },
    {
      key: "delete",
      label: "حذف الحساب",
      icon: "trash-outline",
      iconColor: colors.delete,
      onPress: () =>
        Alert.alert("حذف الحساب", "هل أنت متأكد من رغبتك في حذف الحساب؟", [
          { text: "إلغاء", style: "cancel" },
          { text: "حذف", style: "destructive" },
        ]),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: ms(20),
            paddingTop: ms(14),
            paddingBottom: ms(28),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { height: ms(44), marginBottom: ms(22) }]}>
            <HeaderBackButton
              color={colors.title}
              fallbackHref="/(tabs)/profile"
            />
            <Text
              style={[
                styles.title,
                { fontSize: ms(24), lineHeight: ms(32) },
              ]}
            >
              الإعدادات
            </Text>
          </View>

          {rows.map((row, index) => (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              style={({ pressed }) => [
                styles.row,
                {
                  minHeight: ms(56),
                  paddingVertical: ms(14),
                  gap: ms(12),
                  flexDirection: "row-reverse",
                  flexDirection: "row",
                },
                index < rows.length - 1 && styles.rowBorder,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                row.showLanguage ? `${row.label}, ${languageLabel}` : row.label
              }
            >
              <Ionicons
                name={row.icon}
                size={ms(22)}
                color={row.iconColor || colors.icon}
              />
              <Text style={[styles.rowLabel, { fontSize: ms(16) }]}>
                {row.label}
              </Text>
              {row.showLanguage ? (
                <Text style={[styles.langValue, { fontSize: ms(13) }]}>
                  {languageLabel}
                </Text>
              ) : null}
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    color: colors.chevron,
                    fontSize: ms(22),
                    lineHeight: ms(24),
                    fontWeight: "300",
                  }}
                >
                  {"\u203A"}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLanguageModalVisible(false)}
        >
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t("settings.chooseLanguage")}</Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => selectLanguage("en")}
              accessibilityRole="button"
              accessibilityState={{ selected: locale === "en" }}
            >
              <Text style={styles.optionLabel}>{t("settings.english")}</Text>
              {locale === "en" ? (
                <Ionicons name="checkmark" size={22} color={colors.icon} />
              ) : (
                <View style={styles.optionSpacer} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => selectLanguage("ar")}
              accessibilityRole="button"
              accessibilityState={{ selected: locale === "ar" }}
            >
              <Text style={styles.optionLabel}>
                {t("settings.arabic", { lng: "ar" })}
              </Text>
              {locale === "ar" ? (
                <Ionicons name="checkmark" size={22} color={colors.icon} />
              ) : (
                <View style={styles.optionSpacer} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.cancelText}>{t("settings.cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  },
  row: {
    alignItems: "center",
    width: "100%",
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowLabel: {
    flex: 1,
    fontWeight: "700",
    color: colors.label,
    textAlign: "right",
    writingDirection: "rtl",
  },
  langValue: {
    fontWeight: "500",
    color: colors.muted,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.label,
  },
  optionSpacer: {
    width: 22,
    height: 22,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.muted,
    writingDirection: "rtl",
  },
});
