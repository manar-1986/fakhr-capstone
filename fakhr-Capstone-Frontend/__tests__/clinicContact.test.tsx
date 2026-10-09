import React from "react";
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import { clinicContact } from "../utils/clinicContact";
import { normalizeProfessional } from "../utils/professionalBilingual";
import Details from "../app/(tabs)/directory/professional-details";
import { DirectoryListingCard } from "../components/directory/DirectoryListingCard";
import { FEATURED_LISTINGS } from "../components/directory/directoryMockData";
import Booking from "../app/(tabs)/directory/booking";

let mockRTL = false;
let mockProfessional: ReturnType<typeof normalizeProfessional>;
const mockPush = jest.fn();
let mockParams: { id?: string; item?: string } = { id: "test-record" };
let mockUser: object | null = null;
const mockSave = jest.fn();
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, loading: false }) }));
jest.mock("../utils/mockBookingsStore", () => ({ saveMockBooking: (...args: unknown[]) => mockSave(...args) }));
jest.mock("../utils/addAppointmentToCalendar", () => ({ addAppointmentToDeviceCalendar: jest.fn() }));
jest.mock("../utils/authRedirect", () => ({ setPendingAuthHref: jest.fn(), bookingReturnHref: (item: string) => "/directory/booking?item=" + item }));
jest.mock("../components/navigation/HeaderBackButton", () => ({ HeaderBackButton: "BackButton" }));
jest.mock("../api/directory.api", () => ({ getProfessionalDetails: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: mockProfessional }) }));
jest.mock("expo-router", () => ({ useLocalSearchParams: () => mockParams, useRouter: () => ({ push: mockPush, canGoBack: () => false, replace: mockPush }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => {
  const translations = require(mockRTL ? "../i18n/locales/ar.json" : "../i18n/locales/en.json");
  return key.split(".").reduce((value: any, part: string) => value?.[part], translations) ?? key;
} }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("expo-image", () => ({ Image: "Image" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: require("react-native").View }));

beforeEach(() => {
  mockRTL = false;
  mockParams = { id: "test-record" };
  mockUser = null;
  mockPush.mockClear();
  mockSave.mockClear();
  mockProfessional = normalizeProfessional({ nameEn: "Test doctor", specialtyEn: "Test specialty", clinicNameEn: "Test clinic", clinicNameAr: "عيادة الاختبار", addressEn: "Test address", addressAr: "عنوان الاختبار", phone: "+000 123 456" });
  jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
});
afterEach(() => { jest.restoreAllMocks(); });

test("guest details show stored clinic data and no booking, with native call/maps actions", () => {
  const page = render(<Details />);
  expect(page.getByText("Test clinic")).toBeTruthy();
  expect(page.getByText("Test address")).toBeTruthy();
  expect(page.getByText("+000 123 456")).toBeTruthy();
  expect(page.queryByText(/Book appointment|حجز موعد/i)).toBeNull();
  fireEvent.press(page.getByLabelText("Call"));
  expect(Linking.openURL).toHaveBeenCalledWith("tel:+000123456");
  fireEvent.press(page.getByLabelText("Location"));
  expect(Linking.openURL).toHaveBeenCalledWith("https://www.google.com/maps/search/?api=1&query=Test%20address");
});

test("Arabic uses stored Arabic clinic data and RTL text", () => {
  mockRTL = true;
  const page = render(<Details />);
  expect(page.getByText("عيادة الاختبار")).toBeTruthy();
  expect(page.getByText("عنوان الاختبار").props.style).toEqual(expect.arrayContaining([expect.objectContaining({ writingDirection: "rtl", textAlign: "right" })]));
  expect(page.getByLabelText("اتصال")).toBeTruthy();
  expect(page.getByLabelText("الموقع")).toBeTruthy();
});

test("missing contact data shows unavailable fields and disabled actions", () => {
  mockProfessional = normalizeProfessional({ nameEn: "Test doctor", locationEn: "City only" });
  const page = render(<Details />);
  expect(page.getAllByText("Not available")).toHaveLength(3);
  expect(page.getByLabelText("Call").props.accessibilityState.disabled).toBe(true);
  expect(page.getByLabelText("Location").props.accessibilityState.disabled).toBe(true);
});

test("web exposes real tel and maps hrefs", () => {
  jest.replaceProperty(Platform, "OS", "web");
  const page = render(<Details />);
  expect(page.getByLabelText("Call").props.href).toBe("tel:+000123456");
  expect(page.getByLabelText("Location").props.href).toContain("query=Test%20address");
});

test("doctor cards open details; center cards retain booking", () => {
  const book = jest.fn();
  const details = jest.fn();
  const page = render(<DirectoryListingCard item={FEATURED_LISTINGS[1]} onViewDetails={details} onBookAppointment={book} />);
  expect(page.queryByText(/Book appointment/i)).toBeNull();
  fireEvent.press(page.getByText("View details"));
  expect(details).toHaveBeenCalled();
  expect(book).not.toHaveBeenCalled();
  page.rerender(<DirectoryListingCard item={FEATURED_LISTINGS[0]} onBookAppointment={book} />);
  fireEvent.press(page.getByText(/Book appointment/i));
  expect(book).toHaveBeenCalledTimes(1);
});

test("old doctor booking URLs redirect guests to details, never login", () => {
  mockParams = { item: encodeURIComponent(JSON.stringify(FEATURED_LISTINGS[1])) };
  const page = render(<Booking />);
  expect(mockPush).toHaveBeenCalledWith({ pathname: "/(tabs)/directory/professional-details", params: { id: "2" } });
  expect(mockPush).not.toHaveBeenCalledWith("/(auth)/login");
  expect(page.queryByText("Next")).toBeNull();
});

test("center booking still authenticates guests and completes for signed-in users", () => {
  mockParams = { item: encodeURIComponent(JSON.stringify(FEATURED_LISTINGS[0])) };
  const page = render(<Booking />);
  expect(mockPush).toHaveBeenCalledWith("/(auth)/login");
  mockUser = { id: "test-user" };
  page.rerender(<Booking />);
  fireEvent.press(page.getByLabelText("Next"));
  fireEvent.changeText(page.getByPlaceholderText("Enter your full name"), "Test patient");
  fireEvent.changeText(page.getByPlaceholderText("05xxxxxxxx"), "000123");
  fireEvent.press(page.getByLabelText("Confirm booking"));
  expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ listingNameEn: FEATURED_LISTINGS[0].nameEn, patientName: "Test patient" }));
});

