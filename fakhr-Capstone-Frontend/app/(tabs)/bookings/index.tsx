import { Text } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { libraryColors as c } from "../../../constants/libraryTheme";
import { useAuth } from "../../../context/AuthContext";
import { setPendingAuthHref } from "../../../utils/authRedirect";
import { useRouter } from "expo-router";

/**
 * Bookings tab — placeholder list until appointments API is wired.
 */
export default function BookingsScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) return;
    setPendingAuthHref("/(tabs)/bookings");
    router.replace("/(auth)/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <SafeAreaView style={styles.safe} edges={["top"]} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.body}>
        <View style={[styles.header, { height: undefined, minHeight: 56, paddingHorizontal: 44 }]}>
          <HeaderBackButton color={c.text} fallbackHref="/(tabs)/profile" />
          <Text style={styles.title}>Bookings</Text>
        </View>
        <Text style={styles.sub}>
          Your upcoming appointments will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bgApp },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 110,
  },
  header: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: typography.title, fontWeight: "700", color: c.text },
  sub: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: c.textMuted },
});
