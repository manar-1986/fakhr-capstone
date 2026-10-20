import { assistantFailure } from '../../../utils/assistantFailure';
import type { ApiFailure } from '../../../utils/minimumRelease';
import EducationalSources, { withoutExactSourceFooter } from "../../../components/directory/EducationalSources";
import { isAwarenessEvidence, type AwarenessEvidence } from "../../../types/awareness";
import { useFocusEffect } from "expo-router";
import { assistantSession, saveAssistantSession } from "../../../utils/assistantSession";
import AssessmentContactCards from "../../../components/directory/AssessmentContactCards";
import type { AssessmentPresentation } from "../../../types/assessment";
import ProviderRecommendationCards from "../../../components/directory/ProviderRecommendationCards";
import type { DirectoryRecommendation, SchoolContext } from "../../../types/recommendation";
import { typography } from "../../../theme/typography";
import { colors as fakhrColors } from "../../../theme/colors";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View, ScrollView as NativeScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { useAuth } from "../../../context/AuthContext";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { getChildren, type Child } from "../../../api/children.api";
import { sendHelpMessage } from "../../../api/helpCenter.api";

const headerLogo = require("../../../assets/images/fakhr-approved-header.png");
const logo = require("../../../assets/images/fakhr-wordmark-blue.png");
const navy = "#0B093B", blue = "#607DCB", muted = "#5E6486";
type Message = { awareness?: AwarenessEvidence; assessment?: AssessmentPresentation; context?: SchoolContext | null; question?: string; id: number; text: string; user: boolean; time: string; childId: string; recommendations?: DirectoryRecommendation[]; directoryVersion?: string; language?: 'ar'|'ar-KW'|'en' };
const actions = [
  ["document-text-outline", "مراجعة خطة طفلي", "Review My Child's Plan", "ساعدني في مراجعة خطة طفلي. اسألني عن أهدافه والخطة التي أريد مشاركتها قبل تقديم اقتراحات.", "Help me review my child's plan. Ask about the goals and plan I choose to share before suggesting changes."],
  ["bulb-outline", "اقتراح نشاط", "Suggest an Activity", "ساعدني في اختيار نشاط مناسب لطفلي. اسألني عن عمره واحتياجاته وهدف النشاط أولاً.", "Help me choose an activity for my child. First ask about age, needs and the activity goal."],
  ["bag-outline", "اختيار منتج", "Choose a Product", "ساعدني في تحديد معايير اختيار منتج لطفلي. اسأل عن احتياجاته ولا تفترض توفر منتجات أو أسعار.", "Help me identify criteria for choosing a product for my child. Ask about needs; do not assume product availability or prices."],
  ["calendar-outline", "الاستعداد للجلسة", "Prepare for a Session", "ساعدني في الاستعداد لجلسة طفلي. اسألني عن نوع الجلسة والأهداف دون افتراض وجود موعد.", "Help me prepare for my child's session. Ask about the session type and goals without assuming an appointment exists."],
] as const;

