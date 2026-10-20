/**
 * Fakhr — Spacing
 *
 * 8px base grid — breathable, minimal layout
 */

/** 8px base grid — breathable, minimal layout */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 28,
  pageBottom: 40,
  /** Horizontal padding for screen content */
  screenHorizontal: 20,
} as const;

/** Section spacing — breathable layout */
export const sectionSpacing = {
  tight: 20,
  default: 28,
  loose: 36,
} as const;

/**
 * Touch targets & accessibility
 * - Minimum 44px touch target (iOS/Android guidelines)
 * - Consistent button heights
 * - Clear tap states with activeOpacity
 */
export const touchTargets = {
  /** Minimum touch target size (44px) */
  minimum: 44,
  /** Standard button height */
  button: 52,
  /** Small button height (still meets minimum) */
  buttonSmall: 44,
  /** Card padding — consistent across screens */
  cardPadding: 16, // spacing.lg
} as const;
