import React from "react";
import { StyleSheet } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import Screen from "../app/(tabs)/resources";
const mockPush = jest.fn(); let mockRTL = true;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, navigate: mockPush }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr", tabRow: mockRTL ? "row-reverse" : "row" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key.startsWith("disabilities.") ? require("../i18n/locales/en.json").disabilities[key.split(".")[1]] : key }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon", MaterialCommunityIcons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
beforeEach(() => { mockPush.mockClear(); });
test.each([true, false])("nine categories keep correct IDs and services route, RTL=%s", rtl => {
 mockRTL=rtl; const ui=render(<Screen />);
 const ids=["autism","adhd","intellectual","learning","motor","hearing","vision","speech","multiple"];
 expect(ui.getAllByTestId(/^disability-category-/)).toHaveLength(9);
 for(const id of ids){ fireEvent.press(ui.getByTestId(`disability-category-${id}`)); expect(mockPush).toHaveBeenLastCalledWith(expect.objectContaining({pathname:"/(tabs)/resources/disability-services",params:expect.objectContaining({id})})); }
 fireEvent.press(ui.getByTestId("explore-services")); expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/services");
});
test("Arabic/English search, clear, empty state and preserved additional records",()=>{
 mockRTL=true; const ui=render(<Screen />); const input=ui.getByTestId("category-search");
 fireEvent.changeText(input,"سمعية"); expect(ui.getAllByTestId(/^disability-category-/)).toHaveLength(1); expect(ui.getByTestId("disability-category-hearing")).toBeTruthy();
 fireEvent.changeText(input,"ADHD"); expect(ui.getByTestId("disability-category-adhd")).toBeTruthy();
 fireEvent.changeText(input,"Down"); expect(ui.getByTestId("disability-category-down")).toBeTruthy();
 fireEvent.changeText(input,"zzzz"); expect(ui.queryAllByTestId(/^disability-category-/)).toHaveLength(0);
 fireEvent.press(ui.getByLabelText("مسح البحث")); expect(ui.getAllByTestId(/^disability-category-/)).toHaveLength(9);
 fireEvent.press(ui.getByText("فئات أخرى")); expect(ui.getAllByTestId(/^disability-category-/)).toHaveLength(12);
});

test.each([true,false])("reference presentation retains distinct icon colors and support action, RTL=%s", rtl => { mockRTL=rtl; const ui=render(<Screen />); const icons=ui.getAllByTestId(/^category-icon-/); const backgrounds=icons.map(icon=>StyleSheet.flatten(icon.props.style).backgroundColor); expect(new Set(backgrounds).size).toBe(9); expect(ui.getByTestId("categories-back")).toBeTruthy(); expect(ui.getByTestId("categories-support")).toBeTruthy(); expect(StyleSheet.flatten(ui.getByTestId("disability-category-autism").props.style).minHeight).toBe(50); });
