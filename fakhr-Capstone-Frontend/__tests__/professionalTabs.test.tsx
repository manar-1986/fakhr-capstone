import { doctorVisibleSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import type { Institution } from "../types/institution";
import { isListedCenter } from "../utils/centerVisibility";
import { findInstitution } from "../utils/institutionDirectory";
import catalog from "../data/institutions/catalog.json";
import { SCHOOL_NAVIGATION_INSTITUTION_IDS, filterInstitutions } from "../utils/institutionDirectory";
import InstitutionDirectoryScreen from "../components/directory/InstitutionDirectoryScreen";
import React from "react";
import { fireEvent, render, cleanup } from "@testing-library/react-native";
import { Platform } from "react-native";
import Professionals from "../app/(tabs)/directory/professionals";
import { APPROVED_DOCTORS, HIDDEN_DOCTOR_IDS, PUBLIC_DOCTORS, publicDoctors } from "../constants/approvedDoctors";
import { INSTITUTIONS, LEGACY_INSTITUTIONS, institutionDirectoryCategory } from "../utils/institutionDirectory";

let mockRTL = true;
let mockTab = "doctors";
const mockPush = jest.fn();
const mockSetParams = jest.fn();
const center = { id: "507f1f77bcf86cd799439011", name: "API identity test center", city: "Kuwait" };
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, setParams: mockSetParams }), useLocalSearchParams: () => ({ tab: mockTab }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View", useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ DisabilityAwareHeaderBackButton: () => null }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../api/directory.api", () => ({ getCenters: jest.fn(), centersListQueryKey: () => ["centers"] }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [center, center], isPending: false, isError: false }) }));
afterEach(cleanup);

test.each(["web", "ios", "android"] as const)("%s: bilingual tabs, stable records, search and details", os => {
  const original = Platform.OS;
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  try {
    for (const rtl of [true, false]) {
      mockRTL = rtl; mockTab = "doctors";
      const ui = render(<Professionals />);
      expect(ui.getAllByRole("tab")).toHaveLength(3 + doctorVisibleSpecialtyOptions().length);
      expect(ui.getAllByRole("button").map(button => button.props.accessibilityLabel).sort())
        .toEqual(PUBLIC_DOCTORS.map(doctor => rtl ? doctor.nameAr : doctor.nameEn).sort());
      for (const hidden of APPROVED_DOCTORS.filter(doctor => HIDDEN_DOCTOR_IDS.has(doctor.id))) {
        expect(ui.queryByText(rtl ? hidden.nameAr : hidden.nameEn)).toBeNull();
        fireEvent.changeText(ui.getByLabelText("ui.searchDoctor"), rtl ? hidden.nameAr : hidden.nameEn);
        expect(ui.getByText(rtl ? "لا توجد نتائج مطابقة." : "No matching doctors.")).toBeTruthy();
      }
      fireEvent.changeText(ui.getByLabelText("ui.searchDoctor"), "");
      fireEvent.press(ui.getByRole("tab", { name: rtl ? "طب أسنان ذوي الاحتياجات الخاصة" : "Special Needs Dentistry" }));
      expect(ui.getAllByRole("button")).toHaveLength(5);
      expect(ui.queryByText(rtl ? PUBLIC_DOCTORS[0].nameAr : PUBLIC_DOCTORS[0].nameEn)).toBeNull();
      fireEvent.press(ui.getByRole("tab", { name: rtl ? "طب الأطفال التطوري" : "Developmental pediatrics" }));
      expect(ui.getAllByRole("button")).toHaveLength(2);
      fireEvent.press(ui.getByRole("tab", { name: rtl ? "الكل" : "All" }));
      const doctor = APPROVED_DOCTORS[0];
      fireEvent.press(ui.getByLabelText(rtl ? doctor.nameAr : doctor.nameEn));
      expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/professional-details", params: { id: doctor.id } });
      fireEvent.changeText(ui.getByLabelText("ui.searchDoctor"), "no-such-doctor");
      expect(ui.getByText(rtl ? "لا توجد نتائج مطابقة." : "No matching doctors.")).toBeTruthy();
      expect(ui.queryByText(rtl ? "الأخصائيون" : "Specialists")).toBeNull();
      fireEvent.press(ui.getByText(rtl ? "المراكز" : "Centers"));
      const expected = new Set([...INSTITUTIONS, ...LEGACY_INSTITUTIONS].filter(i => institutionDirectoryCategory(i) === "rehabilitation" && i.id !== "center-speech-plus" && i.id !== "center-blue-wing" && isListedCenter({...i,nameEn:i.nameEn||undefined})).map(i => i.id)).size + 1;
      expect(ui.getAllByRole("button")).toHaveLength(expected);
      expect(ui.getAllByRole("tab")).toHaveLength(2);
      for (const label of ["المحافظة", "المنطقة", "نوع الإعاقة", "المرحلة التعليمية", "Governorate", "Area", "Disability Type", "Educational Stage"]) expect(ui.queryByText(label)).toBeNull();
      expect(ui.queryByText(/بيانات مرجعية/)).toBeNull();
      fireEvent.changeText(ui.getByLabelText(rtl ? "ابحث باسم المؤسسة" : "Search institution name"), center.name);
      expect(ui.getAllByRole("button")).toHaveLength(1);
      fireEvent.press(ui.getByLabelText(center.name));
      expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/institution-details", params: { id: `backend:${center.id}` } });
      expect(ui.queryByText("Schools")).toBeNull();
      ui.unmount();
      mockTab = "centers";
      const direct = render(<Professionals />);
      expect(direct.getByLabelText(rtl ? "ابحث باسم المؤسسة" : "Search institution name")).toBeTruthy();
      direct.unmount();
      mockTab = "specialists";
      const removed = render(<Professionals />);
      expect(removed.getAllByRole("tab")).toHaveLength(3 + doctorVisibleSpecialtyOptions().length);
      expect(removed.getByLabelText("ui.searchDoctor")).toBeTruthy();
      expect(removed.queryByText(rtl ? "الأخصائيون" : "Specialists")).toBeNull();
      removed.unmount();
    }
  } finally { Object.defineProperty(Platform, "OS", { configurable: true, value: original }); }
});

