import { colors } from "../../../theme/colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, type Href } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { commentOnCommunityPost, getCommunityPost, reportCommunityPost, setCommunityInteraction } from "../../../api/community.api";
import { ApiPostCard, CommunityButton, COMMUNITY_ROOT, postHref, useCommunityUI, c } from "../../../components/community/FakhrCommunityUI";

export default function CommunityPostDetails() {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { user, text, txt, isRTL, locale, requireLogin, router } = useCommunityUI();
  const insets = useSafeAreaInsets(), client = useQueryClient();
  const [comment, setComment] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reported, setReported] = useState(false);
  const post = useQuery({ queryKey: ["community", "post", id, user?.id], queryFn: () => getCommunityPost(id), enabled: !!id, retry: false });
  const refresh = () => client.invalidateQueries({ queryKey: ["community"] });
  const interaction = useMutation({ mutationFn: (action: "like" | "save") => setCommunityInteraction(id, action, action === "like" ? !post.data!.isLiked : !post.data!.isSaved), onSuccess: refresh });
  const addComment = useMutation({ mutationFn: () => commentOnCommunityPost(id, comment.trim()), onSuccess: async () => { setComment(""); await refresh(); } });
  const report = useMutation({ mutationFn: () => reportCommunityPost(id, reason.trim()), onSuccess: () => { setReported(true); setReportOpen(false); setReason(""); } });
  const interact = (action: "like" | "save") => { if (requireLogin(postHref(id))) interaction.mutate(action); };
  return <SafeAreaView style={c.safe} edges={["top"]}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[c.content, { paddingBottom: 95 + insets.bottom }]}>
    <CommunityButton title={text("رجوع إلى المجتمع", "Back to Community")} icon={isRTL ? "arrow-forward" : "arrow-back"} onPress={() => router.replace(COMMUNITY_ROOT as Href)} />
    {!id || post.isError ? <View style={c.card}><Text style={[c.error, txt]}>{text("تعذر تحميل المشاركة أو أنها غير متاحة لك.", "This post could not be loaded or is not available to you.")}</Text><CommunityButton title={text("إعادة المحاولة", "Retry")} onPress={() => { void post.refetch(); }} /></View> : post.isPending ? <ActivityIndicator /> : post.data && <>
      <ApiPostCard post={post.data} full busy={interaction.isPending} onLike={() => interact("like")} onSave={() => interact("save")} />
      {interaction.isError && <Text accessibilityRole="alert" style={[c.error, txt]}>{text("تعذر إتمام الإجراء. حاول مرة أخرى.", "Could not complete the action. Please try again.")}</Text>}
      <View style={c.card}><Text accessibilityRole="header" style={[c.postTitle, txt]}>{text("التعليقات", "Comments")} ({post.data.commentCount})</Text>
        {!post.data.comments?.length && <Text style={[c.body, txt]}>{text("لا توجد تعليقات بعد.", "No comments yet.")}</Text>}
        {post.data.comments?.map(item => <View key={item.id} style={{ paddingVertical: 10, gap: 5, borderBottomWidth: 1, borderColor: colors.divider }}><Text style={[c.author, txt]}>{item.author.name || text("ولي أمر", "Parent")}</Text><Text style={[c.body, txt]}>{item.content}</Text><Text style={[c.muted, txt]}>{new Date(item.createdAt).toLocaleString(locale === "ar" ? "ar-KW" : "en-GB")}</Text></View>)}
        {user && <TextInput accessibilityLabel={text("أضف تعليقًا", "Add a comment")} placeholder={text("أضف تعليقًا...", "Add a comment...")} value={comment} onChangeText={setComment} maxLength={2000} multiline style={[c.input, txt, { minHeight: 85 }]} />}
        {addComment.isError && <Text accessibilityRole="alert" style={[c.error, txt]}>{text("لم يُحفظ التعليق. حاول مرة أخرى.", "Your comment was not saved. Please try again.")}</Text>}
        <CommunityButton title={text(user ? "إرسال التعليق" : "سجّل الدخول للتعليق", user ? "Post Comment" : "Sign in to comment")} primary disabled={addComment.isPending || (!!user && !comment.trim())} onPress={() => { if (requireLogin(postHref(id))) addComment.mutate(); }} />
      </View>
      {!post.data.isOwn && <CommunityButton title={text("الإبلاغ عن محتوى غير مناسب", "Report inappropriate content")} icon="flag-outline" disabled={reported} onPress={() => { if (requireLogin(postHref(id))) setReportOpen(!reportOpen); }} />}
      {reported && <Text accessibilityRole="alert" style={[c.body, txt]}>{text("تم إرسال البلاغ للمراجعة.", "Your report has been submitted for review.")}</Text>}
      {reportOpen && <View style={c.card}><Text style={[c.author, txt]}>{text("سبب البلاغ", "Reason for reporting")}</Text><TextInput accessibilityLabel={text("سبب البلاغ", "Report reason")} value={reason} onChangeText={setReason} maxLength={500} multiline style={[c.input, txt, { minHeight: 90 }]} />
        {report.isError && <Text accessibilityRole="alert" style={[c.error, txt]}>{text("تعذر إرسال البلاغ. قد تكون أبلغت عن هذه المشاركة سابقًا.", "Could not submit the report. You may have already reported this post.")}</Text>}
        <CommunityButton title={text("إرسال البلاغ", "Submit Report")} primary disabled={report.isPending || !reason.trim()} onPress={() => report.mutate()} /><CommunityButton title={text("إلغاء", "Cancel")} onPress={() => setReportOpen(false)} />
      </View>}
    </>}
  </ScrollView></SafeAreaView>;
}
