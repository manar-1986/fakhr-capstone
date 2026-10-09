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
import HomeServiceProviderCard from "../../../components/directory/HomeServiceProviderCard";

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
            <Ionicons name={choice.icon} size={18} color={(category || "") === choice.id ? colors.white : colors.primary} />
            <Text style={[styles.chipText, (category || "") === choice.id && { color: colors.white }]}>{choice.label[lang]}</Text>
          </Pressable>)}
        </View>
        <Text style={[styles.intro, text]}>{homeServiceText.intro[lang]}</Text>
        {providers.map(provider => <HomeServiceProviderCard key={provider.id} provider={provider} onDetails={() => router.push({
          pathname: "/(tabs)/services/service-details", params: { id: provider.id },
        })} />)}
        {!providers.length && <Text style={[styles.empty, text]}>{homeServiceText.empty[lang]}</Text>}
      </ScrollView>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, column: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", direction: "ltr" },
  header: { minHeight: 60, marginHorizontal: 18, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.title, lineHeight: typography.h1LineHeight, fontWeight: "800", color: colors.textSecondary, textAlign: "center" },
  filters: { flexWrap: "wrap", gap: 8 }, chip: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: colors.borderLight, alignItems: "center", gap: 6 },
  chipText: { color: colors.textSecondary, fontSize: typography.button, fontWeight: "600" }, selected: { backgroundColor: colors.primary },
  intro: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: typography.bodyLineHeight }, empty: { color: colors.text, padding: 18, borderRadius: 16, backgroundColor: colors.borderLight, lineHeight: typography.bodyLineHeight },
});
