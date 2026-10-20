import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet, View } from "react-native";
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
  const { user } = useAuth();
  const { childId } = useLocalSearchParams<{childId?:string}>();
  const { align, dir, isRTL } = useI18nLayout();
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ["progress", user?.id, childId],
    enabled: !!user,
    queryFn: () => getProgress(childId),
  });

  if (error) return <Text style={styles.loadingText}>{error.message}</Text>;
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
    lineHeight: typography.titleLineHeight,
    fontWeight: typography.weightSemibold,
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
    fontSize: typography.title,
    lineHeight: typography.titleLineHeight,
    fontWeight: typography.weightSemibold,
    color: "#0B093B",
  },
  statLabel: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
