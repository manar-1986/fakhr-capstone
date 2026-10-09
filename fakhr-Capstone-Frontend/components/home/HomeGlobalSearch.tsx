import { homeTheme } from "../../theme/home";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TextInput } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { centersListQueryKey, getCenters } from "../../api/directory.api";
import { buildHomeSearchRecords, searchHomeRecords, SEARCH_CATEGORIES } from "../../utils/homeSearch";
import { colors, typography } from "../../theme";

export default function HomeGlobalSearch() {
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [limit, setLimit] = useState(20);
  const { t } = useTranslation();
  const { isRTL, align, dir } = useI18nLayout();
  const lang = isRTL ? "ar" : "en";
  const focused = useIsFocused();
  const router = useRouter();
  const searching = !!query.trim();
  // Share the directory cache; never send a request on every keystroke.
  const centers = useQuery({ queryKey: centersListQueryKey(), queryFn: () => getCenters(), enabled: searching && focused, retry: 1, staleTime: 60000 });
  const records = useMemo(() => buildHomeSearchRecords(centers.data), [centers.data]);
  const results = useMemo(() => searchHomeRecords(records, query), [records, query]);
  const text = { textAlign: align, writingDirection: dir };
  const change = (value: string) => { setQuery(value); setLimit(20); };
  return <View>
    <Pressable testID="home-search-field" accessible={false} onPress={() => input.current?.focus()}
      style={[styles.bar, { flexDirection: isRTL ? "row-reverse" : "row", borderColor: inputFocused ? homeTheme.blue : homeTheme.border }]}>
      <TextInput ref={input} testID="home-search-input" value={query} onChangeText={change}
        placeholder={t("ui.searchHome")} accessibilityLabel={t("ui.searchHome")}
        onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
        placeholderTextColor={homeTheme.muted} style={[styles.input, text, Platform.OS === "web" && { outlineWidth: 0 }]} textAlign={align}
        returnKeyType="search" submitBehavior="submit" onSubmitEditing={() => input.current?.focus()} autoCorrect={false} />
      {!!query && <Pressable accessibilityRole="button" accessibilityLabel={isRTL ? "مسح البحث" : "Clear search"}
        onPress={event => { event.stopPropagation(); change(""); input.current?.focus(); }} style={styles.clear}>
        <Ionicons name="close-circle" size={22} color={homeTheme.blue} />
      </Pressable>}
      <Ionicons name="search-outline" size={24} color={homeTheme.blue} />
    </Pressable>
    {searching && <View testID="home-search-results" style={styles.results}>
      <Text accessibilityRole="header" style={[styles.heading, text]}>{isRTL ? "نتائج البحث" : "Search results"} ({results.length})</Text>
      {centers.isFetching && <View style={[styles.status, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.secondary, text]}>{isRTL ? "جارٍ تحديث نتائج المراكز…" : "Updating center results…"}</Text>
      </View>}
      {centers.isError && <View>
        <Text accessibilityLiveRegion="polite" style={[styles.secondary, text]}>{isRTL ? "تعذر تحديث المراكز. يمكنك البحث في البيانات المحلية المتاحة." : "Couldn’t update centers. Available local records are still searchable."}</Text>
        <Pressable accessibilityRole="button" onPress={() => centers.refetch()} style={styles.retry}>
          <Text style={[styles.link, text]}>{isRTL ? "إعادة المحاولة" : "Retry"}</Text>
        </Pressable>
      </View>}
      {!results.length && !centers.isFetching && <Text accessibilityLiveRegion="polite" style={[styles.secondary, text]}>
        {isRTL ? "لم نعثر على نتائج. جرّب اسماً آخر أو كلمة أقصر." : "No results found. Try another name or a shorter search."}
      </Text>}
      {results.slice(0, limit).map(item => <Pressable key={item.key} accessibilityRole="button"
        accessibilityLabel={`${item.name[lang]}، ${SEARCH_CATEGORIES[item.category][lang]}`}
        onPress={() => { Keyboard.dismiss(); router.push(item.href); }} style={({ pressed }) => [styles.result, pressed && { opacity: 0.75 }]}>
        <Text style={[styles.name, text]}>{item.name[lang]}</Text>
        <Text style={[styles.category, text]}>{SEARCH_CATEGORIES[item.category][lang]}</Text>
        {!!item.details[lang] && <Text numberOfLines={2} style={[styles.secondary, text]}>{item.details[lang]}</Text>}
        {!!item.note && <Text style={[styles.secondary, text]}>{item.note[lang]}</Text>}
      </Pressable>)}
      {results.length > limit && <Pressable accessibilityRole="button" onPress={() => setLimit(n => n + 20)} style={styles.retry}>
        <Text style={[styles.link, text]}>{isRTL ? "عرض المزيد" : "Show more"}</Text>
      </Pressable>}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  bar: { minHeight: 50, borderRadius: 16, paddingHorizontal: 16, marginBottom: 12, direction: "ltr", alignItems: "center", backgroundColor: homeTheme.surface, borderWidth: 1, borderColor: homeTheme.border, gap: 10 },
  input: { flex: 1, minWidth: 0, color: homeTheme.ink, paddingVertical: 8, fontSize: 14, lineHeight: 21, fontWeight: "500" },
  clear: { minWidth: 32, minHeight: 44, alignItems: "center", justifyContent: "center" },
  results: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 14, marginBottom: 16, gap: 10 },
  heading: { fontSize: typography.menu, fontWeight: "700", color: colors.text },
  name: { fontSize: typography.menu, fontWeight: "700", color: colors.text },
  category: { fontSize: typography.caption, fontWeight: "700", color: colors.textSecondary },
  secondary: { fontSize: typography.caption, color: colors.textSecondary, flexShrink: 1 },
  result: { paddingVertical: 12, gap: 3, borderTopWidth: 1, borderTopColor: colors.borderLight },
  status: { gap: 8, alignItems: "center" }, retry: { minHeight: 44, justifyContent: "center" },
  link: { fontSize: typography.body, fontWeight: "700", color: colors.textSecondary },
});
