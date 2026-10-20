import {planActions} from '../../theme/planActions';
import { directoryListing } from "../../theme/directoryListing";
import { categoryColors } from "../../theme/categories";
import { controls as sharedControls } from "../../theme/controls";
import DirectoryCallButton from "./DirectoryCallButton";
import { institutionPrimaryPhone } from "../../utils/directoryCall";
import { isListedCenter } from "../../utils/centerVisibility";
import InstitutionImage from "./InstitutionImage";
import DirectoryCard from "./DirectoryCard";
import { isSpeechPlus } from "../../constants/speechPlus";
import { BLUE_WING_CENTER_ID, BLUE_WING_DOCTOR } from "../../constants/blueWing";
import { DoctorImage, v } from "./DoctorVisuals";
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
import { backendInstitution, mergeInstitutions, filterInstitutions, institutionDirectoryCategory, INSTITUTIONS, LEGACY_INSTITUTIONS, type InstitutionFilters } from "../../utils/institutionDirectory";
import type { Institution, InstitutionCategory } from "../../types/institution";

type Filter = "governorate" | "area" | "disability" | "stage";
const filters: Filter[] = ["governorate", "area", "disability", "stage"];
const icons = { school: "school-outline", nursery: "happy-outline", rehabilitation: "accessibility-outline", sports: "trophy-outline" } as const;

