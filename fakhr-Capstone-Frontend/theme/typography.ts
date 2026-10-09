/**
 * Shared typography in logical pixels (sp on native with accessibility scaling).
 * Titles 22-24, card/menu titles 18-20, controls 16-18, body 16, secondary 14.
 * AppText selects the bundled Tajawal face and ensures generous line height.
 */

export const typography = {
  // Screen titles — main page heading
  display: 24,
  displayLineHeight: 34,
  
  // Section headers — major sections
  h1: 24,
  h1LineHeight: 36,
  h2: 22,
  h2LineHeight: 34,
  h3: 18,
  h3LineHeight: 28,
  cardTitle: 20,
  cardTitleLineHeight: 30,
  menu: 18,
  button: 17,
  navigation: 16,
  
  // Body text — primary content
  body: 16,
  bodyLineHeight: 24,
  bodySmall: 16,
  bodySmallLineHeight: 24,
  
  // Helper/caption — supporting text (minimum readable size)
  caption: 14,
  captionLineHeight: 22,
  
  // Navigation labels and secondary information
  label: 16,
  labelLineHeight: 24,
  overline: 14,
  overlineLineHeight: 22,
  
  // Aliases for consistency
  title: 24, // Same as display
  titleSmall: 22,
  section: 18, // Same as h3
  
  // Font weights
  weightRegular: "400" as const,
  weightMedium: "500" as const,
  weightSemibold: "600" as const,
  weightBold: "700" as const,
} as const;

/** Two readable navigation-label lines plus the unchanged icon and padding. */
export const tabBarContentHeight = (fontScale: number) => 40 + Math.ceil(typography.labelLineHeight * 2 * fontScale);
