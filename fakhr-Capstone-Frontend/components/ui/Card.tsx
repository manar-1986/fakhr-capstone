import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { cardShadow, colors, radius, spacing } from "../../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Make card pressable */
  onPress?: () => void;
  /** Use subtle shadow instead of default */
  subtle?: boolean;
  /** Remove shadow */
  noShadow?: boolean;
}

/**
 * Card component — used everywhere
 * Consistent padding, rounded corners, subtle elevation
 */
export function Card({
  children,
  style,
  onPress,
  subtle,
  noShadow,
}: CardProps) {
  const shadowStyle = noShadow ? undefined : subtle ? cardShadow : cardShadow;

  const cardStyle = [styles.card, shadowStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
