import { controls as sharedControls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, ScrollView } from "../../components/ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { completeWelcome } from "../../utils/welcome";

export default function WelcomeScreen() {
  const { isRTL } = useI18nLayout();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const artworkWidth = Math.min(width, 430, Math.max(240, (height - 190) * 852 / 1320));
  async function start() {
    if (busy) return;
    setBusy(true);
    await completeWelcome();
    router.replace("/(tabs)/home");
  }
  return <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={s.content}>
      {/* Display only the supplied artwork, including the unchanged logo and all four children.
          Screenshot text/buttons below y=1320 are clipped; accessible live controls follow. */}
      <View style={[s.artwork, { width: artworkWidth, height: artworkWidth * 1320 / 852 }]}>
        <Image source={require("../../assets/images/welcome-reference.jpeg")} style={{ width: artworkWidth, height: artworkWidth * 1846 / 852 }} resizeMode="stretch" accessibilityLabel={isRTL ? "شعار فخر وأطفال، بينهم طفل يستخدم كرسياً متحركاً" : "Fakhr logo and children, including a child using a wheelchair"} />
      </View>
      <View style={s.actions}>
        <Text accessibilityRole="header" style={s.heading}>{isRTL ? "لأن الاختلاف قوة" : "Because difference is strength"}</Text>
        <Pressable testID="welcome-start" accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={start} style={({ pressed }) => [s.button, (pressed || busy) && { opacity: 0.8 }]}>
          <Text style={s.buttonText}>{isRTL ? "ابدأ الآن" : "Get Started"}</Text>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={26} color="white" />
        </Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: fakhrColors.background }, content: { flexGrow: 1, width: "100%", maxWidth: 430, alignSelf: "center", alignItems: "center", justifyContent: "center", paddingBottom: 24 },
  artwork: { overflow: "hidden" }, actions: { width: "100%", paddingHorizontal: 28 }, heading: { color: fakhrColors.text, fontSize: typography.title, fontWeight: typography.weightSemibold, textAlign: "center", marginBottom: 22 },
  button: {     backgroundColor: fakhrColors.primary, borderTopWidth: 2, borderTopColor: fakhrColors.secondary, flexDirection: "row", gap: 12,   ...sharedControls.button }, buttonText: { color: "#0B093B", fontWeight: typography.weightMedium, fontSize: typography.button },
});
