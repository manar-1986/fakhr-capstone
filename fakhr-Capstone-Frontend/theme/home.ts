import { colors } from "./colors";
/** Home uses the same palette as every other Fakhr screen. */
export const homeTheme = {
  ink: colors.text, blue: colors.primary, muted: colors.textMuted,
  surface: colors.backgroundWash, lavender: colors.backgroundSecondary,
  border: colors.border, white: colors.white,
} as const;
