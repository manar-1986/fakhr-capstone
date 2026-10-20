import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, typography } from "../../theme";

interface AvatarProps {
  /** Initials to display (e.g., "JD" for John Doe) */
  initials?: string;
  /** Icon name if no initials */
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Background color override */
  backgroundColor?: string;
  style?: ViewStyle;
}

/**
 * Avatar component — circle placeholder
 * Shows initials or icon
 */
export function Avatar({
  initials,
  icon = "person",
  size = "md",
  backgroundColor,
  style,
}: AvatarProps) {
  const bgColor = backgroundColor || colors.borderLight;

  return (
    <View
      style={[styles.avatar, styles[size], { backgroundColor: bgColor }, style]}
    >
      {initials ? (
        <Text style={[styles.initials, styles[`${size}Text`]]}>{initials}</Text>
      ) : (
        <Ionicons
          name={icon}
          size={size === "sm" ? 16 : size === "md" ? 24 : 32}
          color={colors.textMuted}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 52,
    height: 52,
  },
  lg: {
    width: 72,
    height: 72,
  },
  initials: {
    fontWeight: typography.weightRegular,
    color: colors.textMuted,
  },
  smText: {
    fontSize: typography.helper,
    lineHeight: typography.helperLineHeight,
  },
  mdText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
  },
  lgText: {
    fontSize: typography.section,
    lineHeight: typography.sectionLineHeight,
  },
});
