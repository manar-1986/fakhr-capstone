import { controls as sharedControls } from "../../theme/controls";
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

export default function ChildMedicalScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    medicalHistory: "",
    medications: "",
    allergies: "",
  });

  const handleNext = () => {
    router.push("/(onboarding)/child-diagnosis");
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Medical Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Medical History"
          placeholderTextColor={colors.textLight}
          value={formData.medicalHistory}
          onChangeText={(text) =>
            setFormData({ ...formData, medicalHistory: text })
          }
          multiline
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Current Medications"
          placeholderTextColor={colors.textLight}
          value={formData.medications}
          onChangeText={(text) =>
            setFormData({ ...formData, medications: text })
          }
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Allergies"
          placeholderTextColor={colors.textLight}
          value={formData.allergies}
          onChangeText={(text) => setFormData({ ...formData, allergies: text })}
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
    fontSize: typography.title,
    lineHeight: typography.titleLineHeight,
    fontWeight: typography.weightSemibold,
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.primary,
    
    
    
    
    marginTop: spacing.lg,
    
   ...sharedControls.button },
  buttonText: {
    color: "#0B093B",
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
  },
});
