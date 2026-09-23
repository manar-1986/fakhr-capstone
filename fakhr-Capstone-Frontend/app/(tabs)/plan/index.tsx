import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
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
import { knownText } from "../../../utils/knownText";
import { colors as palette } from "../../../theme";

const CHILD_PHOTO = require("../../../assets/images/home-hero-girl.png");

const colors = {
  bg: "#EEF1F8",
  headerWash: "#E4E9F6",
  blob: "#D7DEF0",
  blobSoft: "#E8ECF7",
  title: "#3D4A86",
  titleDark: "#3D4A78",
  muted: palette.textMuted,
  body: "#5A6490",
  primary: palette.primary,
  primarySoft: "#EEF1FA",
  white: palette.white,
  cardBorder: "#E6EAF4",
  chipIdle: "#F2F4FA",
  done: "#3DCE8A",
  doneBg: "#E7F8F0",
  skip: "#9AA0B8",
  skipBg: "#F1F2F6",
  progressTrack: "#E4E8F2",
  progressFill: palette.brandSoft,
};

const DESIGN_W = 390;

const WEEK_DAYS = [
  { key: 6, labelKey: "planUi.sat" },
  { key: 0, labelKey: "planUi.sun" },
  { key: 1, labelKey: "planUi.mon" },
  { key: 2, labelKey: "planUi.tue" },
  { key: 3, labelKey: "planUi.wed" },
  { key: 4, labelKey: "planUi.thu" },
  { key: 5, labelKey: "planUi.fri" },
] as const;

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

