import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, TextInput } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { CarePathTask } from "../../api/care-path.api";
import { addJourneyRecord, readJourney, JourneyRecord } from "../../utils/journeyStore";
import { dateKey } from "../../utils/childPlanWeek";

type Props = {
  accountId: string; childId: string; goals: string[]; tasks: CarePathTask[];
  allTasks: CarePathTask[]; records: JourneyRecord[]; loading: boolean; error: boolean;
  onRetry: () => void; onProgress: () => void; renderTask: (task: CarePathTask) => React.ReactNode;
};
type Icon = React.ComponentProps<typeof Ionicons>["name"];
const c = { ink: "#152467", blue: "#6E7CAF", muted: "#7B83A1", border: "#E9ECF6", soft: "#F4F5FC" };

export default function ChildPlanToday({ accountId, childId, goals, tasks, allTasks, records, loading, error, onRetry, onProgress, renderTask }: Props) {
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const needsColumns = width >= 380 && fontScale <= 1.2 ? 6 : 3;
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const local = (ar?: string, en?: string, legacy?: string) => (isRTL ? ar || en : en || ar) || legacy || "";
  const txt = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: tabRow };
  const [expanded, setExpanded] = useState<string>();
  const [nutrition, setNutrition] = useState(false);
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [choosingRecommendation, setChoosingRecommendation] = useState(false);
  const [chosen, setChosen] = useState<string>();
  const [booking, setBooking] = useState<string>();
  const today = dateKey(new Date());
  const editGoals = () => router.push({ pathname: "/(tabs)/profile/edit-child-profile", params: { id: childId } });
  // Only this child's dated appointments belong in this timeline. Account-level
  // appointments remain explicitly labelled in the existing weekly view.
  const appointments = records.filter(record => record.type === "appointment" && record.childId === childId && record.dateKey === today);
  const candidates = allTasks.filter(task => task.status === "pending" && !!local(task.expectedOutcomeAr, task.expectedOutcomeEn, task.expectedOutcome));
  const recommendation = candidates.find(task => task.id === chosen) ?? candidates[0];
  const entries = [
    ...appointments.map(item => ({ id: `appointment:${item.id}`, title: local(item.titleAr, item.titleEn), time: item.time || "", appointment: item, task: undefined as CarePathTask | undefined })),
    ...tasks.map(task => ({ id: `task:${task.id}`, title: local(task.titleAr, task.titleEn, task.title), time: "", task, appointment: undefined as JourneyRecord | undefined })),
  ];
  const heading = (title: string, icon: Icon) => <View style={[s.row, row]}><Ionicons name={icon} size={22} color={c.blue} /><Text accessibilityRole="header" style={[s.heading, txt]}>{title}</Text></View>;
  const button = (title: string, onPress: () => void, primary = false) => <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={[s.button, primary && s.primary]}><Text style={[s.buttonText, primary && { color: "white" }]}>{title}</Text></Pressable>;
  return <>
    <View style={s.card}>
      {heading(text("الهدف الحالي", "Current goal"), "locate-outline")}
      <Text style={[s.goal, txt]}>{goals[0] || text("لم تُسجّل أهداف لهذا الطفل بعد.", "No goals recorded for this child yet.")}</Text>
      {button(text("تعديل الأهداف", "Edit goals"), editGoals)}
    </View>
    <View style={s.card}>
      {heading(text("جدول اليوم", "Today's schedule"), "calendar-outline")}
      {loading ? <ActivityIndicator color={c.blue} /> : error ? <><Text style={[s.body, txt]}>{text("تعذر تحميل بعض بيانات اليوم.", "Some of today's data could not be loaded.")}</Text>{button(text("إعادة المحاولة", "Retry"), onRetry)}</> : null}
      {!loading && !entries.length && <Text style={[s.empty, txt]}>{text("لا توجد أنشطة أو مواعيد مرتبطة بهذا الطفل اليوم. تظهر هنا عند تسجيلها.", "No activities or appointments are linked to this child today. They will appear here when recorded.")}</Text>}
      {entries.map(entry => <View key={entry.id} style={[s.timelineItem, { borderRightWidth: isRTL ? 2 : 0, borderLeftWidth: isRTL ? 0 : 2, borderRightColor: c.border, borderLeftColor: c.border, paddingHorizontal: 10 }]}>
        <View style={[s.row, row, { alignItems: "flex-start" }]}>
          <View style={s.timelineIcon}><Ionicons name={entry.task ? "extension-puzzle-outline" : "chatbubble-ellipses-outline"} size={24} color={c.blue} /></View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[s.time, txt]}>{entry.time || text("بدون وقت محدد", "Time not specified")}</Text>
            <Text style={[s.label, txt]}>{entry.title}</Text>
            <Text style={[s.body, txt]}>{entry.appointment ? local(entry.appointment.centerAr, entry.appointment.centerEn) : local(entry.task?.descriptionAr, entry.task?.descriptionEn, entry.task?.description)}</Text>
            {entry.task ? button(text("عرض النشاط", "View activity"), () => setExpanded(expanded === entry.id ? undefined : entry.id)) : button(text("عرض الحجز", "View booking"), () => setBooking(booking === entry.id ? undefined : entry.id))}
          </View>
        </View>
        {entry.task && expanded === entry.id && renderTask(entry.task)}
        {entry.appointment && booking === entry.id && <View style={s.notice}><Text style={[s.body, txt]}>{entry.appointment.dateKey} {entry.appointment.time}</Text><Text style={[s.body, txt]}>{local(entry.appointment.locationAr, entry.appointment.locationEn) || text("الموقع غير مسجل", "Location not recorded")}</Text><Text style={[s.caption, txt]}>{text("تفاصيل محفوظة على هذا الجهاز؛ يرجى تأكيد الموعد مع مقدم الخدمة.", "Details saved on this device; confirm the appointment with the provider.")}</Text></View>}
      </View>)}
    </View>
    <View style={s.card}>
      {heading(text("احتياجات الخطة", "Plan needs"), "grid-outline")}
      <View style={[s.needs, row]}>{([
        ["الجلسات", "Sessions", "people-outline", "#F1EDFD", () => router.push("/(tabs)/directory/professionals")],
        ["التعليم", "Education", "book-outline", "#EDF3FF", () => router.push("/(tabs)/directory/schools")],
        ["الأنشطة", "Activities", "extension-puzzle-outline", "#EEF8F2", () => router.push("/(tabs)/discover")],
        ["التغذية", "Nutrition", "restaurant-outline", "#FCF3EC", () => setNutrition(value => !value)],
        ["المنتجات", "Products", "cart-outline", "#F1EDFD", () => router.push("/(tabs)/products")],
        ["المتابعة", "Follow-up", "document-text-outline", "#F0F2F9", onProgress],
      ] as const).map(([ar, en, icon, backgroundColor, action]) => <Pressable key={en} accessibilityRole="button" accessibilityLabel={text(ar, en)} onPress={action} style={[s.need, { backgroundColor, flexBasis: needsColumns === 6 ? "14%" : "30%" }]}><Ionicons name={icon} size={27} color={c.blue} /><Text style={s.needLabel}>{text(ar, en)}</Text></Pressable>)}</View>
      {nutrition && <Text accessibilityLiveRegion="polite" style={[s.body, txt]}>{text("لا توجد خطة تغذية مرتبطة بملف الطفل. لا تُقترح وجبات أو مواعيد طعام دون بيانات موثقة؛ راجع المختص.", "No nutrition plan is linked to this child. Meals and meal times are not suggested without verified information; consult their specialist.")}</Text>}
    </View>
    <View style={s.card}>
      {heading(text("اقتراح يناسب هدفه", "An activity for their goal"), "bulb-outline")}
      {recommendation ? <>
        <View style={[s.row, row]}><View style={{ flex: 1, gap: 6 }}><Text style={[s.label, txt]}>{local(recommendation.titleAr, recommendation.titleEn, recommendation.title)}</Text><Text style={[s.body, txt]}>{text("الهدف المسجل في الخطة: ", "Recorded plan outcome: ")}{local(recommendation.expectedOutcomeAr, recommendation.expectedOutcomeEn, recommendation.expectedOutcome)}</Text></View><View style={s.placeholder}><Ionicons name="images-outline" size={38} color={c.blue} /><Text style={s.caption}>{text("لا توجد صورة", "No image")}</Text></View></View>
        <View style={[s.row, row]}>{button(text("عرض التفاصيل", "View details"), () => setRecommendationOpen(value => !value), true)}{button(text("تعديل", "Change"), () => setChoosingRecommendation(value => !value))}</View>
        {choosingRecommendation && <><Text style={[s.caption, txt]}>{text("اختر نشاطاً من الخطة الحالية؛ لا يغيّر ذلك أهداف الخطة.", "Choose from the current plan; this does not alter its goals.")}</Text>{candidates.map(task => <React.Fragment key={task.id}>{button(local(task.titleAr, task.titleEn, task.title), () => { setChosen(task.id); setChoosingRecommendation(false); setRecommendationOpen(false); })}</React.Fragment>)}</>}
        {recommendationOpen && renderTask(recommendation)}
      </> : <Text style={[s.empty, txt]}>{text("لا توجد أنشطة مرتبطة بهدف مسجل في الخطة حالياً.", "No activities with recorded plan outcomes are available yet.")}</Text>}
    </View>
    <View style={s.card}>
      {heading(text("كيف كان يومه؟", "How was their day?"), "create-outline")}
      <Text style={[s.body, txt]}>{text("أضف ملاحظة عن سلوكه، تواصله أو أي ملاحظة مهمة.", "Add a note about behaviour, communication or anything important.")}</Text>
      <DailyNotes key={`${accountId}:${childId}:${today}`} accountId={accountId} childId={childId} date={today} />
      <Text style={[s.caption, txt]}>{text("لا تؤكد الملاحظات حجزاً ولا تعدّل الخطة تلقائياً.", "Notes do not confirm bookings or automatically adjust the plan.")}</Text>
    </View>
  </>;
}

