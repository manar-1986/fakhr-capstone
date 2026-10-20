import { INSTITUTIONS, findInstitution, filterInstitutions, institutionDirectoryCategory } from "../utils/institutionDirectory";
import React from "react";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, cleanup } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import Directory from "../components/directory/InstitutionDirectoryScreen";
import Details from "../components/directory/InstitutionDetailsScreen";
import EducationProfileScreen from "../components/directory/EducationProfileScreen";

let mockRTL = true;
const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }), useLocalSearchParams: () => ({}) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ ...jest.requireActual<any>("react-native-safe-area-context"), SafeAreaView: "View", useSafeAreaInsets: () => ({ bottom: 34 }) }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: () => null, DisabilityAwareHeaderBackButton: () => null }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../api/directory.api", () => ({ getCenters: jest.fn(), getCenterDetails: jest.fn(), centersListQueryKey: () => ["centers"] }));
const mockQuery = jest.fn(() => ({ data: [], isPending: false, isError: false, refetch: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useQuery: (...args: unknown[]) => (mockQuery as any)(...args) }));
const originalOS = Platform.OS;
beforeEach(() => { mockRTL = true; mockPush.mockClear(); mockQuery.mockClear(); });
afterEach(() => { cleanup(); jest.restoreAllMocks(); Object.defineProperty(Platform, "OS", { configurable: true, value: originalOS }); });

describe.each([true, false])("directory in RTL=%s", rtl => {
  test("search, categories, governorate, area, disability, stage and stable navigation", () => {
    mockRTL = rtl;
    const ui = render(<Directory initialCategory="school" />);
    expect(ui.getAllByRole("tab")).toHaveLength(2);
    expect(ui.queryByLabelText(rtl ? "مراكز التأهيل" : "Rehabilitation Centers")).toBeNull();
    expect(ui.queryByLabelText("مركز الكويت للتوحد (عربية)")).toBeNull();
    expect(mockQuery).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
    fireEvent.changeText(ui.getByLabelText(rtl ? "ابحث باسم المدرسة..." : "Search for a school..."), "دسمان");
    fireEvent.press(ui.getByRole("button", {name: rtl ? findInstitution("kw-s-dasman-1")!.nameAr : findInstitution("kw-s-dasman-1")!.nameEn!}));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/institution-details", params: { id: "kw-s-dasman-1" } });
    fireEvent.press(ui.getByText(rtl ? "مسح الفلاتر" : "Clear filters"));
    fireEvent.press(ui.getByLabelText(rtl ? "الحضانات" : "Nurseries"));
    const nurseryCount=filterInstitutions(INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="nursery"),{}).length;
    expect(ui.getByText(rtl ? `${nurseryCount} مؤسسة` : `${nurseryCount} institutions`)).toBeTruthy();
    fireEvent.press(ui.getByLabelText(rtl ? "المحافظة: الكل" : "Governorate: All"));
    fireEvent.press(ui.getByLabelText(rtl ? "العاصمة" : "Capital"));
    fireEvent.press(ui.getByLabelText(rtl ? "المنطقة: الكل" : "Area: All"));
    fireEvent.press(ui.getByLabelText("الخالدية"));
    fireEvent.press(ui.getByLabelText(rtl ? "نوع الإعاقة: الكل" : "Disability type: All"));
    fireEvent.press(ui.getByLabelText(rtl ? "الإعاقة السمعية" : "Hearing disability"));
    fireEvent.press(ui.getByLabelText(rtl ? "المرحلة التعليمية: الكل" : "Educational stage: All"));
    fireEvent.press(ui.getByLabelText(rtl ? "حضانة" : "Nursery"));
    expect(ui.getByText(rtl ? "1 مؤسسة" : "1 institutions")).toBeTruthy();
    fireEvent.press(ui.getByRole("button", {name:rtl ? "حضانة البستان لضعاف السمع والنطق" : findInstitution("kw-n-bustan")!.nameEn!}));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/institution-details", params: { id: "kw-n-bustan" } });
  });
  test("centers section has no school/nursery tabs and keeps its stable center identity", () => {
    mockRTL = rtl;
    const ui = render(<Directory initialCategory="rehabilitation" />);
    expect(ui.queryAllByRole("tab")).toHaveLength(0);
    expect(ui.getByText(rtl ? "المراكز" : "Centers")).toBeTruthy();
    const centers=filterInstitutions(INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="rehabilitation" && i.id!=="center-speech-plus"),{});
    expect(ui.getAllByRole("button")).toHaveLength(centers.length + 4); // Four directory filter controls.
    expect(mockQuery).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }));
    const center=centers[0];
    fireEvent.press(ui.getByRole("button", {name:rtl ? center.nameAr : center.nameEn || center.nameAr}));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/institution-details", params: { id: center.id } });
    fireEvent.changeText(ui.getByLabelText(rtl ? "ابحث باسم المدرسة..." : "Search for a school..."), "دسمان");
    expect(ui.getByText(rtl ? "0 مؤسسة" : "0 institutions")).toBeTruthy();
  });
});

