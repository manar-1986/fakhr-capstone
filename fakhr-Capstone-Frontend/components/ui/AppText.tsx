import React, { createContext, forwardRef, useContext } from "react";
import { useFonts } from "expo-font";
import { Platform, StyleSheet, Text as NativeText, TextInput as NativeTextInput, ScrollView as NativeScrollView, useWindowDimensions, type ScrollViewProps, type TextProps, type TextInputProps, type TextStyle } from "react-native";
import { typography, fontFamilies, tabBarContentHeight } from "../../theme/typography";

const FontContext = createContext(false);
const TextContext = createContext<TextStyle | undefined>(undefined);

export function TypographyProvider({ children }: React.PropsWithChildren) {
  const [loaded] = useFonts({
    [fontFamilies.regular]: require("../../assets/fonts/IBMPlexSansArabic-Regular.ttf"),
    [fontFamilies.medium]: require("../../assets/fonts/IBMPlexSansArabic-Medium.ttf"),
    [fontFamilies.semibold]: require("../../assets/fonts/IBMPlexSansArabic-SemiBold.ttf"),
  });
  return <FontContext.Provider value={loaded}>{children}</FontContext.Provider>;
}

export function readableTextStyle(style: TextStyle = {}, loaded = true, inherited?: TextStyle): TextStyle {
  const size = style.fontSize ?? inherited?.fontSize ?? typography.body;
  // A loaded face uses native weight 400, so nested text inherits the face first.
  const inheritedWeight = /semibold|bold/i.test(inherited?.fontFamily ?? "") ? 600 : /medium/i.test(inherited?.fontFamily ?? "") ? 500 : Number(inherited?.fontWeight ?? (size >= typography.section ? 600 : size === typography.cardTitle ? 500 : 400));
  const weight = style.fontWeight === "bold" ? 600 : style.fontWeight === "normal" ? 400 : Number(style.fontWeight ?? inheritedWeight);
  const family = weight >= 600 ? fontFamilies.semibold : weight >= 500 ? fontFamilies.medium : fontFamilies.regular;
  return {
    fontSize: size,
    lineHeight: size === typography.title ? typography.titleLineHeight : size === typography.section ? typography.sectionLineHeight : size === typography.cardTitle ? typography.cardTitleLineHeight : size === typography.body ? typography.bodyLineHeight : size === typography.secondary ? typography.secondaryLineHeight : Math.max(typography.helperLineHeight, Math.ceil(size * 1.5)),
    fontFamily: loaded ? family : Platform.OS === "web" ? "Arial, sans-serif" : undefined,
    fontWeight: loaded ? "400" : weight >= 600 ? "600" : weight >= 500 ? "500" : "400",
    flexShrink: 1,
  };
}

export type Text = NativeText;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Match React Native's value/type import API.
export const Text = forwardRef<NativeText, TextProps>(function AppText({ style, children, ...props }, ref) {
  const { fontScale } = useWindowDimensions();
  const inherited = useContext(TextContext);
  const resolved = readableTextStyle(StyleSheet.flatten(style), useContext(FontContext), inherited);
  return <NativeText {...props} numberOfLines={fontScale > 1 ? undefined : props.numberOfLines} ref={ref} allowFontScaling style={[style, resolved]}>
    <TextContext.Provider value={resolved}>{children}</TextContext.Provider>
  </NativeText>;
});

export type TextInput = NativeTextInput;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Preserve existing input refs.
export const TextInput = forwardRef<NativeTextInput, TextInputProps>(function AppTextInput({ style, ...props }, ref) {
  const flat = StyleSheet.flatten(style);
  const { fontScale } = useWindowDimensions();
  const resolved = readableTextStyle(flat, useContext(FontContext));
  return <NativeTextInput {...props} ref={ref} allowFontScaling style={[style, resolved,
    typeof flat?.height === "number" && { height: undefined, minHeight: Math.max(flat.height, resolved.lineHeight! * fontScale + 16) }]} />;
});

// Existing tab screens already reserve bottom space. Extend that reservation
// for larger navigation text without altering horizontal scrollers or modals.
export type ScrollView = NativeScrollView;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Preserve existing scroll refs.
export const ScrollView = forwardRef<NativeScrollView, ScrollViewProps>(function AppScrollView({ contentContainerStyle, ...props }, ref) {
  const { fontScale } = useWindowDimensions();
  const bottom = StyleSheet.flatten(contentContainerStyle)?.paddingBottom;
  return <NativeScrollView {...props} ref={ref} contentContainerStyle={[contentContainerStyle,
    !props.horizontal && typeof bottom === "number" && bottom >= 58 && { paddingBottom: bottom + tabBarContentHeight(fontScale) - 58 }]} />;
});
