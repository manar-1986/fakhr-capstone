import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  completeCarePathTask,
  getCurrentCarePath,
  skipCarePathTask,
  type CarePathTask,
} from "../../../api/care-path.api";
import { getChildren, type Child } from "../../../api/children.api";
import { WEB_PHONE_WIDTH } from "../../../components/layout/WebAppShell";
import {
  FOCUS_AREAS,
  SUPPORT_GOALS,
  ageFromDate,
  asIdList,
  parseStoredDate,
} from "../../../constants/childProfileOptions";
import { getMockBookings } from "../../../utils/mockBookingsStore";

const colors = {
  bg: "#EEF0F8",
  headerWash: "#E4E8F6",
  title: "#4F5C9A",
  titleDark: "#3A4578",
  muted: "#8B91AF",
  body: "#5A6280",
  primary: "#6F80B4",
  primarySoft: "#EBEEF9",
  white: "#FFFFFF",
  cardBorder: "#E6E8F2",
  chipIdle: "#F4F5FB",
  done: "#3ECF8E",
  doneBg: "#E8F9F0",
  skip: "#A8ABB4",
  skipBg: "#F3F4F7",
  progressTrack: "#E6E8F2",
  progressFill: "#8B96C9",
};

const DESIGN_W = 390;

const WEEK_DAYS = [
  { key: 6, label: "السبت" },
  { key: 0, label: "الأحد" },
  { key: 1, label: "الاثنين" },
  { key: 2, label: "الثلاثاء" },
  { key: 3, label: "الأربعاء" },
  { key: 4, label: "الخميس" },
  { key: 5, label: "الجمعة" },
] as const;

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const TAG_BY_FOCUS: Record<string, string> = {
  speech: "تواصل",
  behavior: "سلوكي",
  sensory: "حسي",
  motor: "تأخر نمائي",
};

const DIAGNOSIS_AR: Record<string, string> = {
  autism: "طيف التوحد",
  asd: "طيف التوحد",
  adhd: "فرط الحركة",
  speech: "تواصل",
  sensory: "حسي",
  behavior: "سلوكي",
  developmental: "تأخر نمائي",
  delay: "تأخر نمائي",
};

function startOfSaturdayWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const jsDay = copy.getDay();
  const offset = (jsDay + 1) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const month = AR_MONTHS[end.getMonth()] ?? "";
  return `${start.getDate()} - ${end.getDate()} ${month}`;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function childAge(child: Child): number | undefined {
  if (typeof child.age === "number" && Number.isFinite(child.age)) {
    return child.age;
  }
  const dob = parseStoredDate(child.dateOfBirth);
  return dob ? ageFromDate(dob) : undefined;
}

function childTags(child: Child, t: (key: string) => string): string[] {
  const tags: string[] = [];
  const diagnoses = Array.isArray(child.diagnosis)
    ? child.diagnosis
    : Array.isArray(child.diagnoses)
      ? child.diagnoses
      : child.diagnosis
        ? [String(child.diagnosis)]
        : [];
  diagnoses.forEach((item) => {
    const raw = String(item).trim();
    if (!raw) return;
    const mapped = DIAGNOSIS_AR[raw.toLowerCase()];
    tags.push(mapped || raw);
  });
  asIdList(child.areasOfFocus).forEach((id) => {
    const mapped = TAG_BY_FOCUS[id];
    if (mapped) tags.push(mapped);
    else {
      const area = FOCUS_AREAS.find((f) => f.id === id);
      tags.push(area ? t(area.labelKey) : id);
    }
  });
  return [...new Set(tags)].slice(0, 4);
}

function weeklyGoalsText(child: Child | undefined, t: (key: string) => string): string {
  if (!child) return "";
  const ids = asIdList(child.supportGoals);
  if (!ids.length) return child.medicalHistory?.trim() || "";
  return ids
    .map((id) => {
      const goal = SUPPORT_GOALS.find((g) => g.id === id);
      return goal ? t(goal.labelKey) : id;
    })
    .join("، ");
}

