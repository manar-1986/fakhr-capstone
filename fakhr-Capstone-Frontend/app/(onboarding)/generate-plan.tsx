import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { generateCarePath } from "../../api/care-path.api";
import { colors, radius, spacing, typography } from "../../theme";

export default function GeneratePlanScreen() {
  const router = useRouter();

  const generateMutation = useMutation({
    mutationFn: generateCarePath,
    onSuccess: () => {
      router.replace("/(tabs)/home");
    },
    onError: (error: Error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to generate care path. Please try again."
      );
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generating Your Care Path</Text>
      <Text style={styles.subtitle}>
        We&apos;re creating a personalized care plan based on your child&apos;s
        information.
      </Text>
      {generateMutation.isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Generating your plan...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerate}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Generate Plan</Text>
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
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
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
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonText: {
    color: colors.backgroundCard,
    fontSize: typography.body,
    fontWeight: typography.weightSemibold,
  },
});