function formatWeekRange(start: Date, months: string[]): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const month = months[end.getMonth()] ?? "";
  return `${start.getDate()} - ${end.getDate()} ${month}`;
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
    tags.push(knownText(t, mapped || raw));
  });
  asIdList(child.areasOfFocus).forEach((id) => {
    const mapped = TAG_BY_FOCUS[id];
    if (mapped) tags.push(knownText(t, mapped));
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
    .join(", ");
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

function helpfulnessLabel(task: CarePathTask, t: (key: string) => string): string | null {
  const hay = `${task.note ?? ""} ${task.expectedOutcome ?? ""}`.toLowerCase();
  if (hay.includes("very") || hay.includes("جدا")) return t("copy.veryHelpful");
  if (hay.includes("helpful") || hay.includes("مفيد")) return t("copy.helpful");
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
  "تحسين مهارات التواصل، وزيادة التركيز على المهام اليومية، وتعزيز الاستقلالية.";

const DEMO_TASKS: CarePathTask[] = [
  {
    id: "demo-task-speech",
    title: "تمرين النطق",
    description: "التمرين لمدة 10 دقائق",
    category: "speech",
    status: "completed",
    expectedOutcome: "مفيد جداً",
  },
  {
    id: "demo-task-play",
    title: "لعب تفاعلي",
    description: "اللعب بالمكعبات لمدة 15 دقيقة",
    category: "play",
    status: "skipped",
    note: "كان متعب اليوم",
    instructions: "كان متعب اليوم",
  },
  {
    id: "demo-task-sensory",
    title: "نشاط حسي",
    description: "استخدام كرة الضغط لمدة 5 دقائق",
    category: "sensory",
    status: "completed",
    expectedOutcome: "مفيد",
  },
];

const DEMO_APPOINTMENT = {
  listingName: "د. أحمد – علاج وظيفي",
  dateLabel: "الأحد 20 سبتمبر",
  timeLabel: "5:00 مساءً",
  notes: "",
};

export default function PlanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const months = (t("planUi.months", { returnObjects: true }) as string[]) ?? [];
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
  const tags = useDemo
    ? DEMO_TAGS.map((tag) => knownText(t, tag))
    : displayChild
      ? childTags(displayChild, t)
      : [];
  const goals = useDemo ? knownText(t, DEMO_GOALS) : weeklyGoalsText(child, t);
  const age = useDemo ? 6 : displayChild ? childAge(displayChild) : undefined;
  const loading = childrenLoading || (Boolean(child?.id) && planLoading);
  const initials = displayChild?.name?.trim()?.slice(0, 1) ?? "";

  const padX = ms(16);
  const avatarSize = ms(68);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.headerWash, { height: ms(168) }]} />
        <View
          style={[
            styles.blob,
            {
              width: ms(220),
              height: ms(220),
              borderRadius: ms(110),
              top: ms(-78),
              right: ms(-70),
              backgroundColor: colors.blob,
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              width: ms(160),
              height: ms(160),
              borderRadius: ms(80),
              top: ms(-36),
              left: ms(-58),
              backgroundColor: colors.blobSoft,
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          width: contentW,
          alignSelf: "center",
          paddingHorizontal: padX,
          paddingBottom: ms(168),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, { marginTop: ms(4), marginBottom: ms(16), minHeight: ms(44) }]}>
          <Pressable
            onPress={() => router.navigate("/(tabs)/home")}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backBtn,
              { width: ms(36), height: ms(36), borderRadius: ms(18) },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Ionicons name="chevron-back" size={ms(20)} color={colors.titleDark} />
          </Pressable>
          <Text style={[styles.pageTitle, { fontSize: ms(24) }]}>{t("ui.childPlan")}</Text>
        </View>

        <View
          style={[
            styles.card,
            styles.profileCard,
            { padding: ms(16), marginBottom: ms(14), borderRadius: ms(24) },
          ]}
        >
          {childrenLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : displayChild ? (
            <View style={styles.profileRow}>
              <View
                style={[
                  styles.avatarRing,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    borderWidth: ms(3),
                  },
                ]}
              >
                {useDemo ? (
                  <Image source={CHILD_PHOTO} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={[styles.avatarLetter, { fontSize: ms(24) }]}>{initials}</Text>
                  </View>
                )}
              </View>
              <View style={styles.profileMain}>
                <View style={styles.profileTop}>
                  <Pressable
                    onPress={() => {
                      if (useDemo) return;
                      router.push(`/(tabs)/profile/edit-child-profile?id=${displayChild.id}`);
                    }}
                    hitSlop={8}
                    style={styles.editBtn}
                    accessibilityLabel={t("ui.edit")}
                  >
                    <Ionicons name="pencil-outline" size={ms(18)} color={colors.primary} />
                  </Pressable>
                  <View style={styles.profileText}>
                    <Text style={[styles.childName, { fontSize: ms(20) }]}>{displayChild.name}</Text>
                    <Text style={[styles.childAge, { fontSize: ms(13) }]}>
                      {age != null ? t("ui.years", { count: age }) : t("ui.ageUnknown")}
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
                  <Text style={styles.emptyInline}>{t("copy.noTagsYet")}</Text>
                )}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.emptyTitle}>{t("copy.noChildProfile")}</Text>
              <Text style={styles.emptyBody}>{t("copy.addChildForPlan")}</Text>
              <Pressable
                onPress={() => router.push("/(tabs)/profile/manage-children")}
                style={styles.emptyCta}
              >
                <Text style={styles.emptyCtaText}>{t("copy.manageChildren")}</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[styles.card, { padding: ms(16), marginBottom: ms(14), borderRadius: ms(24) }]}>
          <View style={styles.sectionHead}>
            <View style={styles.dateChip}>
              <Ionicons name="calendar-outline" size={ms(14)} color={colors.primary} />
              <Text style={[styles.dateChipText, { fontSize: ms(12) }]}>
                {formatWeekRange(weekStart, months)}
              </Text>
            </View>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar" size={ms(16)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { fontSize: ms(16) }]}>{t("planUi.weeklyPlan")}</Text>
            </View>
          </View>

          <View style={[styles.daysRow, { marginTop: ms(14), marginBottom: ms(16) }]}>
            {WEEK_DAYS.map((day) => {
              const selected = selectedDay === day.key;
              return (
                <Pressable
                  key={day.key}
                  onPress={() => setSelectedDay(day.key)}
                  style={[
                    styles.dayChip,
                    {
                      minHeight: ms(34),
                      paddingHorizontal: ms(4),
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
                    {t(day.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.goalsCard, { padding: ms(14), marginBottom: ms(18), borderRadius: ms(18) }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="disc-outline" size={ms(16)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>{t("planUi.weeklyGoals")}</Text>
            </View>
            <View style={styles.goalsBody}>
              <Text style={[styles.goalsText, { fontSize: ms(13), lineHeight: ms(22) }]}>
                {goals || t("ui.childGoalsPlaceholder")}
              </Text>
              <View style={[styles.plantWrap, { width: ms(72), height: ms(72) }]}>
                <Ionicons name="leaf" size={ms(28)} color={colors.primary} style={{ opacity: 0.35 }} />
                <Ionicons
                  name="leaf-outline"
                  size={ms(40)}
                  color={colors.primary}
                  style={{ opacity: 0.7, marginTop: -8 }}
                />
              </View>
            </View>
          </View>

          <View style={[styles.tasksHead, { marginBottom: ms(12) }]}>
            <Ionicons name="checkbox" size={ms(16)} color={colors.primary} />
            <Text style={[styles.sectionTitle, { fontSize: ms(15) }]}>{t("copy.todaysTasks")}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : dayTasks.length ? (
            dayTasks.map((task) => {
              const helpful = helpfulnessLabel(task, t);
              const note = knownText(t, task.instructions || task.note);
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    { padding: ms(14), marginBottom: ms(10), borderRadius: ms(18) },
                  ]}
                >
                  <View style={styles.taskTop}>
                    <View style={[styles.taskStatusCol, { maxWidth: ms(108) }]}>
                      {task.status === "completed" ? (
                        <View style={[styles.statusPill, styles.statusDone]}>
                          <Ionicons name="checkmark-circle" size={15} color={colors.done} />
                          <Text style={[styles.statusText, { color: colors.done }]}>{t("copy.done")}</Text>
                        </View>
                      ) : task.status === "skipped" ? (
                        <View style={[styles.statusPill, styles.statusSkip]}>
                          <Ionicons name="remove-circle-outline" size={15} color={colors.skip} />
                          <Text style={[styles.statusText, { color: colors.skip }]}>{t("copy.skip")}</Text>
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
                            <Ionicons name="checkmark-circle" size={15} color={colors.done} />
                            <Text style={[styles.statusText, { color: colors.done }]}>{t("copy.done")}</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (useDemo) return;
                              skipMutation.mutate(task.id);
                            }}
                            style={[styles.statusPill, styles.statusSkip]}
                          >
                            <Ionicons name="remove-circle-outline" size={15} color={colors.skip} />
                            <Text style={[styles.statusText, { color: colors.skip }]}>{t("copy.skip")}</Text>
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
                      <Text style={[styles.taskTitle, { fontSize: ms(15) }]}>{knownText(t, task.title)}</Text>
                      {task.description ? (
                        <Text style={[styles.taskDesc, { fontSize: ms(12) }]} numberOfLines={2}>
                          {knownText(t, task.description)}
                          {task.frequency ? ` • ${knownText(t, task.frequency)}` : ""}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.taskIconWrap,
                        { width: ms(40), height: ms(40), borderRadius: ms(14) },
                      ]}
                    >
                      <Ionicons name={taskIcon(task)} size={ms(18)} color={colors.primary} />
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={[styles.emptyBox, { marginBottom: ms(10) }]}>
              <Text style={styles.emptyBody}>{t("ui.noTasksToday")}</Text>
            </View>
          )}

          <View
            style={[
              styles.taskCard,
              { padding: ms(14), marginBottom: ms(18), borderRadius: ms(18) },
            ]}
          >
            <View style={styles.taskTop}>
              <Pressable
                onPress={() => router.navigate("/(tabs)/bookings")}
                style={styles.detailsLink}
                accessibilityRole="button"
                accessibilityLabel={t("ui.viewDetails")}
              >
                <Ionicons name="chevron-back" size={16} color={colors.primary} />
                <Text style={styles.detailsLinkText}>{t("ui.viewDetails")}</Text>
              </Pressable>
              <View style={styles.taskMain}>
                <Text style={[styles.taskTitle, { fontSize: ms(15) }]}>{t("copy.doctorAppointments")}</Text>
                {appointment ? (
                  <>
                    <Text style={styles.taskDesc}>{knownText(t, appointment.listingName)}</Text>
                    <Text style={styles.taskDesc}>
                      {knownText(t, appointment.dateLabel)}
                      {appointment.timeLabel ? ` • ${knownText(t, appointment.timeLabel)}` : ""}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.taskDesc}>{t("copy.noSavedAppointments")}</Text>
                )}
              </View>
              <View
                style={[
                  styles.taskIconWrap,
                  { width: ms(40), height: ms(40), borderRadius: ms(14) },
                ]}
              >
                <Ionicons name="calendar-outline" size={ms(18)} color={colors.primary} />
              </View>
            </View>
          </View>

          <View style={styles.bottomStats}>
            <Pressable
              onPress={() => router.push("/(tabs)/plan/progress")}
              style={styles.evalBlock}
            >
              <View style={styles.evalTitleRow}>
                <Ionicons name="star-outline" size={16} color={colors.primary} />
                <Text style={styles.evalTitle}>{t("planUi.weeklyEval")}</Text>
                <Ionicons name="chevron-back" size={14} color={colors.muted} />
              </View>
              <Text style={styles.evalMeta}>
                {totalCount
                  ? t("planUi.completedOf", { done: completedCount, total: totalCount })
                  : t("ui.noRatingYet")}
              </Text>
            </Pressable>
            <View style={styles.progressBlock}>
              <View style={styles.progressLabelRow}>
                <Ionicons name="stats-chart-outline" size={16} color={colors.primary} />
                <Text style={styles.progressLabel}>{t("copy.weekProgress")}</Text>
              </View>
              <Text style={[styles.percent, { fontSize: ms(22) }]}>{percent}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/plan/check-in")}
          style={({ pressed }) => [
            styles.card,
            styles.updateCard,
            { padding: ms(16), borderRadius: ms(22) },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { fontSize: ms(14) }]}>
              {t("copy.autoUpdateTitle")}
            </Text>
            <Text style={[styles.taskDesc, { marginTop: 4 }]}>
              {t("copy.autoUpdateBody")}
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
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  blob: {
    position: "absolute",
    opacity: 0.9,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
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
    borderRadius: 24,
    shadowColor: "#6E7CAF",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  profileCard: {
    backgroundColor: colors.white,
  },
  profileRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  avatarRing: {
    overflow: "hidden",
    borderColor: colors.primarySoft,
    backgroundColor: colors.primarySoft,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
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
  editBtn: {
    paddingTop: 2,
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
    alignItems: "center",
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
    backgroundColor: colors.primarySoft,
  },
  goalsBody: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  plantWrap: {
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#6E7CAF",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  taskTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  taskIconWrap: {
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
    minWidth: 76,
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
    flexShrink: 1,
    fontSize: 10,
    color: colors.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 76,
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
    flex: 1.25,
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
    textAlign: "left",
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
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 12,
  },
  pressed: {
    opacity: 0.85,
  },
});
