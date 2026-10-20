import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react-native";
import * as RN from "react-native";
import { Text, TextInput, TypographyProvider, readableTextStyle } from "../components/ui/AppText";
import { typography, tabBarContentHeight } from "../theme/typography";

jest.mock("expo-font", () => ({ useFonts: () => [true, null] }));
afterEach(() => { cleanup(); jest.restoreAllMocks(); });

test("shared sizes meet the requested typography scale", () => {
  expect(typography).toMatchObject({ title: 22, section: 18, cardTitle: 16, body: 14, secondary: 13, button: 14, navigation: 12, helper: 12 });
  expect(typography.title).toBe(22);
  expect(typography.cardTitle).toBe(16);
  expect(typography.menu).toBe(16);
  expect(typography.button).toBe(14);
  expect(typography.navigation).toBe(12);
  expect(typography.caption).toBe(12);
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
    expect(style.fontFamily).toBe("Fakhr-SemiBold");
    expect(style.lineHeight).toBeGreaterThanOrEqual(34);
    expect(style.writingDirection).toBe("rtl");
    const input = ui.getByTestId("input");
    expect(RN.StyleSheet.flatten(input.props.style).height).toBeUndefined();
    expect(RN.StyleSheet.flatten(input.props.style).minHeight).toBeGreaterThanOrEqual(60);
    fireEvent.changeText(input, "اختبار");
    expect(change).toHaveBeenCalledWith("اختبار");
    expect(tabBarContentHeight(2)).toBeGreaterThan(tabBarContentHeight(1));
  } finally { Object.defineProperty(RN.Platform, "OS", { configurable: true, value: original }); }
});

test("inline text inherits heading size and bold face; font-loading fallback remains readable", () => {
  const parent = readableTextStyle({ fontSize: 24, fontWeight: "700" });
  expect(readableTextStyle({}, true, parent)).toMatchObject({ fontSize: 24, fontFamily: "Fakhr-SemiBold" });
  expect(readableTextStyle({ fontWeight: "700" }, false).fontWeight).toBe("600");
});


test("regular body, medium cards and buttons, and semibold headings use real bundled faces", () => {
  expect(readableTextStyle({ fontSize: typography.body }).fontFamily).toBe("Fakhr-Regular");
  expect(readableTextStyle({ fontSize: typography.cardTitle }).fontFamily).toBe("Fakhr-Medium");
  expect(readableTextStyle({ fontSize: typography.button, fontWeight: typography.weightMedium }).fontFamily).toBe("Fakhr-Medium");
  expect(readableTextStyle({ fontSize: typography.section }).fontFamily).toBe("Fakhr-SemiBold");
  expect(readableTextStyle({}, true, readableTextStyle({ fontWeight: "500" })).fontFamily).toBe("Fakhr-Medium");
  expect(readableTextStyle({ fontWeight: "400" }, true, readableTextStyle({ fontWeight: "600" })).fontFamily).toBe("Fakhr-Regular");
});
