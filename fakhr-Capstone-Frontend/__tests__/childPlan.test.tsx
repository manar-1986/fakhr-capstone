import React from "react";
import { fireEvent, render, waitFor, cleanup } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { addJourneyRecord } from "../utils/journeyStore";
import MyPlanScreen from "../app/(tabs)/plan";
import { getChildren } from "../api/children.api";
import { completeCarePathTask, skipCarePathTask, getCurrentCarePath, savePlanCheckin } from "../api/care-path.api";
import { dateKey, saturdayWeek, weekTasks, weeklyProgress } from "../utils/childPlanWeek";
let mockRTL = false;
const mockPush = jest.fn();
jest.mock("../api/children.api", () => ({ getChildren: jest.fn() }));
jest.mock("../api/care-path.api", () => ({ completeCarePathTask: jest.fn(), skipCarePathTask: jest.fn(), getCurrentCarePath: jest.fn(), savePlanCheckin: jest.fn() }));
jest.mock("../utils/journeyStore", () => ({ addJourneyRecord: jest.fn(async () => ({})), readJourney: async () => [], upcomingAppointments: () => [] }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: { id: "test-parent" } }) }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL, align: mockRTL ? "right" : "left", dir: mockRTL ? "rtl" : "ltr", tabRow: mockRTL ? "row-reverse" : "row" }) }));
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn(), setParams: jest.fn() }), useLocalSearchParams: () => ({}), useFocusEffect: (callback: () => void) => jest.requireActual("react").useEffect(callback, [callback]) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon", MaterialCommunityIcons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../components/journey/JourneyProducts", () => ({ JourneyProductDetails: () => null }));
jest.mock("../utils/authRedirect", () => ({ setPendingAuthHref: jest.fn() }));
const api = { getChildren: jest.mocked(getChildren), getPlan: jest.mocked(getCurrentCarePath), complete: jest.mocked(completeCarePathTask), skip: jest.mocked(skipCarePathTask), feedback: jest.mocked(savePlanCheckin) };
const today = dateKey(new Date());
const task = { id: "task-a", title: "Test task A", titleEn: "Test task A", titleAr: "نشاط اختبار", status: "pending" as const, dueDate: today, expectedOutcome: "Recorded goal" };
let client: QueryClient;
function screen() { client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }); const ui = render(<QueryClientProvider client={client}><MyPlanScreen /></QueryClientProvider>); return ui; }
beforeEach(() => {
  jest.clearAllMocks(); mockRTL = false;
  api.getChildren.mockResolvedValue([{ id: "child-a", parentId: "test-parent", name: "Test child A", age: 6 }, { id: "child-b", parentId: "test-parent", name: "Test child B" }]);
  api.getPlan.mockImplementation(async childId => ({ carePath: { id: `plan-${childId}`, childId }, tasks: childId === "child-a" ? [task, { ...task, id: "task-b", title: "Test task B", titleEn: "Test task B" }] : [] }));
  api.complete.mockResolvedValue(undefined); api.skip.mockResolvedValue(undefined); api.feedback.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); client?.clear(); });
