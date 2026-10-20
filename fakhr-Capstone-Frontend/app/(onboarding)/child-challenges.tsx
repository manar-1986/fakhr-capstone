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

export default function ChildChallengesScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState("");

  const handleNext = () => {
    router.push("/(onboarding)/child-goals");
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Challenges & Needs</Text>
        <Text style={styles.subtitle}>
          Describe the main challenges your child faces and areas where they
          need support
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter challenges..."
          placeholderTextColor={colors.textLight}
          value={challenges}
          onChangeText={setChallenges}
          multiline
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
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
    height: 200,
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
