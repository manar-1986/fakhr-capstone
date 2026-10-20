import React from "react";
import { beforeEach, expect, jest, test } from "@jest/globals";
import { fireEvent, render, within } from "@testing-library/react-native";
import Journey from "../app/(tabs)/plan/index";
let mockRTL = false;
let mockChildren: any[] = [];
let mockRecords: any[] = [];
let mockUser: any = { id: "test-parent" };
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser, loading: false }) }));
jest.mock("../api/children.api", () => ({ getChildren: jest.fn() }));
jest.mock("../utils/authRedirect", () => ({ ...jest.requireActual<any>("../utils/authRedirect"), setPendingAuthHref: jest.fn() }));
jest.mock("../utils/journeyStore", () => ({ ...jest.requireActual<any>("../utils/journeyStore"), readJourney: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: jest.fn() }), useQuery: ({ queryKey }: any) => ({ data: queryKey[0] === "plan-children" ? mockChildren : queryKey[0] === "journey" ? mockRecords : queryKey[0] === "currentCarePath" ? { carePath: null, tasks: [] } : [], isSuccess: true, refetch: mockRefresh }) }));
jest.mock("expo-router", () => ({ useFocusEffect: () => {}, useLocalSearchParams: () => ({}), useRouter: () => ({ push: mockPush }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: require("react-native").View, useSafeAreaInsets: () => ({ bottom: 0 }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, locale: mockRTL ? "ar" : "en", align: mockRTL ? "right" : "left", tabRow: mockRTL ? "row-reverse" : "row" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key === "tabs.plan" ? mockRTL ? "خطة طفلي" : "My Child Plan" : key }) }));
beforeEach(() => { mockRTL = false; mockChildren = []; mockRecords = []; mockUser = { id: "test-parent" }; mockPush.mockClear(); });
test("empty account shows no invented child or treatment progress",()=>{
 const screen=render(<Journey/>);expect(screen.getByText("No child profile yet")).toBeTruthy();
 fireEvent.press(screen.getByText("Manage children"));expect(mockPush).toHaveBeenCalledWith("/(tabs)/profile/manage-children");
 expect(screen.queryByText("Child A")).toBeNull();
});
test("switching children preserves child context and Files & Reports stays removed",()=>{
 mockChildren=[{id:"a",name:"Child A",age:6},{id:"b",name:"Child B",age:8}];
 const screen=render(<Journey/>);expect(within(screen.getByLabelText("Choose child")).getByText("Child A")).toBeTruthy();
 fireEvent.press(screen.getByLabelText("Choose child"));fireEvent.press(screen.getByText("Child B"));
 expect(within(screen.getByLabelText("Choose child")).getByText("Child B")).toBeTruthy();
 expect(screen.queryByText("Files & Reports")).toBeNull();
});
test("Arabic plan labels and manage-child navigation remain functional",()=>{
 mockRTL=true;const screen=render(<Journey/>);expect(screen.getByText("خطة طفلي")).toBeTruthy();
 fireEvent.press(screen.getByText("إدارة الأطفال"));expect(mockPush).toHaveBeenCalledWith("/(tabs)/profile/manage-children");
});
test("guest sees an explicitly non-personal preview and account guidance",()=>{
 mockUser=null;const screen=render(<Journey/>);expect(screen.getByText("Preview")).toBeTruthy();
 expect(screen.getByText(/My Account/)).toBeTruthy();expect(screen.queryByText("Child A")).toBeNull();
});
