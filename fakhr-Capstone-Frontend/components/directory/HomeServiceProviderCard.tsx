import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { HOME_SERVICE_CATEGORIES, homeProviderPhoneUrl, homeServiceText, type HomeServiceProvider } from "../../constants/homeServiceProviders";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";

export default function HomeServiceProviderCard({ provider, onDetails, showSources = false }: { provider: HomeServiceProvider; onDetails?: () => void; showSources?: boolean }) {
  const { isRTL, align, dir } = useI18nLayout();
  const [error, setError] = useState(false);
  const lang = isRTL ? "ar" : "en";
  const text = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const name = provider.name[lang];
  const tel = homeProviderPhoneUrl(provider.phone);
  const open = async (url: string) => { setError(false); try { await Linking.openURL(url); } catch { setError(true); } };
  return <View style={styles.card}>
    <View style={[styles.heading, row]}>
      <View style={styles.icon}><Ionicons name={HOME_SERVICE_CATEGORIES.find(c => c.id === provider.categories[0])!.icon} size={28} color={colors.primary} /></View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text accessibilityRole="header" style={[styles.name, text]}>{name}</Text>
        <Text style={[styles.service, text]}>{provider.service[lang]}</Text>
      </View>
    </View>
    <Text style={[styles.body, text]}>{provider.description[lang]}</Text>
    <View style={styles.notice}>
      <Text style={[styles.status, text]}>{homeServiceText.review[lang]}</Text>
      <Text style={[styles.body, text]}>{provider.verification[lang]}</Text>
    </View>
    <View style={[styles.actions, row]}>
      <Pressable accessibilityRole="link" accessibilityLabel={`${homeServiceText.call[lang]} ${provider.phone}`} disabled={!tel}
        {...(Platform.OS === "web" && tel ? { href: tel } : {})}
        onPress={Platform.OS === "web" ? undefined : () => tel && void open(tel)} style={[styles.call, row]}>
        <Ionicons name="call-outline" size={20} color={colors.white} /><Text style={styles.callText}>{homeServiceText.call[lang]}</Text>
        <Text style={[styles.callText, { writingDirection: "ltr" }]}>{provider.phone}</Text>
      </Pressable>
      {onDetails && <Pressable accessibilityRole="button" accessibilityLabel={`${homeServiceText.details[lang]}: ${name}`} onPress={onDetails} style={[styles.details, row]}>
        <Text style={styles.detailText}>{homeServiceText.details[lang]}</Text><Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={colors.primary} />
      </Pressable>}
    </View>
    {showSources && <View style={{ gap: 6 }}>
      <Text style={[styles.status, text]}>{homeServiceText.sources[lang]}</Text>
      {provider.sources.map(source => <Pressable key={source.url} accessibilityRole="link" accessibilityLabel={source.title}
        {...(Platform.OS === "web" ? { href: source.url, hrefAttrs: { target: "_blank", rel: "noopener noreferrer" } } : {})}
        onPress={Platform.OS === "web" ? undefined : () => void open(source.url)} style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={[styles.detailText, text, { textDecorationLine: "underline" }]}>{source.title}</Text>
      </Pressable>)}
    </View>}
    {error && <Text accessibilityRole="alert" style={[styles.body, text]}>{homeServiceText.error[lang]}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brandPale, borderRadius: 20, padding: 16, gap: 14, direction: "ltr" },
  heading: { alignItems: "center", gap: 12 }, icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.borderLight, alignItems: "center", justifyContent: "center" },
  name: { fontSize: typography.menu, lineHeight: typography.bodyLineHeight, color: colors.text, fontWeight: "700" }, service: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.textSecondary, fontWeight: "600" },
  body: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.textSecondary }, notice: { backgroundColor: colors.borderLight, padding: 12, borderRadius: 12, gap: 6 }, status: { fontSize: typography.caption, lineHeight: typography.bodyLineHeight, fontWeight: "700", color: colors.text },
  phone: { fontSize: typography.menu, color: colors.text, writingDirection: "ltr" }, actions: { flexWrap: "wrap", gap: 10 },
  call: { minHeight: 48, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", gap: 8 }, callText: { color: colors.white, fontSize: typography.button, fontWeight: "600" },
  details: { minHeight: 48, paddingHorizontal: 8, alignItems: "center", gap: 6 }, detailText: { color: colors.primary, fontSize: typography.button, fontWeight: "600" },
});
