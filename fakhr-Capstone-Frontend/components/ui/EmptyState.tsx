import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { cardShadow, colors, radius, spacing, typography } from "../../theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  title: string;
  description: string;
  style?: ViewStyle;
  /** Wrap in a soft card for emphasis */
  card?: boolean;
  /** Optional CTA button */
  cta?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Reusable empty/placeholder state for Community, Documents, Care Path, etc.
 * Calm, trustworthy, production-ready.
 */
export function EmptyState({
  icon,
  iconColor = colors.primary,
  title,
  description,
  style,
  card = true,
  cta,
}: EmptyStateProps) {
  const content = (
    <View style={styles.content}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + "18" }]}>
        <Ionicons name={icon} size={44} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {cta && (
        <View style={styles.ctaContainer}>
          <Button title={cta.label} onPress={cta.onPress} fullWidth />
        </View>
      )}
    </View>
  );

  if (card) {
    return <View style={[styles.card, cardShadow, style]}>{content}</View>;
  }

  return <View style={[styles.wrapper, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xxxl,
    alignItems: "center",
  },
  card: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.section,
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h1,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    textAlign: "center",
  },
  ctaContainer: {
    marginTop: spacing.xl,
    width: "100%",
  },
});
