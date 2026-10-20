import InclusiveActivityPreview from './InclusiveActivityPreview';
import CalendarEventList from "./CalendarEventList";
import DailyCarePreview, {localCarePreview} from './DailyCarePreview';
import type { CalendarEvent } from "../../api/calendar.api";
import { categoryColors } from "../../theme/categories";
import { StatusBadge } from "../ui/StatusBadge";
import { controls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
import React, { useRef, useState } from "react";
import FamilySupport from "./FamilySupport";
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
  calendarEvents?: CalendarEvent[]; calendarError?: boolean; onCalendar?:()=>void;
  accountId?: string; childId?: string; preview?: boolean; period?: "today" | "week"; goals: string[]; tasks: CarePathTask[];
  allTasks: CarePathTask[]; records: JourneyRecord[]; loading: boolean; error: boolean;
  onRetry: () => void; onProgress: () => void; renderTask: (task: CarePathTask) => React.ReactNode;
};
type Icon = React.ComponentProps<typeof Ionicons>["name"];
const c = { ink: fakhrColors.text, blue: "#607DCB", muted: fakhrColors.textMuted, border: "#DFE6F6", soft: "#EBF1FD" };

export default function ChildPlanToday({ calendarEvents=[], calendarError=false, onCalendar, accountId, childId, preview = false, period = "today", goals, tasks: storedTasks, allTasks: storedAllTasks, records, loading, error, onRetry, onProgress, renderTask }: Props) {
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const needsColumns = fontScale > 1.4 ? 2 : 3;
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const local = (ar?: string, en?: string, legacy?: string) => (isRTL ? ar || en : en || ar) || legacy || "";
  const txt = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: tabRow };
  const [expanded, setExpanded] = useState<string>();
  const [nutrition, setNutrition] = useState(false);



  const [booking, setBooking] = useState<string>();
  // Read-only illustrative entries are never passed to a save API or assigned to a child.
  const examples: CarePathTask[] = [
    { id: "preview-pictures", title: "Picture learning", titleAr: "تعلّم بالصور", titleEn: "Picture learning", descriptionAr: "مثال توضيحي: استكشاف صور الأشياء اليومية معاً", descriptionEn: "Illustrative example: explore pictures of everyday objects together", expectedOutcomeAr: "استكشاف التواصل بالصور", expectedOutcomeEn: "Explore picture communication", status: "pending" },
    { id: "preview-turns", title: "Taking turns", titleAr: "لعب وتبادل الأدوار", titleEn: "Play and take turns", descriptionAr: "مثال توضيحي: لعبة بسيطة لتبادل الأدوار", descriptionEn: "Illustrative example: a simple turn-taking game", expectedOutcomeAr: "مشاركة نشاط ممتع", expectedOutcomeEn: "Share an enjoyable activity", status: "pending" },
    { id: "preview-story", title: "Story time", titleAr: "وقت القصة", titleEn: "Story time", descriptionAr: "مثال توضيحي: قراءة قصة مصورة معاً", descriptionEn: "Illustrative example: read a picture story together", status: "pending" },
  ];
  const tasks = preview ? examples : storedTasks;
  const allTasks = preview ? examples : storedAllTasks;
  const today = dateKey(new Date());
  const [accountNotice, setAccountNotice] = useState(false);
  const requirePersonalPlan = () => setAccountNotice(true);
  const editGoals = () => { if (!accountId) { requirePersonalPlan(); return; } router.push({ pathname: "/(tabs)/profile/edit-child-profile", params: childId ? { id: childId } : {} }); };
  // Only this child's dated appointments belong in this timeline. Account-level
  // appointments remain explicitly labelled in the existing weekly view.
  const appointments = (preview ? [] : records).filter(record => record.type === "appointment" && record.childId === childId && record.dateKey === today);
  const entries = [
    ...appointments.map(item => ({ id: `appointment:${item.id}`, title: local(item.titleAr, item.titleEn), time: item.time || "", appointment: item, task: undefined as CarePathTask | undefined })),
    ...tasks.map(task => ({ id: `task:${task.id}`, title: local(task.titleAr, task.titleEn, task.title), time: "", task, appointment: undefined as JourneyRecord | undefined })),
  ];
  const heading = (title: string, icon: Icon) => <View style={[s.row, row]}><Ionicons name={icon} size={22} color={c.blue} /><Text accessibilityRole="header" style={[s.heading, txt]}>{title}</Text></View>;
  const button = (title: string, onPress: () => void, primary = false) => <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={[s.button, primary && s.primary]}><Text style={[s.buttonText, primary && { color: "#FFFFFF" }]}>{title}</Text></Pressable>;
  return <>
    {accountNotice && <View accessibilityLiveRegion="polite" style={s.notice}><Text style={[s.body, txt]}>{text("يتطلب حفظ خطة شخصية حساباً وملف طفل. يمكنك متابعة التصفح أو زيارة حسابي.", "Saving a personal plan requires an account and a child profile. You can keep browsing or visit My Account.")}</Text>{button(text("حسابي", "My Account"), () => router.push("/(tabs)/profile"))}</View>}
    <View testID="plan-goal-card" style={s.card}>
      <View style={[s.row, row, { flexWrap: "nowrap" }]}>
        <View accessible={false} style={s.goalArt}><Ionicons name="locate-outline" size={44} color={c.blue} /><Ionicons name="sparkles" size={20} color="#9A8BDA" /></View>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}><Text style={[s.caption, txt]}>{text("الهدف الحالي:", "Current goal:")}</Text><Text style={[s.goal, txt]}>{preview ? text("استكشاف التواصل والأنشطة اليومية", "Explore communication and everyday activities") : goals[0] || text("لم تُسجّل أهداف لهذا الطفل بعد.", "No goals recorded for this child yet.")}</Text></View>
      </View>
      {button(text("تعديل الاحتياجات والأهداف", "Edit needs & goals"), editGoals)}
    </View>
    <DailyCarePreview key={childId || 'synthetic-demo-child'} childId={childId}/>
    <View style={s.card}>
      {heading(localCarePreview() ? text("أنشطة الخطة التعليمية", "Educational Plan activities") : period === "week" ? text("مثال ليوم ضمن الأسبوع", "Example day within a week") : text("جدول اليوم", "Today's schedule"), "calendar-outline")}
      {loading ? <ActivityIndicator color={c.blue} /> : error ? <><Text style={[s.body, txt]}>{text("تعذر تحميل بعض بيانات اليوم.", "Some of today's data could not be loaded.")}</Text>{button(text("إعادة المحاولة", "Retry"), onRetry)}</> : null}
      {!loading && !entries.length && !calendarEvents.length && <Text style={[s.empty, txt]}>{text("لا توجد أنشطة أو مواعيد مرتبطة بهذا الطفل اليوم. تظهر هنا عند تسجيلها.", "No activities or appointments are linked to this child today. They will appear here when recorded.")}</Text>}
      {!preview && calendarError && <Text style={[s.body, txt]}>{text("تعذر تحميل أحداث التقويم.", "Calendar events could not be loaded.")}</Text>}
      {!preview && <CalendarEventList events={calendarEvents} onSelect={onCalendar ? () => onCalendar() : undefined} />}
      {entries.map(entry => <View key={entry.id} style={s.timelineItem}>
        <Pressable accessibilityRole="button" accessibilityLabel={entry.task ? text("عرض النشاط", "View activity") : text("عرض التذكير", "View reminder")} onPress={() => entry.task ? setExpanded(expanded === entry.id ? undefined : entry.id) : setBooking(booking === entry.id ? undefined : entry.id)} style={[s.row, row, { flexWrap: "nowrap" }]}>
          <View style={[s.timelineIcon, { backgroundColor: entry.task ? categoryColors.activities.background : categoryColors.sessions.background }]}><Ionicons name={entry.task ? "extension-puzzle-outline" : "calendar-outline"} size={27} color={entry.task ? categoryColors.activities.foreground : categoryColors.sessions.foreground} /></View>
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <Text style={[s.time, txt]}>{preview ? text("مثال", "Example") : entry.time || text("بدون وقت محدد", "Time not specified")}</Text>
            <Text style={[s.label, txt]}>{entry.title}</Text>
            {!preview && entry.task?.status === "pending" && <StatusBadge status="suggested" />}
            <Text style={[s.body, txt]}>{entry.appointment ? local(entry.appointment.centerAr, entry.appointment.centerEn) : local(entry.task?.descriptionAr, entry.task?.descriptionEn, entry.task?.description)}</Text>
          </View>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={c.blue} />
        </Pressable>
        {entry.task && expanded === entry.id && (preview ? <Text style={[s.body, txt]}>{text("نشاط توضيحي غير مخصص لطفل؛ لا يتم تسجيله أو احتسابه كتقدم.", "An illustrative activity, not assigned to a child. It is not recorded or counted as progress.")}</Text> : renderTask(entry.task))}
        {entry.appointment && booking === entry.id && <View style={s.notice}><Text style={[s.body, txt]}>{entry.appointment.dateKey} {entry.appointment.time}</Text><Text style={[s.body, txt]}>{local(entry.appointment.locationAr, entry.appointment.locationEn) || text("الموقع غير مسجل", "Location not recorded")}</Text><Text style={[s.caption, txt]}>{text("تذكير شخصي محفوظ على هذا الجهاز، وليس حجزاً مؤكداً لدى مقدم الخدمة.", "A personal reminder saved on this device, not a confirmed provider booking.")}</Text></View>}
      </View>)}
    </View>
    <View style={s.card}>
      {heading(text("احتياجات الخطة", "Plan needs"), "grid-outline")}
      <View style={[s.needs, row]}>{([
        ["الجلسات", "Sessions", "people-outline", categoryColors.sessions, () => router.push("/(tabs)/directory/professionals?tab=centers")],
        ["التعليم", "Education", "book-outline", categoryColors.education, () => router.push("/(tabs)/directory/schools")],
        ["الأنشطة", "Activities", "extension-puzzle-outline", categoryColors.activities, () => router.push("/(tabs)/discover")],
        ["التغذية", "Nutrition", "restaurant-outline", categoryColors.nutrition, () => setNutrition(value => !value)],
        ["المنتجات", "Products", "cart-outline", categoryColors.products, () => router.push("/(tabs)/products")],
        ["التقدم", "Progress", "stats-chart-outline", categoryColors.followUp, onProgress],
      ] as const).map(([ar, en, icon, categoryColor, action]) => <Pressable key={en} testID={`plan-need-${en}`} accessibilityRole="button" accessibilityLabel={text(ar, en)} onPress={action} style={[s.need, { backgroundColor: categoryColor.background, flexBasis: needsColumns === 2 ? "46%" : "30%" }]}><Ionicons name={icon} size={27} color={categoryColor.foreground} /><Text style={[s.needLabel, { color: c.ink }]}>{text(ar, en)}</Text></Pressable>)}</View>
      {nutrition && <Text accessibilityLiveRegion="polite" style={[s.body, txt]}>{text("لا توجد خطة تغذية مرتبطة بملف الطفل. لا تُقترح وجبات أو مواعيد طعام دون بيانات موثقة؛ راجع المختص.", "No nutrition plan is linked to this child. Meals and meal times are not suggested without verified information; consult their specialist.")}</Text>}
    </View>
    <FamilySupport key={`${accountId ?? "guest"}:${childId ?? "none"}`} />
    {localCarePreview() && __DEV__ ? <InclusiveActivityPreview accountId={accountId} childId={childId}/> : <View style={s.card}>{heading(text("نشاط مقترح لطفلك", "Suggested Activity for Your Child"), "bulb-outline")}<Text style={[s.empty,txt]}>{text("لا يتوفر نشاط معتمد مناسب يمكن التحقق منه من أهداف الطفل وعمره وتفضيلاته.", "No suitable approved activity can be verified against this child’s goals, age and preferences.")}</Text></View>}
    <View style={s.card}>
      {heading(text("كيف كان يومه؟", "How was their day?"), "create-outline")}
      <Text style={[s.body, txt]}>{text("أضف ملاحظة عن سلوكه، تواصله أو أي ملاحظة مهمة.", "Add a note about behaviour, communication or anything important.")}</Text>
      {accountId && childId && !preview ? <DailyNotes key={`${accountId}:${childId}:${today}`} accountId={accountId} childId={childId} date={today} /> : button(text("أضف ملاحظاتك", "Add Notes"), accountId ? editGoals : requirePersonalPlan, true)}
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
    <Pressable accessibilityRole="button" accessibilityLabel={open ? text("حفظ الملاحظة", "Save note") : text("أضف ملاحظاتك", "Add Notes")} accessibilityState={{ disabled: busy || (open && !draft.trim()) }} disabled={busy || (open && !draft.trim())} onPress={() => open ? void save() : setOpen(true)} style={[s.button, s.primary]}><Text style={[s.buttonText, { color: "#FFFFFF" }]}>{open ? text("حفظ الملاحظة", "Save note") : text("أضف ملاحظاتك", "Add Notes")}</Text></Pressable>
    {busy && <ActivityIndicator color={c.blue} />}{!!message && <Text accessibilityLiveRegion="polite" style={[s.body, txt]}>{message}</Text>}
  </>;
}

