import { homeTheme } from "../../theme/home";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Image, PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { centersListQueryKey, getCenters, getCenterDetails } from "../../api/directory.api";
import { buildHomeCarouselRecords, centerRecordId, eligibleCarouselCenter } from "../../utils/homeCarouselRecords";
import { Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors, typography } from "../../theme";

export default function HomeAdCarousel() {
  const { isRTL, align, dir } = useI18nLayout();
  const { fontScale } = useWindowDimensions();
  const router = useRouter();
  const focused = useIsFocused();
  const centers = useQuery({ queryKey: centersListQueryKey(), queryFn: () => getCenters(), enabled: focused, retry: 1 });
  const candidate = centers.data?.find(eligibleCarouselCenter);
  const backendId = centerRecordId(candidate);
  const centerDetails = useQuery({ queryKey: ["center", backendId], queryFn: () => getCenterDetails(backendId), enabled: focused && !!backendId, retry: 1 });
  // Only advertise an API record after its own detail endpoint returns the same ID.
  const resolvedCenter = centerRecordId(centerDetails.data) === backendId && backendId && !centerDetails.isError ? centerDetails.data : undefined;
  const ads = useMemo(() => buildHomeCarouselRecords(resolvedCenter), [resolvedCenter]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  const ignorePressUntil = useRef(0);
  const change = useCallback((step: number) => setIndex(i => ads.length ? (i + step + ads.length) % ads.length : 0), [ads.length]);
  const displayIndex = ads.length ? index % ads.length : 0;

  useEffect(() => {
    const app = AppState.addEventListener("change", state => setActive(state === "active"));
    return () => app.remove();
  }, []);

  const autoRotate = focused && active && !paused && !dragging && ads.length > 1;
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => change(1), 5000);
    return () => clearInterval(timer);
  }, [autoRotate, change, index]); // A manual change receives a fresh five seconds.

  const swipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderGrant: () => { ignorePressUntil.current = Date.now() + 400; setDragging(true); },
    onPanResponderRelease: (_, gesture) => {
      // Browsers can emit a click after a drag; a swipe must never open an ad.
      ignorePressUntil.current = Date.now() + 400;
      if (Math.abs(gesture.dx) >= 40) change((gesture.dx < 0 ? 1 : -1) * (isRTL ? -1 : 1));
      setDragging(false);
    },
    onPanResponderTerminate: () => { ignorePressUntil.current = Date.now() + 400; setDragging(false); },
    onPanResponderTerminationRequest: () => true,
  }), [change, isRTL]);

  const ad = ads[displayIndex];
  if (!ad) return null;
  const lang = isRTL ? "ar" : "en";
  const title = ad.name[lang];
  const cta = isRTL ? "عرض التفاصيل" : "View Details";
  return <View testID="home-ad-carousel" style={[styles.banner, { minHeight: Math.max(210, 102 + 84 * fontScale) }]}>
    <View {...swipe.panHandlers} style={styles.swipe} testID="ad-swipe-surface">
      <Pressable testID="home-carousel-record" onPress={() => { if (Date.now() >= ignorePressUntil.current) router.push(ad.href); }} accessibilityRole="button" accessibilityLabel={`${title}. ${ad.description[lang]}. ${cta}`}
        style={({ pressed }) => [styles.ad, { flexDirection: isRTL ? "row" : "row-reverse" }, pressed && { opacity: 0.9 }]}>
        <View style={styles.copy}>
          <Text numberOfLines={2} style={[styles.title, { textAlign: align, writingDirection: dir }]}>{title}</Text>
          {!!ad.description[lang] && <Text numberOfLines={1} style={[styles.description, { textAlign: align, writingDirection: dir }]}>{ad.description[lang]}</Text>}
          <View style={[styles.cta, { alignSelf: isRTL ? "flex-end" : "flex-start", flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <Text style={styles.ctaText}>{cta}</Text>
            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={16} color={colors.white} />
          </View>
        </View>
        <View style={styles.art} pointerEvents="none" accessible={false}>
          {ad.image ? <Image source={ad.image} resizeMode="contain" style={styles.image} /> : <View style={styles.artCircle}><Ionicons name={ad.icon} size={50} color={colors.textSecondary} /></View>}
        </View>
      </Pressable>
    </View>
    <View style={[styles.controls, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
      <Text numberOfLines={2} style={styles.sample}>{ad.note[lang]}</Text>
      <View style={[styles.dots, { flexDirection: isRTL ? "row-reverse" : "row" }]} accessible accessibilityLabel={`${displayIndex + 1} / ${ads.length}`}>
        {ads.map((item, i) => <View key={item.id} style={[styles.dot, i === displayIndex && styles.selectedDot]} />)}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={isRTL ? "الإعلان السابق" : "Previous advertisement"} onPress={() => change(-1)} style={styles.control}>
        <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={18} color={homeTheme.blue} />
      </Pressable>
      {<Pressable accessibilityRole="button" accessibilityLabel={paused ? (isRTL ? "تشغيل الإعلانات" : "Play advertisements") : (isRTL ? "إيقاف الإعلانات مؤقتاً" : "Pause advertisements")}
        onPress={() => setPaused(value => !value)} style={styles.control}>
        <Ionicons name={paused ? "play" : "pause"} size={16} color={homeTheme.blue} />
      </Pressable>}
      <Pressable accessibilityRole="button" accessibilityLabel={isRTL ? "الإعلان التالي" : "Next advertisement"} onPress={() => change(1)} style={styles.control}>
        <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={homeTheme.blue} />
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  banner: { width: "100%", borderRadius: 24, marginBottom: 18, backgroundColor: homeTheme.lavender, borderWidth: 1, borderColor: homeTheme.border, overflow: "hidden", direction: "ltr" },
  swipe: { flex: 1 }, ad: { flex: 1, alignItems: "stretch", minHeight: 166 },
  copy: { flex: 1, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 16, gap: 8 },
  title: { fontSize: typography.menu, lineHeight: 24, fontWeight: "700", color: homeTheme.ink },
  description: { fontSize: typography.caption, lineHeight: 18, color: homeTheme.muted },
  image: { width: "100%", height: "100%", position: "absolute", backgroundColor: colors.white },
  cta: { backgroundColor: homeTheme.blue, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, gap: 4, alignItems: "center" },
  ctaText: { fontSize: typography.navigation, fontWeight: "600", color: colors.white },
  art: { width: "36%", backgroundColor: "#E6ECFC", alignItems: "center", justifyContent: "center" },
  artCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#D5DFFA", alignItems: "center", justifyContent: "center" },
  controls: { minHeight: 44, alignItems: "center", paddingHorizontal: 10, gap: 4 },
  sample: { fontSize: 12, color: homeTheme.muted, flex: 1 },
  dots: { alignItems: "center", gap: 4, marginHorizontal: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.brandPale }, selectedDot: { width: 14, backgroundColor: homeTheme.blue },
  control: { minWidth: 32, minHeight: 44, alignItems: "center", justifyContent: "center" },
});
