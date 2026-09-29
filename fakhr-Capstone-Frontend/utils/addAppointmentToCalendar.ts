import { Alert, Linking, Platform, Share } from "react-native";

export type AppointmentCalendarPayload = {
  title: string;
  notes: string;
  location: string;
  start: Date;
  end: Date;
  duplicateKey: string;
  webSummary: string;
};

const addedKeys = new Set<string>();

function googleCalendarUrl(payload: AppointmentCalendarPayload) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    payload.title,
  )}&details=${encodeURIComponent(payload.notes)}&location=${encodeURIComponent(
    payload.location,
  )}&dates=${stamp(payload.start)}/${stamp(payload.end)}`;
}

async function getWritableCalendarId(
  Calendar: typeof import("expo-calendar"),
): Promise<string | null> {
  if (Platform.OS === "ios") {
    const def = await Calendar.getDefaultCalendarAsync();
    return def?.id ?? null;
  }
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((cal) => cal.allowsModifications);
  const primary = writable.find((cal) => cal.isPrimary);
  return (primary ?? writable[0])?.id ?? null;
}

export async function addAppointmentToDeviceCalendar(
  payload: AppointmentCalendarPayload,
  copy: {
    permissionDenied: string;
    alreadyAdded: string;
    added: string;
    error: string;
    ok: string;
  },
): Promise<"added" | "duplicate" | "denied" | "error" | "web"> {
  if (addedKeys.has(payload.duplicateKey)) {
    Alert.alert(copy.alreadyAdded);
    return "duplicate";
  }

  if (Platform.OS === "web") {
    const url = googleCalendarUrl(payload);
    try {
      await Linking.openURL(url);
      addedKeys.add(payload.duplicateKey);
      return "web";
    } catch {
      await Share.share({ message: payload.notes, title: payload.title }).catch(() => {});
      return "error";
    }
  }

  try {
    const Calendar = await import("expo-calendar");
    const current = await Calendar.getCalendarPermissionsAsync();
    let status = current.status;
    if (status !== "granted") {
      const requested = await Calendar.requestCalendarPermissionsAsync();
      status = requested.status;
    }
    if (status !== "granted") {
      Alert.alert(copy.permissionDenied);
      return "denied";
    }

    const calendarId = await getWritableCalendarId(Calendar);
    if (!calendarId) {
      Alert.alert(copy.error);
      return "error";
    }

    const windowStart = new Date(payload.start.getTime() - 60 * 1000);
    const windowEnd = new Date(payload.end.getTime() + 60 * 1000);
    const existing = await Calendar.getEventsAsync([calendarId], windowStart, windowEnd);
    const duplicate = existing.some(
      (event) =>
        event.title === payload.title &&
        Math.abs(new Date(event.startDate).getTime() - payload.start.getTime()) < 60 * 1000,
    );
    if (duplicate) {
      addedKeys.add(payload.duplicateKey);
      Alert.alert(copy.alreadyAdded);
      return "duplicate";
    }

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: payload.title,
      startDate: payload.start,
      endDate: payload.end,
      location: payload.location || undefined,
      notes: payload.notes,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    addedKeys.add(payload.duplicateKey);

    let opened = false;
    try {
      if (typeof Calendar.openEventInCalendarAsync === "function" && eventId) {
        await Calendar.openEventInCalendarAsync({ id: eventId });
        opened = true;
      }
    } catch {
      opened = false;
    }

    if (!opened) {
      Alert.alert(copy.added, undefined, [{ text: copy.ok }]);
    }
    return "added";
  } catch {
    Alert.alert(copy.error);
    return "error";
  }
}
