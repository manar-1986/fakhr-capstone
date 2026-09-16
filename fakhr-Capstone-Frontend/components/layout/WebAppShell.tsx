import React from "react";
import { Platform, StyleSheet, View } from "react-native";

export const WEB_PHONE_WIDTH = 430;

/** On web, keep the Fakhr UI in a phone-width column so tabs/home match the Thursday layout. */
export function WebAppShell({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    minHeight: "100vh" as unknown as number,
    alignItems: "center",
    backgroundColor: "#E8EAF0",
  },
  phone: {
    width: "100%",
    maxWidth: WEB_PHONE_WIDTH,
    flex: 1,
    minHeight: "100vh" as unknown as number,
    backgroundColor: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },
});
