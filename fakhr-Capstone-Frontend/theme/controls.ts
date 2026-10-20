import { colors } from "./colors";
/** Shared geometry for responsive cards and text-bearing actions. */
export const controls = {
  card: { backgroundColor: colors.backgroundCard, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  button: { minHeight: 44, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" as const, justifyContent: "center" as const },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
} as const;
export const statusColors = {
  confirmed: { background: "#E7F5ED", foreground: "#248A58" },
  pending: { background: "#FFF4DB", foreground: "#805A12" },
  cancelled: { background: "#FDECEC", foreground: "#A33434" },
  suggested: { background: colors.backgroundSecondary, foreground: colors.primary },
} as const;
