import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { AppState, PanResponder } from "react-native";
import HomeAdCarousel from "../components/home/HomeAdCarousel";
import { buildHomePromotions } from "../utils/homePromotions";
import type { HealthCenter } from "../types/directory.types";
const HOME_RECORDS = buildHomePromotions();
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

  act(() => jest.advanceTimersByTime(10000));
  for (const ad of HOME_RECORDS) {
    const label = `${rtl ? ad.name.ar : ad.name.en}. ${ad.note[rtl ? "ar" : "en"]}. ${rtl ? "عرض التفاصيل" : "View Details"}`;
    fireEvent.press(ui.getByLabelText(label)); expect(mockPush).toHaveBeenLastCalledWith(ad.href);
    fireEvent.press(ui.getByLabelText(rtl ? "الإعلان التالي" : "Next advertisement"));
  }
  expect(ui.getByText(rtl ? HOME_RECORDS[0].name.ar : HOME_RECORDS[0].name.en)).toBeTruthy();
});

test("manual interaction pauses the timer; leaving Home stops rotation", () => {
  const ui = render(<HomeAdCarousel />);
  act(() => jest.advanceTimersByTime(4000)); fireEvent.press(ui.getByLabelText("Next advertisement"));
  act(() => jest.advanceTimersByTime(4000)); expect(ui.getByText(HOME_RECORDS[1].name.en)).toBeTruthy();
  act(() => jest.advanceTimersByTime(1000)); expect(ui.getByText(HOME_RECORDS[1].name.en)).toBeTruthy();
  mockFocused = false; ui.rerender(<HomeAdCarousel />);
  act(() => jest.advanceTimersByTime(15000)); expect(ui.getByText(HOME_RECORDS[1].name.en)).toBeTruthy();
});

test("a browser click after dragging does not navigate, but a subsequent tap does", () => {
  const ui = render(<HomeAdCarousel />);
  fireEvent(ui.getByTestId("ad-swipe-surface"), "panResponderRelease", {}, { dx: -100, dy: 0 });
  const ad = ui.getByTestId("home-carousel-record");
  fireEvent.press(ad); expect(mockPush).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(400));
  fireEvent.press(ad); expect(mockPush).toHaveBeenCalledWith(HOME_RECORDS[1].href);
});


test("failed images are removed with no placeholder, and only one image is mounted",()=>{
 const ui=render(<HomeAdCarousel/>);const {Image}=require("react-native");
 expect(ui.UNSAFE_getAllByType(Image)).toHaveLength(1);
 fireEvent(ui.UNSAFE_getByType(Image),"error");
 expect(ui.queryByText(HOME_RECORDS[0].name.en)).toBeNull();expect(ui.UNSAFE_getAllByType(Image)).toHaveLength(1);
});

test("carousel wraps content uses the approved flexible banner without a fixed outer height", () => {
  const ui = render(<HomeAdCarousel />);
  const { StyleSheet } = jest.requireActual("react-native");
  expect(StyleSheet.flatten(ui.getByTestId("home-ad-carousel").props.style).height).toBeUndefined();
  expect(StyleSheet.flatten(ui.getByTestId("ad-swipe-surface").props.style)).toEqual({ flex: 1 });
  expect(ui.getByLabelText("Next advertisement")).toBeTruthy();
  expect(ui.getByLabelText("Previous advertisement")).toBeTruthy();
});
