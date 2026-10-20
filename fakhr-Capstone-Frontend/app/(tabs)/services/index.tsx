import { colors as fakhrColors } from "../../../theme/colors";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors } from "../../../theme";
import { HOME_SERVICE_CATEGORIES, filterHomeServiceProviders, homeServiceText } from "../../../constants/homeServiceProviders";
import HomeServiceListingCard from "../../../components/directory/HomeServiceListingCard";

export default function ServicesScreen() {
  const { t } = useTranslation();
  const { isRTL, dir, align } = useI18nLayout();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState(HOME_SERVICE_CATEGORIES.some(c => c.id === params.category) ? params.category : undefined);
  const lang = isRTL ? "ar" : "en";
  const text = { textAlign: align, writingDirection: dir };
  const providers = filterHomeServiceProviders(category);
  const choices = [{ id: "", label: homeServiceText.all, icon: "apps-outline" as const }, ...HOME_SERVICE_CATEGORIES];
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={styles.column}>
      <View style={[styles.header, { height: undefined, minHeight: 56, paddingHorizontal: 44 }]}>
        <DisabilityAwareHeaderBackButton color={colors.textSecondary} />
        <Text accessibilityRole="header" style={[styles.title, { writingDirection: dir }]}>{t("ui.homeServicesOneLine")}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 6, paddingBottom: 100 + bottom, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.filters, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {choices.map(choice => <Pressable key={choice.id} accessibilityRole="button" accessibilityLabel={choice.label[lang]}
            accessibilityState={{ selected: (category || "") === choice.id }} onPress={() => setCategory(choice.id || undefined)}
            style={[styles.chip, { flexDirection: isRTL ? "row-reverse" : "row" }, (category || "") === choice.id && styles.selected]}>
            <Text style={[styles.chipText, (category || "") === choice.id && { color: "#0B093B" }]}>{choice.label[lang]}</Text>
          </Pressable>)}
        </View>
        <Text style={[styles.intro, text]}>{homeServiceText.intro[lang]}</Text>
        {HOME_SERVICE_CATEGORIES.map(group => {
          const members=providers.filter(provider=>provider.categories[0]===group.id);
          return members.length ? <View key={group.id} style={styles.section}>
            <View style={[styles.sectionHeading,{flexDirection:isRTL?"row-reverse":"row"}]}><Ionicons name={group.icon} size={22} color={colors.primary}/><Text accessibilityRole="header" style={[styles.sectionTitle,text]}>{group.label[lang]}</Text></View>
            {members.map(provider=><HomeServiceListingCard key={provider.id} provider={provider} onOpen={()=>router.push({pathname:"/(tabs)/services/service-details",params:{id:provider.id}})}/>)}
          </View> : null;
        })}
        {!providers.length && <Text style={[styles.empty, text]}>{homeServiceText.empty[lang]}</Text>}
      </ScrollView>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: fakhrColors.background }, column: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", direction: "ltr" },
  header: { minHeight: 60, marginHorizontal: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.title, lineHeight: typography.titleLineHeight, fontWeight: typography.weightSemibold, color: colors.text, textAlign: "center" },
  section: {backgroundColor:colors.borderLight,borderRadius:20,padding:5,gap:8},
  sectionHeading: {alignItems:"center",gap:8,padding:10},
  sectionTitle: {flex:1,fontSize:typography.section,fontWeight:typography.weightSemibold,color:colors.text},
  filters: { flexWrap: "wrap", gap: 6 }, chip: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth:1, borderColor:colors.border, backgroundColor: colors.borderLight, alignItems: "center", justifyContent:"center", flexGrow:1 },
  chipText: { color: colors.textSecondary, fontSize: typography.button, fontWeight: typography.weightMedium, textAlign:"center" }, selected: { backgroundColor: colors.primary },
  intro: { color: colors.textSecondary, fontSize: typography.helper, lineHeight: typography.helperLineHeight }, empty: { color: colors.text, padding: 18, borderRadius: 16, backgroundColor: colors.borderLight, lineHeight: typography.bodyLineHeight },
});
