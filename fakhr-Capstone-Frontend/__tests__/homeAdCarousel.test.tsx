import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { AppState, PanResponder } from "react-native";
import HomeAdCarousel from "../components/home/HomeAdCarousel";
import { buildHomeCarouselRecords } from "../utils/homeCarouselRecords";
import type { HealthCenter } from "../types/directory.types";
const HOME_RECORDS = buildHomeCarouselRecords();
let mockCenters: HealthCenter[] | undefined;
let mockDetail: HealthCenter | undefined;
let mockDetailError = false;
jest.mock("@tanstack/react-query", () => ({ useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === "centers" ? { data: mockCenters } : { data: mockDetail, isError: mockDetailError } }));
jest.mock("../api/directory.api", () => ({ centersListQueryKey: () => ["centers"], getCenters: jest.fn(), getCenterDetails: jest.fn() }));

let mockRTL = false;
let mockFocused = true;
const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: () => mockFocused }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon", MaterialCommunityIcons: "Icon" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
const initialState = AppState.currentState;
beforeEach(() => {
  jest.useFakeTimers(); mockRTL = false; mockFocused = true; mockPush.mockClear();
  mockCenters = undefined; mockDetail = undefined; mockDetailError = false;
  Object.defineProperty(AppState, "currentState", { configurable: true, value: "active", writable: true });
  jest.spyOn(PanResponder, "create").mockImplementation(config => ({ panHandlers: config } as any));
});
afterEach(() => { cleanup(); jest.restoreAllMocks(); jest.useRealTimers(); AppState.currentState = initialState; });

test("rotates at exactly five seconds, wraps, and cleans up its timer", () => {
  const ui = render(<HomeAdCarousel />);
  expect(ui.getByText(HOME_RECORDS[0].name.en)).toBeTruthy();
  act(() => jest.advanceTimersByTime(4999)); expect(ui.getByText(HOME_RECORDS[0].name.en)).toBeTruthy();
  act(() => jest.advanceTimersByTime(1)); expect(ui.getByText(HOME_RECORDS[1].name.en)).toBeTruthy();
  for (let i = 0; i < HOME_RECORDS.length - 1; i++) act(() => jest.advanceTimersByTime(5000));
  expect(ui.getByText(HOME_RECORDS[0].name.en)).toBeTruthy();
  ui.unmount(); expect(jest.getTimerCount()).toBe(0);
});

test.each([true, false])("RTL=%s: swipes, all exact destinations and manual pause", rtl => {
  mockRTL = rtl;
  const ui = render(<HomeAdCarousel />);
  fireEvent(ui.getByTestId("ad-swipe-surface"), "panResponderRelease", {}, { dx: rtl ? 90 : -90, dy: 0 });
  expect(ui.getByText(rtl ? HOME_RECORDS[1].name.ar : HOME_RECORDS[1].name.en)).toBeTruthy();
  fireEvent.press(ui.getByLabelText(rtl ? "الإعلان السابق" : "Previous advertisement"));
  fireEvent.press(ui.getByLabelText(rtl ? "إيقاف الإعلانات مؤقتاً" : "Pause advertisements"));
  act(() => jest.advanceTimersByTime(10000));
  for (const ad of HOME_RECORDS) {
    const label = `${rtl ? ad.name.ar : ad.name.en}. ${ad.description[rtl ? "ar" : "en"]}. ${rtl ? "عرض التفاصيل" : "View Details"}`;
    fireEvent.press(ui.getByLabelText(label)); expect(mockPush).toHaveBeenLastCalledWith(ad.href);
    fireEvent.press(ui.getByLabelText(rtl ? "الإعلان التالي" : "Next advertisement"));
  }
  expect(ui.getByText(rtl ? HOME_RECORDS[0].name.ar : HOME_RECORDS[0].name.en)).toBeTruthy();
});

test("manual changes restart the timer; leaving Home stops rotation", () => {
  const ui = render(<HomeAdCarousel />);
  act(() => jest.advanceTimersByTime(4000)); fireEvent.press(ui.getByLabelText("Next advertisement"));
  act(() => jest.advanceTimersByTime(4000)); expect(ui.getByText(HOME_RECORDS[1].name.en)).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000)); expect(ui.getByText(HOME_RECORDS[2].name.en)).toBeTruthy();
  mockFocused = false; ui.rerender(<HomeAdCarousel />);
  act(() => jest.advanceTimersByTime(15000)); expect(ui.getByText(HOME_RECORDS[2].name.en)).toBeTruthy();
});

test("a browser click after dragging does not navigate, but a subsequent tap does", () => {
  const ui = render(<HomeAdCarousel />);
  fireEvent(ui.getByTestId("ad-swipe-surface"), "panResponderRelease", {}, { dx: -100, dy: 0 });
  const ad = ui.getByTestId("home-carousel-record");
  fireEvent.press(ad); expect(mockPush).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(400));
  fireEvent.press(ad); expect(mockPush).toHaveBeenCalledWith(HOME_RECORDS[1].href);
});

test("API slide requires a successful matching detail identity and survives later removal", () => {
  const center = { id: "123456789012345678901234", name: "API fixture" } as HealthCenter;
  mockCenters = [center];
  const ui = render(<HomeAdCarousel />);
  expect(ui.getByLabelText("1 / 6")).toBeTruthy();
  mockDetail = { ...center, id: "999999999999999999999999" };
  ui.rerender(<HomeAdCarousel />);
  expect(ui.getByLabelText("1 / 6")).toBeTruthy();
  mockDetail = center;
  ui.rerender(<HomeAdCarousel />);
  fireEvent.press(ui.getByLabelText("Previous advertisement"));
  expect(ui.getByText(center.name)).toBeTruthy();
  fireEvent.press(ui.getByTestId("home-carousel-record"));
  expect(mockPush).toHaveBeenLastCalledWith({ pathname: "/(tabs)/directory/institution-details", params: { id: `backend:${center.id}` } });
  mockDetailError = true;
  ui.rerender(<HomeAdCarousel />);
  expect(ui.getByLabelText("1 / 6")).toBeTruthy();
  expect(ui.queryByText(center.name)).toBeNull();
});