const s = StyleSheet.create({
  card: { ...controls.card, padding: 12, borderRadius: 18, borderColor: c.border, gap: 10 },
  goalArt: { width: 76, minHeight: 88, borderRadius: 20, backgroundColor: "#EAF1FF", alignItems: "center", justifyContent: "center", gap: 4 },
  row: { alignItems: "center", gap: 10, flexWrap: "wrap" }, heading: { fontSize: typography.section, color: c.ink, fontWeight: typography.weightSemibold, flexShrink: 1 },
  goal: { fontSize: typography.cardTitle, color: c.ink, fontWeight: typography.weightMedium }, label: { fontSize: typography.cardTitle, color: c.ink, fontWeight: typography.weightMedium },
  body: { fontSize: typography.body, color: c.muted }, caption: { fontSize: typography.helper, color: c.muted }, empty: { fontSize: typography.body, color: c.muted, paddingVertical: 12 },
  button: { ...controls.button, backgroundColor: c.soft, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 8, justifyContent: "center", alignItems: "center" },
  primary: { backgroundColor: c.blue, borderColor: c.blue }, buttonText: { fontSize: typography.button, color: "#0B093B", fontWeight: typography.weightMedium, textAlign: "center" },
  timelineItem: { gap: 8, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 10, backgroundColor: "#FAFCFF" }, timelineIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" },
  time: { fontSize: typography.helper, color: "#0B093B" }, needs: { flexWrap: "wrap", gap: 6 }, need: { flexBasis: "30%", flexGrow: 1, minHeight: 82, borderRadius: 14, padding: 7, alignItems: "center", justifyContent: "center", gap: 6 }, needLabel: { fontSize: typography.helper, color: c.ink, textAlign: "center" },
  illustration: { width: 128, minHeight: 108, borderRadius: 16, backgroundColor: fakhrColors.backgroundWash, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pictureCard: { width: 38, height: 54, borderWidth: 1, borderColor: fakhrColors.border, borderRadius: 7, backgroundColor: "white", alignItems: "center", justifyContent: "center" },
  placeholder: { width: 88, minHeight: 90, borderRadius: 16, backgroundColor: c.soft, alignItems: "center", justifyContent: "center", gap: 8 }, notice: { padding: 10, borderRadius: 12, backgroundColor: c.soft, gap: 6 },
  input: { minHeight: 90, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, fontSize: typography.body, color: c.ink, textAlignVertical: "top" },
});
