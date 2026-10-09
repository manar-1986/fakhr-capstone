import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { colors, radius, spacing, touchTargets, typography } from "../../theme";

interface IconBadgeProps {
  /** Icon name from Ionicons */
  icon: React.ComponentProps<typeof Ionicons>["name"];
  /** Badge count (0 hides badge) */
  badgeCount?: number;
  /** Icon color */
  iconColor?: string;
  /** Badge color */
  badgeColor?: string;
  onPress: () => void;
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * IconBadge component — bell + notification badge
 * Meets 44px minimum touch target
 */
export function IconBadge({
  icon = "notifications-outline",
  badgeCount = 0,
  iconColor = colors.text,
  badgeColor = colors.error,
  onPress,
  style,
  accessibilityLabel = "Notifications",
}: IconBadgeProps) {
  const showBadge = badgeCount > 0;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        showBadge
          ? `${accessibilityLabel}, ${badgeCount} notifications`
          : accessibilityLabel
      }
    >
      <Ionicons name={icon} size={24} color={iconColor} />
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? "99+" : badgeCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: spacing.md,
    minWidth: touchTargets.minimum,
    minHeight: touchTargets.minimum,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    borderRadius: radius.sm,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: colors.backgroundCard,
    fontSize: typography.caption,
    lineHeight: typography.captionLineHeight,
    fontWeight: typography.weightSemibold,
  },
});
