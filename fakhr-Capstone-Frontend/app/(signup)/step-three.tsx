import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signupColors as c } from "../../constants/signupTheme";

/**
 * Placeholder for step 3 of the signup flow (after Child Profile Setup).
 */
export default function SignupStepThreeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={26} color={c.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Continue</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.body}>
        <Text style={styles.kicker}>Step 3 of 4</Text>
        <Text style={styles.title}>Almost there</Text>
        <Text style={styles.sub}>
          This screen is a placeholder for the next step in your journey.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.primaryText}>Continue to app</Text>
          <Ionicons name="arrow-forward" size={20} color={c.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bgApp },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: c.text },
  headerSpacer: { width: 40 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  kicker: { fontSize: 13, color: c.textMuted, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "700", color: c.text, marginBottom: 12 },
  sub: { fontSize: 15, lineHeight: 22, color: c.textMuted, marginBottom: 32 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryText: { fontSize: 17, fontWeight: "700", color: c.white },
  pressed: { opacity: 0.88 },
});