function taskIcon(task: CarePathTask): React.ComponentProps<typeof Ionicons>["name"] {
  const hay = `${task.category ?? ""} ${task.title}`.toLowerCase();
  if (hay.includes("speech") || hay.includes("نطق") || hay.includes("تواصل")) {
    return "chatbubbles-outline";
  }
  if (hay.includes("play") || hay.includes("لعب") || hay.includes("puzzle")) {
    return "extension-puzzle-outline";
  }
  if (hay.includes("sensory") || hay.includes("حسي") || hay.includes("يد")) {
    return "hand-left-outline";
  }
  if (hay.includes("doctor") || hay.includes("طبيب") || hay.includes("موعد")) {
    return "calendar-outline";
  }
  return "checkbox-outline";
}

function helpfulnessLabel(task: CarePathTask): string | null {
  const hay = `${task.note ?? ""} ${task.expectedOutcome ?? ""}`.toLowerCase();
  if (hay.includes("very") || hay.includes("جدا")) return "مفيد جداً";
  if (hay.includes("helpful") || hay.includes("مفيد")) return "مفيد";
  return null;
}

/** Visual-only fallback when the account has no child profile yet. */
const DEMO_CHILD: Child = {
  id: "demo-visual-child",
  name: "محمد",
  age: 6,
  parentId: "demo-visual",
};

const DEMO_TAGS = ["تأخر نمائي", "تواصل", "حسي", "سلوكي"];

const DEMO_GOALS =
  "تحسين التواصل اليومي، تعزيز اللعب التفاعلي، وتنظيم الاستجابة الحسية خلال الأسبوع.";

const DEMO_TASKS: CarePathTask[] = [
  {
    id: "demo-task-speech",
    title: "تمرين النطق",
    description: "تكرار كلمات بسيطة لمدة 10 دقائق",
    category: "speech",
    status: "completed",
    expectedOutcome: "مفيد جداً",
  },
  {
    id: "demo-task-play",
    title: "لعب تفاعلي",
    description: "لعبة تبادل الأدوار مع الوالدين",
    category: "play",
    status: "pending",
  },
  {
    id: "demo-task-sensory",
    title: "نشاط حسي",
    description: "تمرين حسي لليدين باستخدام الرمل",
    category: "sensory",
    status: "skipped",
    note: "سيتم المحاولة غداً",
    instructions: "سيتم المحاولة غداً",
  },
];

const DEMO_APPOINTMENT = {
  listingName: "عيادة علاج النطق",
  dateLabel: "الأحد ٢٠ سبتمبر",
  timeLabel: "٤:٠٠ م",
  notes: "موعد طبيب تجريبي",
};

