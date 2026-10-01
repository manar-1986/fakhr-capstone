import React from "react";
import { expect, jest, test } from "@jest/globals";
import { fireEvent, render } from "@testing-library/react-native";
import fs from "fs";
import path from "path";
import Screen from "../app/(tabs)/resources/disability-services";
import mockAr from "../i18n/locales/ar.json";
import mockEn from "../i18n/locales/en.json";

let mockId = "", mockLocale: "ar" | "en" = "ar";
const mockPush = jest.fn();
const mockRouter = { push: mockPush, navigate: jest.fn() };
jest.mock("expo-router", () => ({ useRouter: () => mockRouter, useLocalSearchParams: () => ({ id: mockId, name: mockId }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key.split(".").reduce((value: any, part: string) => value[part], mockLocale === "ar" ? mockAr : mockEn) }) }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "View" }));

// Read every actual category so additions to the selector automatically join this regression check.
const source = fs.readFileSync(path.join(__dirname, "../app/(tabs)/resources/index.tsx"), "utf8");
const categories = [...source.matchAll(/id: "([a-z-]+)"/g)].map(match => match[1]);
const routes = ["directory/centers", "directory/professionals", "directory/schools", "activity-library", "services", "products"];
const keys = ["centers", "doctorsOneLine", "schools", "activitiesOneLine", "homeServicesOneLine", "products"];
for (const locale of ["ar", "en"] as const) {
  test.each([...categories, "future-category"])(`${locale}: %s has six working services and no consultations`, id => {
    mockId = id; mockLocale = locale; mockPush.mockClear();
    const strings = locale === "ar" ? mockAr : mockEn;
    const screen = render(<Screen />);
    expect(screen.queryByText(strings.ui.consultations)).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(7); // six services plus Back
    keys.forEach((key, index) => {
      fireEvent.press(screen.getByLabelText((strings.ui as any)[key]));
      expect(mockPush).toHaveBeenLastCalledWith({ pathname: `/(tabs)/${routes[index]}`, params: expect.objectContaining({ disabilityId: id, disabilityName: id }) });
    });
    screen.unmount();
  });
}
