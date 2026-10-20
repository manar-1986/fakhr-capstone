import { controls as sharedControls } from "../../theme/controls";
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
    
    
    
    marginBottom: 18,
    
    
    
    
    
   ...sharedControls.card },
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
    fontSize: typography.helper,
    fontWeight: typography.weightRegular,
    letterSpacing: 0.4,
    color: c.articleBadgeText,
  },
  title: {
    fontSize: typography.cardTitle,
    fontWeight: typography.weightMedium,
    color: c.text,
    lineHeight: typography.cardTitleLineHeight,
    marginBottom: 10,
  },
  desc: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: c.textMuted,
    marginBottom: 12,
  },
  cta: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: "#0B093B",
  },
});