export default function InstitutionDirectoryScreen({ initialCategory, header, includeAllCenters = false }: { initialCategory: InstitutionCategory; header?: React.ReactNode; includeAllCenters?: boolean }) {
  const isCentersSection = initialCategory === "rehabilitation" || initialCategory === "sports";
  const categories: InstitutionCategory[] = isCentersSection ? [initialCategory] : ["school", "nursery"];
  const { isRTL, align, dir } = useI18nLayout();
  const { bottom } = useSafeAreaInsets();
  const { fontScale, width } = useWindowDimensions();
  const router = useRouter();
  const t = (key: Parameters<typeof institutionText>[0]) => institutionText(key, isRTL);
  const [category, setCategory] = useState(initialCategory);
  const [selection, setSelection] = useState<InstitutionFilters>({});
  const [picker, setPicker] = useState<Filter | null>(null);
  const [existing, setExisting] = useState(false);
  const text = { textAlign: align, writingDirection: dir };
  // Explicit LTR parent + row-reverse handles JS locale and native RTL without double reversal.
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const backend = useQuery({ queryKey: centersListQueryKey(), queryFn: () => getCenters(), enabled: isCentersSection, retry: 1 });
  const referenceItems = useMemo(() => INSTITUTIONS.filter(i => institutionDirectoryCategory(i) === category), [category]);
  const existingItems = useMemo(() => [
    ...LEGACY_INSTITUTIONS.filter(i => institutionDirectoryCategory(i) === category),
    ...(isCentersSection ? (backend.data || []).filter(c => c.id || (c as { _id?: string })._id).map(backendInstitution).filter(i => (institutionDirectoryCategory(i) === "sports") === (category === "sports")) : []),
  ], [category, backend.data]);
  const allCenters = useMemo(() => mergeInstitutions(referenceItems, existingItems), [referenceItems, existingItems]);
  const items = (includeAllCenters && isCentersSection ? allCenters : existing ? existingItems : referenceItems).filter(item => !isSpeechPlus(item) && isListedCenter({ ...item, nameEn: item.nameEn || undefined }));
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


  // Keep the school/nursery presentation separate from the public Centers tab.
  if (isCentersSection && includeAllCenters) {
    const scale=Math.min(width,430)/390;
    return <SafeAreaView style={styles.safe} edges={["top"]}><View style={styles.column}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:tabBarContentHeight(fontScale)+bottom+24}}>
        {header}
        <View style={{paddingHorizontal:Math.round(18*scale)}}>
          <View style={{flexDirection:"row",alignItems:"center",borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,borderRadius:Math.round(22*scale),paddingHorizontal:Math.round(14*scale),minHeight:Math.round(44*scale),marginBottom:18,gap:8}}>
            <TextInput value={selection.search || ""} onChangeText={search=>setSelection({search})} placeholder={t("search")} accessibilityLabel={t("search")} autoCorrect={false} style={[text,{flex:1,paddingVertical:8,color:colors.text,fontSize:typography.body}]} />
            <Ionicons name="search-outline" size={20} color={colors.textLight}/>
          </View>
          <View style={{backgroundColor:directoryListing.section.backgroundColor,borderRadius:20,padding:5,gap:8,marginBottom:14}}>
            <View style={[row,{alignItems:"center",gap:8,padding:10}]}><Ionicons name="business-outline" size={22} color={categoryColors.sessions.foreground}/><Text accessibilityRole="header" style={[v.title,text,{flex:1,fontSize:typography.section,fontWeight:typography.weightSemibold}]}>{t(category === "sports" ? "sports" : "centers")}</Text></View>
            {results.map(item=><DirectoryCard key={item.id} name={!isRTL && item.nameEn ? item.nameEn : item.nameAr}
              image={item.mainImage ? <InstitutionImage item={item}/> : item.id===BLUE_WING_CENTER_ID ? <DoctorImage doctor={BLUE_WING_DOCTOR} size={58} borderRadius={18}/> : <View style={{width:58,height:58,borderRadius:18,backgroundColor:colors.white,alignItems:"center",justifyContent:"center"}}><Ionicons name="business-outline" size={32} color={colors.primary}/></View>}
              specialty={item.publicProfile?.classification?.[isRTL ? "ar" : "en"] || Array.from(new Set(item.observations.map(o=>o.needsAr).filter(Boolean))).join(" / ") || undefined}
              location={item.publicProfile?.area?.[isRTL ? "ar" : "en"] || Array.from(new Set(item.observations.map(o=>o.areaAr).filter(Boolean))).join(" / ") || undefined}
              phone={institutionPrimaryPhone(item)} mapUrl={item.publicProfile?.mapUrl || item.publicContact?.mapUrl} specialtyLines={2}
              onOpen={()=>open(item)}/>)}
            {!results.length && <Text style={[styles.empty,text]}>{t("noResults")}</Text>}
          </View>
        </View>
      </ScrollView>
    </View></SafeAreaView>;
  }

  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={styles.column}>
      {header ?? <View style={[styles.header, row]}>
        <DisabilityAwareHeaderBackButton variant="inline" />
        <Text accessibilityRole="header" style={[styles.title, text]}>{t(isCentersSection ? "centers" : "title")}</Text>
      </View>}
      <FlatList
        data={Array.from(new Set(results.map(item => item.categories.join("|")))).map(key => ({ key, categories: key.split("|") as InstitutionCategory[], items: results.filter(item => item.categories.join("|") === key) }))} keyExtractor={group => group.key} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 18, paddingTop: 4, paddingBottom: tabBarContentHeight(fontScale) + bottom + 24 }}
        ListHeaderComponent={<View style={styles.stack}>
          {!isCentersSection && <View style={[styles.categories, row]}>
            {categories.map(kind => <Pressable key={kind} accessibilityRole="tab" accessibilityState={{ selected: category === kind }}
              accessibilityLabel={t(kind)} onPress={() => chooseCategory(kind)} style={[styles.category, category === kind && styles.selected]}>
              <Ionicons name={icons[kind]} size={24} color={category === kind ? colors.white : categoryColors.education.foreground} />
              <Text style={[styles.categoryText, text, category === kind && styles.white]}>{t(kind)}</Text>
            </Pressable>)}
          </View>}
          <View style={styles.searchBar}><TextInput value={selection.search || ""} onChangeText={search => setSelection(s => ({ ...s, search }))}
            placeholder={category === "nursery" ? (isRTL ? "ابحث باسم الحضانة..." : "Search for a nursery...") : (isRTL ? "ابحث باسم المدرسة..." : "Search for a school...")} accessibilityLabel={category === "nursery" ? (isRTL ? "ابحث باسم الحضانة..." : "Search for a nursery...") : (isRTL ? "ابحث باسم المدرسة..." : "Search for a school...")} placeholderTextColor={colors.textSecondary}
            style={[styles.search, text]} autoCorrect={false} /><Ionicons name="search-outline" size={20} color={colors.textLight}/></View>
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
          {!includeAllCenters && (existingItems.length > 0 || existing) && <Pressable accessibilityRole="switch" accessibilityState={{ checked: existing }}
            onPress={() => { setExisting(!existing); setSelection({}); }} style={[styles.existing, row]}>
            <Ionicons name={existing ? "checkbox" : "square-outline"} size={22} color={colors.primary} />
            <Text style={[styles.existingText, text]}>{isRTL ? "سجلات إضافية" : "Additional records"} ({existingItems.length})</Text>
          </Pressable>}
          <Text accessibilityLiveRegion="polite" style={[styles.count, text]}>{results.length} {t("count")}</Text>
        </View>}
        ListEmptyComponent={<Text style={[styles.empty, text]}>{t("noResults")}</Text>}
        renderItem={({ item: group }) => <View style={styles.group}>
          <View style={[row,{alignItems:"center",gap:8,padding:10}]}><Ionicons name={icons[group.categories[0]]} size={22} color={categoryColors.education.foreground}/><Text accessibilityRole="header" style={[v.title,text,{flex:1,fontSize:typography.section,fontWeight:typography.weightSemibold}]}>{group.categories.map(kind=>t(kind)).join(" / ")}</Text></View>
          {group.items.map(item=><DirectoryCard key={item.id} name={!isRTL && item.nameEn ? item.nameEn : item.nameAr}
            image={item.mainImage ? <InstitutionImage item={item}/> : <View style={{width:58,height:58,borderRadius:18,backgroundColor:colors.white,alignItems:"center",justifyContent:"center"}}><Ionicons name={icons[item.categories[0]]} size={32} color={colors.primary}/></View>}
            organization={item.publicProfile?.specialization ? item.publicProfile.classification?.[isRTL ? "ar" : "en"] : undefined}
            specialty={item.publicProfile?.specialization?.[isRTL ? "ar" : "en"] || item.publicProfile?.classification?.[isRTL ? "ar" : "en"] || item.categories.map(kind=>t(kind)).join(" / ")}
            location={item.publicProfile?.area?.[isRTL ? "ar" : "en"] || Array.from(new Set(item.observations.map(o=>o.areaAr).filter(Boolean))).join(" / ") || undefined}
            phone={institutionPrimaryPhone(item)} onOpen={()=>open(item)}/>)}
        </View>}
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
  header: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, gap: 8 }, title: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.text, flex: 1 },
  group: { backgroundColor: directoryListing.section.backgroundColor, borderRadius: 20, padding: 5, gap: 8, marginBottom: 14 },
  searchBar: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: 22, paddingHorizontal: 14, minHeight: 44, gap: 8 },
  stack: { gap: 14 }, categories: { gap: 8, alignItems: "stretch" }, category: { flex: 1, minHeight: 48, padding: 10, borderRadius: 16, backgroundColor: categoryColors.education.background, alignItems: "center", justifyContent: "center", gap: 7 },
  categoryText: { fontSize: typography.button, lineHeight: typography.buttonLineHeight, fontWeight: typography.weightMedium, color: colors.text, textAlign: "center" }, selected: { backgroundColor: planActions.primary }, white: { color: colors.white },
  notice: { backgroundColor: colors.brandPale, padding: 14, borderRadius: 14, gap: 6 }, noticeTitle: { color: colors.text, fontWeight: typography.weightMedium, fontSize: typography.cardTitle },
  small: { fontSize: typography.helper, lineHeight: typography.helperLineHeight, color: colors.textSecondary }, search: { flex: 1, minWidth: 0, paddingVertical: 8, color: colors.text, fontSize: typography.body },
  filterRow: { flexWrap: "wrap", gap: 8 }, filter: { width: "48%", flexGrow: 1, padding: 12, minHeight: 44, borderWidth: 1, borderColor: colors.brandPale, borderRadius: 18, backgroundColor: colors.borderLight }, filterText: { color: colors.text, fontSize: typography.button, fontWeight: typography.weightMedium }, activeFilter: { backgroundColor: planActions.primary },
  clear: { minHeight: 44, justifyContent: "center" }, link: { fontSize: typography.button, lineHeight: typography.buttonLineHeight, fontWeight: typography.weightMedium, color: colors.textSecondary },
  existing: { alignItems: "center", gap: 10, minHeight: 48 }, existingText: { color: colors.textSecondary, flex: 1, fontSize: typography.helper, lineHeight: typography.helperLineHeight }, count: { color: colors.textSecondary, fontSize: typography.helper, paddingBottom: 6 },
  card: {     marginBottom: 12, gap: 8,  ...sharedControls.card, backgroundColor: "#EBF1FD" }, badge: { color: colors.textSecondary, fontSize: typography.helper, lineHeight: typography.helperLineHeight }, name: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, fontWeight: typography.weightMedium, color: colors.text }, inline: { alignItems: "center", gap: 8 }, empty: { padding: 20, color: colors.textSecondary, lineHeight: typography.bodyLineHeight },
  scrim: { flex: 1, backgroundColor: "rgba(26,28,41,0.4)", alignItems: "center", justifyContent: "center", padding: 20 }, modal: { width: "100%", maxWidth: 390, maxHeight: "80%", padding: 16, backgroundColor: colors.white, borderRadius: 20, direction: "ltr" }, modalTitle: { flex: 1, color: colors.text, fontSize: typography.cardTitle, fontWeight: typography.weightMedium }, close: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, option: { minHeight: 48, padding: 12, borderRadius: 10, marginVertical: 2 }, optionText: { fontSize: typography.cardTitle, lineHeight: typography.cardTitleLineHeight, color: colors.text },
});
