import { Platform } from "react-native";
import * as C from "expo-calendar";
import * as Store from "expo-secure-store";

export type PersonalEvent = { identity: string; appointmentId?: string; language?: "ar" | "en"; name: string; address?: string; phone?: string; mapUrl?: string; notes: string; start: Date; end?: Date };
export function localAppointmentTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [y, m, d] = date.split("-").map(Number); const [h, min] = time.split(":").map(Number);
  const value = new Date(y, m - 1, d, h, min);
  return value.getFullYear() === y && value.getMonth() === m - 1 && value.getDate() === d && value.getHours() === h && value.getMinutes() === min ? value : null;
}
const uid = (e: PersonalEvent) => `fakhr-${encodeURIComponent(e.appointmentId || e.identity + "-" + e.start.getTime())}@personal`;
const notes = (e: PersonalEvent) => [e.language === "ar" ? "تذكير شخصي — ليس حجزاً مؤكداً لدى مقدم الخدمة." : "Personal reminder — not a confirmed provider booking.", e.name, e.address, e.phone, e.mapUrl, e.notes, `Fakhr personal event: ${uid(e)}`].filter(Boolean).join("\n");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
// Fold by UTF-8 bytes, preserving Arabic characters and RFC 5545's 75-octet limit.
const fold = (line: string) => { let result = "", length = 0; for (const char of line) { const bytes = unescape(encodeURIComponent(char)).length; if (length + bytes > 74) { result += "\r\n "; length = 1; } result += char; length += bytes; } return result; };
export function personalEventICS(e: PersonalEvent) {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fakhr//Personal Calendar//EN", "BEGIN:VEVENT", `UID:${uid(e)}`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(e.start)}`, `DTEND:${stamp((e.end || new Date(e.start.getTime() + 30 * 60000)))}`, `SUMMARY:${escape(e.name)}`, `LOCATION:${escape(e.address || "")}`, `DESCRIPTION:${escape(notes(e))}`, ...(e.start.getTime() - Date.now() > 86400000 ? [1440] : []).flatMap(minutes => ["BEGIN:VALARM", "ACTION:DISPLAY", `TRIGGER:-PT${minutes}M`, `DESCRIPTION:${escape(e.name + " — " + (e.address || ""))}`, "END:VALARM"]), "END:VEVENT", "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}
export async function personalCalendars() {
  let permission = await C.getCalendarPermissionsAsync();
  if (permission.status !== "granted") permission = await C.requestCalendarPermissionsAsync();
  if (permission.status !== "granted") throw new Error("permission");
  return (await C.getCalendarsAsync(C.EntityTypes.EVENT)).filter(c => c.allowsModifications);
}
const inFlight = new Set<string>(); const exported = new Set<string>();
const storageKey = (key: string) => "fakhr.calendar." + Array.from(key).map(c => c.charCodeAt(0).toString(16).padStart(4,"0")).join("");
export async function savePersonalEvent(e: PersonalEvent, calendarId?: string): Promise<{ status: "created" | "updated" | "exported" | "duplicate"; reminders?: number; late?: boolean }> {
  if (!Number.isFinite(e.start.getTime()) || e.start.getTime() <= Date.now()) throw new Error("date");
  if(e.end&&(!Number.isFinite(e.end.getTime())||e.end<=e.start))throw new Error('date');
  const key = uid(e), late = e.start.getTime() - Date.now() <= 86400000;
  if (inFlight.has(key)) throw new Error("busy");
  inFlight.add(key);
  try {
    if (Platform.OS === "web") {
      const content = personalEventICS(e);
      const exportKey = JSON.stringify([key,e.name,e.start.toISOString(),e.address,e.phone,e.mapUrl,e.notes]);
      if (exported.has(exportKey)) return { status: "duplicate" };
      const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
      const a = document.createElement("a"); a.href = url; a.download = "fakhr-personal-appointment.ics"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); exported.add(exportKey);
      return { status: "exported", late };
    }
    if (Platform.OS !== "ios" && Platform.OS !== "android") throw new Error("unsupported");
    const calendars = await personalCalendars();
    const stored = await Store.getItemAsync(storageKey(key));
    if (stored === "removed") throw new Error("removed-event");
    const end = e.end || new Date(e.start.getTime() + 30 * 60000);
    const existing = await C.getEventsAsync(calendars.map(c => c.id), new Date(e.start.getTime() - 60000), end);
    const found = existing.find(event => event.notes?.includes("Fakhr personal event: " + key));
    let id = stored && stored !== "pending" ? stored : found?.id;
    // Never recreate an uncertain event: a failed write or inaccessible calendar requires review.
    if (stored === "pending" && !id) throw new Error("uncertain-event");
    const previous = id ? await C.getEventAsync(id) : undefined;
    const selected = calendars.find(c => c.id === (previous?.calendarId || calendarId));
    if (!selected) throw new Error("calendar");
    const supportsAlert = Platform.OS !== "android" || !selected.allowedReminders || selected.allowedReminders.includes(C.AlarmMethod.ALERT);
    const alarms = !late && supportsAlert ? [{ relativeOffset: -1440, ...(Platform.OS === "android" ? { method: C.AlarmMethod.ALERT } : {}) }] : [];
    const details = { title: e.name, startDate: e.start, endDate: end, location: e.address || e.mapUrl, notes: notes(e), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, alarms };
    const status = id ? "updated" : "created";
    if (id) await C.updateEventAsync(id, details);
    else {
      await Store.setItemAsync(storageKey(key), "pending");
      id = await C.createEventAsync(selected.id, details);
      if (!id) throw new Error("creation");
    }
    await Store.setItemAsync(storageKey(key), id);
    let reminders = 0;
    try { const saved = await C.getEventAsync(id); reminders = !late && saved.alarms?.filter(a => a.relativeOffset === -1440).length === 1 ? 1 : 0; } catch { /* Saved event; alert verification unavailable. */ }
    return { status, reminders, late };
  } finally { inFlight.delete(key); }
}

/** Explicitly confirmed removal only. Never searches for or removes unrelated events. */
export async function removeLinkedPersonalEvent(appointmentId: string): Promise<"removed" | "not-linked" | "unsupported"> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") return "unsupported";
  const key = "fakhr-" + encodeURIComponent(appointmentId) + "@personal";
  if (inFlight.has(key)) throw new Error("busy");
  inFlight.add(key);
  try {
    const id = await Store.getItemAsync(storageKey(key));
    if (!id) return "not-linked";
    if (id === "removed") return "removed";
    if (id === "pending") throw new Error("uncertain-event");
    const calendars = await personalCalendars();
    const event = await C.getEventAsync(id);
    if (!event.notes?.split(/\r?\n/).includes("Fakhr personal event: " + key) || event.recurrenceRule) throw new Error("event-mismatch");
    if (!calendars.some(c => c.id === event.calendarId)) throw new Error("calendar");
    await C.deleteEventAsync(id);
    // Retain a tombstone so repeated confirmation cannot recreate or delete a different event.
    await Store.setItemAsync(storageKey(key), "removed");
    return "removed";
  } finally { inFlight.delete(key); }
}
