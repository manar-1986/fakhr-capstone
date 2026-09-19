import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { libraryColors as c } from "../../../constants/libraryTheme";

/**
 * Bookings tab — placeholder list until appointments API is wired.
 */
export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.body}>
        <View style={styles.header}>
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
  title: { fontSize: 24, fontWeight: "700", color: c.text },
  sub: { fontSize: 15, lineHeight: 22, color: c.textMuted },
});
