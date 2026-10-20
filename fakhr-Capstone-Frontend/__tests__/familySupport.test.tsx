import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Platform } from "react-native";
import FamilySupport from "../components/plan/FamilySupport";

const mockPush = jest.fn();
let mockRTL = false;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr", tabRow: mockRTL ? "row-reverse" : "row" }) }));

test.each(["web", "ios", "android"] as const)("all support options work in both languages without authentication on %s", os => {
  const original = Platform.OS; Platform.OS = os;
  try {
    for (const rtl of [false, true]) {
      mockRTL = rtl; mockPush.mockClear();
      const ui = render(<FamilySupport />);
      expect(ui.getAllByText(rtl ? "دعم الأسرة" : "Family Support")).toHaveLength(1);
      expect(mockPush).not.toHaveBeenCalled();
      fireEvent.press(ui.getByTestId("family-support-guidance"));
      expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/resources");
      fireEvent.press(ui.getByTestId("family-support-home"));
      expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/activity-library");
      fireEvent.press(ui.getByTestId("family-support-workshops"));
      expect(ui.getByText(rtl ? /لا تتوفر حالياً قائمة ورش/ : /does not currently have a published workshops/)).toBeTruthy();
      fireEvent.press(ui.getByTestId("family-support-school"));
      expect(ui.getByText(rtl ? /لن تتم مشاركة معلومات طفلك/ : /Your child's information will not be shared/)).toBeTruthy();
      fireEvent.press(ui.getByText(rtl ? "عرض دليل المدارس" : "View school directory"));
      expect(mockPush).toHaveBeenLastCalledWith("/(tabs)/directory/schools");
      fireEvent.press(ui.getByLabelText(rtl ? "إغلاق المعلومات" : "Close information"));
      expect(ui.queryByText(rtl ? /لن تتم مشاركة معلومات طفلك/ : /Your child's information will not be shared/)).toBeNull();
      ui.unmount();
    }
  } finally { Platform.OS = original; }
});
