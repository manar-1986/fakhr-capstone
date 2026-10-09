import { Text, TextInput, ScrollView } from "../ui/AppText";
import { typography, tabBarContentHeight } from "../../theme/typography";
import React, { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getCenters, centersListQueryKey } from "../../api/directory.api";
import { DisabilityAwareHeaderBackButton } from "../navigation/HeaderBackButton";
import { colors } from "../../theme";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { disabilityLabels, governorateLabels, institutionText, stageLabels } from "../../constants/institutionLabels";
import { backendInstitution, filterInstitutions, institutionDirectoryCategory, INSTITUTIONS, LEGACY_INSTITUTIONS, type InstitutionFilters } from "../../utils/institutionDirectory";
import type { Institution, InstitutionCategory } from "../../types/institution";

type Filter = "governorate" | "area" | "disability" | "stage";
const filters: Filter[] = ["governorate", "area", "disability", "stage"];
const icons = { school: "school-outline", nursery: "happy-outline", rehabilitation: "accessibility-outline" } as const;

export default function InstitutionDirectoryScreen({ initialCategory }: { initialCategory: InstitutionCategory }) {
  const isCentersSection = initialCategory === "rehabilitation";
  const categories: InstitutionCategory[] = isCentersSection ? ["rehabilitation"] : ["school", "nursery"];
  const { isRTL, align, dir } = useI18nLayout();
  const { bottom } = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const router = useRouter();
  const t = (key: Parameters<typeof institutionText>[0]) => institutionText(key, isRTL);
  const [category, setCategory] = useState(initialCategory);
  const [selection, setSelection] = useState<InstitutionFilters>({});
  const [picker, setPicker] = useState<Filter | null>(null);
  const [existing, setExisting] = useState(false);
  const text = { textAlign: align, writingDirection: dir };
  // Explicit LTR parent + row-reverse handles JS locale and native RTL without double reversal.
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const backend = useQuery({ queryKey: centersListQueryKey(), queryFn: () => getCenters(), enabled: category === "rehabilitation", retry: 1 });
  const referenceItems = useMemo(() => INSTITUTIONS.filter(i => institutionDirectoryCategory(i) === category), [category]);
  const existingItems = useMemo(() => [
    ...LEGACY_INSTITUTIONS.filter(i => institutionDirectoryCategory(i) === category),
    ...(category === "rehabilitation" ? (backend.data || []).filter(c => c.id || (c as { _id?: string })._id).map(backendInstitution) : []),
  ], [category, backend.data]);
  const items = existing ? existingItems : referenceItems;
  const results = useMemo(() => filterInstitutions(items, selection), [items, selection]);
  const labelFor = (kind: Filter, value: string) => {
    if (!value) return t("all");
    if (kind === "disability") return disabilityLabels[value]?.[isRTL ? 0 : 1] || value;
    if (kind === "stage") return stageLabels[value]?.[isRTL ? 0 : 1] || value;
    if (kind === "governorate" && !isRTL) return governorateLabels[value] || value;
    return value;
  };
  const options = (kind: Filter) => {
    const scoped = kind === "area" && selection.governorate ? filterInstitutions(items, { governorate: selection.governorate }) : items;
    const values = scoped.flatMap(item => kind === "disability" ? item.disabilityTags : kind === "stage" ? item.stageTags :
      item.observations.map(o => kind === "area" ? o.areaAr : o.governorateAr));
    return ["", ...Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, "ar"))];
  };
  const chooseCategory = (next: InstitutionCategory) => { setCategory(next); setSelection({}); setExisting(false); };
  const open = (item: Institution) => router.push({ pathname: "/(tabs)/directory/institution-details", params: { id: item.id } });

  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={styles.column}>
      <View style={[styles.header, row]}>
        <DisabilityAwareHeaderBackButton variant="inline" />
        <Text accessibilityRole="header" style={[styles.title, text]}>{t(isCentersSection ? "centers" : "title")}</Text>
      </View>
      <FlatList
        data={results} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: tabBarContentHeight(fontScale) + bottom + 24 }}
        ListHeaderComponent={<View style={styles.stack}>
          {!isCentersSection && <View style={[styles.categories, row]}>
            {categories.map(kind => <Pressable key={kind} accessibilityRole="tab" accessibilityState={{ selected: category === kind }}
              accessibilityLabel={t(kind)} onPress={() => chooseCategory(kind)} style={[styles.category, category === kind && styles.selected]}>
              <Ionicons name={icons[kind]} size={24} color={category === kind ? colors.white : colors.primary} />
              <Text style={[styles.categoryText, text, category === kind && styles.white]}>{t(kind)}</Text>
            </Pressable>)}
          </View>}
          <View style={styles.notice}>
            <Text style={[styles.noticeTitle, text]}>{t("reference")}</Text>
            <Text style={[styles.small, text]}>{t("warning")}</Text>
            {!isRTL && <Text style={[styles.small, text]}>{t("arabicSource")}</Text>}
          </View>
          <TextInput value={selection.search || ""} onChangeText={search => setSelection(s => ({ ...s, search }))}
            placeholder={t("search")} accessibilityLabel={t("search")} placeholderTextColor={colors.textSecondary}
            style={[styles.search, text]} autoCorrect={false} />
          <View style={[styles.filterRow, row]}>
            {filters.map(kind => <Pressable key={kind} accessibilityRole="button"
              accessibilityLabel={`${t(kind)}: ${labelFor(kind, selection[kind] || "")}`}
              onPress={() => setPicker(kind)} style={[styles.filter, !!selection[kind] && styles.activeFilter]}>
              <Text style={[styles.filterText, text]}>{t(kind)}</Text>
              <Text style={[styles.small, text]}>{labelFor(kind, selection[kind] || "")}</Text>
            </Pressable>)}
          </View>
          {Object.values(selection).some(Boolean) && <Pressable accessibilityRole="button" onPress={() => setSelection({})} style={styles.clear}>
            <Text style={[styles.link, text]}>{t("clear")}</Text>
          </Pressable>}
          {category === "rehabilitation" && backend.isPending && <View style={[styles.inline, row]}><ActivityIndicator color={colors.primary} /><Text style={[styles.small, text]}>{t("loading")}</Text></View>}
          {category === "rehabilitation" && backend.isError && <View style={styles.notice}>
            <Text style={[styles.small, text]}>{t("loadFailed")}</Text>
            <Pressable accessibilityRole="button" style={styles.clear} onPress={() => void backend.refetch()}><Text style={[styles.link, text]}>{t("retry")}</Text></Pressable>
          </View>}
          {(existingItems.length > 0 || existing) && <Pressable accessibilityRole="switch" accessibilityState={{ checked: existing }}
            onPress={() => { setExisting(!existing); setSelection({}); }} style={[styles.existing, row]}>
            <Ionicons name={existing ? "checkbox" : "square-outline"} size={22} color={colors.primary} />
            <Text style={[styles.existingText, text]}>{t("existing")} ({existingItems.length})</Text>
          </Pressable>}
          {existing && <Text style={[styles.small, text]}>{t("existingInfo")}</Text>}
          <Text accessibilityLiveRegion="polite" style={[styles.count, text]}>{results.length} {t("count")}</Text>
        </View>}
        ListEmptyComponent={<Text style={[styles.empty, text]}>{t("noResults")}</Text>}
        renderItem={({ item }) => {
          const places = Array.from(new Set(item.observations.map(o => o.areaAr).filter(Boolean))).join(" / ");
          return <Pressable accessibilityRole="button" accessibilityLabel={item.nameEn && !isRTL ? item.nameEn : item.nameAr}
            onPress={() => open(item)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}>
            <Text style={[styles.badge, text]}>{item.origin ? t(item.origin) : t("reference")}</Text>
            <Text style={[styles.name, { textAlign: align, writingDirection: /[\u0600-\u06ff]/.test(item.nameAr) ? "rtl" : "ltr" }]}>{!isRTL && item.nameEn ? item.nameEn : item.nameAr}</Text>
            <Text style={[styles.small, { textAlign: align, writingDirection: "rtl" }]}>{places || t("missing")}</Text>
            <View style={[styles.inline, row]}>
              <Text style={[styles.link, text]}>{t("evidence")}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.primary} />
            </View>
          </Pressable>;
        }}
      />
      <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <View style={styles.scrim}>
          <View style={styles.modal} accessibilityViewIsModal>
            <View style={[styles.inline, row]}>
              <Text accessibilityRole="header" style={[styles.modalTitle, text]}>{picker ? t(picker) : ""}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={t("close")} onPress={() => setPicker(null)} style={styles.close}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {picker && options(picker).map(value => <Pressable key={value || "all"} accessibilityRole="radio"
                accessibilityState={{ selected: (selection[picker] || "") === value }} accessibilityLabel={labelFor(picker, value)}
                onPress={() => { const kind = picker; setSelection(s => ({ ...s, [kind]: value, ...(kind === "governorate" ? { area: "" } : {}) })); setPicker(null); }}
                style={[styles.option, (selection[picker] || "") === value && styles.activeFilter]}>
                <Text style={[styles.optionText, text]}>{labelFor(picker, value)}</Text>
              </Pressable>)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, column: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", direction: "ltr" },
  header: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, gap: 8 }, title: { fontSize: typography.title, fontWeight: "700", color: colors.text, flex: 1 },
  stack: { gap: 14 }, categories: { gap: 8, alignItems: "stretch" }, category: { flex: 1, minHeight: 96, padding: 10, borderRadius: 16, backgroundColor: colors.borderLight, alignItems: "center", justifyContent: "center", gap: 7 },
  categoryText: { fontSize: typography.button, lineHeight: typography.captionLineHeight, fontWeight: "700", color: colors.text, textAlign: "center" }, selected: { backgroundColor: colors.primary }, white: { color: colors.white },
  notice: { backgroundColor: colors.brandPale, padding: 14, borderRadius: 14, gap: 6 }, noticeTitle: { color: colors.text, fontWeight: "700", fontSize: typography.cardTitle },
  small: { fontSize: typography.caption, lineHeight: typography.captionLineHeight, color: colors.textSecondary }, search: { minHeight: 48, borderWidth: 1, borderColor: colors.brandPale, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontSize: typography.body },
  filterRow: { flexWrap: "wrap", gap: 8 }, filter: { width: "48%", flexGrow: 1, padding: 12, minHeight: 66, borderWidth: 1, borderColor: colors.brandPale, borderRadius: 12 }, filterText: { color: colors.text, fontSize: typography.button, fontWeight: "600" }, activeFilter: { backgroundColor: colors.brandPale },
  clear: { minHeight: 44, justifyContent: "center" }, link: { fontSize: typography.button, lineHeight: typography.captionLineHeight, fontWeight: "600", color: colors.textSecondary },
  existing: { alignItems: "center", gap: 10, minHeight: 48 }, existingText: { color: colors.textSecondary, flex: 1, fontSize: typography.caption, lineHeight: typography.captionLineHeight }, count: { color: colors.textSecondary, fontSize: typography.caption, paddingBottom: 6 },
  card: { borderWidth: 1, borderColor: colors.brandPale, padding: 16, borderRadius: 18, marginBottom: 12, gap: 8, backgroundColor: colors.white }, badge: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: typography.captionLineHeight }, name: { fontSize: typography.menu, lineHeight: typography.bodyLineHeight, fontWeight: "700", color: colors.text }, inline: { alignItems: "center", gap: 8 }, empty: { padding: 20, color: colors.textSecondary, lineHeight: typography.bodyLineHeight },
  scrim: { flex: 1, backgroundColor: "rgba(26,28,41,0.4)", alignItems: "center", justifyContent: "center", padding: 20 }, modal: { width: "100%", maxWidth: 390, maxHeight: "80%", padding: 16, backgroundColor: colors.white, borderRadius: 20, direction: "ltr" }, modalTitle: { flex: 1, color: colors.text, fontSize: typography.cardTitle, fontWeight: "700" }, close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, option: { minHeight: 48, padding: 12, borderRadius: 10, marginVertical: 2 }, optionText: { fontSize: typography.menu, lineHeight: typography.bodyLineHeight, color: colors.text },
});
