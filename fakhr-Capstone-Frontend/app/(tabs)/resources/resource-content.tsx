import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import React, { useLayoutEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RESOURCES,
  RESOURCE_CATEGORIES,
  type ContentType,
  type ResourceType,
  type VideoItem,
  type ArticleItem,
  type PodcastItem,
  type GuideItem,
} from "../../../constants/resources";
import { colors, spacing, typography } from "../../../theme";

const RESOURCE_LABELS: Record<ResourceType, string> = {
  add: "ADD",
  adhd: "ADHD",
  autism: "Autism",
};

export default function ResourceContentScreen() {
  const { resource, type } = useLocalSearchParams<{
    resource: ResourceType;
    type: ContentType;
  }>();
  const router = useRouter();
  const navigation = useNavigation();

  const category = type ? RESOURCE_CATEGORIES[type as ContentType] : null;
  const headerTitle =
    resource && category
      ? `${RESOURCE_LABELS[resource as ResourceType]} ${category.title}`
      : "";

  useLayoutEffect(() => {
    if (headerTitle) {
      navigation.setOptions({ headerTitle });
    }
  }, [navigation, headerTitle]);

  if (!resource || !type) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Missing resource or type</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const resourceData = RESOURCES[resource as ResourceType];
  const items = resourceData?.[type as ContentType];
  const resolvedCategory = RESOURCE_CATEGORIES[type as ContentType];

  const handleOpenResource = async (url: string) => {
    try {
      const result = await WebBrowser.openBrowserAsync(url);
      if (result.type === "cancel" || result.type === "dismiss") {
        return;
      }
    } catch {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          Alert.alert("Unable to open link", "This resource link is not supported on your device.");
          return;
        }
        await Linking.openURL(url);
      } catch {
        Alert.alert("Unable to open link", "Please try again later.");
      }
    }
  };

  if (!items || items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.empty}>
          <Ionicons name={resolvedCategory.icon as any} size={48} color={resolvedCategory.color} />
          <Text style={styles.emptyTitle}>No {resolvedCategory.title} yet</Text>
          <Text style={styles.emptyText}>
            We&apos;re curating {resolvedCategory.title.toLowerCase()} for this topic. Check back soon.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = (item: VideoItem | ArticleItem | PodcastItem | GuideItem) => {
    const isVideo = "duration" in item && !("readTime" in item) && !("pages" in item);
    const isArticle = "readTime" in item;
    const isPodcast = "duration" in item && type === "podcasts";

    const meta = isVideo || isPodcast
      ? (item as VideoItem).duration
      : isArticle
        ? (item as ArticleItem).readTime
        : (item as GuideItem).pages;

    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [styles.item, pressed && { opacity: 0.9 }]}
        onPress={() => void handleOpenResource(item.url)}
      >
        <View style={[styles.itemIcon, { backgroundColor: resolvedCategory.bgColor }]}>
          {type === "videos" ? (
            <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          ) : (
            <Ionicons
              name={resolvedCategory.icon as any}
              size={24}
              color={resolvedCategory.color}
            />
          )}
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemDesc} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.itemMeta}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.itemMetaText}>{meta}</Text>
            <View style={styles.itemDot} />
            <Text style={styles.itemSource}>{item.source}</Text>
          </View>
        </View>
        <Ionicons name="open-outline" size={20} color={colors.textMuted} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: resolvedCategory.bgColor }]}>
          <Ionicons name={resolvedCategory.icon as any} size={24} color={resolvedCategory.color} />
        </View>
        <View>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerCount}>{items.length} items</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(items as (VideoItem | ArticleItem | PodcastItem | GuideItem)[]).map(renderItem)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    color: colors.text,
  },
  headerCount: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.body,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  itemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 6,
  },
  itemSource: {
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: typography.body,
    fontWeight: typography.weightSemibold,
    color: "#FFFFFF",
  },
});
