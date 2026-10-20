jest.mock("../components/FavoriteButton",()=>"FavoriteButton");
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ProductsScreen from "../app/(tabs)/products";
import { HOME_PRODUCTS } from "../constants/homeProducts";
import { searchStoreProducts } from "../constants/storeProducts";
const mockPush = jest.fn();
let mockRTL = true;
let mockWidth = 375;
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({ __esModule:true, default:()=>({width:mockWidth,height:850,scale:1,fontScale:1}) }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ DisabilityAwareHeaderBackButton: "BackButton" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView", useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
beforeEach(() => mockPush.mockClear());
test("search uses bilingual names and existing category descriptions", () => {
  expect(searchStoreProducts("كرسي", "all").map(p => p.id)).toEqual(["p-1"]);
  expect(searchStoreProducts("wheelchair", "all").map(p => p.id)).toEqual(["p-1"]);
  expect(searchStoreProducts("mobility", "all").length).toBe(3);
  expect(searchStoreProducts("", "educational")).toEqual([]);
  expect(searchStoreProducts("", "sensory").map(p => p.id)).toEqual(["p-7"]);
});
test.each([true, false])("all real products paginate once and navigate by ID, RTL=%s", rtl => {
  mockRTL = rtl;
  const ui = render(<ProductsScreen />);
  expect(ui.queryByTestId("store-card-p-5")).toBeNull();
  fireEvent.press(ui.getByTestId("store-more"));
  expect(ui.queryByTestId("store-more")).toBeNull();
  HOME_PRODUCTS.forEach(product => {
    expect(ui.getAllByTestId(`store-card-${product.id}`)).toHaveLength(1);
    fireEvent.press(ui.getByTestId(`store-product-${product.id}`));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/products/product-details", params: { id: product.id } });
  });
});
test("filters, search and featured pagination use real IDs", () => {
  const ui = render(<ProductsScreen />);
  fireEvent.press(ui.getByTestId("store-category-communication"));
  expect(ui.getByTestId("store-card-p-2")).toBeTruthy();
  expect(ui.queryByTestId("store-card-p-1")).toBeNull();
  fireEvent.changeText(ui.getByTestId("store-search"), "wheelchair");
  expect(ui.getByTestId("store-empty")).toBeTruthy();
  fireEvent.press(ui.getByTestId("store-category-all"));
  expect(ui.getByTestId("store-card-p-1")).toBeTruthy();
  fireEvent.press(ui.getByTestId("store-featured-2"));
  fireEvent.press(ui.getByTestId("store-featured"));
  expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/products/product-details", params: { id: "p-3" } });
});
test("cart remains unavailable; products have real favorite controls", () => {
  const ui = render(<ProductsScreen />);
  fireEvent.press(ui.getByTestId("store-cart"));
  expect(ui.getByTestId("store-panel-close")).toBeTruthy();
  fireEvent.press(ui.getByTestId("store-panel-close"));
  expect(ui.getByTestId("store-favorite-p-1").props.item).toEqual({kind:"product",targetId:"p-1"});
  expect(ui.queryByTestId("store-panel-close")).toBeNull();
  expect(mockPush).not.toHaveBeenCalled();
});



test.each([320,375,430])("two cards per row at %spx in both languages",width=>{
 mockWidth=width;
 for(const rtl of [true,false]){
 mockRTL=rtl;const ui=render(<ProductsScreen/>);
 expect(ui.getByTestId("store-card-p-1")).toHaveStyle({width:(width-42)/2,padding:6});
 expect(ui.getByTestId("store-card-p-2")).toHaveStyle({width:(width-42)/2});
 expect(ui.getByTestId("store-more")).toBeTruthy();ui.unmount();
 }
});
