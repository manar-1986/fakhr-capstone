import { requireGeneratedPlan } from '../../utils/minimumRelease';
import { controls as sharedControls } from "../../theme/controls";
import { Text } from "../../components/ui/AppText";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { generateCarePath } from "../../api/care-path.api";
import { colors, radius, spacing, typography } from "../../theme";
import { useI18nLayout } from "../../hooks/useI18nLayout";

export default function GeneratePlanScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{childId?:string}>();
  const { t } = useTranslation();
  const { dir } = useI18nLayout();

  const generateMutation = useMutation({
    mutationFn: async () => requireGeneratedPlan(await generateCarePath(childId)),
    onSuccess: () => {
      router.replace("/(tabs)/plan");
    },
    onError: (error: Error) => {
      Alert.alert(
        t("common.error"),
        error.message || t("common.tryAgain")
      );
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { writingDirection: dir }]}>{t("onboarding.generatingPlan")}</Text>
      <Text style={[styles.subtitle, { writingDirection: dir }]}>{t("onboarding.generatingDescription")}</Text>
      {generateMutation.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { writingDirection: dir }]}>{t("onboarding.generatingPlan")}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerate}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{t("onboarding.generatePlan")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xxl,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: {
    fontSize: typography.title,
    lineHeight: typography.titleLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginBottom: spacing.xxxl * 1.5,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.body,
    color: colors.textMuted,
  },
  button: {
    backgroundColor: colors.primary,
    
    
    
    
    
    
   ...sharedControls.button },
  buttonText: {
    color: "#0B093B",
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
  },
});
