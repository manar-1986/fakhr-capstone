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
  border: "rgba(0, 0, 0, 0.06)",
  inputBorder: "rgba(0, 0, 0, 0.08)",
  borderLight: colors.borderLight,
  googleBlue: "#4285F4",
  facebookBlue: "#1877F2",
  progressTrack: brand.pale,
  selectedCardBg: "rgba(110, 124, 175, 0.14)",
  illustrationBg: brand.pale,
  overlay: "rgba(0, 0, 0, 0.35)",
};
