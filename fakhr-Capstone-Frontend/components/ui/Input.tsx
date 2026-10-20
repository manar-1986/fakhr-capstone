import { Text, TextInput } from "./AppText";
import React from "react";
import { StyleSheet, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  /** Show password toggle icon */
  showPasswordToggle?: boolean;
  /** Password visibility state */
  passwordVisible?: boolean;
  /** Toggle password visibility */
  onTogglePassword?: () => void;
}

/**
 * Input component — reusable text input with label and error handling
 * Accessibility: proper labels, focus states, contrast
 */
export function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
  ...textInputProps
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={styles.label}
          nativeID={`${textInputProps.id || "input"}-label`}
        >
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          {...textInputProps}
          style={[styles.input, error && styles.inputError, inputStyle]}
          placeholderTextColor={colors.textLight}
          accessibilityLabel={textInputProps.accessibilityLabel || label}
          accessibilityLabelledBy={
            label ? `${textInputProps.id || "input"}-label` : undefined
          }
          accessibilityState={{ ...textInputProps.accessibilityState }}
        />
        {showPasswordToggle && onTogglePassword && (
          <View style={styles.passwordToggle}>
            {/* Password toggle handled by parent component */}
          </View>
        )}
      </View>
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.secondary,
    lineHeight: typography.secondaryLineHeight,
    fontWeight: typography.weightRegular,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
    minHeight: 44, // Accessibility: minimum touch target
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordToggle: {
    position: "absolute",
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  errorText: {
    fontSize: typography.helper,
    lineHeight: typography.helperLineHeight,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
