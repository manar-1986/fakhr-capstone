import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, I18nManager, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { getChildren, updateChild } from "../../../api/children.api";
import {
  FOCUS_AREAS,
  SUPPORT_GOALS,
  ageFromDate,
  asIdList,
  formatMMDDYYYY,
  parseStoredDate,
} from "../../../constants/childProfileOptions";
import { signupColors as c } from "../../../constants/signupTheme";
import { useLanguage } from "../../../context/LanguageContext";

export default function EditChildProfileScreen() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const isRTL = locale === "ar";
  const reverseRows = isRTL !== I18nManager.isRTL;
  const router = useRouter();
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [selectedId, setSelectedId] = useState<string | null>(
    typeof id === "string" ? id : null
  );
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [medicalHistory, setMedicalHistory] = useState("");
  const [focusIds, setFocusIds] = useState<Set<string>>(() => new Set());
  const [goalIds, setGoalIds] = useState<Set<string>>(() => new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [iosDraft, setIosDraft] = useState(() => new Date(2018, 5, 15));
  const hydratedChildId = React.useRef<string | null>(null);

  const { data: children, isLoading } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !!user,
    queryFn: getChildren,
  });

  useEffect(() => {
    if (!children?.length) return;
    const match = selectedId
      ? children.find((child) => child.id === selectedId)
      : undefined;
    if (!match) {
      setSelectedId(children[0].id);
    }
  }, [children, selectedId]);

  const activeChild = children?.find((child) => child.id === selectedId);

  useEffect(() => {
    if (!activeChild) return;
    if (hydratedChildId.current === activeChild.id) return;
    hydratedChildId.current = activeChild.id;
    setChildName(activeChild.name ?? "");
    setDob(parseStoredDate(activeChild.dateOfBirth));
    setMedicalHistory(activeChild.medicalHistory ?? "");
    setFocusIds(new Set(asIdList(activeChild.areasOfFocus)));
    setGoalIds(new Set(asIdList(activeChild.supportGoals)));
  }, [activeChild]);

  const dobLabel = useMemo(() => (dob ? formatMMDDYYYY(dob) : ""), [dob]);
  const displayName = childName.trim() || activeChild?.name || "";
  const challengeRows = [FOCUS_AREAS.slice(0, 2), FOCUS_AREAS.slice(2, 4)];

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

  const toggleFocus = (focusId: string) => {
    setFocusIds((prev) => {
      const next = new Set(prev);
      if (next.has(focusId)) next.delete(focusId);
      else next.add(focusId);
      return next;
    });
  };

  const toggleGoal = (goalId: string) => {
    setGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!activeChild) {
        throw new Error(t("editProfile.childSaveFailed"));
      }
      if (!childName.trim()) {
        throw new Error(t("editProfile.childNameRequired"));
      }
      return updateChild(activeChild.id, {
        name: childName.trim(),
        dateOfBirth: dob ? formatMMDDYYYY(dob) : "",
        age: dob ? ageFromDate(dob) : undefined,
        medicalHistory: medicalHistory.trim(),
        areasOfFocus: Array.from(focusIds),
        supportGoals: Array.from(goalIds),
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["children", user?.id], (prev: typeof children) =>
        prev
          ? prev.map((child) => (child.id === updated.id ? updated : child))
          : [updated]
      );
      void queryClient.invalidateQueries({ queryKey: ["children"] });
      void queryClient.invalidateQueries({ queryKey: ["child", updated.id] });
      Alert.alert(t("editProfile.childSaved"), t("editProfile.childSavedBody"), [
        {
          text: t("common.done"),
          onPress: () => router.replace("/(tabs)/profile"),
        },
      ]);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : t("editProfile.childSaveFailed");
      Alert.alert(t("common.error"), message);
    },
  });

  const handleSave = () => {
    if (!childName.trim()) {
      Alert.alert(t("common.error"), t("editProfile.childNameRequired"));
      return;
    }
    saveMutation.mutate();
  };

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
          <View style={[styles.headerRow, reverseRows && styles.rowReverse]}>
            <HeaderBackButton />
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>{t("editProfile.childTitle")}</Text>
            </View>
            <View style={styles.headerSide} />
          </View>

          <View style={[styles.progressLabels, reverseRows && styles.rowReverse]}>
            <Text style={styles.progressLeft}>{t("editProfile.step2Label")}</Text>
            <Text style={styles.progressRight}>
              {t("editProfile.stepOf", { current: 2, total: 2 })}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          ) : !children?.length ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="happy-outline" size={48} color={c.textLight} />
              <Text style={styles.emptyTitle}>{t("editProfile.noChildren")}</Text>
              <Text style={styles.emptyBody}>{t("editProfile.noChildrenBody")}</Text>
              <Pressable
                onPress={() => router.push("/(tabs)/profile/add-child")}
                style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
              >
                <Text style={styles.continueText}>{t("editProfile.addChild")}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {children.length > 1 ? (
                <>
                  <Text style={[styles.fieldLabel, isRTL && styles.textRtl]}>
                    {t("editProfile.selectChild")}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.childChips}
                  >
                    {children.map((child) => {
                      const selected = child.id === selectedId;
                      return (
                        <Pressable
                          key={child.id}
                          onPress={() => {
                            hydratedChildId.current = null;
                            setSelectedId(child.id);
                          }}
                          style={[
                            styles.childChip,
                            selected && styles.childChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.childChipText,
                              selected && styles.childChipTextSelected,
                            ]}
                          >
                            {child.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              ) : null}

              <Text style={[styles.heroTitle, isRTL && styles.textRtl]}>
                {t("editProfile.childHeroTitle")}
              </Text>
              <Text style={[styles.heroSubtitle, isRTL && styles.textRtl]}>
                {displayName
                  ? t("editProfile.childHeroSubtitle", { name: displayName })
                  : t("editProfile.childHeroSubtitleGeneric")}
              </Text>

              <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>
                {t("editProfile.basicInformation")}
              </Text>

              <Text style={[styles.fieldLabel, isRTL && styles.textRtl]}>
                {t("editProfile.childName")}
              </Text>
              <View style={[styles.inputRow, reverseRows && styles.rowReverse]}>
                <TextInput
                  style={[styles.inputLikeText, isRTL && styles.textRtl]}
                  placeholder={t("editProfile.childNamePlaceholder")}
                  placeholderTextColor={c.textLight}
                  value={childName}
                  onChangeText={setChildName}
                  autoCapitalize="words"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <Text style={[styles.fieldLabel, isRTL && styles.textRtl]}>
                {t("editProfile.dateOfBirth")}
              </Text>
              <Pressable
                onPress={openPicker}
                style={({ pressed }) => [
                  styles.inputRow,
                  reverseRows && styles.rowReverse,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.inputLikeText,
                    !dobLabel && styles.placeholder,
                    isRTL && styles.textRtl,
                  ]}
                  numberOfLines={1}
                >
                  {dobLabel || t("editProfile.datePlaceholder")}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={c.textLight} />
              </Pressable>

              <View
                style={[styles.labelRowBetween, reverseRows && styles.rowReverse]}
              >
                <Text style={[styles.fieldLabel, styles.noMargin, isRTL && styles.textRtl]}>
                  {t("editProfile.medicalHistory")}
                </Text>
                <Text style={styles.optionalLabel}>{t("editProfile.optional")}</Text>
              </View>
              <TextInput
                style={[styles.textArea, isRTL && styles.textRtl]}
                placeholder={t("editProfile.medicalPlaceholder")}
                placeholderTextColor={c.textLight}
                value={medicalHistory}
                onChangeText={setMedicalHistory}
                multiline
                textAlignVertical="top"
                textAlign={isRTL ? "right" : "left"}
              />

              <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>
                {t("editProfile.areasOfFocus")}
              </Text>
              <Text style={[styles.hint, isRTL && styles.textRtl]}>
                {displayName
                  ? t("editProfile.focusHint", { name: displayName })
                  : t("editProfile.focusHintGeneric")}
              </Text>

              {challengeRows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={[styles.gridRow, reverseRows && styles.rowReverse]}
                >
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
                          {t(item.labelKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}

              <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>
                {t("editProfile.supportGoals")}
              </Text>
              <Text style={[styles.hint, isRTL && styles.textRtl]}>
                {t("editProfile.goalsHint")}
              </Text>

              {SUPPORT_GOALS.map((goal) => {
                const selected = goalIds.has(goal.id);
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => toggleGoal(goal.id)}
                    style={({ pressed }) => [
                      styles.goalRow,
                      reverseRows && styles.rowReverse,
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
                    <Text style={styles.goalLabel}>{t(goal.labelKey)}</Text>
                  </Pressable>
                );
              })}

              <View style={styles.illustrationBox}>
                <Ionicons
                  name="happy-outline"
                  size={56}
                  color={c.textLight}
                  style={styles.illustrationIcon}
                />
              </View>

              <Pressable
                onPress={handleSave}
                disabled={saveMutation.isPending}
                style={({ pressed }) => [
                  styles.continueBtn,
                  (pressed || saveMutation.isPending) && styles.pressed,
                ]}
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color={c.white} />
                ) : (
                  <Text style={styles.continueText}>
                    {t("editProfile.saveChanges")}
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalBtn}>{t("common.cancel")}</Text>
                </Pressable>
                <Text style={styles.modalTitle}>{t("editProfile.dateOfBirth")}</Text>
                <Pressable
                  onPress={() => {
                    setDob(iosDraft);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[styles.modalBtn, styles.modalBtnPrimary]}>
                    {t("common.done")}
                  </Text>
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
    fontSize: typography.title,
    fontWeight: typography.weightSemibold,
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
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: c.text,
  },
  progressRight: {
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: c.textMuted,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: c.progressTrack,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: c.primary,
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  loadingWrap: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.body,
    color: c.textMuted,
  },
  emptyWrap: {
    paddingTop: 48,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: typography.cardTitle,
    fontWeight: typography.weightMedium,
    color: c.text,
  },
  emptyBody: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: c.textMuted,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  childChips: {
    gap: 8,
    paddingBottom: 18,
  },
  childChip: {
    backgroundColor: c.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: c.inputBorder,
  },
  childChipSelected: {
    backgroundColor: c.selectedCardBg,
    borderColor: c.primary,
  },
  childChipText: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: c.textMuted,
  },
  childChipTextSelected: {
    color: "#0B093B",
  },
  heroTitle: {
    fontSize: typography.title,
    fontWeight: typography.weightSemibold,
    color: c.text,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: c.textMuted,
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: typography.section,
    fontWeight: typography.weightSemibold,
    color: c.text,
    marginBottom: 12,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: c.textMuted,
    marginBottom: 8,
  },
  noMargin: { marginBottom: 0 },
  labelRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  optionalLabel: {
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
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
    fontSize: typography.body,
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
    fontSize: typography.body,
    color: c.text,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hint: {
    fontSize: typography.helper,
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
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: c.textMuted,
  },
  focusLabelSelected: {
    color: "#0B093B",
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
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: c.text,
  },
  continueBtn: {
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  continueText: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: "#0B093B",
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
    fontSize: typography.button,
    color: c.textMuted,
    fontWeight: typography.weightMedium,
  },
  modalBtnPrimary: {
    color: "#0B093B",
  },
  modalTitle: {
    fontSize: typography.cardTitle,
    fontWeight: typography.weightMedium,
    color: c.text,
  },
});
