import React from "react";
import { render } from "@testing-library/react-native";
import { productIllustration } from "../constants/productImages";
import { HOME_PRODUCTS } from "../constants/homeProducts";
import { JourneyProducts, JourneyProductDetails } from "../components/journey/JourneyProducts";
let mockRTL=false;
jest.mock("@expo/vector-icons",()=>({Ionicons:"Icon"}));
jest.mock("../hooks/useI18nLayout",()=>({useI18nLayout:()=>({isRTL:mockRTL,align:mockRTL?"right":"left",dir:mockRTL?"rtl":"ltr",tabRow:mockRTL?"row-reverse":"row"})}));
test("only approved product IDs have matching illustrations",()=>{
 expect(productIllustration("p-1")).toEqual(require("../assets/images/product-1.png"));
 expect(productIllustration("p-2")).toEqual(require("../assets/images/product-2.png"));
 expect(productIllustration("p-3")).toEqual(require("../assets/images/product-3.png"));
 expect(productIllustration("p-4")).toEqual(require("../assets/images/product-4.png"));
 for(const id of ["p-5","p-6","p-7","p-8","unknown"])expect(productIllustration(id)).toBeUndefined();
});
test.each([false,true])("Journey cards and details never reuse photoIndex images, RTL=%s",rtl=>{
 mockRTL=rtl;
 const ui=render(<JourneyProducts products={HOME_PRODUCTS} personalized={false} isSaved={()=>false} busy={false} onSave={jest.fn()} onView={jest.fn()} onViewAll={jest.fn()}/>);
 HOME_PRODUCTS.forEach((product,index)=>{
 expect(ui.getByTestId((index<4?"journey-image-":"journey-placeholder-")+product.id)).toBeTruthy();
 });ui.unmount();
 HOME_PRODUCTS.forEach((product,index)=>{
 const detail=render(<JourneyProductDetails product={product} onClose={jest.fn()}/>);
 expect(detail.getByTestId((index<4?"journey-image-":"journey-placeholder-")+product.id)).toBeTruthy();
 expect(detail.getByText(rtl?(index<4?"صورة توضيحية":"الصورة غير متوفرة"):(index<4?"Illustration":"Image unavailable"))).toBeTruthy();detail.unmount();
 });
});
