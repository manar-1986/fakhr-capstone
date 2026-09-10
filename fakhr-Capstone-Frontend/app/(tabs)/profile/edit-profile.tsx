import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
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
import { getChildren, updateChild } from "../../../api/children.api";
import { getCurrentUser, updateUser } from "../../../api/users.api";
import {
  FOCUS_AREAS,
  SUPPORT_GOALS,
  ageFromDate,
  asIdList,
  formatMMDDYYYY,
  parseStoredDate,
} from "../../../constants/childProfileOptions";
import { signupColors as c } from "../../../constants/signupTheme";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

/**
 * Personal details editor. Opened from the Profile menu.
 */
export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const isRTL = locale === "ar";
  const reverseRows = isRTL !== I18nManager.isRTL;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [medicalHistory, setMedicalHistory] = useState("");
  const [focusIds, setFocusIds] = useState<Set<string>>(() => new Set());
  const [goalIds, setGoalIds] = useState<Set<string>>(() => new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [iosDraft, setIosDraft] = useState(() => new Date(2018, 5, 15));
  const hydratedChildId = useRef<string | null>(null);

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!user,
  });

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ["children"],
    queryFn: getChildren,
  });

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name ?? "");
    setEmail(currentUser.email ?? "");
  }, [currentUser]);

  useEffect(() => {
    if (!children?.length) return;
    const match = selectedId
      ? children.find((child) => child.id === selectedId)
      : undefined;
    if (!match) setSelectedId(children[0].id);
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const userId = currentUser?.id || user?.id;
      if (!userId) throw new Error(t("editProfile.saveFailed"));
      const updatedUser = await updateUser(userId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      if (activeChild) {
        if (!childName.trim()) {
          throw new Error(t("editProfile.childNameRequired"));
        }
        await updateChild(activeChild.id, {
          name: childName.trim(),
          dateOfBirth: dob ? formatMMDDYYYY(dob) : "",
          age: dob ? ageFromDate(dob) : undefined,
          medicalHistory: medicalHistory.trim(),
          areasOfFocus: Array.from(focusIds),
          supportGoals: Array.from(goalIds),
        });
      }
      return updatedUser;
    },
    onSuccess: (updated) => {
      setUser({ id: updated.id, name: updated.name, email: updated.email });
      queryClient.setQueryData(["currentUser"], updated);
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      void queryClient.invalidateQueries({ queryKey: ["children"] });
      Alert.alert(t("editProfile.saved"), t("editProfile.savedBody"));
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : t("editProfile.saveFailed");
      Alert.alert(t("common.error"), message);
    },
  });

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t("common.error"), t("editProfile.fillNameEmail"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t("common.error"), t("editProfile.invalidEmail"));
      return;
    }
    saveMutation.mutate();
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

  const loading = (userLoading && !currentUser) || childrenLoading;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerRow, reverseRows && styles.rowReverse]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
            >
              <Ionicons name="chevron-back" size={24} color={c.text} />
            </Pressable>
            <Text style={[styles.headerTitle, isRTL && styles.textRtl]}>
              {t("editProfile.title")}
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/profile/settings")}
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t("profile.appSettings")}
            >
              <Ionicons name="settings-outline" size={22} color={c.text} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={styles.loadingText}>{t("profile.loadingProfile")}</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>
                {t("editProfile.heroTitle")}
              </Text>
              <Text style={[styles.sectionSub, isRTL && styles.textRtl]}>
                {t("editProfile.heroSubtitle")}
              </Text>

              <Text style={[styles.label, isRTL && styles.textRtl]}>
                {t("editProfile.fullName")}
              </Text>
              <View style={[styles.inputRow, reverseRows && styles.rowReverse]}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={c.textLight}
                  style={isRTL ? styles.inputIconRtl : styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, isRTL && styles.inputRtl]}
                  placeholder={t("editProfile.fullNamePlaceholder")}
                  placeholderTextColor={c.textLight}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <Text style={[styles.label, isRTL && styles.textRtl]}>
                {t("editProfile.email")}
              </Text>
              <View style={[styles.inputRow, reverseRows && styles.rowReverse]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={c.textLight}
                  style={isRTL ? styles.inputIconRtl : styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, isRTL && styles.inputRtl]}
                  placeholder={t("editProfile.emailPlaceholder")}
                  placeholderTextColor={c.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign={isRTL ? "right" : "left"}
                />
              </View>

              <View style={styles.divider} />

              <Text style={[styles.sectionTitle, isRTL && styles.textRtl]}>
                {t("editProfile.childTitle")}
              </Text>
              <Text style={[styles.sectionSub, isRTL && styles.textRtl]}>
                {displayName
                  ? t("editProfile.childHeroSubtitle", { name: displayName })
                  : t("editProfile.childHeroSubtitleGeneric")}
              </Text>

              {!children?.length ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyTitle}>{t("editProfile.noChildren")}</Text>
                  <Text style={styles.emptyBody}>{t("editProfile.noChildrenBody")}</Text>
                  <Pressable
                    onPress={() => router.push("/(tabs)/profile/add-child")}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {t("editProfile.addChild")}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {children.length > 1 ? (
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
                  ) : null}

                  <Text style={[styles.label, isRTL && styles.textRtl]}>
                    {t("editProfile.childName")}
                  </Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, isRTL && styles.inputRtl]}
                      placeholder={t("editProfile.childNamePlaceholder")}
                      placeholderTextColor={c.textLight}
                      value={childName}
                      onChangeText={setChildName}
                      autoCapitalize="words"
                      textAlign={isRTL ? "right" : "left"}
                    />
                  </View>

                  <Text style={[styles.label, isRTL && styles.textRtl]}>
                    {t("editProfile.dateOfBirth")}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setIosDraft(dob ?? new Date(2018, 5, 15));
                      setShowPicker(true);
                    }}
                    style={[styles.inputRow, reverseRows && styles.rowReverse]}
                  >
                    <Text
                      style={[
                        styles.input,
                        !dobLabel && styles.placeholder,
                        isRTL && styles.inputRtl,
                      ]}
                    >
                      {dobLabel || t("editProfile.datePlaceholder")}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={c.textLight} />
                  </Pressable>

                  <View
                    style={[
                      styles.labelRowBetween,
                      reverseRows && styles.rowReverse,
                    ]}
                  >
                    <Text style={[styles.label, styles.noMargin, isRTL && styles.textRtl]}>
                      {t("editProfile.medicalHistory")}
                    </Text>
                    <Text style={styles.optional}>{t("editProfile.optional")}</Text>
                  </View>
                  <TextInput
                    style={[styles.textArea, isRTL && styles.inputRtl]}
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
                            style={[
                              styles.focusCard,
                              selected && styles.focusCardSelected,
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
                  {SUPPORT_GOALS.map((goal) => {
                    const selected = goalIds.has(goal.id);
                    return (
                      <Pressable
                        key={goal.id}
                        onPress={() => toggleGoal(goal.id)}
                        style={[
                          styles.goalRow,
                          reverseRows && styles.rowReverse,
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
                </>
              )}

              <Pressable
                onPress={handleSave}
                disabled={saveMutation.isPending}
                style={({ pressed }) => [
                  styles.saveBtn,
                  (pressed || saveMutation.isPending) && styles.pressed,
                ]}
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator color={c.white} />
                ) : (
                  <Text style={styles.saveText}>{t("editProfile.saveChanges")}</Text>
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
          onChange={(event, date) => {
            setShowPicker(false);
            if (event.type === "set" && date) setDob(date);
          }}
          maximumDate={new Date()}
          minimumDate={new Date(1990, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bgApp },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
    textAlign: "center",
  },
  headerSide: { width: 40 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRtl: { textAlign: "right", writingDirection: "rtl" },
  loadingWrap: { paddingVertical: 48, alignItems: "center" },
  loadingText: { marginTop: 12, color: c.textMuted },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: c.text,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionSub: {
    fontSize: 14,
    lineHeight: 20,
    color: c.textMuted,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: c.text,
    marginBottom: 8,
  },
  noMargin: { marginBottom: 0 },
  labelRowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optional: { fontSize: 13, color: c.textLight },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    paddingHorizontal: 14,
    marginBottom: 16,
    minHeight: 54,
  },
  inputIcon: { marginEnd: 10 },
  inputIconRtl: { marginStart: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    paddingVertical: 14,
  },
  inputRtl: { textAlign: "right", writingDirection: "rtl" },
  placeholder: { color: c.textLight },
  textArea: {
    backgroundColor: c.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 100,
    fontSize: 15,
    color: c.text,
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: c.border,
    marginVertical: 20,
  },
  emptyWrap: { alignItems: "center", paddingVertical: 16 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: c.text, marginBottom: 8 },
  emptyBody: {
    fontSize: 14,
    color: c.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  secondaryBtn: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.primary,
  },
  secondaryBtnText: { color: c.primary, fontWeight: "700" },
  childChips: { gap: 8, paddingBottom: 16 },
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
  childChipText: { fontWeight: "600", color: c.textMuted },
  childChipTextSelected: { color: c.primary },
  gridRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  focusCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: c.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  focusCardSelected: {
    backgroundColor: c.selectedCardBg,
    borderColor: c.primary,
  },
  focusLabel: { marginTop: 8, fontWeight: "600", color: c.textMuted },
  focusLabelSelected: { color: c.primary },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  goalCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: c.borderLight,
    marginEnd: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  goalCheckSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  goalLabel: { flex: 1, fontSize: 16, fontWeight: "600", color: c.text },
  saveBtn: {
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  saveText: { fontSize: 17, fontWeight: "700", color: c.white },
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
  },
  modalBtn: { fontSize: 16, color: c.textMuted, fontWeight: "600" },
  modalBtnPrimary: { color: c.primary },
  modalTitle: { fontSize: 15, fontWeight: "700", color: c.text },
});
