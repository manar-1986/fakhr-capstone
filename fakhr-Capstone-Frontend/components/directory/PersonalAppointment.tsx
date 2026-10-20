import { controls } from "../../theme/controls";
import React, { useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";
import { typography } from "../../theme/typography";
import { localAppointmentTime, personalCalendars, savePersonalEvent } from "../../utils/personalAppointmentCalendar";


export default function PersonalAppointment(props: { identity: string; name: string; address?: string; phone?: string; mapUrl?: string; center?: boolean; nativeEditor?: boolean }) {
  const { isRTL, align, dir } = useI18nLayout(); const tr = (ar: string, en: string) => isRTL ? ar : en;
  const text = { textAlign: align, writingDirection: dir };
  const appointmentId = useRef<string | undefined>(undefined);
  const [open, setOpen] = useState(false); const [name, setName] = useState(props.name); const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [notes, setNotes] = useState("");
  const [calendars, setCalendars] = useState<{ id: string; title: string }[]>([]); const [calendar, setCalendar] = useState(""); const [busy, setBusy] = useState(false); const lock = useRef(false); const [message, setMessage] = useState("");
  const button = (label: string, action: () => void) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={action} style={s.button}><Text style={s.buttonText}>{label}</Text></Pressable>;
  const begin = () => { setName(props.name); setOpen(!open); };
  const choose = async () => { setBusy(true); try { const list = await personalCalendars(); setCalendars(list); setMessage(list.length ? "" : tr("لا يوجد تقويم قابل للكتابة على الجهاز.", "No writable device calendar is available.")); } catch { setMessage(tr("يلزم السماح بالوصول للتقويم من إعدادات الجهاز.", "Allow calendar access in device settings to continue.")); } finally { setBusy(false); } };
  const save = async () => {
    if (lock.current) return; const start = localAppointmentTime(date, time);
    if (!name.trim() || !start || start.getTime() <= Date.now()) { setMessage(tr("أدخل الاسم وتاريخاً ووقتاً مستقبليين صالحين.", "Enter a name and a valid future date and time.")); return; }
    if (Platform.OS !== "web" && !calendar) { setMessage(tr("اختر تقويماً أولاً.", "Choose a calendar first.")); return; }
    lock.current = true; setBusy(true); setMessage("");
    try { appointmentId.current ||= props.identity + "-" + start.getTime(); const result = await savePersonalEvent({ ...props, appointmentId: appointmentId.current, language: isRTL ? "ar" : "en", name: name.trim(), notes, start }, calendar);
      setMessage(result.status === "exported" ? tr("تم تنزيل ملف التقويم. افتحه لاستيراده؛ قد تؤدي إعادة الاستيراد إلى نسخة إضافية حسب تطبيق التقويم.", "Calendar file downloaded. Open it to import; importing again may create duplicates depending on your calendar app.") : result.status === "duplicate" ? tr("لم تُنشأ نسخة إضافية.", "No additional copy was created.") : tr("تم حفظ التذكير الشخصي في تقويمك.", "Personal reminder saved in your calendar.") + " " + (result.late ? tr("بقي أقل من 24 ساعة؛ لم نضف تنبيهاً في وقت مضى. يمكنك اختيار تنبيه مستقبلي داخل التقويم.", "Less than 24 hours remain; no past alert was added. You can choose a future alert in Calendar.") : result.reminders === 1 ? tr("التذكير مضبوط قبل الموعد بـ24 ساعة.", "Reminder set exactly 24 hours before the appointment.") : tr("تعذر تأكيد التنبيه. راجع إعدادات الحدث في التقويم.", "The alert could not be confirmed. Review the event in Calendar.")));

    } catch { setMessage(tr("تعذر إنشاء الموعد. تحقق من إذن التقويم ثم أعد المحاولة.", "Could not create the appointment. Check calendar permission and try again.")); }
    finally { lock.current = false; setBusy(false); }
  };
  const field = (label: string, value: string, change: (v: string) => void, multiline = false) => <View style={{ gap: 6 }}><Text style={[s.body, text]}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={change} multiline={multiline} style={[s.input, text]} /></View>;
  return <View style={{ gap: 12 }}>{button(tr("إضافة موعد للتقويم", "Add Appointment to Calendar"), () => void begin())}{(props.center || props.nativeEditor) && Platform.OS !== "web" && !!message && <Text accessibilityLiveRegion="polite" style={[s.body,text]}>{message}</Text>}{open && <>
    <Text style={[s.body, text]}>{tr("تذكير شخصي وليس حجزاً مؤكداً لدى مقدم الخدمة. في تقويمك فقط، ولا يُرسل إلى العيادة أو فخر. مدة الحدث 30 دقيقة ويمكن تعديلها في التقويم.", "A personal reminder, not a confirmed provider booking. A calendar entry only, shared with neither the clinic nor Fakhr. The event lasts 30 minutes and can be edited in your calendar.")}</Text>
    {field(props.center ? tr("اسم المركز", "Center name") : tr("اسم الطبيب أو العيادة", "Doctor or clinic name"), name, setName)}
    {field(tr("التاريخ (YYYY-MM-DD)", "Date (YYYY-MM-DD)"), date, setDate)}
    {field(tr("الوقت (HH:mm)", "Time (HH:mm)"), time, setTime)}
    <Text style={[s.body, text]}>{tr("توقيت الجهاز: ", "Device time zone: ")}{Intl.DateTimeFormat().resolvedOptions().timeZone}</Text>
    {field(tr("ملاحظات (اختياري)", "Notes (optional)"), notes, setNotes, true)}
    <Text style={[s.body, text]}>{tr("تذكير قبل الموعد بـ24 ساعة. إذا بقي أقل من 24 ساعة، لن يُضاف تنبيه في الماضي.", "One reminder exactly 24 hours before. No past alert is added for appointments less than 24 hours away.")}</Text>
    {Platform.OS !== "web" && <>{button(tr("اختيار تقويم الجهاز", "Choose device calendar"), () => void choose())}{calendars.map(c => <Pressable key={c.id} accessibilityRole="radio" accessibilityState={{ selected: calendar === c.id }} onPress={() => setCalendar(c.id)} style={s.input}><Text style={[s.body, text]}>{calendar === c.id ? "✓ " : ""}{c.title}</Text></Pressable>)}</>}
    {button(Platform.OS === "web" ? tr("تأكيد وتنزيل ملف التقويم", "Confirm & Download Calendar File") : tr("تأكيد وإضافة الموعد", "Confirm & Add Appointment"), () => void save())}
    {appointmentId.current && button(tr("تذكير جديد", "New reminder"), () => { appointmentId.current = undefined; setDate(""); setTime(""); setMessage(""); })}
    {!!message && <Text accessibilityLiveRegion="polite" style={[s.body, text]}>{message}</Text>}
  </>}</View>;
}
const s = StyleSheet.create({ button: { ...controls.button, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, buttonText: { color: "#0B093B", fontWeight: typography.weightMedium, fontSize: typography.button, textAlign: "center" }, body: { color: colors.textSecondary, fontSize: typography.helper, lineHeight: typography.helperLineHeight }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text } });
