import { homeTheme } from "./home";
/** Home-only colors sampled from approved c76304d4 reference, 2026-10-16.
 * Raster gradients/antialiasing vary; these are actual representative pixels.
 * Do not apply to HomeDrawer, Products, Settings, or other screens.
 */
export const homeReference = {
 ...homeTheme,
 blue: "#607DCB", ink: "#0B093B", secondaryBlue: "#556DA9",
 muted: "#5E6486", surface: "#EBF1FD",
} as const;
