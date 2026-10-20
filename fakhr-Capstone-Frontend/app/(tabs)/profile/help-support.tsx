import { Text, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.text,
  label: palette.textSecondary,
  icon: palette.primary,
  chevron: palette.chevron,
  divider: palette.divider,
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
      label: t("ui.faq"),
      icon: "help-circle-outline",
      onPress: () =>
        Alert.alert(t("ui.faq"), t("community.safetyBody")),
    },
    {
      key: "contact",
      label: t("ui.contactUs"),
      icon: "chatbubble-ellipses-outline",
      onPress: () => router.push("/(tabs)/directory/helpCenter"),
    },
    {
      key: "report",
      label: t("ui.reportIssue"),
      icon: "alert-circle-outline",
      onPress: () =>
        Alert.alert(t("community.reportContent"), t("community.reportPostBy", { name: t("ui.brand") })),
    },
    {
      key: "feedback",
      label: t("ui.feedback"),
      icon: "chatbox-ellipses-outline",
      onPress: () =>
        Alert.alert(t("ui.feedback"), t("community.commentThanks")),
    },
    {
      key: "privacy",
      label: t("ui.privacyPolicy"),
      icon: "document-text-outline",
      onPress: () =>
        Alert.alert(t("auth.privacyPolicy"), t("community.safetyBody")),
    },
    {
      key: "terms",
      label: t("ui.termsAndConditions"),
      icon: "information-circle-outline",
      onPress: () =>
        Alert.alert(t("ui.termsAndConditions"), t("community.safetyBody")),
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
          <View style={[[styles.header, { height: ms(44), marginBottom: ms(22) }], { height: undefined, minHeight: 56, paddingHorizontal: 44 }]}>
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
              {t("ui.helpSupport")}
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
                  flexDirection: "row",
                },
                index < rows.length - 1 && styles.rowBorder,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={row.label}
            >
              <Ionicons name={row.icon} size={ms(22)} color={colors.icon} />
              <Text style={[styles.rowLabel, { fontSize: typography.cardTitle }]}>
                {row.label}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    color: colors.chevron,
                    fontSize: typography.title,
                    lineHeight: typography.titleLineHeight,
                    fontWeight: typography.weightSemibold,
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
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: typography.weightSemibold,
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
    fontWeight: typography.weightMedium,
    color: colors.label,
    textAlign: "right",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
