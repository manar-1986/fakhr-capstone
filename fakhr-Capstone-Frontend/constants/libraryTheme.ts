import { brand, colors } from "../theme/colors";
import { signupColors } from "./signupTheme";

/** Library + bottom tab chrome — same Fakhr palette as signup / Child Profile. */
export const libraryColors = {
  ...signupColors,
  brand: colors.primary,
  textTertiary: colors.textMuted,
  chipBg: colors.borderLight,
  chipText: colors.textSecondary,
  headerIconBg: brand.pale,
  articleBadgeBg: brand.pale,
  articleBadgeText: colors.primary,
  videoBadgeBg: "rgba(0, 0, 0, 0.72)",
  infographicSurface: brand.pale,
  fabShadow: "rgba(0, 0, 0, 0.2)",
  shieldFab: colors.text,
};
