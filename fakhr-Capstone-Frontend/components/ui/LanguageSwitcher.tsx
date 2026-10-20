import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

interface LanguageSwitcherProps {
  style?: ViewStyle;
}

/**
 * Language Display Component
 * Shows English only (language switching removed)
 */
export function LanguageSwitcher({ style }: LanguageSwitcherProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="language"
        size={20}
        color={colors.primary}
        style={styles.icon}
      />
      <Text style={styles.text}>EN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    gap: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: "#0B093B",
  },
});
