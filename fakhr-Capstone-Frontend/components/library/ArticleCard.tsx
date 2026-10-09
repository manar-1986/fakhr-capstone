import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";
import type { LibraryArticleItem } from "./types";

type Props = { item: LibraryArticleItem };

export function ArticleCard({ item }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.readTimeLabel}</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => Alert.alert("Library", "Bookmark (coming soon).")}
        >
          <Ionicons name="bookmark-outline" size={22} color={c.textLight} />
        </Pressable>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc} numberOfLines={3}>
        {item.description}
      </Text>
      <Pressable onPress={() => Alert.alert("Library", "Open article (coming soon).")}>
        <Text style={styles.cta}>Read Full Article →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: c.articleBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: c.articleBadgeText,
  },
  title: {
    fontSize: typography.cardTitle,
    fontWeight: "700",
    color: c.text,
    lineHeight: typography.bodyLineHeight,
    marginBottom: 10,
  },
  desc: {
    fontSize: typography.body,
    lineHeight: typography.captionLineHeight,
    color: c.textMuted,
    marginBottom: 12,
  },
  cta: {
    fontSize: typography.body,
    fontWeight: "700",
    color: c.primary,
  },
});
