import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { submitCheckIn } from "../../../api/care-path.api";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import {
  colors,
  radius,
  sectionSpacing,
  spacing,
  typography,
} from "../../../theme";

export default function CheckInScreen() {
  const { t } = useTranslation();
  const { align, dir, isRTL } = useI18nLayout();
  const [notes, setNotes] = useState("");
  const rating = 0;

  const checkInMutation = useMutation({
    mutationFn: submitCheckIn,
    onSuccess: () => {
      // Handle success
    },
  });

  const handleSubmit = () => {
    checkInMutation.mutate({
      notes,
      rating,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <Text style={[styles.title, { textAlign: align, writingDirection: dir }]}>{t("care.dailyCheckIn")}</Text>
      <Text style={[styles.label, { textAlign: align, writingDirection: dir }]}>{t("care.howDidTodayGo")}</Text>
      <TextInput
        style={[styles.input, styles.textArea, { textAlign: align, writingDirection: dir }]}
        placeholder={t("care.enterNotes")}
        placeholderTextColor={colors.textLight}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t("care.submit")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingBottom: 100,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.title,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  label: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
    marginBottom: spacing.sm,
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
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
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
