import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import HomeDiscoverySections from "../components/home/HomeDiscoverySections";
import { HOME_PRODUCTS } from "../constants/homeProducts";
const mockPush = jest.fn();
let mockRTL = false;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon", MaterialCommunityIcons: "Icon" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr", tabRow: mockRTL ? "row-reverse" : "row" }) }));
beforeEach(() => mockPush.mockClear());
test.each([false, true])("Home shortcuts route to the existing separate screens, RTL=%s", rtl => {
  mockRTL = rtl;
  const ui = render(<HomeDiscoverySections />);
  fireEvent.press(ui.getByTestId("home-child-plan-shortcut"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/plan");
  fireEvent.press(ui.getByTestId("home-products-all"));
  expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/products");
});
test.each([false, true])("product cards use actual directory names and stable detail IDs, RTL=%s", rtl => {
  mockRTL = rtl;
  const ui = render(<HomeDiscoverySections />);
  HOME_PRODUCTS.slice(0, 2).forEach(product => {
    expect(ui.getByText(rtl ? product.nameAr : product.nameEn)).toBeTruthy();
    fireEvent.press(ui.getByTestId(`home-product-${product.id}`));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/products/product-details", params: { id: product.id } });
  });
  expect(ui.getAllByText(rtl ? "صورة توضيحية" : "Illustration")).toHaveLength(2);
  expect(ui.getAllByLabelText(rtl ? "صورة توضيحية" : "Illustration")).toHaveLength(2);
});
for (const width of [320,375,430]) test.each([false,true])("sampled Home colors at " + width + "px RTL=%s",rtl=>{
 mockRTL=rtl;
 const rn=require("react-native");
 const dimensions=jest.spyOn(rn,"useWindowDimensions").mockReturnValue({width,height:900,scale:1,fontScale:1});
 const ui=render(<HomeDiscoverySections/>);
 expect(rn.StyleSheet.flatten(ui.getByText(rtl?"اكتشف منتجاتنا":"Explore our products").props.style).color).toBe("#0B093B");
 expect(rn.StyleSheet.flatten(ui.getByText(rtl?"خطة طفلي":"My Child's Plan").props.style).color).toBe("#0B093B");
 for(const product of HOME_PRODUCTS.slice(0,2))expect(rn.StyleSheet.flatten(ui.getByText(rtl?product.nameAr:product.nameEn).props.style).color).toBe("#0B093B");
 ui.unmount();dimensions.mockRestore();
});
