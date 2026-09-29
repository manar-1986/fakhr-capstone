import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getProgress } from "../../../api/care-path.api";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import {
  cardShadow,
  colors,
  radius,
  sectionSpacing,
  spacing,
  typography,
} from "../../../theme";

export default function ProgressScreen() {
  const { t } = useTranslation();
  const { align, dir, isRTL } = useI18nLayout();
  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: getProgress,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.wrapper, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
        <View style={styles.container}>
          <Text style={[styles.loadingText, { textAlign: align, writingDirection: dir }]}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.wrapper, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.title, { textAlign: align, writingDirection: dir }]}>{t("care.progressOverview")}</Text>
        <View style={[styles.statCard, cardShadow]}>
          <Text style={styles.statValue}>{progress?.completedTasks || 0}</Text>
          <Text style={[styles.statLabel, { textAlign: align, writingDirection: dir }]}>{t("care.completedTasks")}</Text>
        </View>
        <View style={[styles.statCard, cardShadow]}>
          <Text style={styles.statValue}>{progress?.totalTasks || 0}</Text>
          <Text style={[styles.statLabel, { textAlign: align, writingDirection: dir }]}>{t("care.totalTasks")}</Text>
        </View>
        <View style={[styles.statCard, cardShadow]}>
          <Text style={styles.statValue}>{progress?.completionRate || 0}%</Text>
          <Text style={[styles.statLabel, { textAlign: align, writingDirection: dir }]}>{t("care.completionRate")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.title,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  statCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.display + 12,
    lineHeight: typography.displayLineHeight + 14,
    fontWeight: typography.weightBold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
