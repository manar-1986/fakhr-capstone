import {dailyCareEnabled} from '../../../api/dailyCare.api';
import CalendarEventList from "../../../components/plan/CalendarEventList";
import { useCalendarEvents } from "../../../hooks/useCalendarEvents";
import { categoryColors } from "../../../theme/categories";
import { controls as sharedControls } from "../../../theme/controls";
import { colors as fakhrColors } from "../../../theme/colors";
import ChildPlanToday from "../../../components/plan/ChildPlanToday";
import DailyCarePreview, {DailyCareProvider,localCarePreview} from "../../../components/plan/DailyCarePreview";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Modal, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { useAuth } from "../../../context/AuthContext";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { getChildren, type Child } from "../../../api/children.api";
import { completeCarePathTask, skipCarePathTask, getCurrentCarePath, savePlanCheckin, type CarePathTask, type CurrentCarePathResult } from "../../../api/care-path.api";
import { ageFromDate, parseStoredDate, asIdList, FOCUS_AREAS, SUPPORT_GOALS } from "../../../constants/childProfileOptions";
import { dateKey, saturdayWeek, taskDate, weekTasks, weeklyProgress } from "../../../utils/childPlanWeek";
import { readJourney, upcomingAppointments } from "../../../utils/journeyStore";
import { HOME_PRODUCTS } from "../../../constants/homeProducts";
import { JourneyProductDetails } from "../../../components/journey/JourneyProducts";

const DAYS = [["السبت", "Saturday"], ["الأحد", "Sunday"], ["الاثنين", "Monday"], ["الثلاثاء", "Tuesday"], ["الأربعاء", "Wednesday"], ["الخميس", "Thursday"], ["الجمعة", "Friday"]];
const colors = { bg: "#FFFFFF", title: fakhrColors.text, primary: "#607DCB", soft: "#EBF1FD", border: "#DFE6F6", body: fakhrColors.textSecondary };
type Icon = React.ComponentProps<typeof Ionicons>["name"];
function Section({ title, icon, children }: React.PropsWithChildren<{ title: string; icon: Icon }>) {
  const { tabRow, align } = useI18nLayout();
  return <View style={s.card}><View style={[s.row, { flexDirection: tabRow }]}><View style={s.sectionIcon}><Ionicons name={icon} color={colors.primary} size={22} /></View><Text accessibilityRole="header" style={[s.heading, { textAlign: align }]}>{title}</Text></View>{children}</View>;
}
function Button({ title, onPress, disabled = false, selected = false, icon }: { title: string; onPress: () => void; disabled?: boolean; selected?: boolean; icon?: Icon }) {
  const { tabRow } = useI18nLayout();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled, selected }} disabled={disabled} onPress={onPress} style={[s.button, { flexDirection: tabRow, gap: 8 }, selected && s.selected, disabled && { opacity: .5 }]}>{icon && <Ionicons name={icon} size={19} color={selected ? "white" : colors.primary} />}<Text style={[s.buttonText, selected && { color: "#FFFFFF" }]}>{title}</Text></Pressable>;
}