function DailyNotes({ accountId, childId, date }: { accountId: string; childId: string; date: string }) {
  const { isRTL, align, dir } = useI18nLayout();
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  const client = useQueryClient();
  const notes = useQuery({ queryKey: ["plan-daily-notes", accountId, childId, date], queryFn: () => readJourney(accountId) });
  const [open, setOpen] = useState(false); const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const lock = useRef(false);
  async function save() {
    if (!draft.trim() || lock.current) return;
    lock.current = true; setBusy(true); setMessage("");
    try {
      await addJourneyRecord(accountId, { type: "note", action: "note", childId, dateKey: date, titleAr: draft.trim(), titleEn: draft.trim() });
      setDraft(""); setOpen(false); setMessage(text("تم حفظ الملاحظة", "Note saved"));
      await client.invalidateQueries({ queryKey: ["plan-daily-notes", accountId, childId, date] });
    } catch { setMessage(text("تعذر حفظ الملاحظة. حاول مرة أخرى.", "Could not save the note. Please retry.")); }
    finally { lock.current = false; setBusy(false); }
  }
  return <>
    <Text style={[s.caption, txt]}>{text("ملاحظات خاصة بهذا الطفل والتاريخ، محفوظة في حسابك على هذا الجهاز.", "Notes for this child and date, saved for your account on this device.")}</Text>
    {notes.isError && <Pressable accessibilityRole="button" onPress={() => { void notes.refetch(); }}><Text style={[s.body, txt]}>{text("تعذر قراءة الملاحظات — إعادة المحاولة", "Could not load notes — retry")}</Text></Pressable>}
    {notes.data?.filter(note => note.type === "note" && note.childId === childId && note.dateKey === date).map(note => <Text key={note.id} style={[s.notice, s.body, txt]}>{isRTL ? note.titleAr : note.titleEn}</Text>)}
    {open && <TextInput accessibilityLabel={text("ملاحظة اليوم", "Daily note")} multiline maxLength={1000} editable={!busy} value={draft} onChangeText={setDraft} style={[s.input, txt]} />}
    <Pressable accessibilityRole="button" accessibilityLabel={open ? text("حفظ الملاحظة", "Save note") : text("إضافة ملاحظة", "Add note")} accessibilityState={{ disabled: busy || (open && !draft.trim()) }} disabled={busy || (open && !draft.trim())} onPress={() => open ? void save() : setOpen(true)} style={[s.button, s.primary]}><Text style={[s.buttonText, { color: "white" }]}>{open ? text("حفظ الملاحظة", "Save note") : text("إضافة ملاحظة", "Add note")}</Text></Pressable>
    {busy && <ActivityIndicator color={c.blue} />}{!!message && <Text accessibilityLiveRegion="polite" style={[s.body, txt]}>{message}</Text>}
  </>;
}

