import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendHelpMessage } from "../../../api/helpCenter.api";

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#3A4060",
  placeholder: "#A8ABB4",
  border: "#E6E8EE",
  promptBg: "#E8EBF5",
  promptText: "#3A4060",
  icon: "#6E81BB",
  send: "#6E81BB",
  userBubble: "#6E81BB",
  aiBubble: "#F4F5F8",
  white: "#FFFFFF",
};

const DESIGN_W = 390;

const SUGGESTIONS = [
  "ابحث عن مدرسة مناسبة",
  "أفضل المراكز القريبة مني",
  "أنشطة تناسب طفلي",
  "نصائح للتعامل مع التوحد",
];

const robot = require("../../../assets/images/fakhr-ai-robot.png");

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function HelpCenterScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const hasChat = messages.length > 0;

  const sendMessageMutation = useMutation({
    mutationFn: sendHelpMessage,
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          text: response.message || "أنا هنا للمساعدة!",
          isUser: false,
        },
      ]);
    },
    onError: (error: { message?: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          text:
            error?.message ||
            "عذراً، لم أستطع معالجة طلبك. حاول مرة أخرى.",
          isUser: false,
        },
      ]);
    },
  });

  const sendText = (raw: string) => {
    const text = raw.trim();
    if (!text || sendMessageMutation.isPending) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, text, isUser: true },
    ]);
    setInputText("");
    sendMessageMutation.mutate({ message: text });
  };

  const handleSend = () => sendText(inputText);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={[styles.keyboard, { width: contentW }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { height: ms(48), marginTop: ms(4) }]}>
          <Text style={[styles.brand, { fontSize: ms(26), lineHeight: ms(34) }]}>
            فخر
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: ms(22),
              paddingBottom: ms(12),
              flexGrow: 1,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!hasChat ? (
            <View style={styles.landing}>
              <View style={styles.landingTop}>
              <Image
                source={robot}
                style={{
                  width: ms(178),
                  height: ms(158),
                  marginTop: ms(4),
                  marginBottom: ms(8),
                }}
                resizeMode="contain"
                accessibilityLabel="فخر AI"
              />
              <Text
                style={[styles.welcome, { fontSize: ms(22), lineHeight: ms(32) }]}
              >
                مرحباً! أنا فخر{" "}
                <Text style={{ writingDirection: "ltr" }}>AI</Text>
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: ms(18),
                    lineHeight: ms(28),
                    marginTop: ms(4),
                    marginBottom: ms(12),
                  },
                ]}
              >
                كيف أقدر أساعدك اليوم؟
              </Text>
              </View>
              <View style={{ width: "100%", gap: ms(10), marginTop: ms(8) }}>
                {SUGGESTIONS.map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() => sendText(prompt)}
                    disabled={sendMessageMutation.isPending}
                    style={({ pressed }) => [
                      styles.promptBtn,
                      {
                        minHeight: ms(48),
                        borderRadius: ms(16),
                        paddingHorizontal: ms(16),
                      },
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={prompt}
                  >
                    <Text
                      style={[styles.promptText, { fontSize: ms(15) }]}
                    >
                      {prompt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ gap: ms(10), paddingTop: ms(8) }}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.bubbleWrap,
                    message.isUser ? styles.userWrap : styles.aiWrap,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      message.isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        {
                          fontSize: ms(14),
                          lineHeight: ms(22),
                          color: message.isUser ? colors.white : colors.title,
                        },
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}
              {sendMessageMutation.isPending && (
                <View style={[styles.bubbleWrap, styles.aiWrap]}>
                  <View style={[styles.bubble, styles.aiBubble]}>
                    <ActivityIndicator size="small" color={colors.icon} />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              paddingHorizontal: ms(16),
              paddingVertical: ms(10),
              paddingBottom: ms(18),
              gap: ms(10),
              direction: "ltr" as const,
            },
          ]}
        >
          <Pressable
            style={[
              styles.micBtn,
              { width: ms(44), height: ms(44), borderRadius: ms(22) },
            ]}
            accessibilityRole="button"
            accessibilityLabel="تسجيل صوتي"
          >
            <Ionicons
              name="mic-outline"
              size={ms(22)}
              color={colors.icon}
            />
          </Pressable>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="اكتب سؤالك هنا"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              {
                minHeight: ms(44),
                borderRadius: ms(22),
                fontSize: ms(14),
                paddingHorizontal: ms(16),
              },
            ]}
            textAlign="right"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!sendMessageMutation.isPending}
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sendMessageMutation.isPending}
            style={({ pressed }) => [
              styles.sendBtn,
              { width: ms(36), height: ms(44) },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="إرسال"
          >
            {sendMessageMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.send} />
            ) : (
              <Ionicons name="send" size={ms(22)} color={colors.send} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  keyboard: {
    flex: 1,
    maxWidth: 430,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  landing: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  landingTop: {
    alignItems: "center",
    width: "100%",
  },
  welcome: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  promptBtn: {
    width: "100%",
    backgroundColor: colors.promptBg,
    alignItems: "center",
    justifyContent: "center",
  },
  promptText: {
    fontWeight: "700",
    color: colors.promptText,
    textAlign: "center",
    writingDirection: "rtl",
  },
  bubbleWrap: {
    width: "100%",
    flexDirection: "row",
  },
  userWrap: {
    justifyContent: "flex-start",
  },
  aiWrap: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomLeftRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.aiBubble,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    writingDirection: "rtl",
    textAlign: "right",
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  micBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.title,
    writingDirection: "rtl",
    paddingVertical: 8,
  },
  sendBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});
