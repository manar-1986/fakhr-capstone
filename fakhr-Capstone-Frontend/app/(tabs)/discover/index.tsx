import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WEB_PHONE_WIDTH } from "../../../components/layout/WebAppShell";
import {
  EXPLORE_ARTICLES,
  EXPLORE_CATEGORIES,
  FEATURED_CARD,
  WEEKLY_CONTENT,
  type ExploreCategoryId,
  type WeeklyContentItem,
} from "../../../components/explore/exploreDemoData";

const colors = {
  bg: "#F7F8FC",
  white: "#FFFFFF",
  title: "#3B4A8A",
  heading: "#3D4A86",
  subtitle: "#8A90A8",
  body: "#4A5168",
  brand: "#6F80B4",
  searchBg: "#FFFFFF",
  searchBorder: "#E8EBF3",
  placeholder: "#A8AEBF",
  cardBorder: "#EEF0F6",
  badgeBg: "rgba(255,255,255,0.92)",
  durationBg: "rgba(35,40,55,0.72)",
};

const DESIGN_W = 390;

export default function ExploreScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth || WEB_PHONE_WIDTH, WEB_PHONE_WIDTH);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<ExploreCategoryId>("all");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const query = search.trim();

  const weeklyItems = useMemo(() => {
    return WEEKLY_CONTENT.filter((item) => {
      const inCategory =
        categoryId === "all" || item.categoryIds.includes(categoryId);
      const inSearch = !query || item.title.includes(query);
      return inCategory && inSearch;
    });
  }, [categoryId, query]);

  const articles = useMemo(() => {
    return EXPLORE_ARTICLES.filter((item) => {
      const inCategory =
        categoryId === "all" || item.categoryIds.includes(categoryId);
      const inSearch =
        !query || item.title.includes(query) || item.subtitle.includes(query);
      return inCategory && inSearch;
    });
  }, [categoryId, query]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const padX = ms(18);
  const weeklyCardW = ms(142);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            paddingHorizontal: padX,
            paddingBottom: ms(120),
            paddingTop: ms(6),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandTextCol}>
            <Text style={[styles.brandName, { fontSize: ms(15) }]}>فخر</Text>
            <Text style={[styles.brandTag, { fontSize: ms(10) }]}>
              معك .. لفرص أكبر
            </Text>
          </View>
          <Image
            source={require("../../../assets/images/fakhr-wordmark-blue.png")}
            style={{ width: ms(28), height: ms(34) }}
            resizeMode="contain"
            accessibilityLabel="فخر"
          />
        </View>

        <Text
          style={[
            styles.pageTitle,
            { fontSize: ms(34), lineHeight: ms(44), marginTop: ms(4) },
          ]}
        >
          استكشف
        </Text>
        <Text
          style={[
            styles.pageSubtitle,
            { fontSize: ms(13), lineHeight: ms(20), marginBottom: ms(14) },
          ]}
        >
          محتوى وأنشطة مناسبة لاحتياجات طفلك
        </Text>

        <View
          style={[
            styles.searchBar,
            {
              minHeight: ms(46),
              borderRadius: ms(23),
              paddingHorizontal: ms(14),
              marginBottom: ms(18),
            },
          ]}
        >
          <Ionicons name="search-outline" size={ms(18)} color={colors.placeholder} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن موضوع، مهارة أو نشاط..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { fontSize: ms(13) }]}
            textAlign="right"
            returnKeyType="search"
          />
        </View>

        <View style={[styles.categoriesRow, { marginBottom: ms(18) }]}>
          {EXPLORE_CATEGORIES.map((cat) => {
            const selected = categoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={styles.categoryItem}
                accessibilityRole="button"
                accessibilityLabel={cat.label.replace("\n", " ")}
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    {
                      width: ms(56),
                      height: ms(56),
                      borderRadius: ms(28),
                      backgroundColor: cat.backgroundColor,
                      borderWidth: selected ? 2 : 0,
                      borderColor: cat.iconColor,
                    },
                  ]}
                >
                  <Ionicons name={cat.icon} size={ms(24)} color={cat.iconColor} />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    {
                      fontSize: ms(10),
                      lineHeight: ms(14),
                      color: selected ? colors.heading : colors.body,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.featuredCard,
            {
              borderRadius: ms(22),
              height: ms(158),
              marginBottom: ms(22),
            },
          ]}
        >
          <Image
            source={{ uri: FEATURED_CARD.imageUrl }}
            style={[styles.featuredImage, { width: "42%", height: "100%" }]}
            resizeMode="cover"
          />
          <View style={[styles.featuredCopy, { padding: ms(14) }]}>
            <Text
              style={[
                styles.featuredTitle,
                { fontSize: ms(18), lineHeight: ms(26), marginBottom: ms(6) },
              ]}
            >
              {FEATURED_CARD.title}
            </Text>
            <Text
              style={[
                styles.featuredSubtitle,
                { fontSize: ms(11), lineHeight: ms(17), marginBottom: ms(12) },
              ]}
            >
              {FEATURED_CARD.subtitle}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.featuredCta,
                {
                  borderRadius: ms(14),
                  minHeight: ms(30),
                  paddingHorizontal: ms(12),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={FEATURED_CARD.cta}
            >
              <Ionicons name="chevron-back" size={ms(14)} color={colors.white} />
              <Text style={[styles.featuredCtaText, { fontSize: ms(12) }]}>
                {FEATURED_CARD.cta}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.sectionHeader, { marginBottom: ms(12) }]}>
          <Text style={[styles.sectionTitle, { fontSize: ms(16) }]}>
            محتوى مميز هذا الأسبوع
          </Text>
          <Text style={[styles.sparkle, { fontSize: ms(14) }]}>✨</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ direction: "rtl" }}
          contentContainerStyle={[
            styles.weeklyRow,
            { paddingBottom: ms(4), gap: ms(12) },
          ]}
        >
          {weeklyItems.map((item) => (
            <WeeklyCard
              key={item.id}
              item={item}
              width={weeklyCardW}
              ms={ms}
              saved={savedIds.has(item.id)}
              onToggleSave={() => toggleSaved(item.id)}
            />
          ))}
        </ScrollView>

        <View
          style={[
            styles.articlesHeader,
            { marginTop: ms(22), marginBottom: ms(12) },
          ]}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="عرض الكل">
            <Text style={[styles.viewAll, { fontSize: ms(13) }]}>عرض الكل</Text>
          </Pressable>
          <Text style={[styles.sectionTitle, { fontSize: ms(16) }]}>
            مقالات ونصائح
          </Text>
        </View>

        {articles.map((article) => (
          <Pressable
            key={article.id}
            style={[
              styles.articleRow,
              {
                borderRadius: ms(16),
                padding: ms(10),
                marginBottom: ms(10),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={article.title}
          >
            <Ionicons name="chevron-back" size={ms(18)} color={colors.placeholder} />
            <Image
              source={{ uri: article.imageUrl }}
              style={{
                width: ms(72),
                height: ms(64),
                borderRadius: ms(12),
                marginHorizontal: ms(8),
              }}
              resizeMode="cover"
            />
            <View style={styles.articleCopy}>
              <Text
                style={[
                  styles.articleTitle,
                  { fontSize: ms(13), lineHeight: ms(20) },
                ]}
              >
                {article.title}
              </Text>
              <Text
                style={[
                  styles.articleSub,
                  { fontSize: ms(11), lineHeight: ms(16), marginTop: ms(2) },
                ]}
              >
                {article.subtitle}
              </Text>
              <View style={styles.readRow}>
                <Text style={[styles.readTime, { fontSize: ms(11) }]}>
                  {article.readTime}
                </Text>
                <Ionicons
                  name="time-outline"
                  size={ms(13)}
                  color={colors.placeholder}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function WeeklyCard({
  item,
  width,
  ms,
  saved,
  onToggleSave,
}: {
  item: WeeklyContentItem;
  width: number;
  ms: (n: number) => number;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <View style={[styles.weeklyCard, { width, borderRadius: ms(16) }]}>
      <View style={[styles.weeklyImageWrap, { height: ms(92), borderRadius: ms(14) }]}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.weeklyImage}
          resizeMode="cover"
        />
        <View style={[styles.badge, { top: ms(8), right: ms(8), borderRadius: ms(8) }]}>
          <Text style={[styles.badgeText, { fontSize: ms(10) }]}>{item.badge}</Text>
        </View>
        {item.duration ? (
          <View
            style={[
              styles.duration,
              { bottom: ms(8), left: ms(8), borderRadius: ms(8) },
            ]}
          >
            <Text style={[styles.durationText, { fontSize: ms(10) }]}>
              {item.duration}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.weeklyFooter, { paddingTop: ms(8) }]}>
        <Text
          style={[styles.weeklyTitle, { fontSize: ms(12), lineHeight: ms(18) }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Pressable
          onPress={onToggleSave}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="حفظ"
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={ms(16)}
            color={colors.brand}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignSelf: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 2,
  },
  brandTextCol: {
    alignItems: "flex-end",
    marginRight: 6,
  },
  brandName: {
    fontWeight: "800",
    color: colors.title,
    writingDirection: "rtl",
  },
  brandTag: {
    color: colors.subtitle,
    writingDirection: "rtl",
  },
  pageTitle: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  pageSubtitle: {
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.searchBg,
    borderWidth: 1,
    borderColor: colors.searchBorder,
    shadowColor: "#8A94B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.body,
    paddingVertical: 8,
    writingDirection: "rtl",
  },
  categoriesRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryItem: {
    flex: 1,
    alignItems: "center",
  },
  categoryCircle: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryLabel: {
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "rtl",
  },
  featuredCard: {
    flexDirection: "row",
    backgroundColor: "#EEF1FA",
    overflow: "hidden",
    shadowColor: "#6F80B4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  featuredImage: {
    backgroundColor: "#DDE3F4",
  },
  featuredCopy: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  featuredTitle: {
    fontWeight: "800",
    color: colors.heading,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featuredSubtitle: {
    color: "#7B84A3",
    textAlign: "right",
    writingDirection: "rtl",
  },
  featuredCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brand,
    alignSelf: "flex-end",
    gap: 4,
  },
  featuredCtaText: {
    color: colors.white,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontWeight: "800",
    color: colors.heading,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sparkle: {
    textAlign: "right",
  },
  weeklyRow: {
    flexDirection: "row",
  },
  weeklyCard: {
    backgroundColor: colors.white,
    padding: 6,
    shadowColor: "#8A94B8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyImageWrap: {
    overflow: "hidden",
    position: "relative",
  },
  weeklyImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.heading,
    fontWeight: "700",
    writingDirection: "rtl",
  },
  duration: {
    position: "absolute",
    backgroundColor: colors.durationBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  durationText: {
    color: colors.white,
    fontWeight: "700",
  },
  weeklyFooter: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 6,
  },
  weeklyTitle: {
    flex: 1,
    fontWeight: "700",
    color: colors.body,
    textAlign: "right",
    writingDirection: "rtl",
  },
  articlesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAll: {
    color: colors.brand,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  articleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    shadowColor: "#8A94B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  articleCopy: {
    flex: 1,
    alignItems: "flex-end",
  },
  articleTitle: {
    fontWeight: "800",
    color: colors.heading,
    textAlign: "right",
    writingDirection: "rtl",
  },
  articleSub: {
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  readTime: {
    color: colors.placeholder,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
