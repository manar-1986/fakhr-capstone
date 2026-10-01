import { colors } from "../../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getCommunityPosts, setCommunityInteraction, type CommunityPost, type CommunitySort } from "../../../api/community.api";
import { FAKHR_COMMUNITY_CATEGORIES } from "../../../constants/fakhrCommunity";
import { ApiPostCard, CommunityButton, COMMUNITY_ROOT, createPostHref, postHref, useCommunityUI, c } from "../../../components/community/FakhrCommunityUI";

export default function FakhrCommunityScreen() {
  const { text, row, txt, isRTL, user, go, requireLogin, router } = useCommunityUI();
  const { sort: initialSort } = useLocalSearchParams<{ sort?: string }>();
  const insets = useSafeAreaInsets();
  const client = useQueryClient();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<CommunitySort>(initialSort === "saved" && user ? "saved" : "latest");
  const [more, setMore] = useState(false);
  const filters = useRef<ScrollView>(null);
  useEffect(() => { const timer = setTimeout(() => setSearchQuery(search.trim()), 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => { if (!user) setSort("latest"); else if (initialSort === "saved") setSort("saved"); }, [user, initialSort]);
  const feed = useInfiniteQuery({
    queryKey: ["community", "feed", user?.id, category, searchQuery, sort], initialPageParam: 1,
    queryFn: ({ pageParam }) => getCommunityPosts({ page: pageParam, category, search: searchQuery, sort }),
    getNextPageParam: page => page.pagination.page < page.pagination.totalPages ? page.pagination.page + 1 : undefined,
    retry: false,
  });
  const pinned = useQuery({ queryKey: ["community", "pinned", user?.id], queryFn: () => getCommunityPosts({ pinned: true }), retry: false });
  const interaction = useMutation({ mutationFn: ({ post, action }: { post: CommunityPost; action: "like" | "save" }) => setCommunityInteraction(post.id, action, action === "like" ? !post.isLiked : !post.isSaved), onSuccess: () => client.invalidateQueries({ queryKey: ["community"] }) });
  const interact = (post: CommunityPost, action: "like" | "save") => { if (requireLogin(postHref(post.id))) interaction.mutate({ post, action }); };
  const rows = feed.data?.pages.flatMap(page => page.posts) ?? [];
  const important = pinned.data?.posts[0];
  return <SafeAreaView style={c.safe} edges={["top"]}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[c.content, { paddingBottom: 90 + insets.bottom }]}>
      <View style={c.header}>
        <View style={[c.row, row]}><Pressable accessibilityRole="button" accessibilityLabel={text("رجوع", "Back")} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/home")} style={c.action}><Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={23} color={colors.brandMuted} /></Pressable><Text accessibilityRole="header" style={[c.title, txt]}>{text("مجتمع فخر", "Fakhr Community")}</Text><Ionicons name="people" size={38} color={colors.brandMuted} /></View>
        <Text style={[c.subtitle, txt]}>{text("معًا.. نصنع فرقًا أكبر", "Together, we make a bigger difference")}</Text>
      </View>
      <View style={c.card}>
        <TextInput accessibilityLabel={text("البحث في المجتمع", "Search community")} placeholder={text("ابحث في المواضيع والتجارب...", "Search topics and experiences...")} value={search} onChangeText={setSearch} maxLength={200} placeholderTextColor={colors.textMuted} style={[c.input, txt]} />
        <CommunityButton title={text("مشاركة جديدة", "New Post")} icon="add" primary onPress={() => { if (requireLogin(createPostHref)) go(createPostHref); }} />
        <ScrollView key={String(isRTL)} ref={filters} horizontal showsHorizontalScrollIndicator={false} style={{ direction: "ltr" }} contentContainerStyle={[c.chips, row]} onContentSizeChange={() => { if (isRTL) filters.current?.scrollToEnd({ animated: false }); }}>
          {FAKHR_COMMUNITY_CATEGORIES.filter((_, index) => more || index < 6).map(item => <Pressable accessibilityRole="button" accessibilityState={{ selected: category === item.id }} key={item.id} onPress={() => setCategory(item.id)} style={[c.chip, category === item.id && c.selected]}><Ionicons name={item.icon} size={25} color={colors.brandMuted} /><Text style={c.chipText}>{isRTL ? item.ar : item.en}</Text></Pressable>)}
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore(!more)} style={c.chip}><Ionicons name="ellipsis-horizontal" size={25} color={colors.brandMuted} /><Text style={c.chipText}>{text(more ? "أقل" : "المزيد", more ? "Less" : "More")}</Text></Pressable>
        </ScrollView>
      </View>
      <View style={[c.card, { backgroundColor: `${colors.brandSoft}26` }]}>
        <View style={[c.row, row]}><Ionicons name="megaphone-outline" size={23} color={colors.brandMuted} /><Text style={[c.author, txt]}>{text("موضوع مهم", "Important Topic")}</Text></View>
        {pinned.isPending ? <ActivityIndicator color={colors.brandMuted} /> : pinned.isError ? <Text style={[c.muted, txt]}>{text("تعذر تحميل المواضيع المهمة الآن.", "Important topics could not be loaded.")}</Text> : important ? <Pressable accessibilityRole="button" onPress={() => go(postHref(important.id))}><Text style={[c.postTitle, txt]}>{important.title}</Text><Text numberOfLines={2} style={[c.body, txt]}>{important.content}</Text></Pressable> : <Text style={[c.body, txt]}>{text("لا توجد مواضيع مثبّتة حاليًا.", "No pinned topics yet.")}</Text>}
      </View>
      <View style={[c.row, row, { backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 5, gap: 3 }]}>{([
        ["latest", text("الأحدث", "Latest")], ["engaged", text("الأكثر تفاعلًا", "Most Engaged")], ["saved", text("المحفوظة", "Saved")],
      ] as [CommunitySort, string][]).map(([id, label]) => <Pressable accessibilityRole="button" accessibilityState={{ selected: sort === id }} key={id} onPress={() => { if (id !== "saved" || requireLogin(`${COMMUNITY_ROOT}?sort=saved`)) setSort(id); }} style={[c.button, { flex: 1, paddingHorizontal: 4, backgroundColor: sort === id ? colors.brand : "transparent" }]}><Text style={[c.buttonText, sort === id && { color: colors.white }]}>{label}</Text></Pressable>)}</View>
      {interaction.isError && <Text accessibilityRole="alert" style={[c.error, txt]}>{text("تعذر إتمام الإجراء. حاول مرة أخرى.", "Could not complete the action. Please try again.")}</Text>}
      {feed.isPending ? <ActivityIndicator color={colors.brandMuted} /> : feed.isError ? <View style={c.card}><Text style={[c.error, txt]}>{text("تعذر تحميل المشاركات. تحقق من الاتصال وحاول مرة أخرى.", "Could not load posts. Check your connection and try again.")}</Text><CommunityButton title={text("إعادة المحاولة", "Retry")} onPress={() => { void feed.refetch(); void pinned.refetch(); }} /></View> : !rows.length ? <View style={c.card}><Text style={[c.body, txt]}>{text("لا توجد مشاركات لعرضها هنا بعد.", "No posts to show here yet.")}</Text></View> : rows.map(post => <ApiPostCard key={post.id} post={post} busy={interaction.isPending} onOpen={() => go(postHref(post.id))} onLike={() => interact(post, "like")} onSave={() => interact(post, "save")} />)}
      {feed.hasNextPage && <CommunityButton title={text("عرض المزيد", "Load more")} disabled={feed.isFetchingNextPage} onPress={() => { void feed.fetchNextPage(); }} />}
    </ScrollView>
  </SafeAreaView>;
}
