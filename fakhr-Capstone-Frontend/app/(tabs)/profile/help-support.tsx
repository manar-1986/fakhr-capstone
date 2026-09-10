import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const colors = {
  bg: "#FFFFFF",
  title: "#3D4A78",
  label: "#3D4A78",
  icon: "#6E7CAF",
  chevron: "#C5CAD8",
  divider: "#EEF0F5",
};

const DESIGN_W = 390;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type HelpRow = {
  key: string;
  label: string;
  icon: IoniconName;
  onPress: () => void;
};

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const rows: HelpRow[] = [
    {
      key: "faq",
      label: "الأسئلة الشائعة",
      icon: "help-circle-outline",
      onPress: () =>
        Alert.alert("الأسئلة الشائعة", t("community.safetyBody")),
    },
    {
      key: "contact",
      label: "تواصل معنا",
      icon: "chatbubble-ellipses-outline",
      onPress: () => router.push("/(tabs)/directory/helpCenter"),
    },
    {
      key: "report",
      label: "الإبلاغ عن مشكلة",
      icon: "alert-circle-outline",
      onPress: () =>
        Alert.alert(t("community.reportContent"), t("community.reportPostBy", { name: "فخر" })),
    },
    {
      key: "feedback",
      label: "مقترحات وآراء",
      icon: "chatbox-ellipses-outline",
      onPress: () =>
        Alert.alert("مقترحات وآراء", t("community.commentThanks")),
    },
    {
      key: "privacy",
      label: "سياسة الخصوصية",
      icon: "document-text-outline",
      onPress: () =>
        Alert.alert(t("auth.privacyPolicy"), t("community.safetyBody")),
    },
    {
      key: "terms",
      label: "الشروط والأحكام",
      icon: "information-circle-outline",
      onPress: () =>
        Alert.alert("الشروط والأحكام", t("community.safetyBody")),
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
          <Text
            style={[
              styles.title,
              { fontSize: ms(24), lineHeight: ms(32), marginBottom: ms(22) },
            ]}
          >
            المساعدة والدعم
          </Text>

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
              accessibilityLabel={row.label}
            >
              <Ionicons name={row.icon} size={ms(22)} color={colors.icon} />
              <Text style={[styles.rowLabel, { fontSize: ms(16) }]}>
                {row.label}
              </Text>
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
  pressed: {
    opacity: 0.88,
  },
});
