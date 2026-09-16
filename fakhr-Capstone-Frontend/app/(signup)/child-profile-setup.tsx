import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signupColors as c } from "../../constants/signupTheme";

const CHALLENGES = [
  { id: "speech", label: "Speech", icon: "volume-high-outline" as const },
  { id: "behavior", label: "Behavior", icon: "settings-outline" as const },
  { id: "sensory", label: "Sensory", icon: "ear-outline" as const },
  { id: "motor", label: "Motor", icon: "walk-outline" as const },
];

const GOALS = [
  { id: "comm", label: "Better Communication" },
  { id: "school", label: "School Readiness" },
  { id: "social", label: "Social Interaction" },
];

function formatMMDD(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function ChildProfileSetupScreen() {
  const router = useRouter();
  const [dob, setDob] = useState<Date | null>(null);
  const [medicalHistory, setMedicalHistory] = useState("");
  const [focusIds, setFocusIds] = useState<Set<string>>(() => new Set(["speech"]));
  const [goalIds, setGoalIds] = useState<Set<string>>(() => new Set(["comm"]));
  const [showPicker, setShowPicker] = useState(false);
  const [iosDraft, setIosDraft] = useState(() => new Date(2018, 5, 15));

  const dobLabel = useMemo(
    () => (dob ? formatMMDD(dob) : ""),
    [dob]
  );

  const openPicker = () => {
    setIosDraft(dob ?? new Date(2018, 5, 15));
    setShowPicker(true);
  };

  const onDateChange = (event: { type: string }, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && date) {
        setDob(date);
      }
    } else if (date) {
      setIosDraft(date);
    }
  };

  const confirmIosDate = () => {
    setDob(iosDraft);
    setShowPicker(false);
  };

  const cancelIosPicker = () => {
    setShowPicker(false);
  };

  const toggleFocus = (id: string) => {
    setFocusIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGoal = (id: string) => {
    setGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const challengeRows = [CHALLENGES.slice(0, 2), CHALLENGES.slice(2, 4)];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={26} color={c.text} />
            </Pressable>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Child Profile Setup</Text>
            </View>
            <View style={styles.headerSide} />
          </View>

          {/* Progress */}
          <View style={styles.progressLabels}>
            <Text style={styles.progressLeft}>Profile Details</Text>
            <Text style={styles.progressRight}>Step 2 of 4</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.heroTitle}>Tell us about your child</Text>
          <Text style={styles.heroSubtitle}>
            {
              "This helps us customize the experience for Fakhr's unique journey."
            }
          </Text>

          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <Pressable
            onPress={openPicker}
            style={({ pressed }) => [
              styles.inputRow,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.inputLikeText, !dobLabel && styles.placeholder]}
              numberOfLines={1}
            >
              {dobLabel || "mm/dd/yyyy"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={c.textLight} />
          </Pressable>

          <View style={styles.labelRowBetween}>
            <Text style={styles.fieldLabel}>Medical History</Text>
            <Text style={styles.optionalLabel}>Optional</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Any relevant medical history or diagnoses..."
            placeholderTextColor={c.textLight}
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            multiline
            textAlignVertical="top"
          />

          {/* Areas of Focus */}
          <Text style={styles.sectionTitle}>Areas of Focus</Text>
          <Text style={styles.hint}>
            Select challenges Fakhr faces (Select all that apply)
          </Text>

          {challengeRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((item) => {
                const selected = focusIds.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleFocus(item.id)}
                    style={({ pressed }) => [
                      styles.focusCard,
                      selected && styles.focusCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={26}
                      color={selected ? c.primary : c.textMuted}
                    />
                    <Text
                      style={[
                        styles.focusLabel,
                        selected && styles.focusLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Support Goals */}
          <Text style={styles.sectionTitle}>Support Goals</Text>
          <Text style={styles.hint}>
            What are the primary goals for this program?
          </Text>

          {GOALS.map((g) => {
            const selected = goalIds.has(g.id);
            return (
              <Pressable
                key={g.id}
                onPress={() => toggleGoal(g.id)}
                style={({ pressed }) => [
                  styles.goalRow,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.goalCheck,
                    selected && styles.goalCheckSelected,
                  ]}
                >
                  {selected ? (
                    <Ionicons name="checkmark" size={14} color={c.white} />
                  ) : null}
                </View>
                <Text style={styles.goalLabel}>{g.label}</Text>
              </Pressable>
            );
          })}

          {/* Illustration placeholder */}
          <View style={styles.illustrationBox}>
            <Ionicons
              name="happy-outline"
              size={56}
              color={c.textLight}
              style={styles.illustrationIcon}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            onPress={() => router.push("/(signup)/step-three")}
          >
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={cancelIosPicker}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Pressable onPress={cancelIosPicker}>
                  <Text style={styles.modalBtn}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Date of Birth</Text>
                <Pressable onPress={confirmIosDate}>
                  <Text style={[styles.modalBtn, styles.modalBtnPrimary]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={iosDraft}
                mode="date"
                display="spinner"
                onChange={(_, date) => date && setIosDraft(date)}
                maximumDate={new Date()}
                minimumDate={new Date(1990, 0, 1)}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={dob ?? iosDraft}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1990, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.bgApp,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
    textAlign: "center",
  },
  headerSide: { width: 40 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLeft: {
    fontSize: 14,
    fontWeight: "700",
    color: c.text,
  },
  progressRight: {
    fontSize: 14,
    fontWeight: "400",
    color: c.textMuted,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: c.progressTrack,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressFill: {
    width: "50%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: c.primary,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: c.text,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: c.textMuted,
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: c.text,
    marginBottom: 12,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: c.textMuted,
    marginBottom: 8,
  },
  labelRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  optionalLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: c.textLight,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    paddingHorizontal: 16,
    minHeight: 52,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLikeText: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    paddingVertical: 14,
  },
  placeholder: {
    color: c.textLight,
  },
  textArea: {
    backgroundColor: c.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 110,
    fontSize: 15,
    color: c.text,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hint: {
    fontSize: 13,
    color: c.textMuted,
    marginBottom: 14,
    marginTop: -4,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  focusCard: {
    flex: 1,
    minHeight: 104,
    borderRadius: 16,
    backgroundColor: c.white,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  focusCardSelected: {
    backgroundColor: c.selectedCardBg,
    borderColor: c.primary,
  },
  focusLabel: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: c.textMuted,
  },
  focusLabelSelected: {
    color: c.primary,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  goalCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: c.borderLight,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.white,
  },
  goalCheckSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  goalLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: c.text,
  },
  illustrationBox: {
    marginTop: 8,
    marginBottom: 20,
    height: 132,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: c.borderLight,
    borderStyle: "dashed",
    backgroundColor: c.illustrationBg,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationIcon: { opacity: 0.45 },
  continueBtn: {
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  continueText: {
    fontSize: 17,
    fontWeight: "700",
    color: c.white,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: c.textMuted,
  },
  pressed: { opacity: 0.88 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: c.overlay,
  },
  modalSheet: {
    backgroundColor: c.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.borderLight,
  },
  modalBtn: {
    fontSize: 16,
    color: c.textMuted,
    fontWeight: "600",
  },
  modalBtnPrimary: {
    color: c.primary,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
  },
});
