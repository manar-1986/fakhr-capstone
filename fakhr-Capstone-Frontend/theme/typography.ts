/** Logical pixels; native accessibility scaling remains enabled in AppText. */
export const fontFamilies = {
  regular: "Fakhr-Regular",
  medium: "Fakhr-Medium",
  semibold: "Fakhr-SemiBold",
} as const;

export const typography = {
  title: 22, titleLineHeight: 34,
  section: 18, sectionLineHeight: 28,
  cardTitle: 16, cardTitleLineHeight: 26,
  body: 14, bodyLineHeight: 22,
  secondary: 13, secondaryLineHeight: 21,
  button: 14, buttonLineHeight: 22,
  navigation: 12, navigationLineHeight: 20,
  helper: 12, helperLineHeight: 20,
  // Compatibility aliases keep existing screens on the same semantic scale.
  display: 22, displayLineHeight: 34,
  h1: 22, h1LineHeight: 34,
  h2: 18, h2LineHeight: 28,
  h3: 18, h3LineHeight: 28,
  titleSmall: 18,
  menu: 16, menuLineHeight: 26,
  bodySmall: 13, bodySmallLineHeight: 21,
  caption: 12, captionLineHeight: 20,
  label: 14, labelLineHeight: 22,
  overline: 12, overlineLineHeight: 20,
  weightRegular: "400" as const,
  weightMedium: "500" as const,
  weightSemibold: "600" as const,
  weightBold: "600" as const,
} as const;

export const typographyStyles = {
  title: { fontSize: typography.title, lineHeight: typography.titleLineHeight, fontWeight: typography.weightSemibold },
  section: { fontSize: typography.section, lineHeight: typography.sectionLineHeight, fontWeight: typography.weightSemibold },
  cardTitle: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, fontWeight: typography.weightMedium },
  body: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, fontWeight: typography.weightRegular },
  secondary: { fontSize: typography.secondary, lineHeight: typography.secondaryLineHeight, fontWeight: typography.weightRegular },
  button: { fontSize: typography.button, lineHeight: typography.buttonLineHeight, fontWeight: typography.weightMedium },
  navigation: { fontSize: typography.navigation, lineHeight: typography.navigationLineHeight, fontWeight: typography.weightMedium },
  helper: { fontSize: typography.helper, lineHeight: typography.helperLineHeight, fontWeight: typography.weightRegular },
} as const;

/** Two readable navigation-label lines plus the unchanged icon and padding. */
export const tabBarContentHeight = (fontScale: number) => 40 + Math.ceil(typography.navigationLineHeight * 2 * fontScale);