test("public visibility retains source records and overrides API ordering without duplicates", () => {
  expect(APPROVED_DOCTORS).toHaveLength(28);
  const result = publicDoctors([...APPROVED_DOCTORS].reverse().concat(APPROVED_DOCTORS));
  expect(result).toHaveLength(28 - HIDDEN_DOCTOR_IDS.size);
  expect(new Set(result.map(d=>d.id)).size).toBe(result.length);
  expect(result.slice(0, 2).map(doctor => doctor.id)).toEqual([
    "doctor-hadeel-yassin-faras", "doctor-fatima-al-awadhi",
  ]);
  expect(result.some(doctor => HIDDEN_DOCTOR_IDS.has(doctor.id))).toBe(false);
});

test("Blue Wing has one specialist and one Center entry, with explicit public priority", () => {
  expect(PUBLIC_DOCTORS.slice(0,3).map(d=>d.id)).toEqual(["doctor-hadeel-yassin-faras","doctor-fatima-al-awadhi","doctor-dalal-sulaiman-al-shayji"]);
  expect(APPROVED_DOCTORS.filter(d=>d.id==="doctor-dalal-sulaiman-al-shayji")).toHaveLength(1);
  expect(INSTITUTIONS.filter(d=>d.id==="center-blue-wing")).toHaveLength(1);
});

test.each(["web","ios","android"] as const)("%s moves exactly 12 existing identities into Schools search and filters", os=>{
 const original=Platform.OS;Object.defineProperty(Platform,"OS",{configurable:true,value:os});
 try { for(const rtl of [true,false]) {mockRTL=rtl;
 const ui=render(<InstitutionDirectoryScreen initialCategory="school"/>);
 expect(SCHOOL_NAVIGATION_INSTITUTION_IDS.size).toBe(12);
 const schools=INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="school");
 const centers=INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="rehabilitation");
 for(const id of SCHOOL_NAVIGATION_INSTITUTION_IDS) {
  const item=findInstitution(id)!;expect(item).toBeDefined();
  const original=(catalog.institutions as Institution[]).find(i=>i.id===id)!;
  expect(item.observations).toEqual(expect.arrayContaining(original.observations));
  expect(schools.some(i=>i.id===item.id)).toBe(true);expect(centers.some(i=>i.id===id)).toBe(false);
  if(!isListedCenter({...item,nameEn:item.nameEn||undefined})) { expect(filterInstitutions(schools,{search:item.nameAr})).not.toContain(item); continue; }
  const name=!rtl&&item.nameEn?item.nameEn:item.nameAr;
  fireEvent.changeText(ui.getByLabelText(rtl?"ابحث باسم المدرسة...":"Search for a school..."),name);
  fireEvent.press(ui.getByRole("button",{name}));
  expect(mockPush).toHaveBeenLastCalledWith({pathname:"/(tabs)/directory/institution-details",params:{id:item.id}});
  for(const o of item.observations) {if(o.areaAr) expect(filterInstitutions(schools,{area:o.areaAr}).some(i=>i.id===item.id)).toBe(true);}
 }
 ui.unmount();
 }} finally {Object.defineProperty(Platform,"OS",{configurable:true,value:original});}
});
