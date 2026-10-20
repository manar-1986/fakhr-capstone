import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { LegalDocumentScreen } from "../components/screens/LegalDocumentScreen";
import { legalDrafts } from "../constants/legalDocuments";
const mockBack = jest.fn(), mockNavigate = jest.fn(), mockReplace = jest.fn();
let mockRTL = true, mockCanBack = true, mockFromRegistration = "1";
jest.mock("expo-router", () => ({ useRouter: () => ({ canGoBack: () => mockCanBack, back: mockBack, navigate: mockNavigate, replace: mockReplace }), useLocalSearchParams: () => ({ fromRegistration: mockFromRegistration }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
beforeEach(() => { jest.clearAllMocks(); mockCanBack = true; mockFromRegistration = "1"; });
test.each(["privacy", "terms"] as const)("%s renders all complete Arabic paragraphs and warnings in both locales", kind => {
  for (const rtl of [true, false]) {
    mockRTL = rtl;
    const ui = render(<LegalDocumentScreen kind={kind} />);
    expect(ui.getByTestId("legal-draft-notice")).toBeTruthy();
    expect(legalDrafts[kind]).toHaveLength(10);
    legalDrafts[kind].forEach(([title, paragraph], i) => {
      expect(ui.getByText(title)).toBeTruthy();
      expect(ui.getByTestId(`legal-content-${i}`)).toBeTruthy(); expect(ui.getByText(paragraph)).toBeTruthy();
    });
    fireEvent.press(ui.getByTestId("legal-back"));
    fireEvent.press(ui.getByTestId("legal-return-register"));
    expect(mockBack).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    ui.unmount();
  }
});
test("Settings entry returns to registration only when requested; direct back has a safe fallback", () => {
  mockFromRegistration = "";
  const ui = render(<LegalDocumentScreen kind="privacy" />);
  fireEvent.press(ui.getByTestId("legal-return-register"));
  expect(mockNavigate).toHaveBeenCalledWith("/(auth)/register");
  mockCanBack = false;
  fireEvent.press(ui.getByTestId("legal-back"));
  expect(mockReplace).toHaveBeenCalledWith("/(auth)/register");
});

