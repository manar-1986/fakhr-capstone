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
import { planLocaleText } from "../../../utils/planBilingual";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
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
  speech: "copy.tagCommunication",
  behavior: "copy.tagBehavior",
  sensory: "copy.tagSensory",
  motor: "copy.tagDelay",
};

const DIAGNOSIS_KEY: Record<string, string> = {
  autism: "copy.tagAutism",
  asd: "copy.tagAutism",
  adhd: "copy.tagAdhd",
  speech: "copy.tagCommunication",
  sensory: "copy.tagSensory",
  behavior: "copy.tagBehavior",
  developmental: "copy.tagDelay",
  delay: "copy.tagDelay",
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

function formatAppointmentDate(
  appointment: {
    dateKey?: string;
    dateLabel?: string;
    dateLabelAr?: string;
    dateLabelEn?: string;
  },
  isRTL: boolean,
  t: (key: string) => string,
): string {
  if (appointment.dateKey) {
    const parsed = new Date(appointment.dateKey);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString(isRTL ? "ar-KW" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }
  return planLocaleText(
    isRTL,
    {
      ar: appointment.dateLabelAr,
      en: appointment.dateLabelEn,
      legacy: appointment.dateLabel,
    },
    t,
  );
}

function childAge(child: Child): number | undefined {
  if (typeof child.age === "number" && Number.isFinite(child.age)) {
    return child.age;
  }
  const dob = parseStoredDate(child.dateOfBirth);
  return dob ? ageFromDate(dob) : undefined;
}

function childTags(child: Child, t: (key: string) => string, isRTL: boolean): string[] {
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
    const mapped = DIAGNOSIS_KEY[raw.toLowerCase()];
    tags.push(mapped ? t(mapped) : planLocaleText(isRTL, { legacy: raw }, t));
  });
  asIdList(child.areasOfFocus).forEach((id) => {
    const mapped = TAG_BY_FOCUS[id];
    if (mapped) tags.push(t(mapped));
    else {
      const area = FOCUS_AREAS.find((f) => f.id === id);
      tags.push(area ? t(area.labelKey) : planLocaleText(isRTL, { legacy: id }, t));
    }
  });
  return [...new Set(tags)].slice(0, 4);
}

function weeklyGoalsText(child: Child | undefined, t: (key: string) => string, isRTL: boolean): string {
  if (!child) return "";
  const ids = asIdList(child.supportGoals);
  if (!ids.length) {
    return planLocaleText(
      isRTL,
      {
        ar: child.medicalHistoryAr,
        en: child.medicalHistoryEn,
        legacy: child.medicalHistory?.trim(),
      },
      t,
    );
  }
  return ids
    .map((id) => {
      const goal = SUPPORT_GOALS.find((g) => g.id === id);
      return goal ? t(goal.labelKey) : planLocaleText(isRTL, { legacy: id }, t);
    })
    .join(isRTL ? "، " : ", ");
}

function taskLocale(
  isRTL: boolean,
  t: (key: string) => string,
  ar?: string,
  en?: string,
  legacy?: string,
) {
  return planLocaleText(isRTL, { ar, en, legacy }, t);
}

