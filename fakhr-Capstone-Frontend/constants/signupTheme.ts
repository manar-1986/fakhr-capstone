import { brand, colors } from "../theme/colors";

/**
 * Shared visual tokens for signup / Child Profile / library chrome.
 * Always derived from the central Fakhr palette so language or screen
 * copies cannot drift back to the old green theme.
 */
export const signupColors = {
  bgApp: colors.background,
  primary: colors.primary,
  primaryDark: colors.primaryMuted,
  text: colors.text,
  textMuted: colors.textMuted,
  textLight: colors.textLight,
  white: colors.white,
  border: colors.border,
  inputBorder: colors.border,
  borderLight: colors.borderLight,
  googleBlue: "#4285F4",
  facebookBlue: "#1877F2",
  progressTrack: brand.pale,
  selectedCardBg: colors.backgroundSecondary,
  illustrationBg: brand.pale,
  overlay: "rgba(0, 0, 0, 0.35)",
};
