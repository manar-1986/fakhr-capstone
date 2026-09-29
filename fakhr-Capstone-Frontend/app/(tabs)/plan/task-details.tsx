import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getTaskDetails } from "../../../api/care-path.api";
import { colors, sectionSpacing, spacing, typography } from "../../../theme";
import { planLocaleText } from "../../../utils/planBilingual";
import { useI18nLayout } from "../../../hooks/useI18nLayout";

export default function TaskDetailsScreen() {
  const { t } = useTranslation();
  const { isRTL, dir, align } = useI18nLayout();
  const { id } = useLocalSearchParams();
  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskDetails(id as string),
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { textAlign: align, writingDirection: dir }]}>
          {planLocaleText(isRTL, { ar: task?.titleAr, en: task?.titleEn, legacy: task?.title }, t)}
        </Text>
        <Text style={[styles.description, { textAlign: align, writingDirection: dir }]}>
          {planLocaleText(isRTL, { ar: task?.descriptionAr, en: task?.descriptionEn, legacy: task?.description }, t)}
        </Text>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: align, writingDirection: dir }]}>{t("copy.instructions")}</Text>
          <Text style={[styles.sectionContent, { textAlign: align, writingDirection: dir }]}>
            {planLocaleText(isRTL, { ar: task?.instructionsAr, en: task?.instructionsEn, legacy: task?.instructions }, t)}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: align, writingDirection: dir }]}>{t("copy.expectedOutcome")}</Text>
          <Text style={[styles.sectionContent, { textAlign: align, writingDirection: dir }]}>
            {planLocaleText(isRTL, { ar: task?.expectedOutcomeAr, en: task?.expectedOutcomeEn, legacy: task?.expectedOutcome }, t)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  title: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginBottom: sectionSpacing.default,
  },
  section: {
    marginBottom: sectionSpacing.default,
  },
  sectionTitle: {
    fontSize: typography.h2,
    lineHeight: typography.h2LineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textSecondary,
  },
});
