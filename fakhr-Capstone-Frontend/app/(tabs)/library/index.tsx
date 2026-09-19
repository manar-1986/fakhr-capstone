import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArticleCard } from "../../../components/library/ArticleCard";
import { CategoryChip } from "../../../components/library/CategoryChip";
import { InfographicCard } from "../../../components/library/InfographicCard";
import {
  DISABILITY_CATEGORIES,
  DISABILITY_TAGS,
  EXPERT_TOPICS,
  LIBRARY_FEED,
} from "../../../components/library/libraryMockData";
import { TagChip } from "../../../components/library/TagChip";
import { VideoCard } from "../../../components/library/VideoCard";
import type {
  LibraryArticleItem,
  LibraryInfographicItem,
  LibraryVideoItem,
} from "../../../components/library/types";
import { libraryColors as c } from "../../../constants/libraryTheme";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";

export default function LibraryScreen() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("physical");

  const { firstVideo, secondVideo, infographic, article } = useMemo(() => {
    const videos = LIBRARY_FEED.filter(
      (i): i is LibraryVideoItem => i.kind === "video"
    );
    const inf = LIBRARY_FEED.find(
      (i): i is LibraryInfographicItem => i.kind === "infographic"
    );
    const art = LIBRARY_FEED.find(
      (i): i is LibraryArticleItem => i.kind === "article"
    );
    return {
      firstVideo: videos[0],
      secondVideo: videos[1],
      infographic: inf,
      article: art,
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <HeaderBackButton variant="inline" color={c.text} />
          </View>
          <Text style={styles.headerTitle}>Fakhr Library</Text>
          <View style={[styles.headerSide, styles.headerSideRight]}>
            <Pressable
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
              onPress={() =>
                Alert.alert("Notifications", "No new notifications.")
              }
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={c.text}
              />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.headerIconBtn,
                styles.headerIconBtnSpaced,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                Alert.alert("Profile", "Profile shortcut (coming soon).")
              }
            >
              <Ionicons name="person-outline" size={22} color={c.text} />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color={c.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos, articles, guides..."
            placeholderTextColor={c.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Disability type */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Disability Type</Text>
          <Pressable onPress={() => Alert.alert("Library", "View all categories.")}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {DISABILITY_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              selected={categoryId === cat.id}
              onPress={() => setCategoryId(cat.id)}
            />
          ))}
        </ScrollView>
        <View style={styles.tagsWrap}>
          {DISABILITY_TAGS.map((t) => (
            <TagChip key={t} label={t} />
          ))}
        </View>

        {/* Recommended */}
        <Text style={styles.recommendedTitle}>Recommended for You</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.expertScroll}
        >
          {EXPERT_TOPICS.map((topic) => (
            <View key={topic} style={styles.expertChip}>
              <Text style={styles.expertChipText}>{topic}</Text>
            </View>
          ))}
        </ScrollView>

        {firstVideo ? <VideoCard item={firstVideo} /> : null}

        {infographic ? <InfographicCard item={infographic} /> : null}

        {article ? <ArticleCard item={article} /> : null}

        {secondVideo ? <VideoCard item={secondVideo} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.bgApp,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerSide: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSideRight: {
    justifyContent: "flex-end",
  },
  headerIconBtnSpaced: {
    marginLeft: 8,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.headerIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    paddingHorizontal: 16,
    minHeight: 48,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: c.text,
    paddingVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "600",
    color: c.textMuted,
  },
  chipsScroll: {
    paddingBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 22,
  },
  recommendedTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
    marginBottom: 12,
  },
  expertScroll: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingRight: 8,
  },
  expertChip: {
    backgroundColor: c.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
  },
  expertChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: c.textMuted,
  },
  pressed: { opacity: 0.88 },
});