function taskIcon(task: CarePathTask): React.ComponentProps<typeof Ionicons>["name"] {
  const hay = `${task.category ?? ""} ${task.title} ${task.titleAr ?? ""} ${task.titleEn ?? ""}`.toLowerCase();
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

function helpfulnessLabel(
  task: CarePathTask,
  t: (key: string) => string,
  isRTL: boolean,
): string | null {
  const hay = [
    taskLocale(isRTL, t, task.noteAr, task.noteEn, task.note),
    taskLocale(isRTL, t, task.expectedOutcomeAr, task.expectedOutcomeEn, task.expectedOutcome),
    task.note,
    task.expectedOutcome,
  ]
    .join(" ")
    .toLowerCase();
  if (hay.includes("very") || hay.includes("جدا")) return t("copy.veryHelpful");
  if (hay.includes("helpful") || hay.includes("مفيد")) return t("copy.helpful");
  return null;
}

/** Visual-only fallback when the account has no child profile yet. */
const DEMO_CHILD: Child = {
  id: "demo-visual-child",
  name: "محمد",
  nameAr: "محمد",
  nameEn: "Mohammed",
  age: 6,
  parentId: "demo-visual",
};

const DEMO_TAGS = [
  { ar: "تأخر نمائي", en: "Developmental delay", key: "copy.tagDelay" },
  { ar: "تواصل", en: "Communication", key: "copy.tagCommunication" },
  { ar: "حسي", en: "Sensory", key: "copy.tagSensory" },
  { ar: "سلوكي", en: "Behavior", key: "copy.tagBehavior" },
];

const DEMO_GOALS_AR =
  "تحسين مهارات التواصل، وزيادة التركيز على المهام اليومية، وتعزيز الاستقلالية.";
const DEMO_GOALS_EN =
  "Improve communication skills, increase focus on daily tasks, and build independence.";

const DEMO_TASKS: CarePathTask[] = [
  {
    id: "demo-task-speech",
    title: "تمرين النطق",
    titleAr: "تمرين النطق",
    titleEn: "Speech exercise",
    description: "التمرين لمدة 10 دقائق",
    descriptionAr: "التمرين لمدة 10 دقائق",
    descriptionEn: "Practice for 10 minutes",
    category: "speech",
    status: "completed",
    expectedOutcome: "مفيد جداً",
    expectedOutcomeAr: "مفيد جداً",
    expectedOutcomeEn: "Very helpful",
  },
  {
    id: "demo-task-play",
    title: "لعب تفاعلي",
    titleAr: "لعب تفاعلي",
    titleEn: "Interactive play",
    description: "اللعب بالمكعبات لمدة 15 دقيقة",
    descriptionAr: "اللعب بالمكعبات لمدة 15 دقيقة",
    descriptionEn: "Play with blocks for 15 minutes",
    category: "play",
    status: "skipped",
    note: "كان متعب اليوم",
    noteAr: "كان متعب اليوم",
    noteEn: "Felt tired today",
    instructions: "كان متعب اليوم",
    instructionsAr: "كان متعب اليوم",
    instructionsEn: "Felt tired today",
  },
  {
    id: "demo-task-sensory",
    title: "نشاط حسي",
    titleAr: "نشاط حسي",
    titleEn: "Sensory activity",
    description: "استخدام كرة الضغط لمدة 5 دقائق",
    descriptionAr: "استخدام كرة الضغط لمدة 5 دقائق",
    descriptionEn: "Use a squeeze ball for 5 minutes",
    category: "sensory",
    status: "completed",
    expectedOutcome: "مفيد",
    expectedOutcomeAr: "مفيد",
    expectedOutcomeEn: "Helpful",
  },
];

const DEMO_APPOINTMENT = {
  listingName: "د. أحمد – علاج وظيفي",
  listingNameAr: "د. أحمد – علاج وظيفي",
  listingNameEn: "Dr. Ahmad – occupational therapy",
  dateLabel: "الأحد 20 سبتمبر",
  dateLabelAr: "الأحد 20 سبتمبر",
  dateLabelEn: "Sunday 20 September",
  timeLabel: "5:00 مساءً",
  timeLabelAr: "5:00 مساءً",
  timeLabelEn: "5:00 PM",
  notes: "",
};

export default function PlanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, dir, align } = useI18nLayout();
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
    ? DEMO_TAGS.map((tag) => t(tag.key))
    : displayChild
      ? childTags(displayChild, t, isRTL)
      : [];
  const goals = useDemo
    ? planLocaleText(isRTL, { ar: DEMO_GOALS_AR, en: DEMO_GOALS_EN, legacy: DEMO_GOALS_AR }, t)
    : weeklyGoalsText(child, t, isRTL);
  const childDisplayName = displayChild
    ? planLocaleText(
        isRTL,
        {
          ar: displayChild.nameAr,
          en: displayChild.nameEn,
          legacy: displayChild.name,
        },
        t,
        { allowArabicInEnglish: true },
      )
    : "";
  const age = useDemo ? 6 : displayChild ? childAge(displayChild) : undefined;
  const loading = childrenLoading || (Boolean(child?.id) && planLoading);
  const initials = childDisplayName.trim()?.slice(0, 1) ?? "";

  const padX = ms(16);
  const avatarSize = ms(68);

  return (
    <SafeAreaView style={[styles.safe, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
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
          <Text style={[styles.pageTitle, { fontSize: ms(24), textAlign: align, writingDirection: dir }]}>{t("ui.childPlan")}</Text>
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
            <View style={[styles.profileRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
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
                  <View style={[styles.profileText, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                    <Text style={[styles.childName, { fontSize: ms(20), textAlign: align, writingDirection: dir }]}>{childDisplayName}</Text>
                    <Text style={[styles.childAge, { fontSize: ms(13), textAlign: align, writingDirection: dir }]}>
                      {age != null ? t("ui.years", { count: age }) : t("ui.ageUnknown")}
                    </Text>
                  </View>
                </View>
                {tags.length ? (
                  <View style={[styles.tagsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={[styles.tagText, { writingDirection: dir }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptyInline, { textAlign: align, writingDirection: dir }]}>{t("copy.noTagsYet")}</Text>
                )}
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.emptyTitle, { textAlign: align, writingDirection: dir }]}>{t("copy.noChildProfile")}</Text>
              <Text style={[styles.emptyBody, { textAlign: align, writingDirection: dir }]}>{t("copy.addChildForPlan")}</Text>
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
          <View style={[styles.sectionHead, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
            <View style={[styles.dateChip, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="calendar-outline" size={ms(14)} color={colors.primary} />
              <Text style={[styles.dateChipText, { fontSize: ms(12), writingDirection: dir }]}>
                {formatWeekRange(weekStart, months)}
              </Text>
            </View>
            <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="calendar" size={ms(16)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { fontSize: ms(16), textAlign: align, writingDirection: dir }]}>{t("planUi.weeklyPlan")}</Text>
            </View>
          </View>

          <View style={[styles.daysRow, { marginTop: ms(14), marginBottom: ms(16), flexDirection: isRTL ? "row-reverse" : "row" }]}>
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
                      { fontSize: ms(11), writingDirection: dir },
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
            <View style={[styles.sectionTitleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Ionicons name="disc-outline" size={ms(16)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { fontSize: ms(15), textAlign: align, writingDirection: dir }]}>{t("planUi.weeklyGoals")}</Text>
            </View>
            <View style={[styles.goalsBody, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={[styles.goalsText, { fontSize: ms(13), lineHeight: ms(22), textAlign: align, writingDirection: dir }]}>
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

          <View style={[styles.tasksHead, { marginBottom: ms(12), flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Ionicons name="checkbox" size={ms(16)} color={colors.primary} />
            <Text style={[styles.sectionTitle, { fontSize: ms(15), textAlign: align, writingDirection: dir }]}>{t("copy.todaysTasks")}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : dayTasks.length ? (
            dayTasks.map((task) => {
              const helpful = helpfulnessLabel(task, t, isRTL);
              const note = taskLocale(
                isRTL,
                t,
                task.instructionsAr || task.noteAr,
                task.instructionsEn || task.noteEn,
                task.instructions || task.note,
              );
              const title = taskLocale(isRTL, t, task.titleAr, task.titleEn, task.title);
              const description = taskLocale(
                isRTL,
                t,
                task.descriptionAr,
                task.descriptionEn,
                task.description,
              );
              const frequency = taskLocale(isRTL, t, task.frequencyAr, task.frequencyEn, task.frequency);
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    { padding: ms(14), marginBottom: ms(10), borderRadius: ms(18) },
                  ]}
                >
                  <View style={[styles.taskTop, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
                    <View style={[styles.taskStatusCol, { maxWidth: ms(108), alignItems: isRTL ? "flex-start" : "flex-end" }]}>
                      {task.status === "completed" ? (
                        <View style={[styles.statusPill, styles.statusDone, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Ionicons name="checkmark-circle" size={15} color={colors.done} />
                          <Text style={[styles.statusText, { color: colors.done, writingDirection: dir }]}>{t("copy.done")}</Text>
                        </View>
                      ) : task.status === "skipped" ? (
                        <View style={[styles.statusPill, styles.statusSkip, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Ionicons name="remove-circle-outline" size={15} color={colors.skip} />
                          <Text style={[styles.statusText, { color: colors.skip, writingDirection: dir }]}>{t("copy.skip")}</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingActions}>
                          <Pressable
                            onPress={() => {
                              if (useDemo) return;
                              completeMutation.mutate(task.id);
                            }}
                            style={[styles.statusPill, styles.statusDone, { flexDirection: isRTL ? "row-reverse" : "row" }]}
                          >
                            <Ionicons name="checkmark-circle" size={15} color={colors.done} />
                            <Text style={[styles.statusText, { color: colors.done, writingDirection: dir }]}>{t("copy.done")}</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (useDemo) return;
                              skipMutation.mutate(task.id);
                            }}
                            style={[styles.statusPill, styles.statusSkip, { flexDirection: isRTL ? "row-reverse" : "row" }]}
                          >
                            <Ionicons name="remove-circle-outline" size={15} color={colors.skip} />
                            <Text style={[styles.statusText, { color: colors.skip, writingDirection: dir }]}>{t("copy.skip")}</Text>
                          </Pressable>
                        </View>
                      )}
                      {helpful ? (
                        <View style={[styles.helpfulRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Ionicons name="happy-outline" size={14} color={colors.primary} />
                          <Text style={[styles.helpfulText, { writingDirection: dir }]}>{helpful}</Text>
                        </View>
                      ) : null}
                      {note && task.status === "skipped" ? (
                        <View style={[styles.noteRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                          <Ionicons name="document-text-outline" size={13} color={colors.muted} />
                          <Text style={[styles.noteText, { textAlign: align, writingDirection: dir }]} numberOfLines={2}>
                            {note}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={[styles.taskMain, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                      <Text style={[styles.taskTitle, { fontSize: ms(15), textAlign: align, writingDirection: dir }]}>{title}</Text>
                      {description ? (
                        <Text style={[styles.taskDesc, { fontSize: ms(12), textAlign: align, writingDirection: dir }]} numberOfLines={2}>
                          {description}
                          {frequency ? ` • ${frequency}` : ""}
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
              <Text style={[styles.emptyBody, { textAlign: align, writingDirection: dir }]}>{t("ui.noTasksToday")}</Text>
            </View>
          )}

          <View
            style={[
              styles.taskCard,
              { padding: ms(14), marginBottom: ms(18), borderRadius: ms(18) },
            ]}
          >
            <View style={[styles.taskTop, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
              <Pressable
                onPress={() => router.navigate("/(tabs)/bookings")}
                style={[styles.detailsLink, { flexDirection: isRTL ? "row" : "row-reverse" }]}
                accessibilityRole="button"
                accessibilityLabel={t("ui.viewDetails")}
              >
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.primary} />
                <Text style={[styles.detailsLinkText, { writingDirection: dir }]}>{t("ui.viewDetails")}</Text>
              </Pressable>
              <View style={[styles.taskMain, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                <Text style={[styles.taskTitle, { fontSize: ms(15), textAlign: align, writingDirection: dir }]}>{t("copy.doctorAppointments")}</Text>
                {appointment ? (
                  <>
                    <Text style={[styles.taskDesc, { textAlign: align, writingDirection: dir }]}>
                      {planLocaleText(
                        isRTL,
                        {
                          ar: appointment.listingNameAr,
                          en: appointment.listingNameEn,
                          legacy: appointment.listingName,
                        },
                        t,
                      )}
                    </Text>
                    <Text style={[styles.taskDesc, { textAlign: align, writingDirection: dir }]}>
                      {formatAppointmentDate(appointment, isRTL, t)}
                      {appointment.timeLabel || appointment.timeLabelEn || appointment.timeLabelAr
                        ? ` • ${planLocaleText(
                            isRTL,
                            {
                              ar: appointment.timeLabelAr,
                              en: appointment.timeLabelEn,
                              legacy: appointment.timeLabel,
                            },
                            t,
                          )}`
                        : ""}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.taskDesc, { textAlign: align, writingDirection: dir }]}>{t("copy.noSavedAppointments")}</Text>
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

          <View style={[styles.bottomStats, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Pressable
              onPress={() => router.push("/(tabs)/plan/progress")}
              style={[styles.evalBlock, { alignItems: isRTL ? "flex-end" : "flex-start" }]}
            >
              <View style={[styles.evalTitleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Ionicons name="star-outline" size={16} color={colors.primary} />
                <Text style={[styles.evalTitle, { writingDirection: dir }]}>{t("planUi.weeklyEval")}</Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={14} color={colors.muted} />
              </View>
              <Text style={[styles.evalMeta, { textAlign: align, writingDirection: dir }]}>
                {totalCount
                  ? t("planUi.completedOf", { done: completedCount, total: totalCount })
                  : t("ui.noRatingYet")}
              </Text>
            </Pressable>
            <View style={styles.progressBlock}>
              <View style={[styles.progressLabelRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <Ionicons name="stats-chart-outline" size={16} color={colors.primary} />
                <Text style={[styles.progressLabel, { writingDirection: dir }]}>{t("copy.weekProgress")}</Text>
              </View>
              <Text style={[styles.percent, { fontSize: ms(22), textAlign: isRTL ? "left" : "right", writingDirection: dir }]}>{percent}%</Text>
              <View style={[styles.progressTrack, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
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
            { padding: ms(16), borderRadius: ms(22), flexDirection: isRTL ? "row-reverse" : "row" },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { fontSize: ms(14), textAlign: align, writingDirection: dir }]}>
              {t("copy.autoUpdateTitle")}
            </Text>
            <Text style={[styles.taskDesc, { marginTop: 4, textAlign: align, writingDirection: dir }]}>
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
