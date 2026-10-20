/** Shared Fakhr palette for Arabic and English product UI. */
export const brand = {
  primary: "#6E7CAF",
  muted: "#5E6486",
  soft: "#8B91AF",
  pale: "#F1F2F8",
} as const;
export const colors = {
  brand: brand.primary, brandMuted: brand.muted, brandSoft: brand.soft, brandPale: brand.pale,
  primary: brand.primary, primaryLight: "#F1F2F8", primaryMuted: "#8B91AF", primarySoft: "#F1F2F8", primaryHover: "#8B91AF",
  secondary: "#8B91AF", secondaryLight: "#F1F2F8", accent: brand.soft,
  background: "#FFFFFF", backgroundCard: "#FFFFFF", backgroundElevated: "#FFFFFF",
  backgroundSecondary: "#F1F2F8", backgroundWash: "#F1F2F8", bgApp: "#FFFFFF", bgCard: "#FFFFFF", white: "#FFFFFF",
  text: "#0B093B", textSecondary: "#5E6486", textMuted: brand.muted, textLight: brand.muted, textTertiary: brand.muted,
  border: "#BCC3D8", borderLight: "#F1F2F8", divider: "#F1F2F8", chevron: brand.muted, shadow: "#0B093B",
  success: "#248A58", error: "#D9534F", errorLight: "#FDECEA", warning: "#DCAC2E", info: brand.primary, signOut: "#D9534F", star: "#DCAC2E",
} as const;
