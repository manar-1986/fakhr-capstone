import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View, ScrollView as NativeScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Text, TextInput, ScrollView } from "../../../components/ui/AppText";
import { useAuth } from "../../../context/AuthContext";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { getChildren } from "../../../api/children.api";
import { sendHelpMessage } from "../../../api/helpCenter.api";

const logo = require("../../../assets/images/fakhr-wordmark-blue.png");
const navy = "#152467", blue = "#596CC2", muted = "#7A85B2";
type Message = { id: number; text: string; user: boolean; time: string; childId: string };
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
  const router = useRouter();
  const { isRTL } = useI18nLayout();
  const tr = (ar: string, en: string) => isRTL ? ar : en;
  const row = { flexDirection: isRTL ? "row-reverse" as const : "row" as const };
  const text = { textAlign: isRTL ? "right" as const : "left" as const, writingDirection: isRTL ? "rtl" as const : "ltr" as const };
  const children = useQuery({ queryKey: ["assistant-children", accountId], queryFn: getChildren, enabled: !!accountId });
  const [childId, setChildId] = useState<string>();
  const child = children.data?.find(c => c.id === childId) ?? children.data?.[0];
  const activeId = child?.id ?? "general";
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const input = drafts[activeId] ?? "";
  const setInput = (value: string) => setDrafts(previous => ({ ...previous, [activeId]: value }));
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  const sequence = useRef(0);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"children" | "history" | null>(null);
  const scroll = useRef<NativeScrollView>(null);
  const visible = messages.filter(m => m.childId === activeId);
  const childName = child ? (isRTL ? child.nameAr : child.nameEn) || child.name : tr("لا يوجد طفل محدد", "No child selected");
  async function send(raw: string) {
    const question = raw.trim();
    if (!question || sending.current) return;
    if (!accountId) { setError(tr("سجل الدخول لإرسال رسالة إلى المساعد.", "Sign in to message the assistant.")); return; }
    sending.current = true; setPending(true); setError(""); setInput("");
    const conversation = activeId;
    setMessages(prev => [...prev, { id: ++sequence.current, text: question, user: true, time: new Date().toISOString(), childId: conversation }]);
    try {
      const answer = await sendHelpMessage({ message: question });
      setMessages(prev => [...prev, { id: ++sequence.current, text: answer.message, user: false, time: answer.timestamp || new Date().toISOString(), childId: conversation }]);
    } catch (failure) {
      setError(tr("تعذر الحصول على رد. تحقق من الاتصال وتسجيل الدخول ثم حاول مجدداً. رسالتك محفوظة في هذه الجلسة.", "Could not get a response. Check your connection and sign-in, then try again. Your message remains in this session."));
      const status = (failure as Error & { status?: number }).status;
      if (status === 404) setError(tr("خدمة المساعد غير متاحة على الخادم الحالي (HTTP 404). لم يصل رد؛ يرجى المحاولة بعد إتاحة الخدمة.", "The assistant endpoint is unavailable on the current server (HTTP 404). No reply was received; try after the service is available."));
      else if (status) setError(tr(`تعذر الحصول على رد (HTTP ${status}). حاول لاحقاً أو تحقق من تسجيل الدخول.`, `Could not get a response (HTTP ${status}). Try later or check your sign-in.`));
      setInput(question);
    } finally { sending.current = false; setPending(false); }
  }
  function avatar(assistant: boolean, photo?: string) {
    return <View style={styles.avatar}>{assistant ? <Image source={logo} style={styles.avatarLogo} resizeMode="contain" /> : photo ? <Image source={{ uri: photo }} style={styles.avatar} /> : <Ionicons name="person-outline" size={23} color={blue} />}</View>;
  }
  function bubble(m: Message) {
    const onRight = isRTL ? !m.user : m.user;
    return <View key={m.id} style={[styles.messageRow, { flexDirection: onRight ? "row-reverse" : "row" }]}>
      {avatar(!m.user, m.user ? child?.photoUrl : undefined)}
      <View style={styles.messageBody}><View style={[styles.bubble, m.user && styles.userBubble]}><Text style={[styles.messageText, text]}>{m.text}</Text></View>
        <Text style={[styles.time, text]}>{new Date(m.time).toLocaleTimeString(isRTL ? "ar-KW" : "en", { hour: "2-digit", minute: "2-digit" })}</Text>
      </View>
    </View>;
  }
  return <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}>
      <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" onContentSizeChange={() => { if (visible.length) scroll.current?.scrollToEnd({ animated: true }); }}>
        <View style={styles.header}>
          <Pressable testID="assistant-back" accessibilityRole="button" accessibilityLabel={tr("رجوع", "Back")} onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/home")} style={[styles.headerControl, isRTL ? { right: 0 } : { left: 0 }]}><Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={25} color={navy} /></Pressable>
          <Pressable testID="assistant-history" accessibilityRole="button" accessibilityLabel={tr("سجل المحادثة", "Chat history")} onPress={() => setPanel("history")} style={[styles.headerControl, isRTL ? { left: 0 } : { right: 0 }]}><Ionicons name="time-outline" size={25} color={navy} /></Pressable>
          <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Fakhr" />
          <Text style={styles.title}>{tr("مساعد فخر", "Fakhr Assistant")}</Text>
          <Text style={styles.subtitle}>{tr("مساعدك لخطة طفلك", "Your child's plan companion")}</Text>
        </View>
        <Pressable testID="assistant-child" accessibilityRole="button" disabled={pending} onPress={() => setPanel("children")} style={[styles.childCard, row]}>
          {avatar(false, child?.photoUrl)}<View style={styles.flex}><Text style={[styles.childName, text]}>{childName}</Text></View>
          <Ionicons name="chevron-down" size={17} color={navy} /><Text style={styles.change}>{tr("تغيير الطفل", "Change Child")}</Text>
        </Pressable>
        <View style={[styles.messageRow, row]}>{avatar(true)}<View style={[styles.bubble, styles.flex]}><Text style={[styles.messageText, text]}>{tr("مرحباً، كيف أقدر أساعدك اليوم؟", "Hello, how can I help you today?")}</Text></View></View>
        <View style={[styles.actions, row]}>{actions.map(([icon, ar, en, arPrompt, enPrompt], index) => <Pressable key={icon} testID={`assistant-action-${index}`} accessibilityRole="button" disabled={pending} onPress={() => send(tr(arPrompt, enPrompt))} style={[styles.action, row, pending && styles.disabled]}><View style={styles.actionIcon}><Ionicons name={icon} size={23} color={blue} /></View><Text style={[styles.actionLabel, text]}>{tr(ar, en)}</Text></Pressable>)}</View>
        <Text style={[styles.contextNote, text]}>{tr("المحادثة لهذه الجلسة فقط. المساعد يستقبل نص رسالتك فقط؛ لا يقرأ ملف الطفل أو خطته تلقائياً.", "Session-only chat. The assistant receives your message text; it does not automatically read your child's profile or plan.")}</Text>
        {visible.map(bubble)}
        {pending && <ActivityIndicator testID="assistant-loading" color={blue} accessibilityLabel={tr("جاري الرد", "Waiting for a response")} />}
        {!!error && <Text testID="assistant-error" accessibilityRole="alert" style={[styles.error, text]}>{error}</Text>}
      </ScrollView>
      <View style={styles.composer}>
        <View style={[styles.inputRow, row]}>
          <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={tr("المرفقات غير مدعومة", "Attachments unavailable")} style={[styles.control, styles.disabled]}><Ionicons name="attach-outline" size={24} color={blue} /></Pressable>
          <TextInput testID="assistant-input" accessibilityLabel={tr("رسالتك", "Your message")} value={input} onChangeText={setInput} placeholder={tr("اكتب رسالتك...", "Write your message...")} placeholderTextColor={muted} style={[styles.input, text]} maxLength={2000} editable={!pending} returnKeyType="send" onSubmitEditing={() => send(input)} />
          <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={tr("الصوت غير مدعوم", "Voice input unavailable")} style={[styles.control, styles.disabled]}><Ionicons name="mic-outline" size={24} color={blue} /></Pressable>
          <Pressable testID="assistant-send" accessibilityRole="button" accessibilityLabel={tr("إرسال", "Send")} disabled={pending || !input.trim()} onPress={() => send(input)} style={[styles.control, styles.send, (pending || !input.trim()) && styles.disabled]}>{pending ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={21} color="white" />}</Pressable>
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
              {children.data?.map(c => <Pressable key={c.id} testID={`assistant-child-${c.id}`} accessibilityRole="button" onPress={() => { setChildId(c.id); setError(""); setPanel(null); }} style={[styles.childCard, row]}>{avatar(false, c.photoUrl)}<Text style={[styles.childName, styles.flex, text]}>{(isRTL ? c.nameAr : c.nameEn) || c.name}</Text>{activeId === c.id && <Ionicons name="checkmark" size={22} color={blue} />}</Pressable>)}
            </> : <><Text style={styles.contextNote}>{tr("للطفل المحدد فقط. لا تتوفر محادثات محفوظة على الخادم؛ يغادر السجل عند إغلاق هذه الشاشة.", "For the selected child only. Server history is unavailable; this history ends when the screen is closed.")}</Text>{visible.length ? visible.map(bubble) : <Text style={styles.messageText}>{tr("لا توجد رسائل بعد.", "No messages yet.")}</Text>}</>}
          </ScrollView>
        </View></View>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white", alignItems: "center" }, page: { flex: 1, width: "100%", maxWidth: 540 }, scroll: { flex: 1 }, content: { padding: 18, gap: 18 },
  header: { alignItems: "center", paddingTop: 4, paddingBottom: 2 }, headerControl: { position: "absolute", top: 20, width: 44, height: 44, borderRadius: 15, backgroundColor: "#F3F5FD", alignItems: "center", justifyContent: "center" },
  logo: { width: 66, height: 65 }, title: { fontSize: 23, fontWeight: "700", color: navy }, subtitle: { fontSize: 16, color: muted, textAlign: "center" },
  childCard: { alignItems: "center", gap: 8, padding: 12, borderRadius: 22, borderWidth: 1, borderColor: "#E5EAF8", backgroundColor: "#F3F6FE" }, childName: { color: navy, fontSize: 16, fontWeight: "600" }, change: { color: blue, fontSize: 13 }, flex: { flex: 1, minWidth: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E9EDFD", justifyContent: "center", alignItems: "center", overflow: "hidden" }, avatarLogo: { width: 28, height: 33 },
  messageRow: { gap: 9, alignItems: "flex-start", marginBottom: 2 }, messageBody: { maxWidth: "82%", flexShrink: 1 }, bubble: { backgroundColor: "#F1F4FE", padding: 14, borderRadius: 21 }, userBubble: { backgroundColor: "#E4EAFD" }, messageText: { fontSize: 16, lineHeight: 25, color: navy }, time: { color: muted, fontSize: 11, marginTop: 4 },
  actions: { flexWrap: "wrap", gap: 8 }, action: { flexBasis: "47%", flexGrow: 1, alignItems: "center", gap: 6, minHeight: 70, padding: 9, borderRadius: 18, borderWidth: 1, borderColor: "#E6EAF8", backgroundColor: "#F3F5FE" }, actionIcon: { width: 33, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#E9EDFD" }, actionLabel: { flex: 1, color: navy, fontSize: 14, fontWeight: "500" },
  contextNote: { fontSize: 12, color: muted, marginBottom: 6 }, error: { fontSize: 14, color: "#A03245", backgroundColor: "#FFF2F4", borderRadius: 12, padding: 12 },
  composer: { padding: 12, borderTopWidth: 1, borderColor: "#EFF1FA", backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 }, inputRow: { alignItems: "center", gap: 6 }, input: { flex: 1, minWidth: 0, minHeight: 48, borderWidth: 1, borderColor: "#E6EAF8", backgroundColor: "#F5F6FD", borderRadius: 21, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: navy }, control: { width: 40, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F5FD" }, send: { backgroundColor: blue }, disabled: { opacity: 0.45 }, footer: { color: muted, fontSize: 11, textAlign: "center", marginTop: 8 },
  overlay: { flex: 1, backgroundColor: "rgba(15,25,60,0.35)", justifyContent: "center", padding: 20 }, modal: { backgroundColor: "white", width: "100%", maxWidth: 500, maxHeight: "80%", alignSelf: "center", borderRadius: 24, padding: 18, gap: 12 }, modalHeader: { alignItems: "center", justifyContent: "space-between" },
});



