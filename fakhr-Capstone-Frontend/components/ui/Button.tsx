import { Text } from "./AppText";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radius, spacing, touchTargets, typography } from "../../theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component — primary / secondary / ghost variants
 * Meets 44px minimum touch target
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.backgroundCard : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[styles[`${variant}Text`], isDisabled && styles.disabledText]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.button,
  },
  fullWidth: {
    width: "100%",
  },
  // Primary variant
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.backgroundCard,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
  },
  // Secondary variant
  secondary: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  secondaryText: {
    color: colors.secondary,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
  },
  // Ghost variant
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostText: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    fontWeight: typography.weightSemibold,
  },
  // Disabled state
  disabled: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
});
