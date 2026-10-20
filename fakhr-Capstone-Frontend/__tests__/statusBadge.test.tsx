import React from "react";
import { render } from "@testing-library/react-native";
import { StatusBadge } from "../components/ui/StatusBadge";
let mockRTL = false;
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
test("missing and unknown booking states never claim confirmation", () => {
 for (const status of [undefined, "booked", "saved", "completed", "toString"]) expect(render(<StatusBadge status={status}/>).toJSON()).toBeNull();
});
test.each([false, true])("renders explicit statuses in either language (%s)", value => {
 mockRTL = value;
 for (const [status, ar, en] of [["confirmed","حجز مؤكد","Confirmed Booking"],["pending","بانتظار التأكيد","Pending Confirmation"],["cancelled","حجز ملغي","Cancelled Booking"],["suggested","نشاط مقترح","Suggested Activity"]]) {
  const screen = render(<StatusBadge status={status}/>); expect(screen.getByText(value ? ar : en)).toBeTruthy(); screen.unmount();
 }
});
