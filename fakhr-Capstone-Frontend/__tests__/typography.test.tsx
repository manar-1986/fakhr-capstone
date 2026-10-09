import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react-native";
import * as RN from "react-native";
import { Text, TextInput, TypographyProvider, readableTextStyle } from "../components/ui/AppText";
import { typography, tabBarContentHeight } from "../theme/typography";

jest.mock("expo-font", () => ({ useFonts: () => [true, null] }));
afterEach(() => { cleanup(); jest.restoreAllMocks(); });

test("shared sizes meet readable title, card, control and secondary ranges", () => {
  expect(typography.title).toBe(24);
  expect(typography.cardTitle).toBe(20);
  expect(typography.menu).toBe(18);
  expect(typography.button).toBe(17);
  expect(typography.navigation).toBe(16);
  expect(typography.caption).toBeGreaterThanOrEqual(14);
});

test.each(["ios", "android", "web"])("%s: bold face, scaling, wrapping and editable input survive 200%% font scaling", platform => {
  const original = RN.Platform.OS;
  Object.defineProperty(RN.Platform, "OS", { configurable: true, value: platform });
  try {
    jest.spyOn(RN, "useWindowDimensions").mockReturnValue({ width: 320, height: 740, scale: 2, fontScale: 2 });
    const change = jest.fn();
    const ui = render(<TypographyProvider>
      <Text testID="title" numberOfLines={1} style={{ fontSize: typography.title, lineHeight: 12, fontWeight: "700", writingDirection: "rtl" }}>العلاج الطبيعي / Physiotherapy</Text>
      <TextInput testID="input" value="" onChangeText={change} style={{ height: 32, fontSize: typography.body }} />
    </TypographyProvider>);
    const text = ui.getByTestId("title");
    const style = RN.StyleSheet.flatten(text.props.style);
    expect(text.props.allowFontScaling).toBe(true);
    expect(text.props.numberOfLines).toBeUndefined();
    expect(style.fontFamily).toBe("Fakhr-Bold");
    expect(style.lineHeight).toBeGreaterThanOrEqual(36);
    expect(style.writingDirection).toBe("rtl");
    const input = ui.getByTestId("input");
    expect(RN.StyleSheet.flatten(input.props.style).height).toBeUndefined();
    expect(RN.StyleSheet.flatten(input.props.style).minHeight).toBeGreaterThanOrEqual(64);
    fireEvent.changeText(input, "اختبار");
    expect(change).toHaveBeenCalledWith("اختبار");
    expect(tabBarContentHeight(2)).toBeGreaterThan(tabBarContentHeight(1));
  } finally { Object.defineProperty(RN.Platform, "OS", { configurable: true, value: original }); }
});

test("inline text inherits heading size and bold face; font-loading fallback remains readable", () => {
  const parent = readableTextStyle({ fontSize: 24, fontWeight: "700" });
  expect(readableTextStyle({}, true, parent)).toMatchObject({ fontSize: 24, fontFamily: "Fakhr-Bold" });
  expect(readableTextStyle({ fontWeight: "700" }, false).fontWeight).toBe("700");
});
