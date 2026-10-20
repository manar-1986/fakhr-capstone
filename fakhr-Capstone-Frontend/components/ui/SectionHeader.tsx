import { Text } from "./AppText";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing, typography } from "../../theme";

interface SectionHeaderProps {
  title: string;
  /** Optional metadata (e.g., "Week 2") */
  meta?: string;
  style?: ViewStyle;
  /** Size variant */
  size?: "h1" | "h2" | "h3";
}

/**
 * SectionHeader component — consistent section titles
 */
export function SectionHeader({
  title,
  meta,
  style,
  size = "h3",
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, styles[size]]}>{title}</Text>
      {meta && <Text style={styles.meta}>{meta}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: typography.weightSemibold,
    color: colors.text,
  },
  h1: {
    fontSize: typography.title,
    lineHeight: typography.titleLineHeight,
  },
  h2: {
    fontSize: typography.section,
    lineHeight: typography.sectionLineHeight,
  },
  h3: {
    fontSize: typography.section,
    lineHeight: typography.sectionLineHeight,
  },
  meta: {
    fontSize: typography.secondary,
    lineHeight: typography.secondaryLineHeight,
    color: colors.textMuted,
    fontWeight: typography.weightRegular,
  },
});