export default function PlanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const today = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDay());
  const weekStart = useMemo(() => startOfSaturdayWeek(today), [today]);

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ["children"],
    queryFn: getChildren,
    retry: false,
  });

  const child = children?.[0];
  const useDemo = !childrenLoading && !child;

  const { data: carePathData, isLoading: planLoading } = useQuery({
    queryKey: ["currentCarePath", child?.id],
    queryFn: () => getCurrentCarePath(child!.id),
    enabled: Boolean(child?.id),
    retry: false,
  });

  const bookings = useMemo(() => getMockBookings(), []);
  const appointment = useDemo ? DEMO_APPOINTMENT : bookings[0];

  const tasks = useDemo ? DEMO_TASKS : (carePathData?.tasks ?? []);
  const dayTasks = useMemo(() => {
    const withDue = tasks.filter((task) => task.dueDate);
    if (!withDue.length) return tasks;
    return tasks.filter((task) => {
      if (!task.dueDate) return selectedDay === today.getDay();
      const due = new Date(task.dueDate);
      return !Number.isNaN(due.getTime()) && due.getDay() === selectedDay;
    });
  }, [tasks, selectedDay, today]);

  const completedCount = useDemo
    ? 3
    : tasks.filter((task) => task.status === "completed").length;
  const totalCount = useDemo ? 4 : tasks.length;
  const percent = useDemo
    ? 75
    : totalCount
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => completeCarePathTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentCarePath"] });
    },
  });

  const skipMutation = useMutation({
    mutationFn: (taskId: string) => skipCarePathTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentCarePath"] });
    },
  });

  const displayChild = child ?? (useDemo ? DEMO_CHILD : undefined);
  const tags = useDemo ? DEMO_TAGS : displayChild ? childTags(displayChild, t) : [];
  const goals = useDemo ? DEMO_GOALS : weeklyGoalsText(child, t);
  const age = useDemo ? 6 : displayChild ? childAge(displayChild) : undefined;
  const loading = childrenLoading || (Boolean(child?.id) && planLoading);
  const initials = displayChild?.name?.trim()?.slice(0, 1) ?? "";

  const padX = ms(16);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.headerWash, { height: ms(86) }]} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          width: contentW,
          alignSelf: "center",
          paddingHorizontal: padX,
          paddingBottom: ms(120),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, { marginBottom: ms(14), minHeight: ms(40) }]}>
          <Pressable
            onPress={() => router.navigate("/(tabs)/home")}
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
          >
            <Ionicons name="chevron-back" size={ms(22)} color={colors.title} />
          </Pressable>
          <Text style={[styles.pageTitle, { fontSize: ms(22) }]}>خطة الطفل</Text>
        </View>

        <View style={[styles.card, { padding: ms(14), marginBottom: ms(12) }]}>
          {childrenLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : displayChild ? (
            <View style={styles.profileRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    width: ms(64),
                    height: ms(64),
                    borderRadius: ms(32),
                  },
                ]}
              >
                <Text style={[styles.avatarLetter, { fontSize: ms(24) }]}>{initials}</Text>
              </View>
              <View style={styles.profileMain}>
                <View style={styles.profileTop}>
                  <Pressable
                    onPress={() => {
                      if (useDemo) return;
                      router.push(`/(tabs)/profile/edit-child-profile?id=${displayChild.id}`);
                    }}
                    hitSlop={8}
                    accessibilityLabel="تعديل"
                  >
                    <Ionicons name="pencil-outline" size={ms(18)} color={colors.primary} />
                  </Pressable>
                  <View style={styles.profileText}>
                    <Text style={[styles.childName, { fontSize: ms(18) }]}>{displayChild.name}</Text>
                    <Text style={[styles.childAge, { fontSize: ms(13) }]}>
                      {age != null ? `${age} سنوات` : "العمر غير محدد"}
                    </Text>
                  </View>
                </View>
                {tags.length ? (
                  <View style={styles.tagsRow}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyInline}>لا توجد تصنيفات بعد</Text>
                )}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.emptyTitle}>لا يوجد ملف طفل</Text>
              <Text style={styles.emptyBody}>أضف ملف طفل لعرض الخطة الأسبوعية.</Text>
              <Pressable
                onPress={() => router.push("/(tabs)/profile/manage-children")}
                style={styles.emptyCta}
              >
                <Text style={styles.emptyCtaText}>إدارة الأطفال</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[styles.card, { padding: ms(14), marginBottom: ms(12) }]}>
          <View style={styles.sectionHead}>
            <View style={styles.dateChip}>
              <Ionicons name="calendar-outline" size={ms(14)} color={colors.primary} />
              <Text style={[styles.dateChipText, { fontSize: ms(12) }]}>
                {formatWeekRange(weekStart)}
              </Text>
            </View>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { fontSize: ms(16) }]}>الخطة الأسبوعية</Text>
              <Ionicons name="calendar" size={ms(16)} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.daysRow, { marginTop: ms(12), marginBottom: ms(14) }]}>
            {WEEK_DAYS.map((day) => {
              const selected = selectedDay === day.key;
              return (
                <Pressable
                  key={day.key}
                  onPress={() => setSelectedDay(day.key)}
                  style={[
                    styles.dayChip,
                    {
                      minHeight: ms(32),
                      paddingHorizontal: ms(8),
                    },
                    selected && styles.dayChipOn,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      { fontSize: ms(11) },
                      selected && styles.dayChipTextOn,
                    ]}
                    numberOfLines={1}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.goalsCard, { padding: ms(12), marginBottom: ms(16) }]}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>أهداف الأسبوع</Text>
              <Ionicons name="disc-outline" size={ms(16)} color={colors.primary} />
            </View>
            <View style={styles.goalsBody}>
              <Ionicons
                name="leaf-outline"
                size={ms(42)}
                color={colors.primary}
                style={{ opacity: 0.55 }}
              />
              <Text style={[styles.goalsText, { fontSize: ms(13), lineHeight: ms(22) }]}>
                {goals || "ستظهر أهداف طفلك هنا عند إضافتها في ملف الطفل."}
              </Text>
            </View>
          </View>

          <View style={[styles.tasksHead, { marginBottom: ms(10) }]}>
            <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>مهام اليوم</Text>
            <Ionicons name="checkbox" size={ms(16)} color={colors.primary} />
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : dayTasks.length ? (
            dayTasks.map((task) => {
              const helpful = helpfulnessLabel(task);
              const note = task.instructions || task.note;
              return (
                <View key={task.id} style={[styles.taskCard, { padding: ms(12), marginBottom: ms(10) }]}>
                  <View style={styles.taskTop}>
                    <View style={styles.taskStatusCol}>
                      {task.status === "completed" ? (
                        <View style={[styles.statusPill, styles.statusDone]}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.done} />
                          <Text style={[styles.statusText, { color: colors.done }]}>تم</Text>
                        </View>
                      ) : task.status === "skipped" ? (
                        <View style={[styles.statusPill, styles.statusSkip]}>
                          <Ionicons name="remove-circle-outline" size={14} color={colors.skip} />
                          <Text style={[styles.statusText, { color: colors.skip }]}>تخطي</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingActions}>
                          <Pressable
                            onPress={() => {
                              if (useDemo) return;
                              completeMutation.mutate(task.id);
                            }}
                            style={[styles.statusPill, styles.statusDone]}
                          >
                            <Ionicons name="checkmark-circle" size={14} color={colors.done} />
                            <Text style={[styles.statusText, { color: colors.done }]}>تم</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (useDemo) return;
                              skipMutation.mutate(task.id);
                            }}
                            style={[styles.statusPill, styles.statusSkip]}
                          >
                            <Ionicons name="remove-circle-outline" size={14} color={colors.skip} />
                            <Text style={[styles.statusText, { color: colors.skip }]}>تخطي</Text>
                          </Pressable>
                        </View>
                      )}
                      {helpful ? (
                        <View style={styles.helpfulRow}>
                          <Ionicons name="happy-outline" size={14} color={colors.primary} />
                          <Text style={styles.helpfulText}>{helpful}</Text>
                        </View>
                      ) : null}
                      {note && task.status === "skipped" ? (
                        <View style={styles.noteRow}>
                          <Ionicons name="document-text-outline" size={13} color={colors.muted} />
                          <Text style={styles.noteText} numberOfLines={2}>
                            {note}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.taskMain}>
                      <Text style={[styles.taskTitle, { fontSize: ms(14) }]}>{task.title}</Text>
                      {task.description ? (
                        <Text style={[styles.taskDesc, { fontSize: ms(12) }]} numberOfLines={2}>
                          {task.description}
                          {task.frequency ? ` • ${task.frequency}` : ""}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.taskIconWrap}>
                      <Ionicons name={taskIcon(task)} size={ms(18)} color={colors.primary} />
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={[styles.emptyBox, { marginBottom: ms(10) }]}>
              <Text style={styles.emptyBody}>لا توجد مهام لهذا اليوم بعد.</Text>
            </View>
          )}

          <View style={[styles.taskCard, { padding: ms(12), marginBottom: ms(14) }]}>
            <View style={styles.taskTop}>
              <Pressable
                onPress={() => router.navigate("/(tabs)/bookings")}
                style={styles.detailsLink}
                accessibilityRole="button"
                accessibilityLabel="عرض التفاصيل"
              >
                <Ionicons name="chevron-back" size={16} color={colors.primary} />
                <Text style={styles.detailsLinkText}>عرض التفاصيل</Text>
              </Pressable>
              <View style={styles.taskMain}>
                <Text style={[styles.taskTitle, { fontSize: ms(14) }]}>مواعيد الطبيب</Text>
                {appointment ? (
                  <>
                    <Text style={styles.taskDesc}>{appointment.listingName}</Text>
                    <Text style={styles.taskDesc}>
                      {appointment.dateLabel}
                      {appointment.timeLabel ? ` • ${appointment.timeLabel}` : ""}
                    </Text>
                    {appointment.notes ? (
                      <Text style={styles.taskDesc}>{appointment.notes}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.taskDesc}>لا توجد مواعيد محفوظة حالياً.</Text>
                )}
              </View>
              <View style={styles.taskIconWrap}>
                <Ionicons name="calendar-outline" size={ms(18)} color={colors.primary} />
              </View>
            </View>
          </View>

          <View style={styles.bottomStats}>
            <View style={styles.progressBlock}>
              <View style={styles.progressLabelRow}>
                <Ionicons name="stats-chart-outline" size={16} color={colors.primary} />
                <Text style={styles.progressLabel}>نسبة التقدم هذا الأسبوع</Text>
              </View>
              <Text style={[styles.percent, { fontSize: ms(22) }]}>{percent}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/plan/progress")}
              style={styles.evalBlock}
            >
              <View style={styles.evalTitleRow}>
                <Ionicons name="star-outline" size={16} color={colors.primary} />
                <Text style={styles.evalTitle}>تقييم الأسبوع</Text>
                <Ionicons name="chevron-back" size={14} color={colors.muted} />
              </View>
              <Text style={styles.evalMeta}>
                {totalCount
                  ? `أكمل ${completedCount} من أصل ${totalCount} مهام`
                  : "لا يوجد تقييم بعد"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/plan/check-in")}
          style={({ pressed }) => [
            styles.card,
            styles.updateCard,
            { padding: ms(14) },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { fontSize: ms(14) }]}>
              التحديث التلقائي للخطة القادمة
            </Text>
            <Text style={[styles.taskDesc, { marginTop: 4 }]}>
              سيتم تعديل الخطة الأسبوعية بناءً على تقدم طفلك
            </Text>
          </View>
          <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.headerWash,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  scroll: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    flex: 1,
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "700",
    color: colors.title,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#6F80B4",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: colors.primary,
    fontWeight: "700",
  },
  profileMain: {
    flex: 1,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  profileText: {
    flex: 1,
    alignItems: "flex-end",
  },
  childName: {
    fontWeight: "700",
    color: colors.titleDark,
    writingDirection: "rtl",
    textAlign: "right",
  },
  childAge: {
    color: colors.muted,
    marginTop: 2,
    writingDirection: "rtl",
    textAlign: "right",
  },
  tagsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontWeight: "700",
    color: colors.titleDark,
    writingDirection: "rtl",
    textAlign: "right",
  },
  dateChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  dateChipText: {
    color: colors.primary,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  daysRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 4,
  },
  dayChip: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.chipIdle,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipOn: {
    backgroundColor: colors.primary,
  },
  dayChipText: {
    color: colors.primary,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  dayChipTextOn: {
    color: colors.white,
  },
  goalsCard: {
    backgroundColor: "#F7F8FD",
    borderRadius: 18,
  },
  goalsBody: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  goalsText: {
    flex: 1,
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
  },
  tasksHead: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  taskTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  taskIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  taskMain: {
    flex: 1,
    alignItems: "flex-end",
  },
  taskTitle: {
    fontWeight: "700",
    color: colors.titleDark,
    textAlign: "right",
    writingDirection: "rtl",
  },
  taskDesc: {
    color: colors.muted,
    marginTop: 3,
    textAlign: "right",
    writingDirection: "rtl",
  },
  taskStatusCol: {
    alignItems: "flex-start",
    gap: 6,
    maxWidth: 92,
  },
  statusPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDone: {
    backgroundColor: colors.doneBg,
  },
  statusSkip: {
    backgroundColor: colors.skipBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  pendingActions: {
    gap: 4,
  },
  helpfulRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  helpfulText: {
    fontSize: 11,
    color: colors.primary,
    writingDirection: "rtl",
  },
  noteRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 10,
    color: colors.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailsLink: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 2,
  },
  detailsLinkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  bottomStats: {
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "flex-end",
  },
  progressBlock: {
    flex: 1.2,
  },
  progressLabelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  progressLabel: {
    color: colors.body,
    fontSize: 12,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  percent: {
    color: colors.titleDark,
    fontWeight: "800",
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
    flexDirection: "row-reverse",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.progressFill,
    borderRadius: 999,
  },
  evalBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  evalTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  evalTitle: {
    color: colors.body,
    fontSize: 12,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  evalMeta: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "right",
    writingDirection: "rtl",
  },
  updateCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.titleDark,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  emptyInline: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  emptyCta: {
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyCtaText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: "#F7F8FD",
    borderRadius: 14,
    padding: 12,
  },
  pressed: {
    opacity: 0.85,
  },
});
