import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DirectoryListing } from "../../../components/directory/types";
import { saveMockBooking } from "../../../utils/mockBookingsStore";

const colors = {
  bg: "#FFFFFF",
  title: "#3D4A78",
  muted: "#A8ABB4",
  line: "#D8DCE8",
  cardBorder: "#E6E8EE",
  selected: "#7B88B8",
  white: "#FFFFFF",
  success: "#3CCF7A",
  chevron: "#8B91AF",
  timeMuted: "#8B91AF",
};

const DESIGN_W = 390;

const STEPS = [
  { n: 1, label: "الخدمة" },
  { n: 2, label: "الموعد" },
  { n: 3, label: "التأكيد" },
  { n: 4, label: "التأكيد" },
];

const AR_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

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

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
];

function parseListing(raw: string | string[] | undefined): DirectoryListing | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return null;
  const tryParse = (x: string) => JSON.parse(x) as DirectoryListing;
  try {
    return tryParse(decodeURIComponent(s));
  } catch {
    try {
      return tryParse(s);
    } catch {
      return null;
    }
  }
}

function formatTimeAr(slot: string) {
  const [time, period] = slot.split(" ");
  const [h, m] = time.split(":");
  const hour = String(parseInt(h, 10));
  const suffix = period === "PM" ? "م" : "ص";
  return `${hour}:${m} ${suffix}`;
}

function slotToHours(slot: string | null) {
  if (!slot) return { h: 11, m: 0 };
  const [time, period] = slot.split(" ");
  let h = parseInt(time.split(":")[0], 10);
  const m = parseInt(time.split(":")[1], 10) || 0;
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return { h, m };
}

function buildCalendarStamp(dateKey: string, slot: string | null) {
  if (!dateKey) return "";
  const { h, m } = slotToHours(slot);
  const ymd = dateKey.replace(/-/g, "");
  return `${ymd}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
}

function shiftCalendarStamp(stamp: string, minutes: number) {
  const y = Number(stamp.slice(0, 4));
  const mo = Number(stamp.slice(4, 6)) - 1;
  const d = Number(stamp.slice(6, 8));
  const h = Number(stamp.slice(9, 11));
  const mi = Number(stamp.slice(11, 13));
  const dt = new Date(y, mo, d, h, mi + minutes, 0);
  const ymd = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}`;
  return `${ymd}T${String(dt.getHours()).padStart(2, "0")}${String(dt.getMinutes()).padStart(2, "0")}00`;
}

