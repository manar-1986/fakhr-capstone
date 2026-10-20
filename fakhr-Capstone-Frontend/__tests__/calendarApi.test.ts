import api from "../api/axios";
import { listCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, eventInput, CalendarEvent } from "../api/calendar.api";

jest.mock("../api/axios", () => ({__esModule: true, default: {get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn()}}));

test("calendar adapter uses Fakhr's unwrapped responses and retains revision and retry identity", async () => {
  const event: CalendarEvent = {id: "event", childId: "child", title: "Activity", date: "2026-10-12", startTime: "09:00", timezone: "Asia/Kuwait", category: "home", notes: "", status: "scheduled", revision: 2};
  jest.mocked(api.get).mockResolvedValue({events: [event]});
  jest.mocked(api.post).mockResolvedValue({event});
  jest.mocked(api.put).mockResolvedValue({event});
  expect(await listCalendarEvents("child", event.date, event.date)).toEqual([event]);
  expect(api.get).toHaveBeenCalledWith("/calendar-events", {params: {childId: "child", from: event.date, to: event.date}});
  const input = eventInput(event);
  expect(input).not.toHaveProperty("id");
  expect(input).not.toHaveProperty("childId");
  expect(await createCalendarEvent({...input, childId: "child", requestId: "stable-retry-key"})).toEqual(event);
  expect(api.post).toHaveBeenCalledWith("/calendar-events", {...input, childId: "child", requestId: "stable-retry-key"});
  expect(await updateCalendarEvent("event", {...input, revision: 2})).toEqual(event);
  expect(api.put).toHaveBeenCalledWith("/calendar-events/event", {...input, revision: 2});
  await deleteCalendarEvent("event", 2);
  expect(api.delete).toHaveBeenCalledWith("/calendar-events/event", {params: {revision: 2}});
});
