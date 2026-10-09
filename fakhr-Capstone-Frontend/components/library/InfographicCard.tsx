import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";
import type { LibraryInfographicItem } from "./types";

type Props = { item: LibraryInfographicItem };

export function InfographicCard({ item }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelPill}>
        <Text style={styles.labelText}>INFOGRAPHIC</Text>
      </View>
      <View style={styles.iconRing}>
        <Ionicons name="color-filter-outline" size={36} color={c.primary} />
      </View>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.pdfMeta}>{item.pdfSizeLabel}</Text>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={() => Alert.alert("Library", "Save to Library (coming soon).")}
      >
        <Ionicons name="download-outline" size={20} color={c.white} />
        <Text style={[styles.btnText, styles.btnTextSpaced]}>Save to Library</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.infographicSurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  labelPill: {
    alignSelf: "flex-start",
    backgroundColor: c.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  labelText: {
    fontSize: typography.label,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: c.textMuted,
  },
  iconRing: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: c.white,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: typography.cardTitle,
    color: c.textMuted,
    textAlign: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: typography.cardTitle,
    fontWeight: "700",
    color: c.text,
    textAlign: "center",
    lineHeight: typography.bodyLineHeight,
    marginBottom: 8,
  },
  pdfMeta: {
    fontSize: typography.caption,
    color: c.textLight,
    textAlign: "center",
    marginBottom: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingVertical: 14,
  },
  btnText: {
    color: c.white,
    fontSize: typography.button,
    fontWeight: "700",
  },
  btnTextSpaced: { marginLeft: 8 },
  pressed: { opacity: 0.9 },
});
