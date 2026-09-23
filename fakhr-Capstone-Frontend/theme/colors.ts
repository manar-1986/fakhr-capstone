/**
 * Fakhr brand colors — the only product chrome palette.
 *
 * #6E7CAF  primary actions, icons, selected states
 * #8B91AF  muted text, secondary
 * #AAB3D6  soft fills, highlights
 * #BCC3D8  pale borders, washes
 *
 * Surfaces/text neutrals match the current Fakhr UI (white + dark navy).
 * Do not reintroduce sage green (#7FB77E) or old off-white (#FAF9F6).
 */

export const brand = {
  primary: "#6E7CAF",
  muted: "#8B91AF",
  soft: "#AAB3D6",
  pale: "#BCC3D8",
} as const;

export const colors = {
  brand: brand.primary,
  brandMuted: brand.muted,
  brandSoft: brand.soft,
  brandPale: brand.pale,

  primary: brand.primary,
  primaryLight: brand.soft,
  primaryMuted: brand.muted,
  primarySoft: brand.pale,
  primaryHover: brand.muted,

  secondary: brand.muted,
  secondaryLight: brand.pale,
  accent: brand.soft,

  background: "#FFFFFF",
  backgroundCard: "#FFFFFF",
  backgroundElevated: "#FFFFFF",
  backgroundSecondary: brand.pale,
  backgroundWash: brand.pale,
  bgApp: "#FFFFFF",
  bgCard: "#FFFFFF",
  white: "#FFFFFF",

  text: "#1A1C29",
  textSecondary: "#3D4A78",
  textMuted: brand.muted,
  textLight: brand.muted,
  textTertiary: brand.muted,

  border: brand.pale,
  borderLight: "#EEF0F5",
  divider: "#EEF0F5",
  chevron: brand.pale,

  success: brand.primary,
  error: "#D9534F",
  errorLight: "#FDECEA",
  warning: "#DCAC2E",
  info: brand.muted,
  signOut: "#D9534F",
  star: "#DCAC2E",
} as const;