test.each(["ios", "android", "web"] as const)("%s: source details, safe phone links and no fabricated actions", os => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  const ui = render(<Details institutionId="kw-n-bustan" />);
  expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  const call = ui.getByLabelText("اتصال 24822086");
  if (os === "web") expect(call.props.href).toBe("tel:+96524822086");
  else { fireEvent.press(call); expect(openURL).toHaveBeenCalledWith("tel:+96524822086"); }
  expect(ui.queryByLabelText("عرض الموقع المتحقق منه")).toBeNull();
  expect(ui.queryByText(/احجز/)).toBeNull();
  expect(findInstitution("kw-n-bustan")!.observations.some(o=>o.capacityAr === "48")).toBe(true);
  // Preserve the original Details-page contract; source data alone is not sufficient.
  expect(ui.getByText("48")).toBeTruthy();
  expect(ui.getByText("3–6 سنوات")).toBeTruthy();
});

test("unknown IDs never show first school or request an unrelated backend center", () => {
  const ui = render(<Details institutionId="bad-id" />);
  expect(ui.getByText("المؤسسة غير موجودة. لم يتم عرض مؤسسة بديلة.")).toBeTruthy();
  expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
});

test.each([true, false])("nursery capacity uses recorded data and hides missing values (RTL=%s)", rtl => {
  mockRTL = rtl;
  const item = findInstitution("kw-n-bustan")!;
  const original = JSON.stringify(item);
  const ui = render(<Details institutionId={item.id} />);
  expect(ui.getByRole("header", { name: rtl ? "السعة الاستيعابية" : "Capacity" })).toBeTruthy();
  expect(ui.getByText("48")).toBeTruthy();
  ui.unmount();
  const changed = { ...item, observations: item.observations.map(o => ({ ...o, capacityAr: "27" })) };
  const preview = render(<EducationProfileScreen item={changed} />);
  expect(preview.getByText("27")).toBeTruthy();
  expect(preview.queryByText("48")).toBeNull();
  preview.rerender(<EducationProfileScreen item={{ ...item, observations: item.observations.map(o => ({ ...o, capacityAr: null })) }} />);
  expect(preview.queryByRole("header", { name: rtl ? "السعة الاستيعابية" : "Capacity" })).toBeNull();
  expect(preview.queryByText("48")).toBeNull();
  expect(JSON.stringify(item)).toBe(original);
});

test.each([true,false])('deaf sports club has working details navigation RTL=%s',rtl=>{
 mockRTL=rtl;const ui=render(<Directory initialCategory="sports"/>);
 fireEvent.press(ui.getByRole('button',{name:rtl?'النادي الكويتي الرياضي للصم':'Kuwait Sports Club for the Deaf'}));
 expect(mockPush).toHaveBeenLastCalledWith({pathname:'/(tabs)/directory/institution-details',params:{id:'sports-kuwait-deaf'}});
});

test.each([true,false])('Warba club details navigation RTL=%s',rtl=>{mockRTL=rtl;const ui=render(<Directory initialCategory="sports"/>);fireEvent.press(ui.getByRole('button',{name:rtl?'نادي وربة الرياضي للمعاقين':'Warba Disabled Sports Club'}));expect(mockPush).toHaveBeenLastCalledWith({pathname:'/(tabs)/directory/institution-details',params:{id:'sports-warba'}});});

test.each([true,false])('Nova Forte details navigation RTL=%s',rtl=>{mockRTL=rtl;const ui=render(<Directory initialCategory="sports"/>);fireEvent.press(ui.getByRole('button',{name:rtl?'نادي نوفا فورتي الرياضي':'Nova Forte Gym'}));expect(mockPush).toHaveBeenLastCalledWith({pathname:'/(tabs)/directory/institution-details',params:{id:'sports-nova-forte'}});});
