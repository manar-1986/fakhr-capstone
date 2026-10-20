import { controls as sharedControls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useCallback } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../ui/AppText";
import { useAuth } from "../../context/AuthContext";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { ACCOUNT_REQUIRED_HREF, setPendingAuthHref } from "../../utils/authRedirect";
import { FAKHR_COMMUNITY_CATEGORIES } from "../../constants/fakhrCommunity";
import { colors } from "../../theme/colors";
import type { CommunityPost } from "../../api/community.api";
export const COMMUNITY_ROOT = "/(tabs)/community";
export const createPostHref = `${COMMUNITY_ROOT}/create`;
export const postHref = (id: string) => `${COMMUNITY_ROOT}/post?id=${encodeURIComponent(id)}`;
export function useCommunityUI() {
  const layout = useI18nLayout();
  const { user, loading } = useAuth();
  const router = useRouter();
  const text = (ar: string, en: string) => layout.isRTL ? ar : en;
  const go = useCallback((href: string) => router.push(href as Href), [router]);
  const requireLogin = useCallback((href: string) => {
    if (loading) return false;
    if (user) return true;
    setPendingAuthHref(href as Href);
    router.push(ACCOUNT_REQUIRED_HREF);
    return false;
  }, [loading, user, router]);
  return { ...layout, user, loading, router, go, requireLogin, text, row: { flexDirection: layout.tabRow }, txt: { textAlign: layout.align } };
}
export function CommunityButton({ title, onPress, disabled, primary = false, icon }: { title: string; onPress: () => void; disabled?: boolean; primary?: boolean; icon?: React.ComponentProps<typeof Ionicons>["name"] }) {
  const { row } = useCommunityUI();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[c.button, row, primary && c.primary, disabled && { opacity: .5 }]}>
    {icon && <Ionicons name={icon} size={20} color={primary ? colors.white : colors.brand} />}<Text style={[c.buttonText, primary && { color: "#0B093B" }]}>{title}</Text>
  </Pressable>;
}
export function ApiPostCard({ post, full = false, busy = false, onOpen, onLike, onSave }: { post: CommunityPost; full?: boolean; busy?: boolean; onOpen?: () => void; onLike: () => void; onSave: () => void }) {
  const { row, txt, text, locale, isRTL } = useCommunityUI();
  const category = FAKHR_COMMUNITY_CATEGORIES.find(item => item.id === post.tags[0]);
  const name = post.author.name || text("ولي أمر", "Parent");
  return <View style={c.card}>
    <View style={[c.row, row]}>
      <View accessibilityLabel={name} style={c.avatar}><Ionicons name="person-outline" size={23} color={colors.brandMuted} /></View>
      <View style={{ flex: 1 }}><Text style={[c.author, txt]}>{name}</Text><Text style={[c.muted, txt]}>{new Date(post.createdAt).toLocaleString(locale === "ar" ? "ar-KW" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</Text></View>
    </View>
    {category && <Text style={[c.tag, txt]}>{isRTL ? category.ar : category.en}</Text>}
    {post.visibility === "members" && <Text style={[c.muted, txt]}>{text("للأعضاء فقط", "Members only")}</Text>}
    <Pressable accessibilityRole={onOpen ? "button" : undefined} disabled={!onOpen} onPress={onOpen} accessibilityLabel={post.title}>
      <Text style={[c.postTitle, txt]}>{post.title}</Text>
      <Text numberOfLines={full ? undefined : 3} style={[c.body, txt]}>{post.content}</Text>
      {post.imageUrl && <Image accessibilityLabel={text("صورة المشاركة", "Post image")} source={{ uri: post.imageUrl }} style={c.postImage} resizeMode="cover" />}
    </Pressable>
    <View style={[c.actions, row]}>
      <Pressable accessibilityRole="button" accessibilityLabel={text("إعجاب", "Like")} accessibilityState={{ selected: post.isLiked, disabled: busy }} disabled={busy} onPress={onLike} style={[c.action, row]}><Ionicons name={post.isLiked ? "heart" : "heart-outline"} size={23} color={colors.brand} /><Text style={c.buttonText}>{post.likes}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={text("التعليقات", "Comments")} onPress={onOpen} disabled={!onOpen} style={[c.action, row]}><Ionicons name="chatbubble-outline" size={21} color={colors.brand} /><Text style={c.buttonText}>{post.commentCount}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={text(post.isSaved ? "إلغاء الحفظ" : "حفظ المشاركة", post.isSaved ? "Unsave post" : "Save post")} accessibilityState={{ selected: post.isSaved, disabled: busy }} disabled={busy} onPress={onSave} style={c.action}><Ionicons name={post.isSaved ? "bookmark" : "bookmark-outline"} size={23} color={colors.brand} /></Pressable>
    </View>
  </View>;
}
export const c = StyleSheet.create({
  safe: { flex: 1, backgroundColor: `${colors.brandPale}26` }, content: { padding: 16, gap: 14 },
  header: { paddingVertical: 10, gap: 8 }, title: { fontSize: typography.title, fontWeight: typography.weightSemibold, color: colors.text, flexShrink: 1 }, subtitle: { fontSize: typography.body, lineHeight: typography.bodyLineHeight, color: colors.textMuted },
  row: { alignItems: "center", gap: 10 }, card: {  gap: 10,        ...sharedControls.card },
  button: {     backgroundColor: colors.borderLight,   gap: 7 , ...sharedControls.button }, primary: { backgroundColor: colors.brand }, buttonText: { color: colors.textSecondary, fontSize: typography.button, textAlign: "center", flexShrink: 1 },
  input: { minHeight: 46, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: `${colors.brandPale}1A`, color: colors.textSecondary, fontSize: typography.body },
  author: { color: colors.textSecondary, fontSize: typography.cardTitle, fontWeight: typography.weightMedium }, muted: { color: colors.textMuted, fontSize: typography.secondary, lineHeight: typography.secondaryLineHeight }, body: { color: colors.textSecondary, fontSize: typography.body, lineHeight: typography.bodyLineHeight }, postTitle: { color: colors.textSecondary, fontSize: typography.cardTitle, fontWeight: typography.weightMedium, lineHeight: typography.cardTitleLineHeight, marginBottom: 5 },
  avatar: { width: 43, height: 43, backgroundColor: colors.borderLight, borderRadius: 22, alignItems: "center", justifyContent: "center" }, tag: { fontSize: typography.helper, color: colors.textSecondary, backgroundColor: colors.borderLight, padding: 6, borderRadius: 9, alignSelf: "stretch" },
  postImage: { width: "100%", height: 150, borderRadius: 13, marginTop: 10 }, actions: { alignItems: "center", justifyContent: "space-between" }, action: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center", gap: 6 },
  error: { color: "#A04F69", fontSize: typography.helper, lineHeight: typography.helperLineHeight }, chips: { gap: 8, paddingVertical: 4 }, chip: { width: 90, padding: 10, minHeight: 90, borderRadius: 15, backgroundColor: colors.borderLight, alignItems: "center", justifyContent: "center", gap: 8 }, selected: { backgroundColor: `${colors.brandSoft}66`, borderWidth: 1, borderColor: colors.brandPale }, chipText: { fontSize: typography.button, lineHeight: typography.buttonLineHeight, textAlign: "center", color: colors.textSecondary },
});
