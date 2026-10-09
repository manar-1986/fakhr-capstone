/**
 * Fakhr — Design System
 *
 * Centralized exports for all theme tokens
 */

export * from "./colors";
export * from "./radius";
export * from "./spacing";
export * from "./typography";

// Shadows (Platform-specific, needs Platform import)
import { Platform } from "react-native";
import { colors } from "./colors";

/** Subtle elevation for cards — calm, modern */
export const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
});

export const cardShadowSubtle = Platform.select({
  ios: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  android: { elevation: 1 },
});
