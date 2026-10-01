import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { createCommunityPost } from "../../../api/community.api";
import { FAKHR_COMMUNITY_CATEGORIES } from "../../../constants/fakhrCommunity";
import { CommunityButton, COMMUNITY_ROOT, createPostHref, postHref, useCommunityUI, c } from "../../../components/community/FakhrCommunityUI";
import type { Href } from "expo-router";

export default function CreateCommunityPost() {
  const { user, loading, requireLogin, text, txt, row, isRTL, router } = useCommunityUI();
  const insets = useSafeAreaInsets(), client = useQueryClient();
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [validation, setValidation] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "members">("public");
  useEffect(() => { if (!loading && !user) requireLogin(createPostHref); }, [loading, user, requireLogin]); // Auth return is handled by existing login/register.
  const mutation = useMutation({ mutationFn: () => createCommunityPost({ title: title.trim(), content: content.trim(), tags: [category], imageUrl: imageUrl.trim() || undefined, visibility }), onSuccess: async post => { await client.invalidateQueries({ queryKey: ["community"] }); router.replace(postHref(post.id) as Href); } });
  let validImage = !imageUrl.trim();
  if (imageUrl.trim()) { try { const url = new URL(imageUrl.trim()); validImage = url.protocol === "https:" && !url.username && !url.password; } catch { validImage = false; } }
  if (loading || !user) return <SafeAreaView style={c.safe}><ActivityIndicator /></SafeAreaView>;
  return <SafeAreaView style={c.safe} edges={["top"]}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[c.content, { paddingBottom: 95 + insets.bottom }]}>
    <CommunityButton title={text("رجوع إلى المجتمع", "Back to Community")} icon={isRTL ? "arrow-forward" : "arrow-back"} onPress={() => router.replace(COMMUNITY_ROOT as Href)} />
    <Text accessibilityRole="header" style={[c.title, txt]}>{text("مشاركة جديدة", "New Post")}</Text>
    <View style={c.card}>
      <Text style={[c.body, txt]}>{text("شارك تجربتك بالقدر الذي يناسبك. لا حاجة لذكر تشخيص طفلك أو معلومات شخصية.", "Share only what you feel comfortable sharing. Your child's diagnosis and personal information are not required.")}</Text>
      <Text style={[c.author, txt]}>{text("الفئة", "Category")}</Text>
      <View style={[row, { flexWrap: "wrap", gap: 7 }]}>{FAKHR_COMMUNITY_CATEGORIES.filter(item => item.id !== "all").map(item => <CommunityButton key={item.id} title={isRTL ? item.ar : item.en} primary={category === item.id} onPress={() => setCategory(item.id)} />)}</View>
      <TextInput accessibilityLabel={text("عنوان المشاركة", "Post title")} placeholder={text("عنوان المشاركة", "Post title")} value={title} onChangeText={setTitle} maxLength={200} style={[c.input, txt]} />
      <TextInput accessibilityLabel={text("نص المشاركة", "Post text")} placeholder={text("اكتب تجربتك أو سؤالك...", "Share your experience or question...")} value={content} onChangeText={setContent} maxLength={5000} multiline style={[c.input, txt, { minHeight: 160, textAlignVertical: "top" }]} />
      <TextInput accessibilityLabel={text("رابط صورة اختياري", "Optional image URL")} placeholder={text("رابط صورة اختياري (https://)", "Optional image URL (https://)")} value={imageUrl} onChangeText={value => { setImageUrl(value); setImageFailed(false); }} autoCapitalize="none" keyboardType="url" maxLength={2048} style={[c.input, txt]} />
      {validImage && !!imageUrl.trim() && !imageFailed && <Image source={{ uri: imageUrl.trim() }} style={c.postImage} onError={() => setImageFailed(true)} />}
      {imageFailed && <Text style={[c.error, txt]}>{text("تعذر عرض الصورة. تحقق من رابط الصورة.", "Could not preview the image. Check the image URL.")}</Text>}
      <Text style={[c.author, txt]}>{text("من يمكنه قراءة المشاركة؟", "Who can read this post?")}</Text>
      <View style={[c.row, row]}><CommunityButton title={text("الجميع", "Everyone")} primary={visibility === "public"} onPress={() => setVisibility("public")} /><CommunityButton title={text("الأعضاء فقط", "Members only")} primary={visibility === "members"} onPress={() => setVisibility("members")} /></View>
      <Text style={[c.muted, txt]}>{visibility === "public" ? text("ستكون المشاركة مرئية للجميع، بما في ذلك الزوار.", "Your post will be visible to everyone, including guests.") : text("ستكون المشاركة مرئية للأعضاء المسجلين فقط.", "Your post will be visible to signed-in members only.")}</Text>
      {validation && <Text accessibilityRole="alert" style={[c.error, txt]}>{text("أضف عنوانًا ونصًا وتحقق من رابط الصورة الاختياري.", "Add a title and post text, and check the optional image URL.")}</Text>}
      {mutation.isError && <Text accessibilityRole="alert" style={[c.error, txt]}>{text("لم تُنشر المشاركة. تحقق من الاتصال وحاول مرة أخرى.", "Your post was not published. Check your connection and try again.")}</Text>}
      <CommunityButton title={text(mutation.isPending ? "جارٍ النشر..." : "نشر المشاركة", mutation.isPending ? "Publishing..." : "Publish Post")} primary disabled={mutation.isPending} onPress={() => { if (!title.trim() || !content.trim() || !validImage) { setValidation(true); return; } setValidation(false); mutation.mutate(); }} />
    </View>
  </ScrollView></SafeAreaView>;
}