export default function HelpCenterScreen() {
  const { user } = useAuth();
  return <ChatScreen key={user?.id ?? "guest"} accountId={user?.id} />;
}
function ChatScreen({ accountId }: { accountId?: string }) {
  const [session] = useState(() => assistantSession(accountId));
  const saved = session.values;
  const { isRTL } = useI18nLayout();
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const text = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [greetingTime] = useState(() => saved.greetingTime as Date || new Date());
  const [panel, setPanel] = useState<"children" | "history" | null>(null);
  const languages=useRef<Record<string,"ar"|"ar-KW"|"en">>((saved.languages as Record<string,"ar"|"ar-KW"|"en">) || {});
  const children = useQuery({ queryKey: ["assistant-children", accountId], queryFn: getChildren, enabled: !!accountId && panel === "children" });
  const [childId, setChildId] = useState<string>(saved.childId as string);
  const child = children.data?.find(c => c.id === childId) ?? (saved.child as Child | undefined) ?? children.data?.[0];
  const activeId = child?.id ?? "general";
  const contexts = useRef<Record<string, SchoolContext | undefined>>((saved.contexts as Record<string, SchoolContext | undefined>) || {});
  const [messages, setMessages] = useState<Message[]>((saved.messages as Message[]) || []);
  const [drafts, setDrafts] = useState<Record<string, string>>((saved.drafts as Record<string, string>) || {});
  const input = drafts[activeId] ?? "";
  const inputRTL = languages.current[activeId] ? languages.current[activeId] !== "en" : isRTL;
  const setInput = (value: string) => setDrafts(previous => ({ ...previous, [activeId]: value }));
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  const sequence = useRef((saved.sequence as number) || 0);
  const [error, setError] = useState("");
  const scroll = useRef<NativeScrollView>(null);
  const offset = useRef((saved.offset as number) || 0);
  useFocusEffect(useCallback(() => {
    const frame = requestAnimationFrame(() => scroll.current?.scrollTo({ y: offset.current, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, []));
  const newMessage = useRef(false);
  const previousMessages = useRef(messages.length);
  if (messages.length > previousMessages.current) newMessage.current = true;
  previousMessages.current = messages.length;
  useEffect(() => {
    saveAssistantSession(session, { messages, drafts, childId, child, contexts: contexts.current, languages: languages.current, sequence: sequence.current, greetingTime });
  }, [session, messages, drafts, childId, child, greetingTime]);
  const visible = messages.filter(m => m.childId === activeId);
  const displayName = (profile: Child) => (isRTL ? profile.nameAr : profile.nameEn)?.trim() || profile.name?.trim() || (isRTL ? profile.nameEn : profile.nameAr)?.trim() || tr("طفل", "Child");
  const childName = child ? displayName(child) : tr("لا يوجد طفل محدد", "No child selected");
  async function send(raw: string) {
    const question = raw.trim();
    if (!question || sending.current) return;
    if (!accountId) { setError(tr("سجل الدخول لإرسال رسالة إلى المساعد.", "Sign in to message the assistant.")); return; }
    sending.current = true; setPending(true); setError(""); setInput("");
    const conversation = activeId;
    setMessages(prev => [...prev, { id: ++sequence.current, text: question, user: true, time: new Date().toISOString(), childId: conversation }]);
    try {
      const answer = await sendHelpMessage({ message: question, locale: languages.current[conversation] || (isRTL?"ar":"en"), ...(contexts.current[conversation] ? {schoolContext:contexts.current[conversation]}: {}) });
      if(answer.language)languages.current[conversation]=answer.language;
      contexts.current[conversation] = answer.schoolContext || undefined;
      setMessages(prev => [...prev, { awareness:answer.awareness, assessment:answer.assessment, context: answer.schoolContext, question, language:answer.language||answer.schoolContext?.language,recommendations:answer.recommendations, directoryVersion:answer.directoryVersion, id: ++sequence.current, text: answer.message, user: false, time: answer.timestamp || new Date().toISOString(), childId: conversation }]);
    } catch (failure) {
      setError(assistantFailure(failure as ApiFailure,isRTL));
      setInput(question);
    } finally { sending.current = false; setPending(false); }
  }
  function avatar(assistant: boolean, photo?: string, large = false) {
    return <View style={[styles.avatar, large && styles.childAvatar]}>{assistant ? <Image source={logo} style={styles.avatarLogo} resizeMode="contain" /> : photo ? <Image source={{ uri: photo }} style={[styles.avatar, large && styles.childAvatar]} /> : <Ionicons name="person-outline" size={23} color={blue} />}</View>;
  }
  function bubble(m: Message) {
    const onRight = isRTL ? !m.user : m.user;
    const displayText=m.assessment?[m.assessment.introduction,m.assessment.explanation,m.assessment.medicalDisclaimer].filter(Boolean).join("\n\n"):m.text;
    const paragraphs = displayText.split(/\n\s*\n/);
    const medical = m.user ? [] : [...new Set(paragraphs.filter(value => /^(?:💜\s*)?(?:فخر منصة توعوية وداعمة للأهالي|Fakhr is an awareness and family support platform)/.test(value.trim())))];
    const admission = m.user ? [] : [...new Set(paragraphs.filter(value => /^(?:💜\s*)?(?:ننصحكم بالتواصل مع (?:المدرسة|الجهة)|Please contact the (?:school|provider) to confirm)/.test(value.trim())))];
    const fullAnswer = medical.length || admission.length ? paragraphs.filter(value => !medical.includes(value) && !admission.includes(value)).join("\n\n") : displayText;
    const evidence = !m.user && !m.assessment && isAwarenessEvidence(m.awareness) ? m.awareness : undefined;
    const answer = evidence ? withoutExactSourceFooter(fullAnswer,evidence) : fullAnswer;
    // Classify this response, not the current conversation, so history stays stable.
    const category = m.context?.category;
    const clinicalText = [m.question, answer, m.context && 'criteria' in m.context ? m.context.criteria.services.join(' ') : ''].filter(Boolean).join(' ');
    const clinical = /\b(?:medical|developmental|assessment|diagnos(?:is|e|tic)|therap(?:y|ist|eutic)|treatment|medication|iq)\b|(?:تشخيص|علاج|دواء|أدوية|ادوية|تقييم|اختبار ذكاء|تطور الطفل|نمو الطفل|تأخر نمائي|تأخر تطوري)/i.test(clinicalText);
    const showMedical = m.context?.category === 'awareness' || category === 'assessment' || category === 'doctor' || category === 'rehabilitation' || (m.context?.category === 'general' && m.context.topic === 'development') || clinical || !category;
    const messageRTL = m.language ? m.language !== 'en' : isRTL;
    return <View key={m.id} style={{gap:10}}><View style={[styles.messageRow, { flexDirection: onRight ? "row-reverse" : "row" }]}>
      {avatar(!m.user, m.user ? child?.photoUrl : undefined)}
      <View style={styles.messageBody}>{!!answer && <View testID={m.user ? "assistant-user-bubble" : "assistant-answer-bubble"} style={[styles.bubble, m.user && styles.userBubble]}><Text style={[styles.messageText, {textAlign:messageRTL?'right':'left',writingDirection:messageRTL?'rtl':'ltr'}]}>{answer}</Text></View>}


        <Text style={[styles.time, { textAlign: onRight ? "right" : "left" }]}>{new Date(m.time).toLocaleTimeString(isRTL ? "ar-KW" : "en", { hour: "2-digit", minute: "2-digit" })}</Text>
      </View>
    </View>{!!m.recommendations?.length && <ProviderRecommendationCards references={m.recommendations} version={m.directoryVersion} language={m.language}/>}
      {m.assessment&&<AssessmentContactCards data={m.assessment} language={m.language}/>}
      {admission.map((notice, index) => <View key={index} testID="assistant-admission-notice" style={styles.admissionNotice}><Text style={[styles.noticeText, {textAlign:messageRTL?'right':'left',writingDirection:messageRTL?'rtl':'ltr'}]}>{notice}</Text></View>)}
      {evidence&&<EducationalSources data={evidence} language={m.language||(isRTL?"ar":"en")}/>}
      {showMedical && medical.slice(-1).map((notice, index) => <View key={index} testID="assistant-medical-notice" style={styles.medicalNotice}><Text style={[styles.noticeText, {textAlign:messageRTL?'right':'left',writingDirection:messageRTL?'rtl':'ltr'}]}>{notice}</Text></View>)}
    </View>;
  }
  return <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
      <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" testID="assistant-chat-scroll" scrollEventThrottle={16}
        onScroll={event => { offset.current = event.nativeEvent.contentOffset.y; saveAssistantSession(session, { offset: offset.current }); }}
        onContentSizeChange={() => {
          if (newMessage.current) { newMessage.current = false; scroll.current?.scrollToEnd({ animated: true }); }
          else scroll.current?.scrollTo({ y: offset.current, animated: false });
        }}>
        <View style={styles.header}>
          <View style={[styles.backControl, isRTL ? { right: 0 } : { left: 0 }]}><HeaderBackButton testID="assistant-back" variant="inline" /></View>
          <Pressable testID="assistant-history" accessibilityRole="button" accessibilityLabel={tr("سجل المحادثة", "Chat history")} onPress={() => setPanel("history")} style={[styles.headerControl, isRTL ? { left: 0 } : { right: 0 }]}><Ionicons name="time-outline" size={25} color={navy} /></Pressable>
          <Image source={headerLogo} style={styles.logo} resizeMode="contain" accessibilityLabel="Fakhr" />
          <Text style={styles.title}>{tr("اسأل فخر", "Ask Fakhr")}</Text>
          <Text style={styles.subtitle}>{tr("مساعدك لخطة طفلك", "Your child's plan companion")}</Text>
        </View>
        <Pressable testID="assistant-child" accessibilityRole="button" disabled={pending} onPress={() => setPanel("children")} style={[styles.childCard, row]}>
          {avatar(false, child?.photoUrl, true)}<View style={[styles.flex, styles.childIdentity, row]}><Text testID="assistant-child-name" accessibilityLabel={childName} numberOfLines={1} ellipsizeMode="tail" style={[styles.childName, text, styles.flex]}>{childName}</Text><Ionicons name="chevron-down" size={17} color={navy} /></View>
          <View style={styles.childDivider} /><View style={[styles.changeAction, row]}><Text numberOfLines={1} style={styles.change}>{tr("تغيير الطفل", "Change Child")}</Text><Ionicons name="swap-horizontal" size={20} color={blue} /></View>
        </Pressable>
        <View style={[styles.messageRow, row]}>{avatar(true)}<View style={styles.greetingBody}><View style={styles.bubble}><Text style={[styles.messageText, text]}>{tr("مرحباً، كيف أقدر أساعدك اليوم؟", "Hello, how can I help you today?")}</Text></View><Text style={[styles.time, text]}>{greetingTime.toLocaleTimeString(isRTL ? "ar-KW" : "en", { hour: "2-digit", minute: "2-digit" })}</Text></View></View>
        <View style={[styles.actions, row]}>{actions.map(([icon, ar, en, arPrompt, enPrompt], index) => <Pressable key={icon} testID={`assistant-action-${index}`} accessibilityRole="button" disabled={pending} onPress={() => send(tr(arPrompt, enPrompt))} style={[styles.action, row, pending && styles.disabled]}><View style={styles.actionIcon}><Ionicons name={icon} size={23} color={blue} /></View><Text style={[styles.actionLabel, text]}>{tr(ar, en)}</Text></Pressable>)}</View>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showPrivacy }} accessibilityLabel={tr("خصوصية المحادثة", "Conversation privacy")} onPress={() => setShowPrivacy(value => !value)}><Text style={[styles.privacyToggle, text]}>{tr("خصوصية المحادثة", "Conversation privacy")} ⓘ</Text></Pressable>
        {showPrivacy && <Text style={[styles.contextNote, text]}>{tr("المحادثة لهذه الجلسة فقط. المساعد يستقبل رسالتك ومعايير بحث الدليل لهذه المحادثة فقط؛ لا يقرأ ملف الطفل أو خطته تلقائياً.", "Session-only chat. The assistant receives your message and directory search criteria for this conversation; it does not automatically read your child's profile or plan.")}</Text>}
        {visible.map(bubble)}
        {pending && <ActivityIndicator testID="assistant-loading" color={blue} accessibilityLabel={tr("جاري الرد", "Waiting for a response")} />}
        {!!error && <Text testID="assistant-error" accessibilityRole="alert" style={[styles.error, text]}>{error}</Text>}
      </ScrollView>
      <View testID="assistant-composer" style={styles.composer}>
        <View style={[styles.inputRow, row]}>
          <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={tr("المرفقات غير مدعومة", "Attachments unavailable")} style={[styles.control, styles.disabled]}><Ionicons name="attach-outline" size={24} color={blue} /></Pressable>
          <TextInput testID="assistant-input" accessibilityLabel={inputRTL ? "رسالتك" : "Your message"} value={input} onChangeText={setInput} placeholder={inputRTL ? "اكتب رسالتك..." : "Write your message..."} placeholderTextColor={muted} style={[styles.input, {textAlign: inputRTL ? "right" : "left", writingDirection: inputRTL ? "rtl" : "ltr"}]} maxLength={2000} editable={!pending} returnKeyType="send" onSubmitEditing={() => send(input)} />
          <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={tr("الصوت غير مدعوم", "Voice input unavailable")} style={[styles.control, styles.disabled]}><Ionicons name="mic-outline" size={24} color={blue} /></Pressable>
          <Pressable testID="assistant-send" accessibilityRole="button" accessibilityLabel={tr("إرسال", "Send")} disabled={pending || !input.trim()} onPress={() => send(input)} style={[styles.control, styles.send, pending && styles.disabled]}>{pending ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={21} color="white" />}</Pressable>
        </View>
        <Text style={styles.footer}>{tr("الصوت والمرفقات غير متاحين حالياً. اقتراحات للدعم وليست تشخيصاً؛ راجع المختص.", "Voice and attachments are not available. Support suggestions, not diagnoses; consult a specialist.")}</Text>
      </View>
      <Modal visible={!!panel} transparent animationType="fade" onRequestClose={() => setPanel(null)}>
        <View style={styles.overlay}><View style={styles.modal}>
          <View style={[styles.modalHeader, row]}><Text style={styles.childName}>{panel === "children" ? tr("اختر الطفل", "Choose a child") : tr("سجل هذه الجلسة", "Session history")}</Text><Pressable testID="assistant-panel-close" accessibilityRole="button" accessibilityLabel={tr("إغلاق", "Close")} onPress={() => setPanel(null)} style={styles.control}><Ionicons name="close" size={24} color={navy} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {panel === "children" ? <>
              {children.isFetching && <ActivityIndicator color={blue} />}
              {children.isError && <Pressable accessibilityRole="button" onPress={() => children.refetch()}><Text style={styles.error}>{tr("تعذر تحميل الأطفال. اضغط للمحاولة مجدداً.", "Could not load children. Tap to retry.")}</Text></Pressable>}
              {!children.isFetching && !children.isError && !children.data?.length && <Text style={styles.messageText}>{tr("لا توجد ملفات أطفال متاحة. يمكنك استخدام المساعد لأسئلة عامة بعد تسجيل الدخول.", "No child profiles available. You can ask general questions after signing in.")}</Text>}
              {children.data?.map(c => <Pressable key={c.id} testID={`assistant-child-${c.id}`} accessibilityRole="button" onPress={() => { setChildId(c.id); setError(""); setPanel(null); }} style={[styles.childCard, row]}>{avatar(false, c.photoUrl)}<Text style={[styles.childName, styles.flex, text]}>{displayName(c)}</Text>{activeId === c.id && <Ionicons name="checkmark" size={22} color={blue} />}</Pressable>)}
            </> : <><Text style={styles.contextNote}>{tr("للطفل المحدد فقط. لا تتوفر محادثات محفوظة على الخادم؛ يغادر السجل عند إغلاق هذه الشاشة.", "For the selected child only. Server history is unavailable; this history ends when the screen is closed.")}</Text>{visible.length ? visible.map(bubble) : <Text style={styles.messageText}>{tr("لا توجد رسائل بعد.", "No messages yet.")}</Text>}</>}
          </ScrollView>
        </View></View>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: fakhrColors.background, alignItems: "center" }, page: { flex: 1, minHeight: 0, width: "100%", maxWidth: 540 }, scroll: { flex: 1, minHeight: 0 }, content: { padding: 18, paddingTop: 22, paddingBottom: 20, gap: 16 },
  header: { alignItems: "center", paddingTop: 0, paddingBottom: 0 }, backControl: { position: "absolute", top: 22 }, headerControl: { position: "absolute", top: 22, width: 44, height: 44, borderRadius: 15, backgroundColor: "#EBF1FD", alignItems: "center", justifyContent: "center" },
  logo: { width: 56, height: 52 }, title: { fontSize: 18, fontWeight: typography.weightSemibold, color: navy }, subtitle: { fontSize: typography.body, color: muted, textAlign: "center" },
  childCard: { alignItems: "center", gap: 8, padding: 5, borderRadius: 22, borderWidth: 1, borderColor: "#E5E9F8", backgroundColor: "#EBF1FD" }, childName: { color: navy, fontSize: typography.cardTitle, fontWeight: typography.weightMedium }, childDivider: { width: 1, height: 34, backgroundColor: "#E1E6FA" }, childIdentity: { alignItems: "center", gap: 5 }, changeAction: { alignItems: "center", gap: 5, width: 112, flexShrink: 0, paddingHorizontal: 0 }, childAvatar: { width: 54, height: 54, borderRadius: 27, flexShrink: 0 }, change: { color: blue, fontSize: 14, flexShrink: 1 }, flex: { flex: 1, minWidth: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E7ECFF", justifyContent: "center", alignItems: "center", overflow: "hidden" }, avatarLogo: { width: 28, height: 33 },
  greetingBody: { maxWidth: "72%", flexShrink: 1 }, privacyToggle: { fontSize: 11, color: muted }, messageRow: { gap: 9, alignItems: "flex-start", marginBottom: 2 }, messageBody: { maxWidth: "82%", flexShrink: 1 }, bubble: { backgroundColor: "#EBF1FD", padding: 14, borderRadius: 21 }, userBubble: { backgroundColor: "#E3E9FF" }, messageText: { fontSize: 16, fontWeight: typography.weightRegular, lineHeight: 26, color: navy }, time: { color: muted, fontSize: typography.helper, marginTop: 4 },
  noticeText: { fontSize: 13, fontWeight: typography.weightRegular, color: "#5E6486" }, admissionNotice: { marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: "#EBF1FD" }, medicalNotice: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: "#E5E9F8" },
  actions: { flexWrap: "wrap", gap: 8 }, action: { flexBasis: "47%", flexGrow: 1, alignItems: "center", gap: 6, minHeight: 48, padding: 6, borderRadius: 18, borderWidth: 1, borderColor: "#E5E9F8", backgroundColor: "#EBF1FD" }, actionIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#E7ECFF" }, actionLabel: { flex: 1, minWidth: 0, color: navy, fontSize: 14, fontWeight: typography.weightRegular },
  contextNote: { fontSize: typography.helper, color: muted, marginBottom: 6 }, error: { fontSize: typography.helper, color: "#A03245", backgroundColor: "#FFF2F4", borderRadius: 12, padding: 12 },
  composer: { flexShrink: 0, padding: 18, shadowColor: "#607DCB", shadowOpacity: 0.08, shadowRadius: 16, elevation: 3, borderTopWidth: 0, borderColor: "#E5E9F8", backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 }, inputRow: { alignItems: "center", gap: 6 }, input: { flex: 1, minWidth: 0, minHeight: 48, borderWidth: 1, borderColor: "#E5E9F8", backgroundColor: "#EBF1FD", borderRadius: 21, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: navy }, control: { width: 40, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#EBF1FD" }, send: { backgroundColor: blue, borderRadius: 24, width: 44 }, disabled: { opacity: 0.45 }, footer: { color: muted, fontSize: typography.helper, textAlign: "center", marginTop: 8 },
  overlay: { flex: 1, backgroundColor: "rgba(15,25,60,0.35)", justifyContent: "center", padding: 20 }, modal: { backgroundColor: "white", width: "100%", maxWidth: 500, maxHeight: "80%", alignSelf: "center", borderRadius: 24, padding: 18, gap: 12 }, modalHeader: { alignItems: "center", justifyContent: "space-between" },
});




