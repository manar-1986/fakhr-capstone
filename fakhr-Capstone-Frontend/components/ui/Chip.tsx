import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { cardShadow, colors, radius, spacing, typography } from "../../theme";

interface ChipProps {
  label: string;
  /** Icon name from Ionicons */
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Chip component — for mood selection and similar use cases
 * Toggleable, with optional icon
 */
export function Chip({
  label,
  icon,
  selected = false,
  onPress,
  style,
}: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, cardShadow, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={22}
          color={selected ? colors.primary : colors.textMuted}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightMedium,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  labelSelected: {
    color: colors.primary,
  },
});
