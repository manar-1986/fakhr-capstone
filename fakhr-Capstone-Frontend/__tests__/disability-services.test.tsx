import { categoryContent, categoryBrowsingCards, hasServiceResults, categoryServiceCards, hasCategoryService, hasProfessionalCategoryService } from "../utils/disabilityContent";
import React from "react";
import { expect, jest, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import fs from "fs";
import path from "path";
import Screen from "../app/(tabs)/resources/disability-services";
import mockAr from "../i18n/locales/ar.json";
import mockEn from "../i18n/locales/en.json";

jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null, loading: false }) }));

let mockId = "", mockLocale: "ar" | "en" = "ar";
const mockPush = jest.fn();
const mockRouter = { push: mockPush, navigate: jest.fn() };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => ({ id: mockId, name: mockId }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon", MaterialCommunityIcons: "Icon" }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: () => null }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [] }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockLocale === "ar", align: mockLocale === "ar" ? "right" : "left", dir: mockLocale === "ar" ? "rtl" : "ltr", tabRow: mockLocale === "ar" ? "row-reverse" : "row" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key.split(".").reduce((value: any, part: string) => value[part], mockLocale === "ar" ? mockAr : mockEn) }) }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View" }));

// Read every actual category so additions to the selector automatically join this regression check.
const source = fs.readFileSync(path.join(__dirname, "../app/(tabs)/resources/index.tsx"), "utf8");
const categories = [...source.matchAll(/id: "([a-z-]+)"/g)].map(match => match[1]);
const routes = ["directory/centers", "directory/professionals", "directory/schools", "activity-library", "services", "products"];
const keys = ["centers", "doctorsOneLine", "schools", "activitiesOneLine", "homeServicesOneLine", "products"];
for (const locale of ["ar", "en"] as const) {
  test.each([...categories, "future-category"])(`${locale}: %s has grounded services and working details without consultations`, id => {
    mockId = id; mockLocale = locale; mockPush.mockClear();
    const strings = locale === "ar" ? mockAr : mockEn;
    const screen = render(<Screen />);
    expect(screen.queryByText(strings.ui.consultations)).toBeNull();
    const data=categoryContent(id);
    if(data.education.length){
      fireEvent.press(screen.getByLabelText(locale === "ar" ? "عرض التعليم" : "Show education"));
      const links=screen.getAllByLabelText(locale === "ar" ? "عرض التفاصيل" : "View details");
      expect(links).toHaveLength(data.education.length);
      for(const item of data.education) expect(screen.getByTestId(`category-${item.mainImage ? "image" : "placeholder"}-${item.id}`)).toBeTruthy();
      links.forEach((link,index)=>{fireEvent.press(link);expect(mockPush).toHaveBeenLastCalledWith({pathname:"/(tabs)/directory/institution-details",params:{id:data.education[index].id}});});
    }
    if(data.centers.length){ const show=screen.queryByLabelText(locale === "ar" ? "عرض الجهات" : "Show institutions") ?? screen.queryAllByLabelText(locale === "ar" ? "عرض الكل" : "View all")[0]; if(show)fireEvent.press(show);
      const links=screen.getAllByLabelText(locale === "ar" ? "عرض الخدمات" : "View services");
      expect(links).toHaveLength(data.centers.length);
      links.forEach((link,index)=>{fireEvent.press(link);expect(mockPush).toHaveBeenLastCalledWith({pathname:"/(tabs)/directory/institution-details",params:{id:data.centers[index].id}});});
    }
    if(data.products.length>2) fireEvent.press(screen.getAllByLabelText(locale === "ar" ? "عرض الكل" : "View all").slice(-1)[0]);
    for(const product of data.products) {
      const {within}=require("@testing-library/react-native");
      fireEvent.press(within(screen.getByTestId(`category-product-${product.id}`)).getByLabelText(locale === "ar" ? "استكشف" : "Explore"));
      expect(mockPush).toHaveBeenLastCalledWith({pathname:"/(tabs)/products/product-details",params:{id:product.id}});
    }
    if(!data.centers.length&&!data.professionals.length&&!data.education.length)expect(screen.getByText(locale === "ar" ? "لا توجد خدمات مطابقة موثقة في الدليل الحالي." : "No matching services are documented in the current directory.")).toBeTruthy();
    if(!data.centers.length && data.professionals.length>2) fireEvent.press(screen.getAllByLabelText(locale === "ar" ? "عرض الكل" : "View all")[0]);
    for(const doctor of data.professionals) {
      const card=screen.getByTestId(`category-professional-${doctor.id}`);
      const {within}=require("@testing-library/react-native");
      fireEvent.press(within(card).getByLabelText(locale === "ar" ? "عرض الملف" : "View profile"));
      expect(mockPush).toHaveBeenLastCalledWith({pathname:"/(tabs)/directory/professional-details",params:{id:doctor.id}});
    }
    fireEvent.press(screen.getByLabelText(locale === "ar" ? "عرض خطة طفلي" : "View My Child's Plan"));
    expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/plan");
    screen.unmount();
  });
}


