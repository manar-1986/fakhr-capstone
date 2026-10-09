import { Text } from "./AppText";
import React from "react";
import { Platform, StyleSheet, Switch, View, ViewStyle } from "react-native";
import { colors, spacing, typography } from "../../theme";

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  style?: ViewStyle;
  /** Accessibility label (defaults to label) */
  accessibilityLabel?: string;
}

/**
 * Toggle component — reusable switch with label
 * Accessibility: proper labels, focus states, contrast, 44px touch target
 */
export function Toggle({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  style,
  accessibilityLabel,
}: ToggleProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: colors.border,
            true: colors.primaryLight,
          }}
          thumbColor={value ? colors.primary : colors.borderLight}
          ios_backgroundColor={colors.border}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
          accessibilityLabel={accessibilityLabel || label}
          style={styles.switch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44, // Accessibility: minimum touch target
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
    fontWeight: typography.weightMedium,
  },
  description: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  switch: {
    // Ensure switch meets touch target requirements
    transform: Platform.OS === "ios" ? [{ scaleX: 1 }, { scaleY: 1 }] : [],
  },
});