export default function MyPlanScreen() {
  const { user, loading } = useAuth();
  const { isRTL } = useI18nLayout();
  if (loading) return <SafeAreaView style={s.screen}><ActivityIndicator color={colors.primary} /></SafeAreaView>;
  // Remount private state on account changes; queries are also scoped to account and child.
  return <DailyCareProvider key={user?.id ?? "guest"}><PlanContent key={`${user?.id ?? "guest"}:${isRTL}`} accountId={user?.id} /></DailyCareProvider>;
}
function PlanContent({ accountId }: { accountId?: string }) {
  const router = useRouter(); const client = useQueryClient(); const { t } = useTranslation();
  const { productId,childId:initialChild,date:initialDate } = useLocalSearchParams<{ productId?: string;childId?:string;date?:string }>();
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  const { width, fontScale } = useWindowDimensions();
  const compactProfile = width < 360 || fontScale > 1.25;
  const [view, setView] = useState<"today" | "week" | "progress">("today");
  const [selectingChild, setSelectingChild] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [childId, setChildId] = useState<string|undefined>(initialChild);
  const [weekStart, setWeekStart] = useState(() => saturdayWeek(initialDate ? new Date(initialDate+"T12:00:00") : new Date()));
  const [day, setDay] = useState(((initialDate ? new Date(initialDate+"T12:00:00") : new Date()).getDay() + 1) % 7);
  const children = useQuery({ queryKey: ["plan-children", accountId], queryFn: getChildren, enabled: !!accountId });
  const child = children.data?.find(item => item.id === childId) ?? children.data?.[0];
  const calendarEnd = new Date(weekStart); calendarEnd.setDate(calendarEnd.getDate()+6);
  const calendarEvents = useCalendarEvents(undefined,child?.id,dateKey(weekStart),dateKey(calendarEnd));
  const planKey = ["currentCarePath", accountId, child?.id];
  const plan = useQuery({ queryKey: planKey, queryFn: () => getCurrentCarePath(child!.id), enabled: !!accountId && !!child });
  const appointments = useQuery({ queryKey: ["journey", accountId], queryFn: () => readJourney(accountId!), enabled: !!accountId });
  useFocusEffect(useCallback(() => {
    if (!accountId) return;
    void client.invalidateQueries({ queryKey: ["plan-children", accountId] });
    void client.invalidateQueries({ queryKey: ["currentCarePath", accountId] });
    void client.invalidateQueries({ queryKey: ["journey", accountId] });
  }, [accountId, client]));
  const name = (item: Child) => (isRTL ? item.nameAr : item.nameEn) || item.name;
  const birth = parseStoredDate(child?.dateOfBirth);
  const age = birth ? ageFromDate(birth) : child?.age;
  const tags = [...new Set([...asIdList(child?.diagnoses ?? child?.diagnosis), ...asIdList(child?.areasOfFocus)])].map(id => {
    const option = FOCUS_AREAS.find(item => item.id === id); return option ? t(option.labelKey) : id;
  });
  const tasks = plan.data?.carePath ? plan.data.tasks : [];
  const weekly = weekTasks(tasks, weekStart);
  const progress = weeklyProgress(weekly);
  const selectedDate = new Date(weekStart); selectedDate.setDate(selectedDate.getDate() + day);
  const daily = weekly.filter(task => dateKey(taskDate(task)!) === dateKey(selectedDate));
  const unscheduled = tasks.filter(task => !taskDate(task));
  // Use actual task outcomes for weekly goals; profile goals remain explicitly labelled.
  const local = (ar?: string, en?: string, legacy?: string) => (isRTL ? ar || en : en || ar) || legacy || "";
  const goals = [...new Set(weekly.map(task => local(task.expectedOutcomeAr, task.expectedOutcomeEn, task.expectedOutcome)).filter(Boolean))];
  const profileGoals = asIdList(child?.supportGoals).map(id => { const option = SUPPORT_GOALS.find(item => item.id === id); return option ? t(option.labelKey) : id; });
  const moveWeek = (offset: number) => { const next = new Date(weekStart); next.setDate(next.getDate() + offset * 7); setWeekStart(next); };
  const dateLabel = (date: Date) => date.toLocaleDateString(isRTL ? "ar-KW" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const refreshPlan = (taskId: string, status: "completed" | "skipped", note?: string) => {
    // Retain the confirmed final task: the server hides care paths once all tasks are resolved.
    client.setQueryData<CurrentCarePathResult>(planKey, current => current ? { ...current, tasks: current.tasks.map(task => task.id === taskId ? { ...task, status, note: note || task.note } : task) } : current);
  };
  const active = !!plan.data?.carePath && tasks.some(task => task.status === "pending");
  const upcoming = upcomingAppointments(appointments.data ?? []).filter(item => !item.childId || item.childId === child?.id);
  const hasPlan = !!plan.data?.carePath;
  const planReady = !plan.isPending && !plan.isError;
  const emptyPlan = !hasPlan && planReady;
  const sectionEmpty = (message: string, icon: Icon = "leaf-outline") => <View style={s.emptyPanel}><Ionicons name={icon} size={30} color={fakhrColors.secondary} /><Text style={[s.body, txt]}>{message}</Text></View>;
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  const number = (value: number) => value.toLocaleString(isRTL ? "ar-KW" : "en-GB");
  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
          <View style={[s.header, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={text("فتح التقويم التجريبي", "Open preview calendar")} disabled={!localCarePreview()&&!dailyCareEnabled()} accessibilityState={{disabled:!localCarePreview()&&!dailyCareEnabled()}} onPress={() => setCalendarOpen(true)} style={s.back}><Ionicons name="calendar-outline" size={26} color={colors.primary} /></Pressable>
            <Image source={require("../../../assets/images/fakhr-wordmark-blue.png")} resizeMode="contain" accessibilityLabel={text("فخر", "Fakhr")} style={s.logo} />
            <Pressable accessibilityRole="button" accessibilityLabel={text("اختيار الطفل", "Choose child")} onPress={() => setSelectingChild(value => !value)} style={[s.childSelector, { flexDirection: tabRow, maxWidth: compactProfile ? 112 : 140 }]}>{child?.photoUrl ? <Image source={{ uri: child.photoUrl }} style={s.selectorPhoto} /> : <Ionicons name="person-circle-outline" size={30} color={colors.primary} />}<Text style={[s.caption, { flexShrink: 1, fontSize: typography.button, fontWeight: typography.weightMedium }]}>{child ? name(child) : accountId ? text("اختيار الطفل", "Choose child") : text("معاينة", "Preview")}</Text><Ionicons name="chevron-down" size={16} color={colors.primary} /></Pressable>
          </View>
          {calendarOpen && (localCarePreview()||dailyCareEnabled()) && <Modal visible animationType="slide" onRequestClose={()=>setCalendarOpen(false)}><SafeAreaView style={s.screen}><ScrollView contentContainerStyle={s.content}><Button title={text('إغلاق التقويم','Close calendar')} onPress={()=>setCalendarOpen(false)}/><Text style={[s.heading,txt]}>{child?name(child):text('طفل تجريبي','Demo child')}</Text><DailyCarePreview key={child?.id||'synthetic-demo-child'} childId={child?.id} calendar/></ScrollView></SafeAreaView></Modal>}
          <View style={[s.intro, { flexDirection: tabRow }]}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text accessibilityRole="header" style={[s.pageTitle, txt, { textAlign: "center" }]}>{t("tabs.plan")}</Text>
              <Text style={[s.body, txt, { textAlign: "center" }]}>{text("خطة وأنشطة ومتابعة التقدم حسب احتياجاته", "A plan, activities and progress based on their needs")}</Text>
              <Text style={[s.caption, txt, {textAlign:'center'}]}>{dailyCareEnabled()?text('جدول شخصي؛ لا يؤكد حجزاً لدى مقدم الخدمة.','Personal schedule; does not confirm provider booking.'):localCarePreview()?text('تقويم محلي تجريبي؛ لا يؤكد حجزاً لدى مقدم الخدمة.', 'Local demo calendar; does not confirm a provider booking.'):text('التقويم والحجز غير متاحين حالياً؛ لا يتم تأكيد أي موعد.', 'Calendar and booking are currently unavailable; no appointments are confirmed.')}</Text>
            </View>
          </View>
            <View accessibilityRole="tablist" style={[s.tabs, { flexDirection: tabRow }]}>{([["today", "اليوم", "Today", "calendar-outline"], ["week", "هذا الأسبوع", "This Week", "calendar-number-outline"], ["progress", "التقدم", "Progress", "stats-chart-outline"]] as const).map(([id, ar, en, icon]) => <Pressable key={id} testID={`plan-tab-${id}`} accessibilityRole="tab" accessibilityState={{ selected: view === id }} onPress={() => { setView(id); if (id === "today") { setWeekStart(saturdayWeek(new Date())); setDay((new Date().getDay() + 1) % 7); } }} style={[s.tab, { flexDirection: tabRow }, view === id && s.selected]}><Ionicons name={icon} size={18} color={view === id ? "white" : colors.primary} /><Text style={[s.caption, { flexShrink: 1, textAlign: "center", fontSize: typography.button, fontWeight: typography.weightMedium }, view === id && s.onSelected]}>{text(ar, en)}</Text></Pressable>)}</View>
          {!accountId ? (
            <>
              <View style={s.notice}><Text style={[s.label, txt]}>{text("معاينة توضيحية · غير مخصصة لطفل", "Illustrative preview · not personalized")}</Text><Text style={[s.body, txt]}>{text("أنشطة أمثلة للتعرّف على شكل الخطة، وليست مواعيد أو توصيات شخصية. يتطلب حفظ خطة شخصية حساباً من قسم حسابي.", "Example activities show how a plan can look. These are not bookings or personal recommendations. Saving a personalized plan requires an account through My Account.")}</Text></View>
              {selectingChild && <Button title={text("إدارة الأطفال من حسابي", "Manage children in My Account")} onPress={() => router.push("/(tabs)/profile")} />}
              {view === "progress" ? <Section title={text("التقدم", "Progress")} icon="stats-chart-outline"><Text style={[s.body, txt]}>{text("لا يوجد تقدم مسجل في المعاينة. يظهر التقدم من الأنشطة المسجلة في خطة طفلك فقط.", "No progress is recorded in this preview. Progress comes only from recorded activities in your child's plan.")}</Text></Section> : null}
              <ChildPlanToday preview period={view === "week" ? "week" : "today"} goals={[]} tasks={[]} allTasks={[]} records={[]} loading={false} error={false} onRetry={() => {}} onProgress={() => setView("progress")} renderTask={() => null} />
            </>
          ) : children.isPending ? <ActivityIndicator color={colors.primary} /> : children.isError ? (
            <Section title={text("تعذر تحميل الأطفال", "Could not load children")} icon="alert-circle-outline"><Button title={text("إعادة المحاولة", "Retry")} onPress={() => { void children.refetch(); }} /></Section>
          ) : !child ? (<>
            <Section title={text("لا يوجد ملف طفل بعد", "No child profile yet")} icon="person-outline">
              {sectionEmpty(text("أضف طفلك لعرض خطته عند توفرها.", "Add your child to view their plan when available."))}
              <Button title={text("إدارة الأطفال", "Manage children")} selected onPress={() => router.push("/(tabs)/profile/manage-children")} />
            </Section>
            <ChildPlanToday accountId={accountId} goals={[]} tasks={[]} allTasks={[]} records={[]} loading={false} error={false} onRetry={() => {}} onProgress={() => setView("progress")} renderTask={() => null} />
          </>
          ) : <>
            {(selectingChild || view === "week") && (children.data?.length ?? 0) > 1 && <View style={{ gap: 8 }}>
              <Text style={[s.caption, txt]}>{text("اختر ملف الطفل", "Choose a child")}</Text>
              <View style={[s.wrap, { flexDirection: tabRow }]}>{children.data!.map(item => <Button key={item.id} title={name(item)} selected={child.id === item.id} onPress={() => { setChildId(item.id); setSelectingChild(false); }} />)}</View>
            </View>}

            {view === "today" && <ChildPlanToday calendarEvents={(calendarEvents.data??[]).filter(e=>e.date===dateKey(new Date()))} calendarError={calendarEvents.isError} key={child.id} accountId={accountId} childId={child.id} goals={profileGoals.length ? profileGoals : goals} tasks={daily} allTasks={tasks} records={appointments.data ?? []} loading={plan.isPending} error={plan.isError || appointments.isError} onRetry={() => { void plan.refetch(); void appointments.refetch(); }} onProgress={() => setView("progress")} renderTask={task => <TaskCard key={`${child.id}:${task.id}`} task={task} childId={child.id} active={active} onSaved={refreshPlan} />} />}
            {view === "week" && <><View style={[s.card, s.profileCard]} testID="child-plan-profile">
              <View style={[s.row, { flexDirection: tabRow }]}>
                <View style={s.avatar}>{child.photoUrl ? <Image source={{ uri: child.photoUrl }} accessibilityLabel={name(child)} style={s.photo} /> : <Ionicons name="person-outline" size={38} color={colors.primary} />}</View>
                <View style={{ flex: 1, gap: 4 }}><Text style={[s.title, txt]}>{name(child)}</Text><Text style={[s.body, txt]}>{age != null ? t("ui.years", { count: age }) : text("العمر غير مسجل", "Age not recorded")}</Text></View>
                {!compactProfile && <Pressable accessibilityRole="button" accessibilityLabel={text("تعديل ملف الطفل", "Edit child profile")} style={s.back} onPress={() => router.push({ pathname: "/(tabs)/profile/edit-child-profile", params: { id: child.id } })}><Ionicons name="pencil-outline" size={20} color={colors.primary} /></Pressable>}
              </View>
              {compactProfile && <Button icon="pencil-outline" title={text("تعديل ملف الطفل", "Edit child profile")} onPress={() => router.push({ pathname: "/(tabs)/profile/edit-child-profile", params: { id: child.id } })} />}
              <View style={s.divider} />
              <Text style={[s.caption, txt]}>{text("الاحتياجات ومجالات التطور", "Developmental needs & focus areas")}</Text>
              {tags.length ? <View style={[s.wrap, { flexDirection: tabRow }]}>{tags.map(tag => <Text key={tag} style={[s.tag, txt]}>{tag}</Text>)}</View> : <Text style={[s.body, txt]}>{text("لم تُسجّل احتياجات بعد.", "No developmental needs recorded yet.")}</Text>}
            </View>
            <Section title={text("الخطة الأسبوعية", "Weekly plan")} icon="calendar-outline">
              <View style={[s.weekNavigation, { flexDirection: tabRow }]}>
                <Pressable accessibilityRole="button" accessibilityLabel={text("الأسبوع السابق", "Previous week")} onPress={() => moveWeek(-1)} style={s.weekArrow}><Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={20} color={colors.primary} /></Pressable>
                <Text style={[s.weekRange, txt]}>{dateLabel(weekStart)} — {dateLabel(weekEnd)}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={text("الأسبوع التالي", "Next week")} onPress={() => moveWeek(1)} style={s.weekArrow}><Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.primary} /></Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.calendarRow, { flexDirection: tabRow }]}>
                {DAYS.map((labels, index) => {
                  const date = new Date(weekStart); date.setDate(date.getDate() + index);
                  const count = weekly.filter(task => dateKey(taskDate(task)!) === dateKey(date)).length;
                  const selected = day === index;
                  return <Pressable key={index} testID={`plan-day-${index}`} accessibilityRole="button" accessibilityLabel={`${labels[isRTL ? 0 : 1]} ${dateLabel(date)}`} accessibilityState={{ selected }} onPress={() => setDay(index)} style={[s.day, selected && s.selected]}>
                    <Text style={[s.dayName, selected && s.onSelected]}>{labels[isRTL ? 0 : 1]}</Text>
                    <Text style={[s.dayNumber, selected && s.onSelected]}>{number(date.getDate())}</Text>
                    <View style={[s.dayDot, { opacity: count ? 1 : 0 }, selected && { backgroundColor: "white" }]} />
                  </Pressable>;
                })}
              </ScrollView>
              <Button title={text("هذا الأسبوع", "This week")} onPress={() => { setWeekStart(saturdayWeek(new Date())); setDay((new Date().getDay() + 1) % 7); }} />
              {plan.isPending ? <ActivityIndicator color={colors.primary} /> : plan.isError ? <View style={s.notice}><Text accessibilityRole="alert" style={[s.body, txt]}>{text("تعذر تحميل الخطة. حاول مرة أخرى.", "Could not load the plan. Please retry.")}</Text><Button title={text("إعادة المحاولة", "Retry")} onPress={() => { void plan.refetch(); }} /></View> : emptyPlan ? <View style={s.notice}><Text style={[s.body, txt]}>{text("لا توجد خطة نشطة لهذا الطفل حالياً.", "There is no active plan for this child yet.")}</Text></View> : null}
            </Section>
            <Section title={text("الأهداف الأسبوعية", "Weekly goals")} icon="radio-button-on-outline">
              {goals.length ? goals.map((goal, index) => <View key={goal} style={[s.goal, { flexDirection: tabRow }]}><View style={s.goalNumber}><Text style={s.buttonText}>{number(index + 1)}</Text></View><Text style={[s.body, txt, { flex: 1 }]}>{goal}</Text></View>) : sectionEmpty(planReady ? text("لم تُسجّل أهداف لهذا الأسبوع.", "No goals recorded for this week.") : text("تظهر الأهداف بعد تحميل الخطة.", "Goals appear after the plan loads."))}
              {profileGoals.length > 0 && <View style={s.softCard}><Text style={[s.label, txt]}>{text("أهداف الدعم في ملف الطفل", "Child profile support goals")}</Text>{profileGoals.map(goal => <Text key={goal} style={[s.body, txt]}>• {goal}</Text>)}</View>}
            </Section>
            <Section title={text("أنشطة اليوم", "Daily activities")} icon="checkbox-outline">
              <Text style={[s.caption, txt]}>{DAYS[day][isRTL ? 0 : 1]} · {dateLabel(selectedDate)}</Text>
              {daily.length ? daily.map(task => <TaskCard key={`${child.id}:${task.id}`} task={task} childId={child.id} active={active} onSaved={refreshPlan} />) : sectionEmpty(planReady ? text("لا توجد أنشطة مجدولة لهذا اليوم.", "No activities scheduled for this day.") : text("تظهر الأنشطة بعد تحميل الخطة.", "Activities appear after the plan loads."), "sunny-outline")}
              {unscheduled.length > 0 && <><Text style={[s.label, txt]}>{text("أنشطة بدون موعد محدد", "Unscheduled activities")}</Text>{unscheduled.map(task => <TaskCard key={`${child.id}:${task.id}`} task={task} childId={child.id} active={active} onSaved={refreshPlan} />)}</>}
            </Section>
            <Section title={text("أحداث التقويم لهذا الأسبوع", "Calendar events this week")} icon="calendar-outline">
              {calendarEvents.isError ? <Text>{text("تعذر تحميل أحداث التقويم.","Could not load calendar events.")}</Text> : <CalendarEventList events={calendarEvents.data??[]} onSelect={()=>setCalendarOpen(true)}/>}
              <Button disabled={!localCarePreview()&&!dailyCareEnabled()} title={text("فتح التقويم","Open calendar")} onPress={()=>setCalendarOpen(true)}/>
            </Section>
            <Section title={text("مواعيد الأطباء والمراكز", "Doctor & center appointments")} icon="calendar-number-outline">
              {appointments.isPending ? <ActivityIndicator color={colors.primary} /> : appointments.isError ? <><Text style={[s.body, txt]}>{text("تعذر تحميل المواعيد المحفوظة.", "Could not load saved appointments.")}</Text><Button title={text("إعادة المحاولة", "Retry")} onPress={() => { void appointments.refetch(); }} /></> : upcoming.length ? upcoming.map(item => <View key={item.id} style={s.appointment}><View style={[s.row, { flexDirection: tabRow }]}><View style={[s.sectionIcon, { backgroundColor: categoryColors.sessions.background }]}><Ionicons name="calendar-outline" size={24} color={categoryColors.sessions.foreground} /></View><View style={{ flex: 1, gap: 4 }}><Text style={[s.label, txt]}>{local(item.titleAr, item.titleEn)}</Text><Text style={[s.body, txt]}>{local(item.centerAr, item.centerEn)}</Text></View></View><Text style={[s.appointmentDate, txt]}>{item.dateKey} {item.time}</Text>{!item.childId && <Text style={[s.caption, txt]}>{text("موعد للحساب — لم يُربط بطفل", "Account appointment — no child assigned")}</Text>}</View>) : sectionEmpty(text("لا توجد مواعيد قادمة محفوظة.", "No saved upcoming appointments."), "calendar-outline")}
              <Text style={[s.caption, txt]}>{text("تُعرض المواعيد المحفوظة في حسابك على هذا الجهاز.", "Shows appointments saved for your account on this device.")}</Text>
            </Section>
            </>}
            {view !== "today" && <><Section title={text("التقدم الأسبوعي", "Weekly progress")} icon="stats-chart-outline">
              <View style={[s.progressSummary, { flexDirection: tabRow }]}><Text style={[s.body, txt, { flex: 1 }]}>{hasPlan && planReady ? text(`اكتمل ${progress.done} من ${progress.total} نشاطاً مجدولاً`, `${progress.done} of ${progress.total} scheduled activities completed`) : text("يظهر تقدم طفلك عند توفر أنشطة الخطة.", "Your child's progress appears when plan activities are available.")}</Text><Text testID="plan-percentage" style={s.percentage}>{hasPlan && planReady ? `${progress.percent}%` : "—"}</Text></View>
              <View accessibilityRole="progressbar" accessibilityLabel={text("التقدم الأسبوعي", "Weekly progress")} accessibilityValue={hasPlan && planReady ? { min: 0, max: 100, now: progress.percent } : { text: text("غير متاح", "Not available") }} style={s.track}><View style={[s.fill, { width: `${hasPlan && planReady ? progress.percent : 0}%`, alignSelf: isRTL ? "flex-end" : "flex-start" }]} /></View>
              {hasPlan && planReady && <View style={[s.stats, { flexDirection: tabRow }]}>{[[text("مكتمل", "Completed"), progress.done], [text("تم التخطي", "Skipped"), weekly.filter(task => task.status === "skipped").length], [text("متبقٍ", "Remaining"), weekly.filter(task => task.status === "pending").length]].map(([label, count]) => <View key={label} style={s.stat}><Text style={s.statValue}>{number(Number(count))}</Text><Text style={s.caption}>{label}</Text></View>)}</View>}
            </Section>
            <Section title={text("التقييم الأسبوعي", "Weekly evaluation")} icon="star-outline">
              <Text style={[s.body, txt]}>{text("كيف كانت الأنشطة هذا الأسبوع؟ شارك ملاحظاتك عن تجربة طفلك.", "How were this week's activities? Share feedback on your child's experience.")}</Text>
              <WeeklyEvaluation key={`${child.id}:${dateKey(weekStart)}`} childId={child.id} week={dateKey(weekStart)} active={active && planReady} />
            </Section>
            <Section title={text("تعديل خطة الأسبوع القادم", "Next week's plan adjustment")} icon="refresh-outline">
              <View style={s.adjustment}><View style={[s.row, { flexDirection: tabRow }]}><Ionicons name="information-circle-outline" size={22} color={colors.primary} /><Text style={[s.label, txt]}>{text("التعديل التلقائي", "Automatic adjustment")}</Text></View><Text style={[s.body, txt]}>{text("التعديل التلقائي غير متاح حالياً. حفظ التقييم لا يغيّر الخطة تلقائياً.", "Automatic adjustment is not available yet. Saving an evaluation does not automatically change the plan.")}</Text></View>
            </Section>
            </>}
          </>}
        </ScrollView>
        <JourneyProductDetails product={HOME_PRODUCTS.find(item => item.id === productId)} onClose={() => router.setParams({ productId: "" })} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function TaskCard({ task, childId, active, onSaved }: { task: CarePathTask; childId: string; active: boolean; onSaved: (id: string, status: "completed" | "skipped", note?: string) => void }) {
  const { isRTL, align, dir, tabRow } = useI18nLayout(); const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  const local = (ar?: string, en?: string, legacy?: string) => (isRTL ? ar || en : en || ar) || legacy || "";
  const [note, setNote] = useState(task.note ?? ""); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const [message, setMessage] = useState(""); const [helpful, setHelpful] = useState<boolean>();
  async function save(action: "completed" | "skipped" | "helpful" | "unhelpful") {
    if (lock.current) return; lock.current = true; setBusy(true); setMessage("");
    try {
      if (action === "completed" || action === "skipped") {
        await (action === "completed" ? completeCarePathTask : skipCarePathTask)(task.id, note.trim() || undefined);
        onSaved(task.id, action, note.trim() || undefined);
      } else {
        await savePlanCheckin({ childId, answers: { kind: "activity-feedback", taskId: task.id, helpful: action === "helpful" }, note: note.trim() || undefined });
        setHelpful(action === "helpful");
      }
      setMessage(text("تم الحفظ", "Saved"));
    } catch { setMessage(text("تعذر تأكيد الحفظ. تحقق من الاتصال وأعد تحميل الخطة قبل المحاولة مجدداً.", "Could not confirm the save. Check your connection and reload the plan before retrying.")); }
    finally { lock.current = false; setBusy(false); }
  }
  return <View style={s.softCard}><View style={[s.row, { flexDirection: tabRow }]}><Ionicons name="checkbox-outline" color={colors.primary} size={24} /><Text style={[s.label, txt]}>{local(task.titleAr, task.titleEn, task.title)}</Text></View>
    {[local(task.descriptionAr, task.descriptionEn, task.description), local(task.instructionsAr, task.instructionsEn, task.instructions), local(task.frequencyAr, task.frequencyEn, task.frequency)].filter(Boolean).map((value, index) => <Text key={index} style={[s.body, txt]}>{value}</Text>)}
    <Text style={[s.caption, txt]}>{text("ملاحظات النشاط", "Activity notes")}</Text><TextInput accessibilityLabel={text("ملاحظات النشاط", "Activity notes")} value={note} onChangeText={setNote} editable={!busy && (active || task.status === "pending")} multiline maxLength={500} style={[s.input, txt]} />
    <View style={[s.wrap, { flexDirection: tabRow }]}>{task.status === "pending" ? <><Button icon="checkmark-circle-outline" selected title={text("تم", "Done")} disabled={busy} onPress={() => { void save("completed"); }} /><Button icon="play-skip-forward-outline" title={text("تخطي", "Skip")} disabled={busy} onPress={() => { void save("skipped"); }} /></> : <Text style={[s.label, txt]}>{task.status === "completed" ? text("مكتمل", "Completed") : text("تم التخطي", "Skipped")}</Text>}</View>
    {active && <><Text style={[s.caption, txt]}>{text("هل كان النشاط مفيداً؟ يحفظ اختيارك والملاحظات.", "Was this activity helpful? Saves your choice and notes.")}</Text><View style={[s.wrap, { flexDirection: tabRow }]}><Button icon="thumbs-up-outline" title={text("مفيد", "Helpful")} selected={helpful === true} disabled={busy} onPress={() => { void save("helpful"); }} /><Button icon="thumbs-down-outline" title={text("غير مفيد", "Not helpful")} selected={helpful === false} disabled={busy} onPress={() => { void save("unhelpful"); }} /></View></>}
    {busy && <ActivityIndicator color={colors.primary} />}{!!message && <Text accessibilityLiveRegion="polite" style={[s.body, txt]}>{message}</Text>}
  </View>;
}
function WeeklyEvaluation({ childId, week, active }: { childId: string; week: string; active: boolean }) {
  const { isRTL, align, dir, tabRow } = useI18nLayout(); const text = (ar: string, en: string) => isRTL ? ar : en;
  const [difficulty, setDifficulty] = useState<"easy" | "ok" | "hard">(); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const lock = useRef(false); const [message, setMessage] = useState("");
  async function save() { if (lock.current || !difficulty || !active) return; lock.current = true; setBusy(true); setMessage(""); try { await savePlanCheckin({ childId, difficulty, note: note.trim() || undefined, answers: { kind: "weekly-evaluation", weekStart: week } }); setMessage(text("تم حفظ التقييم", "Evaluation saved")); } catch { setMessage(text("تعذر تأكيد حفظ التقييم. أعد تحميل الخطة قبل المحاولة مجدداً.", "Could not confirm the evaluation. Reload the plan before retrying.")); } finally { lock.current = false; setBusy(false); } }

  return <><View style={[s.wrap, { flexDirection: tabRow }]}>{([['easy', 'سهل', 'Easy'], ['ok', 'مناسب', 'Manageable'], ['hard', 'صعب', 'Hard']] as const).map(([value, ar, en]) => <Button key={value} title={text(ar, en)} selected={difficulty === value} disabled={busy || !active} onPress={() => setDifficulty(value)} />)}</View><TextInput accessibilityLabel={text("ملاحظات التقييم الأسبوعي", "Weekly evaluation notes")} multiline maxLength={1000} value={note} onChangeText={setNote} editable={!busy && active} style={[s.input, { textAlign: align, writingDirection: dir }]} />{!active && <Text style={[s.caption, { textAlign: align }]}>{text("يتاح حفظ التقييم عند وجود خطة نشطة.", "Saving an evaluation requires an active plan.")}</Text>}<Button selected title={text("حفظ التقييم", "Save evaluation")} disabled={busy || !difficulty || !active} onPress={() => { void save(); }} />{busy && <ActivityIndicator color={colors.primary} />}{!!message && <Text accessibilityLiveRegion="polite" style={[s.body, { textAlign: align }]}>{message}</Text>}</>;
}
const s = StyleSheet.create({
  tabs: { gap: 6, borderRadius: 14 },
  tab: { flex: 1, minHeight: 48, backgroundColor: colors.soft, gap: 4, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  childSelector: { maxWidth: 140, minHeight: 44, gap: 5, alignItems: "center", backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 6 },
  selectorPhoto: { width: 30, height: 30, borderRadius: 15 },
  screen: { flex: 1, backgroundColor: fakhrColors.background },
  content: { width: "100%", maxWidth: 680, alignSelf: "center", padding: 14, paddingBottom: 168, gap: 12 },
  header: { minHeight: 66, direction: "ltr", alignItems: "center", justifyContent: "space-between" },
  headerBalance: { width: 44 }, logo: { position: "absolute", left: "50%", marginLeft: -26, width: 52, height: 66 },
  intro: { alignItems: "center", gap: 4, paddingVertical: 4 },
  row: { alignItems: "center", gap: 12 }, wrap: { flexWrap: "wrap", gap: 8 },
  back: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "white", borderWidth: 1, borderColor: colors.border },
  pageTitle: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.title },
  title: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.title, flexShrink: 1 },
  heading: { fontSize: typography.section, fontWeight: typography.weightSemibold, color: colors.title, flexShrink: 1 },
  label: { fontSize: typography.cardTitle, fontWeight: typography.weightMedium, color: colors.title, flexShrink: 1 },
  body: { fontSize: typography.body, color: colors.body },
  caption: { fontSize: typography.helper, color: fakhrColors.textMuted },
  card: { ...sharedControls.card, gap: 12, padding: 14, borderRadius: 18, borderColor: colors.border },
  sectionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: fakhrColors.backgroundWash, alignItems: "center", justifyContent: "center" },
  profileCard: { backgroundColor: fakhrColors.backgroundWash, borderColor: fakhrColors.border, padding: 20 },
  divider: { height: 1, backgroundColor: fakhrColors.border },
  softCard: { backgroundColor: colors.soft, padding: 16, borderRadius: 20, gap: 14, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 78, height: 78, borderRadius: 26, borderWidth: 3, borderColor: "white", overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: fakhrColors.border },
  photo: { width: "100%", height: "100%" },
  tag: { fontSize: typography.helper, backgroundColor: "white", color: "#0B093B", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, overflow: "hidden" },
  button: { backgroundColor: fakhrColors.backgroundWash,       borderWidth: 1, borderColor: fakhrColors.border , ...sharedControls.button },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  buttonText: { color: "#0B093B", fontSize: typography.button, fontWeight: typography.weightMedium, textAlign: "center" },
  onSelected: { color: "#FFFFFF" },
  input: { minHeight: 88, borderWidth: 1, borderColor: fakhrColors.border, borderRadius: 16, backgroundColor: "white", padding: 14, color: colors.title, textAlignVertical: "top" },
  weekNavigation: { alignItems: "center", gap: 8 },
  weekArrow: { width: 40, minHeight: 44, backgroundColor: fakhrColors.backgroundWash, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  weekRange: { flex: 1, fontSize: typography.helper, fontWeight: typography.weightRegular, color: colors.body, textAlign: "center" },
  calendarRow: { gap: 7, paddingVertical: 3 },
  day: { minWidth: 64, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: fakhrColors.backgroundWash, paddingVertical: 12, paddingHorizontal: 8, gap: 4, borderWidth: 1, borderColor: fakhrColors.border },
  dayName: { fontSize: typography.helper, color: colors.body, textAlign: "center" },
  dayNumber: { fontSize: typography.section, fontWeight: typography.weightSemibold, color: colors.title },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
  notice: { borderRadius: 16, backgroundColor: fakhrColors.backgroundWash, padding: 14, gap: 10 },
  emptyPanel: { minHeight: 80, padding: 12, gap: 12, alignItems: "center", justifyContent: "center", backgroundColor: fakhrColors.background, borderRadius: 18, borderWidth: 1, borderStyle: "dashed", borderColor: fakhrColors.border },
  goal: { alignItems: "center", gap: 12, backgroundColor: fakhrColors.backgroundWash, borderRadius: 16, padding: 14 },
  goalNumber: { width: 34, height: 34, borderRadius: 12, backgroundColor: fakhrColors.backgroundSecondary, alignItems: "center", justifyContent: "center" },
  appointment: { backgroundColor: fakhrColors.background, padding: 16, gap: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  appointmentDate: { fontSize: typography.body, color: "#0B093B", fontWeight: typography.weightRegular },
  progressSummary: { alignItems: "center", gap: 20 },
  percentage: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: "#0B093B" },
  track: { height: 12, borderRadius: 6, backgroundColor: fakhrColors.backgroundWash, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: fakhrColors.secondary, borderRadius: 6 },
  stats: { gap: 8, flexWrap: "wrap" },
  stat: { flex: 1, minWidth: 75, backgroundColor: fakhrColors.background, padding: 12, borderRadius: 16, alignItems: "center", gap: 4 },
  statValue: { fontSize: typography.section, fontWeight: typography.weightSemibold, color: colors.title },
  adjustment: { padding: 16, borderRadius: 18, gap: 12, backgroundColor: fakhrColors.backgroundWash },
});

