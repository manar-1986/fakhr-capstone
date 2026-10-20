import { Text } from "./AppText";
import { controls } from "../../theme/controls";
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
    ...controls.button,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  fullWidth: {
    width: "100%",
  },
  // Primary variant
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: "#0B093B",
    fontSize: typography.button,
    lineHeight: typography.buttonLineHeight,
    fontWeight: typography.weightMedium,
  },
  // Secondary variant
  secondary: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontSize: typography.button,
    lineHeight: typography.buttonLineHeight,
    fontWeight: typography.weightMedium,
  },
  // Ghost variant
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostText: {
    color: colors.text,
    fontSize: typography.button,
    lineHeight: typography.buttonLineHeight,
    fontWeight: typography.weightMedium,
  },
  // Disabled state
  disabled: {
    opacity: 0.7,
  },
  disabledText: {
    opacity: 0.7,
  },
});