const s = StyleSheet.create({
  card: { backgroundColor: "white", borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 14, gap: 12 },
  row: { alignItems: "center", gap: 10, flexWrap: "wrap" }, heading: { fontSize: 18, color: c.ink, fontWeight: "700", flexShrink: 1 },
  goal: { fontSize: 16, color: c.ink, fontWeight: "600" }, label: { fontSize: 16, color: c.ink, fontWeight: "600" },
  body: { fontSize: 14, color: c.muted }, caption: { fontSize: 12, color: c.muted }, empty: { fontSize: 14, color: c.muted, paddingVertical: 12 },
  button: { minHeight: 44, borderRadius: 12, backgroundColor: c.soft, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center", alignItems: "center" },
  primary: { backgroundColor: c.blue, borderColor: c.blue }, buttonText: { fontSize: 14, color: c.blue, fontWeight: "600", textAlign: "center" },
  timelineItem: { gap: 12, borderTopWidth: 1, borderTopColor: c.border, paddingVertical: 12 }, timelineIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" },
  time: { fontSize: 12, color: c.blue }, needs: { flexWrap: "wrap", gap: 6 }, need: { flexBasis: "30%", flexGrow: 1, minHeight: 76, borderRadius: 14, padding: 4, alignItems: "center", justifyContent: "center", gap: 6 }, needLabel: { fontSize: 12, color: c.ink, textAlign: "center" },
  placeholder: { width: 88, minHeight: 90, borderRadius: 16, backgroundColor: c.soft, alignItems: "center", justifyContent: "center", gap: 8 }, notice: { padding: 10, borderRadius: 12, backgroundColor: c.soft, gap: 6 },
  input: { minHeight: 90, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, fontSize: 14, color: c.ink, textAlignVertical: "top" },
});