test("weekly progress counts only this week's completed tasks and excludes skipped/undated", () => {
  const start = saturdayWeek(new Date()); const old = new Date(start); old.setDate(old.getDate() - 7);
  const tasks = weekTasks([task, { ...task, id: "done", status: "completed" }, { ...task, id: "skip", status: "skipped" }, { ...task, id: "old", dueDate: dateKey(old) }, { ...task, id: "undated", dueDate: undefined }], start);
  expect(tasks).toHaveLength(3); expect(weeklyProgress(tasks)).toEqual({ done: 1, total: 3, percent: 33 });
  expect(start.getDay()).toBe(6); expect(weeklyProgress([]).percent).toBe(0);
});
test.each([false, true])("empty child state, RTL=%s, never shows demo child or plan", async rtl => {
  mockRTL = rtl; api.getChildren.mockResolvedValue([]); const ui = screen();
  await waitFor(() => expect(ui.getByText(rtl ? "لا يوجد ملف طفل بعد" : "No child profile yet")).toBeTruthy());
  expect(ui.queryByText("75%")).toBeNull(); expect(ui.queryByText("محمد")).toBeNull(); expect(api.getPlan).not.toHaveBeenCalled();
  fireEvent.press(ui.getByText(rtl ? "إدارة الأطفال" : "Manage children")); expect(mockPush).toHaveBeenCalledWith("/(tabs)/profile/manage-children");
});
test.each([false, true])("real plan renders days, goals and progress, RTL=%s", async rtl => {
  mockRTL = rtl; const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week")); await waitFor(() => expect(ui.getByText(/Recorded goal/)).toBeTruthy());
  expect(ui.getByText(rtl ? "السبت" : "Saturday")).toBeTruthy(); expect(ui.getByText(rtl ? "الجمعة" : "Friday")).toBeTruthy();
  expect(ui.getByText("0%")).toBeTruthy();
  fireEvent.press(ui.getByLabelText(rtl ? "الأسبوع التالي" : "Next week"));
  expect(ui.getByText(rtl ? "لا توجد أنشطة مجدولة لهذا اليوم." : "No activities scheduled for this day.")).toBeTruthy();
  expect(api.complete).not.toHaveBeenCalled(); expect(api.feedback).not.toHaveBeenCalled();
});
test("Done/Skip use exact task IDs, persist notes and update confirmed progress", async () => {
  const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week")); await waitFor(() => expect(ui.getByText("Test task A")).toBeTruthy());
  fireEvent.changeText(ui.getAllByLabelText("Activity notes")[0], "Test-only note");
  fireEvent.press(ui.getAllByText("Done")[0]);
  await waitFor(() => expect(ui.getByText("50%")).toBeTruthy());
  expect(api.complete).toHaveBeenCalledWith("task-a", "Test-only note");
  fireEvent.press(ui.getByText("Skip")); await waitFor(() => expect(ui.getAllByText("Skipped").length).toBeGreaterThan(1));
  expect(api.skip).toHaveBeenCalledWith("task-b", undefined);
  expect(ui.getByText("50%")).toBeTruthy();
});
test("helpfulness and evaluation use registered check-in with correct child and week", async () => {
  const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week")); await waitFor(() => expect(ui.getByText("Test task A")).toBeTruthy());
  fireEvent.press(ui.getAllByText("Helpful")[0]); await waitFor(() => expect(api.feedback).toHaveBeenCalledWith(expect.objectContaining({ childId: "child-a", answers: { kind: "activity-feedback", taskId: "task-a", helpful: true } })));
  fireEvent.press(ui.getByText("Manageable")); fireEvent.press(ui.getByText("Save evaluation"));
  await waitFor(() => expect(ui.getByText("Evaluation saved")).toBeTruthy());
  expect(api.feedback).toHaveBeenLastCalledWith(expect.objectContaining({ childId: "child-a", difficulty: "ok", answers: { kind: "weekly-evaluation", weekStart: dateKey(saturdayWeek(new Date())) } }));
});
test("failed task request leaves progress unchanged and shows an error", async () => {
  api.complete.mockRejectedValueOnce(new Error("offline")); const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week")); await waitFor(() => expect(ui.getByText("Test task A")).toBeTruthy());
  fireEvent.press(ui.getAllByText("Done")[0]); await waitFor(() => expect(ui.getByText(/Could not confirm the save/)).toBeTruthy()); expect(ui.getByText("0%")).toBeTruthy();
});
test("child selection fetches only selected child's plan and clears previous tasks", async () => {
  const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week")); await waitFor(() => expect(ui.getByText("Test task A")).toBeTruthy());
  fireEvent.press(ui.getByText("Test child B")); await waitFor(() => expect(api.getPlan).toHaveBeenCalledWith("child-b"));
  expect(ui.queryByText("Test task A")).toBeNull();
});
test("missing plan stays empty rather than fabricating activities", async () => {
  api.getPlan.mockResolvedValue({ carePath: null, tasks: [] }); const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week"));
  await waitFor(() => expect(ui.getByText("There is no active plan for this child yet.")).toBeTruthy()); expect(ui.queryByText("Done")).toBeNull();
});