test("normalization preserves clinic fields and populated center contacts", () => {
  expect(mockProfessional.clinicNameAr).toBe("عيادة الاختبار");
  const p = normalizeProfessional({ centerId: { nameAr: "مركز الاختبار", nameEn: "Test center", addressEn: "Stored address", phone: "+000123", latitude: 0, longitude: 0 } });
  expect(p.centerNameAr).toBe("مركز الاختبار");
  expect(clinicContact(p).telUrl).toBe("tel:+000123");
  expect(clinicContact(p).mapUrl).toContain("query=0%2C0");
});

test("maps require stored location, preserve curated links, and reject invalid coordinates", () => {
  expect(clinicContact(normalizeProfessional({ locationEn: "City", centerName: "Name only" })).mapUrl).toBeUndefined();
  expect(clinicContact(normalizeProfessional({ latitude: 91, longitude: 10 })).mapUrl).toBeUndefined();
  expect(clinicContact(normalizeProfessional({ mapUrl: "https://maps.app.goo.gl/test" })).mapUrl).toBe("https://maps.app.goo.gl/test");
  expect(clinicContact(normalizeProfessional({ mapUrl: "javascript:alert(1)" })).mapUrl).toBeUndefined();
  expect(clinicContact(normalizeProfessional({ addressAr: "عنوان الاختبار" })).mapUrl).toContain(encodeURIComponent("عنوان الاختبار"));
});
