import { Text, TextInput, ScrollView } from "../../components/ui/AppText";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  radius,
  sectionSpacing,
  spacing,
  typography,
} from "../../theme";

export default function ChildDiagnosisScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    diagnosis: "",
    diagnosisDate: "",
    severity: "",
  });

  const handleNext = () => {
    router.push("/(onboarding)/child-challenges");
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Diagnosis Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Primary Diagnosis"
          placeholderTextColor={colors.textLight}
          value={formData.diagnosis}
          onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Date of Diagnosis"
          placeholderTextColor={colors.textLight}
          value={formData.diagnosisDate}
          onChangeText={(text) =>
            setFormData({ ...formData, diagnosisDate: text })
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Severity Level"
          placeholderTextColor={colors.textLight}
          value={formData.severity}
          onChangeText={(text) => setFormData({ ...formData, severity: text })}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.xxl,
    paddingBottom: spacing.pageBottom,
  },
  title: {
    fontSize: typography.display,
    lineHeight: typography.displayLineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.backgroundCard,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    minHeight: 52,
  },
  buttonText: {
    color: colors.backgroundCard,
    fontSize: typography.body,
    fontWeight: typography.weightSemibold,
  },
});