test.each([false, true])("all plan sections remain visible without a plan, RTL=%s", async rtl => {
  mockRTL = rtl;
  api.getPlan.mockResolvedValue({ carePath: null, tasks: [] });
  const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week"));
  await waitFor(() => expect(ui.getByText(rtl ? "لا توجد خطة نشطة لهذا الطفل حالياً." : "There is no active plan for this child yet.")).toBeTruthy());
  for (const [ar, en] of [["الأهداف الأسبوعية", "Weekly goals"], ["أنشطة اليوم", "Daily activities"], ["التقدم الأسبوعي", "Weekly progress"], ["التقييم الأسبوعي", "Weekly evaluation"], ["تعديل خطة الأسبوع القادم", "Next week's plan adjustment"]]) {
    expect(ui.getByText(rtl ? ar : en)).toBeTruthy();
  }
  expect(ui.getByTestId("plan-percentage")).toHaveTextContent("—");
  expect(ui.queryByText("0%")).toBeNull();
  const save = ui.getByRole("button", { name: rtl ? "حفظ التقييم" : "Save evaluation" });
  expect(save.props.accessibilityState.disabled).toBe(true);
  fireEvent.press(save);
  expect(api.feedback).not.toHaveBeenCalled();
});

test("dated calendar selects activities for the exact day and returns to current week", async () => {
  const start = saturdayWeek(new Date());
  api.getPlan.mockResolvedValue({ carePath: { id: "plan-child-a", childId: "child-a" }, tasks: [{ ...task, dueDate: dateKey(start) }] });
  const ui = screen(); await waitFor(() => expect(ui.getByTestId("plan-tab-week")).toBeTruthy()); fireEvent.press(ui.getByTestId("plan-tab-week"));
  await waitFor(() => expect(ui.getByText("Weekly goals")).toBeTruthy());
  fireEvent.press(ui.getByTestId("plan-day-0"));
  await waitFor(() => expect(ui.getByText("Test task A")).toBeTruthy());
  expect(ui.getByTestId("plan-day-0").props.accessibilityState.selected).toBe(true);
  fireEvent.press(ui.getByTestId("plan-day-1"));
  expect(ui.queryByText("Test task A")).toBeNull();
  fireEvent.press(ui.getByLabelText("Next week"));
  expect(ui.getByText("0%")).toBeTruthy();
  fireEvent.press(ui.getByText("This week"));
  fireEvent.press(ui.getByTestId("plan-day-0"));
  expect(ui.getByText("Test task A")).toBeTruthy();
  expect(api.complete).not.toHaveBeenCalled();
  expect(api.skip).not.toHaveBeenCalled();
});


test.each([false, true])("Today tabs, activity expansion and goal editing keep real IDs, RTL=%s", async rtl => {
  mockRTL = rtl; const ui = screen();
  await waitFor(() => expect(ui.getByTestId("plan-tab-today")).toBeTruthy());
  expect(ui.getByText(rtl ? "جدول اليوم" : "Today's schedule")).toBeTruthy();
  fireEvent.press(ui.getAllByLabelText(rtl ? "عرض النشاط" : "View activity")[0]);
  expect(ui.getAllByLabelText(rtl ? "ملاحظات النشاط" : "Activity notes").length).toBeGreaterThan(0);
  fireEvent.press(ui.getByLabelText(rtl ? "تعديل الأهداف" : "Edit goals"));
  expect(mockPush).toHaveBeenCalledWith({ pathname: "/(tabs)/profile/edit-child-profile", params: { id: "child-a" } });
  fireEvent.press(ui.getByTestId("plan-tab-progress"));
  expect(ui.getByTestId("plan-percentage")).toHaveTextContent("0%");
  expect(ui.queryByText(rtl ? "جدول اليوم" : "Today's schedule")).toBeNull();
});

test("daily note is saved only for selected account, child and date", async () => {
  const ui = screen(); await waitFor(() => expect(ui.getByLabelText("Add note")).toBeTruthy());
  fireEvent.press(ui.getByLabelText("Add note"));
  fireEvent.changeText(ui.getByLabelText("Daily note"), "Unit test note");
  fireEvent.press(ui.getByText("Save note"));
  await waitFor(() => expect(addJourneyRecord).toHaveBeenCalledWith("test-parent", expect.objectContaining({ childId: "child-a", dateKey: today, type: "note", titleEn: "Unit test note" })));
  fireEvent.press(ui.getByLabelText("Choose child")); fireEvent.press(ui.getByText("Test child B"));
  await waitFor(() => expect(api.getPlan).toHaveBeenCalledWith("child-b"));
  expect(ui.queryByText("Note saved")).toBeNull();
});
