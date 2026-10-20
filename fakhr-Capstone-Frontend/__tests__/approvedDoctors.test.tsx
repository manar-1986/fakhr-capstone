import React from "react";
import { beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import Doctors from "../app/(tabs)/directory/professionals";
import Details from "../app/(tabs)/directory/professional-details";
import { APPROVED_DOCTORS, PUBLIC_DOCTORS, HIDDEN_DOCTOR_IDS, findApprovedDoctor } from "../constants/approvedDoctors";

let mockRTL = true;
let mockId = "doctor-hadeel-yassin-faras";
const mockPush = jest.fn();
const mockQuery = jest.fn(() => ({ data: [{ id: "unrelated-backend-doctor", name: "Unrelated" }], isLoading: false }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, canGoBack: () => false, replace: jest.fn() }), useLocalSearchParams: () => ({ id: mockId }) }));
jest.mock("@tanstack/react-query", () => ({ useQuery: (...args: unknown[]) => (mockQuery as any)(...args) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View" }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: () => null, DisabilityAwareHeaderBackButton: () => null }));
jest.mock("../api/directory.api", () => ({ getProfessionalDetails: jest.fn(), getProfessionals: jest.fn() }));
beforeEach(() => { mockPush.mockClear(); mockQuery.mockClear(); mockRTL = true; mockId = "doctor-hadeel-yassin-faras"; });
afterEach(cleanup);

test("exact user allowlist; no invented contact, ratings, photos, booking or backend associations", () => {
  expect(APPROVED_DOCTORS).toHaveLength(28);
  expect(new Set(APPROVED_DOCTORS.map(d=>d.id)).size).toBe(28);
  expect(findApprovedDoctor("doc-1")).toBeUndefined();
  for(const d of APPROVED_DOCTORS){
    expect(d.nameAr.trim()).not.toBe(""); expect(d.nameEn.trim()).not.toBe("");
    for(const field of ["rating","backendId","availability"])expect(d).not.toHaveProperty(field);
  }
  for(const id of HIDDEN_DOCTOR_IDS)expect(PUBLIC_DOCTORS.some(d=>d.id===id)).toBe(false);
});

describe.each([true, false])("approved doctors RTL=%s", rtl => {
  test("only ten doctors, doctors first, English/Arabic search and empty Specialists", () => {
    mockRTL = rtl;
    const ui = render(<Doctors />);
    expect(mockQuery).not.toHaveBeenCalled();
    for (const d of PUBLIC_DOCTORS) expect(ui.getByLabelText(rtl ? d.nameAr : d.nameEn)).toBeTruthy();
    expect(ui.queryByText("د. نورة الشمري")).toBeNull();
    fireEvent.changeText(ui.getByLabelText("ui.searchDoctor"), "المحطب");
    fireEvent.press(ui.getByLabelText(rtl ? "د. محمد المحطب" : "Dr. Mohammed Al-Muhtab"));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/professional-details", params: { id: "doctor-mohammed-almuhtab" } });
    fireEvent.changeText(ui.getByLabelText("ui.searchDoctor"), "Bosanka");
    expect(ui.queryByLabelText(rtl ? "د. بوسانكا يوسيتش ياكوبي" : "Dr. Bosanka Jocic Jakubi")).toBeNull();
    expect(ui.getByText(rtl ? "لا توجد نتائج مطابقة." : "No matching doctors.")).toBeTruthy();
    expect(ui.queryByText(rtl ? "الأخصائيون — المرحلة القادمة" : "Specialists — next stage")).toBeNull();
  });
  test("each curated detail resolves its own identity without any API lookup", () => {
    mockRTL = rtl;
    for (const doctor of PUBLIC_DOCTORS) {
      mockId = doctor.id;
      const ui = render(<Details />);
      expect(ui.getAllByText(rtl ? doctor.nameAr : doctor.nameEn).length).toBeGreaterThan(0);
      expect(mockQuery).not.toHaveBeenCalled();
      ui.unmount();
    }
  });
});
