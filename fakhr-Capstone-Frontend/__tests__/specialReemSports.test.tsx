import React from "react";
import { render, cleanup } from "@testing-library/react-native";
import { Platform } from "react-native";
import CenterProfileScreen from "../components/directory/CenterProfileScreen";
import { INSTITUTIONS, findInstitution, institutionDirectoryCategory, backendInstitution, mergeInstitutions, filterInstitutions } from "../utils/institutionDirectory";
import { buildHomeSearchRecords } from "../utils/homeSearch";
import { buildHomeCarouselRecords } from "../utils/homeCarouselRecords";
import type { HealthCenter } from "../types/directory.types";
let mockRTL = false;
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr" }) }));
jest.mock("../components/directory/PersonalAppointment", () => () => null);
afterEach(cleanup);
const record = findInstitution("center-special-reem")!;
const api = { id: "abcdef123456abcdef123456", name: "Special Reem Center" } as HealthCenter;

test("one original identity belongs only to Sports Clubs, including exact API matches", () => {
  expect(INSTITUTIONS.filter(i => i.id === record.id)).toHaveLength(1);
  expect(record.categories).toEqual(["sports"]);
  expect(institutionDirectoryCategory(record)).toBe("sports");
  const mapped = backendInstitution(api);
  expect(institutionDirectoryCategory(mapped)).toBe("sports");
  expect(mergeInstitutions(INSTITUTIONS, [mapped]).filter(i => (i.canonicalId || i.id) === record.id)).toHaveLength(1);
  for (const search of ["Special Reem", "سبيشل ريم"]) expect(filterInstitutions(INSTITUTIONS, { search })).toContain(record);
  expect(buildHomeSearchRecords([api]).filter(i => i.id === record.id)).toHaveLength(1);
  const slides = buildHomeCarouselRecords([api]).filter(i => i.id === record.id);
  expect(slides).toHaveLength(1);
  expect(slides[0].category).toBe("sports");
  expect(record.mainImage).toBe("specialreem");
});

test.each([true, false])("original bilingual profile and exact contact destinations remain available, RTL=%s", rtl => {
  mockRTL = rtl;
  const original = Platform.OS;
  Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
  try {
    const ui = render(<CenterProfileScreen item={record} />);
    expect(ui.getAllByText(rtl ? "مركز سبيشل ريم" : "Special Reem Center").length).toBeGreaterThan(0);
    expect(ui.getByText(record.publicProfile!.description![rtl ? "ar" : "en"])).toBeTruthy();
    const links = ui.getAllByRole("link").map(link => link.props.href);
    for (const url of ["tel:+96595007009", "https://wa.me/96595007009", "https://www.instagram.com/special.reem/", "https://maps.app.goo.gl/gW7SfCGw6qyiWav69"]) expect(links).toContain(url);
    expect(record.publicProfile!.services!.en).toEqual(["Behavior Analysis", "Physiotherapy", "Occupational Therapy"]);
  } finally { Object.defineProperty(Platform, "OS", { configurable: true, value: original }); }
});