for(const width of [320,375,430]) for(const locale of ["ar","en"] as const) {
 test.each(categories)(`${width}px ${locale}: %s preserves category and guest browsing`,id=>{
  const rn=require("react-native");
  const dimensions=jest.spyOn(rn,"useWindowDimensions").mockReturnValue({width,height:900,scale:1,fontScale:1});
  mockId=id;mockLocale=locale;
  const screen=render(<Screen/>);
  expect(screen.getByTestId("category-details-search")).toBeTruthy();
  const education=screen.queryByLabelText(locale==="ar"?"عرض التعليم":"Show education");
  if(education)fireEvent.press(education);
  const cards=screen.queryAllByTestId(/^category-(education|center|professional)-/);
  for(const card of cards){
   const style=rn.StyleSheet.flatten(card.props.style);
   expect(style.minHeight).toBeUndefined();
   expect(style.height).toBeUndefined();
   expect(style.width).toBe("48%");
   expect(style.alignSelf).toBe("stretch");
   const children=card.children.filter(child=>typeof child!=="string");
   expect(rn.StyleSheet.flatten(children[0].props.style).height).toBe(96);
   expect(children[1].props.numberOfLines).toBeUndefined();
   expect(rn.StyleSheet.flatten(children[1].props.style).minHeight).toBeUndefined();
   expect(rn.StyleSheet.flatten(children[children.length-1].props.style).marginTop).toBe("auto");
  }
  fireEvent.press(screen.getByLabelText(locale==="ar"?"تغيير الطفل":"Change child"));
  expect(screen.getByText(locale==="ar"?"تحتاج إلى حساب لإضافة معلومات طفلك وتخصيص تجربته. يمكنك متابعة تصفح الخدمات كضيف.":"An account is needed to add your child information and personalise their experience. You can keep browsing services as a guest.")).toBeTruthy();
  screen.unmount();dimensions.mockRestore();
 });
}

for(const locale of ["ar","en"] as const) test.each(categories)(`${locale}: %s service filters retain only documented matches`,id=>{
 mockId=id;mockLocale=locale;const screen=render(<Screen/>);const data=categoryContent(id);
 for(const {query:key,ar,en} of categoryServiceCards(id,data)){
  const tile=screen.queryByLabelText(locale==="ar"?ar:en);
  if(!tile)continue;
  fireEvent.press(tile);
  for(const center of data.centers)expect(!!screen.queryByTestId(`category-center-${center.id}`)).toBe(hasCategoryService(center,key));
  for(const doctor of data.professionals)expect(!!screen.queryByTestId(`category-professional-${doctor.id}`)).toBe(hasProfessionalCategoryService(doctor,key));
  fireEvent.press(screen.getByLabelText(locale==="ar"?"عرض جميع الخدمات":"Show all services"));
 }
 screen.unmount();
});

for(const locale of ["ar","en"] as const) test.each(categories)(`${locale}: %s has four assigned or informational service actions`,id=>{
 mockId=id;mockLocale=locale;mockPush.mockClear();const screen=render(<Screen/>);const data=categoryContent(id);
 expect(screen.getAllByTestId(/^category-service-(?!notice)/)).toHaveLength(4);
 expect(categoryBrowsingCards(id)).toHaveLength(4);
 for(const card of categoryBrowsingCards(id)) {
  fireEvent.press(screen.getByTestId(`category-service-${card.query}`));
  if(!hasServiceResults(data,card.query)) {
   expect(screen.getByTestId("category-service-notice")).toBeTruthy();
   expect(screen.getByText(locale==="ar"?"ستتم إضافة الجهات المقدمة للخدمة قريباً. لا توجد حالياً جهات معتمدة مرتبطة بهذه الخدمة ضمن هذه الفئة في دليل فخر.":"Providers will be added soon. No approved providers are currently assigned to this service within this category in Fakhr.")).toBeTruthy();
   expect(mockPush).not.toHaveBeenCalled();
   fireEvent.press(screen.getByLabelText(locale==="ar"?"إغلاق":"Close"));
  } else expect(screen.queryByTestId("category-service-notice")).toBeNull();
 }
 fireEvent.changeText(screen.getByTestId("category-details-search"),"unmatched-query");
 expect(screen.getAllByTestId(/^category-service-(?!notice)/)).toHaveLength(4);
 const assigned=categoryBrowsingCards(id).find(card=>hasServiceResults(data,card.query));
 if(assigned){fireEvent.press(screen.getByTestId(`category-service-${assigned.query}`));expect(screen.getByText(locale==="ar"?"لا توجد نتائج تطابق البحث والمنطقة المحددين. جرّب تغيير عوامل التصفية.":"No results match your search and area. Try changing the filters.")).toBeTruthy();}
 screen.unmount();
});