export default function BookingScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const { item: itemParam } = useLocalSearchParams<{ item?: string }>();
  const listing = useMemo(() => parseListing(itemParam), [itemParam]);

  const dateOptions = useMemo(() => {
    const out: {
      key: string;
      day: string;
      date: string;
      month: string;
    }[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({
        key,
        day: AR_DAYS[d.getDay()],
        date: String(d.getDate()),
        month: AR_MONTHS[d.getMonth()],
      });
    }
    return out;
  }, []);

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [selectedDateKey, setSelectedDateKey] = useState(
    () => dateOptions[2]?.key ?? dateOptions[0]?.key ?? "",
  );
  const [selectedTime, setSelectedTime] = useState<string | null>("01:00 PM");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const providerName = listing?.name || "مؤسسة فاطمة";
  const activeStep = phase === 1 ? 1 : 2;

  const selectedDateLabel = useMemo(() => {
    const opt = dateOptions.find((d) => d.key === selectedDateKey);
    if (!opt) return "";
    return `${opt.day} ${opt.date} ${opt.month}`;
  }, [dateOptions, selectedDateKey]);

  const confirmationDateLabel = useMemo(() => {
    const opt = dateOptions.find((d) => d.key === selectedDateKey);
    if (!opt) return "";
    const year = selectedDateKey.slice(0, 4);
    return `${opt.day} ${opt.date} ${opt.month} ${year}`;
  }, [dateOptions, selectedDateKey]);

  const appointmentType =
    listing?.subtitle?.trim() || listing?.tags?.[0] || "جلسة تخاطب";
  const confirmationTime = selectedTime
    ? `الساعة: ${formatTimeAr(selectedTime)}`
    : "";

  const goNext = () => {
    if (!selectedTime) {
      Alert.alert("مطلوب", "يرجى اختيار وقت الموعد.");
      return;
    }
    setPhase(2);
  };

  const confirm = () => {
    if (!listing) {
      Alert.alert("خطأ", "تعذر تحميل بيانات الحجز.");
      return;
    }
    if (!patientName.trim() || !phone.trim()) {
      Alert.alert("مطلوب", "يرجى إدخال الاسم الكامل ورقم الهاتف.");
      return;
    }
    if (!selectedTime) {
      Alert.alert("مطلوب", "يرجى اختيار وقت الموعد.");
      return;
    }
    saveMockBooking({
      listingName: listing.name,
      dateLabel: `${selectedDateLabel} (${selectedDateKey})`,
      timeLabel: selectedTime,
      patientName: patientName.trim(),
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    });
    setPhase(3);
  };

  const addToCalendar = () => {
    const summary = `${appointmentType} — ${providerName}`;
    const details = [appointmentType, confirmationDateLabel, confirmationTime, providerName]
      .filter(Boolean)
      .join("\n");
    const start = buildCalendarStamp(selectedDateKey, selectedTime);
    const end = start ? shiftCalendarStamp(start, 60) : "";
    const calUrl =
      start && end
        ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&details=${encodeURIComponent(details)}&dates=${start}/${end}`
        : "";

    if (Platform.OS === "web" && calUrl) {
      Linking.openURL(calUrl).catch(() => {
        Share.share({ message: details, title: summary }).catch(() => {});
      });
      return;
    }
    Share.share({ message: details, title: summary }).catch(() => {});
  };

  const viewAppointments = () => {
    router.push("/(tabs)/bookings");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
        {phase === 3 ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{
              paddingHorizontal: ms(22),
              paddingTop: ms(14),
              paddingBottom: ms(28),
            }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[styles.title, { fontSize: ms(24), lineHeight: ms(32) }]}
            >
              تأكيد الحجز
            </Text>

            <View
              style={[
                styles.confirmArrows,
                {
                  marginTop: ms(16),
                  paddingHorizontal: ms(2),
                  flexDirection: "row",
                  flexDirection: "row",
                },
              ]}
            >
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={({ pressed }) => [pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="رجوع"
              >
                <Ionicons
                  name="chevron-back"
                  size={ms(20)}
                  color={colors.title}
                />
              </Pressable>
              <Pressable
                onPress={viewAppointments}
                hitSlop={12}
                style={({ pressed }) => [pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="التالي"
              >
                <Ionicons
                  name="chevron-forward"
                  size={ms(20)}
                  color={colors.title}
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.successCircle,
                {
                  width: ms(92),
                  height: ms(92),
                  borderRadius: ms(46),
                  marginTop: ms(8),
                  marginBottom: ms(20),
                  alignSelf: "center",
                },
              ]}
            >
              <Ionicons name="checkmark" size={ms(50)} color={colors.white} />
            </View>

            <Text
              style={[
                styles.successMsg,
                { fontSize: ms(22), lineHeight: ms(32), marginBottom: ms(12) },
              ]}
            >
              تم حجز موعدك بنجاح
            </Text>
            <Text
              style={[
                styles.confirmType,
                { fontSize: ms(17), lineHeight: ms(26), marginBottom: ms(8) },
              ]}
            >
              {appointmentType}
            </Text>
            <Text
              style={[
                styles.confirmDate,
                { fontSize: ms(16), lineHeight: ms(24), marginBottom: ms(4) },
              ]}
            >
              {confirmationDateLabel}
            </Text>
            <Text
              style={[
                styles.confirmTime,
                {
                  fontSize: ms(14),
                  lineHeight: ms(22),
                  marginBottom: ms(10),
                  writingDirection: "rtl",
                },
              ]}
            >
              {confirmationTime}
            </Text>
            <Text
              style={[
                styles.confirmProvider,
                {
                  fontSize: ms(17),
                  lineHeight: ms(26),
                  marginBottom: ms(24),
                },
              ]}
            >
              {providerName}
            </Text>

            <Pressable
              onPress={addToCalendar}
              style={({ pressed }) => [
                styles.nextBtn,
                {
                  minHeight: ms(52),
                  borderRadius: ms(18),
                  marginBottom: ms(12),
                  width: "100%",
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="إضافة إلى التقويم"
            >
              <Text style={[styles.nextText, { fontSize: ms(17) }]}>
                إضافة إلى التقويم
              </Text>
            </Pressable>
            <Pressable
              onPress={viewAppointments}
              style={({ pressed }) => [
                styles.nextBtn,
                {
                  minHeight: ms(52),
                  borderRadius: ms(18),
                  width: "100%",
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="عرض مواعيدي"
            >
              <Text style={[styles.nextText, { fontSize: ms(17) }]}>
                عرض مواعيدي
              </Text>
            </Pressable>
          </ScrollView>
        ) : (
          <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: ms(20),
              paddingTop: ms(14),
              paddingBottom: ms(28),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[styles.title, { fontSize: ms(24), lineHeight: ms(32) }]}
          >
            حجز موعد
          </Text>

          <View
            style={[
              styles.stepper,
              {
                marginTop: ms(18),
                marginBottom: ms(22),
                flexDirection: "row-reverse",
                flexDirection: "row",
              },
            ]}
          >
            <View
              style={[
                styles.stepLine,
                {
                  left: "12.5%",
                  right: "12.5%",
                  top: ms(15),
                },
              ]}
            />
            {STEPS.map((step) => {
              const active = step.n === activeStep;
              return (
                <View key={step.n} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        width: ms(32),
                        height: ms(32),
                        borderRadius: ms(16),
                      },
                      active ? styles.stepCircleActive : styles.stepCircleIdle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        { fontSize: ms(14) },
                        active ? styles.stepNumActive : styles.stepNumIdle,
                      ]}
                    >
                      {step.n}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { fontSize: ms(11), marginTop: ms(6) },
                      active ? styles.stepLabelActive : styles.stepLabelIdle,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {phase === 1 ? (
            <>
              <Text
                style={[
                  styles.provider,
                  { fontSize: ms(15), marginBottom: ms(18) },
                ]}
              >
                {providerName}
              </Text>

              <View
                style={[
                  styles.dateRow,
                  {
                    gap: ms(8),
                    flexDirection: "row-reverse",
                    flexDirection: "row",
                  },
                ]}
              >
                {dateOptions.map((d) => {
                  const sel = d.key === selectedDateKey;
                  return (
                    <Pressable
                      key={d.key}
                      onPress={() => setSelectedDateKey(d.key)}
                      style={({ pressed }) => [
                        styles.dateCard,
                        {
                          minHeight: ms(108),
                          borderRadius: ms(18),
                          paddingVertical: ms(12),
                        },
                        sel && styles.dateCardSelected,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={d.day}
                    >
                      <Text
                        style={[
                          styles.dateDay,
                          { fontSize: ms(11) },
                          sel && styles.dateTextSel,
                        ]}
                        numberOfLines={1}
                      >
                        {d.day}
                      </Text>
                      <Text
                        style={[
                          styles.dateNum,
                          { fontSize: ms(24), lineHeight: ms(30) },
                          sel && styles.dateTextSel,
                        ]}
                      >
                        {d.date}
                      </Text>
                      <Text
                        style={[
                          styles.dateMonth,
                          { fontSize: ms(10) },
                          sel && styles.dateTextSel,
                        ]}
                        numberOfLines={1}
                      >
                        {d.month}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View
                style={[
                  styles.timeRow,
                  {
                    gap: ms(8),
                    marginTop: ms(16),
                    marginBottom: ms(28),
                    flexDirection: "row",
                    flexDirection: "row",
                  },
                ]}
              >
                {([TIME_SLOTS[3], TIME_SLOTS[2], TIME_SLOTS[4]] as string[]).map(
                  (slot) => {
                  const sel = selectedTime === slot;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setSelectedTime(slot)}
                      style={({ pressed }) => [
                        styles.timeCard,
                        {
                          flex: 1,
                          minHeight: ms(44),
                          borderRadius: ms(14),
                        },
                        sel && styles.timeCardSelected,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={formatTimeAr(slot)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          { fontSize: ms(14), writingDirection: "ltr" },
                          sel && styles.timeTextSel,
                        ]}
                      >
                        {formatTimeAr(slot)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <View>
              <Text
                style={[
                  styles.provider,
                  { fontSize: ms(16), marginBottom: ms(16) },
                ]}
              >
                {providerName}
              </Text>
              <Text style={styles.inputLabel}>الاسم الكامل</Text>
              <TextInput
                style={styles.input}
                placeholder="أدخل الاسم الكامل"
                placeholderTextColor={colors.muted}
                value={patientName}
                onChangeText={setPatientName}
                textAlign="right"
              />
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                placeholder="05xxxxxxxx"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                textAlign="right"
              />
              <Text style={styles.inputLabel}>ملاحظات (اختياري)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="أي معلومات إضافية"
                placeholderTextColor={colors.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlign="right"
                textAlignVertical="top"
              />
            </View>
          )}

          <Pressable
            onPress={phase === 1 ? goNext : confirm}
            style={({ pressed }) => [
              styles.nextBtn,
              {
                minHeight: ms(52),
                borderRadius: ms(16),
                marginTop: phase === 1 ? 0 : ms(12),
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={phase === 1 ? "التالي" : "تأكيد الحجز"}
          >
            <Text style={[styles.nextText, { fontSize: ms(18) }]}>
              {phase === 1 ? "التالي" : "تأكيد الحجز"}
            </Text>
          </Pressable>
        </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  column: {
    flex: 1,
    maxWidth: 430,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    width: "100%",
  },
  title: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "relative",
  },
  stepLine: {
    position: "absolute",
    height: 1.5,
    backgroundColor: colors.line,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    zIndex: 1,
  },
  stepCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  stepCircleActive: {
    backgroundColor: colors.selected,
    borderColor: colors.selected,
  },
  stepCircleIdle: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  stepNum: {
    fontWeight: "700",
  },
  stepNumActive: {
    color: colors.white,
  },
  stepNumIdle: {
    color: colors.muted,
  },
  stepLabel: {
    fontWeight: "600",
    textAlign: "center",
    writingDirection: "rtl",
  },
  stepLabelActive: {
    color: colors.title,
  },
  stepLabelIdle: {
    color: colors.muted,
  },
  provider: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
    width: "100%",
  },
  dateRow: {
    flexDirection: "row",
    width: "100%",
  },
  dateCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dateCardSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected,
  },
  dateDay: {
    fontWeight: "600",
    color: colors.muted,
    writingDirection: "rtl",
  },
  dateNum: {
    fontWeight: "800",
    color: colors.title,
    marginTop: 2,
  },
  dateMonth: {
    fontWeight: "600",
    color: colors.muted,
    writingDirection: "rtl",
  },
  dateTextSel: {
    color: colors.white,
  },
  timeRow: {
    flexDirection: "row",
    width: "100%",
  },
  timeCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  timeCardSelected: {
    backgroundColor: colors.selected,
    borderColor: colors.selected,
  },
  timeText: {
    fontWeight: "700",
    color: colors.title,
    writingDirection: "rtl",
  },
  timeTextSel: {
    color: colors.white,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.title,
    marginBottom: 14,
    writingDirection: "rtl",
  },
  textArea: {
    minHeight: 90,
  },
  nextBtn: {
    backgroundColor: colors.selected,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  nextText: {
    color: colors.white,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.9,
  },
  confirmArrows: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  successCircle: {
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  successMsg: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
  confirmType: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
  confirmDate: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
  confirmTime: {
    fontWeight: "600",
    color: colors.timeMuted,
    textAlign: "center",
    width: "100%",
  },
  confirmProvider: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
    width: "100%",
  },
});
