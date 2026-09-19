import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { libraryColors as c } from "../../../constants/libraryTheme";
import { useLanguage } from "../../../context/LanguageContext";
import { tryNavigateToDisabilityServices } from "../../../utils/disabilityFlowNav";

export default function AdviceReplyScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const reverseRows = isRTL !== I18nManager.isRTL;
  const router = useRouter();
  const { postId, preview, disabilityId, disabilityName } = useLocalSearchParams<{
    postId?: string;
    preview?: string;
    disabilityId?: string;
    disabilityName?: string;
  }>();

  const previewText = (() => {
    if (!preview) return "";
    const s = Array.isArray(preview) ? preview[0] : preview;
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  })();
  const [reply, setReply] = useState("");

  const goBack = () => {
    if (
      tryNavigateToDisabilityServices(router, {
        disabilityId,
        disabilityName,
      })
    ) {
      return;
    }
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate("/(tabs)/home");
  };

  const submit = () => {
    if (!reply.trim()) {
      Alert.alert(t("community.adviceTitle"), t("community.adviceEmpty"));
      return;
    }
    Alert.alert(t("community.adviceSent"), t("community.adviceSentBody"), [
      { text: t("community.ok"), onPress: goBack },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={[styles.header, reverseRows && styles.rowReverse]}>
        <Pressable
          onPress={goBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={26}
            color={c.text}
          />
        </Pressable>
        <Text style={styles.title}>{t("community.adviceTitle")}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, isRTL && styles.textRtl]}>
          {t("community.thread")}
        </Text>
        <Text style={[styles.preview, isRTL && styles.textRtl]}>
          {previewText || `${t("community.post")} ${postId ?? ""}`}
        </Text>
        <Text style={[styles.label, isRTL && styles.textRtl]}>
          {t("community.yourReply")}
        </Text>
        <TextInput
          style={[styles.input, isRTL && styles.textRtl]}
          placeholder={t("community.replyPlaceholder")}
          placeholderTextColor={c.textLight}
          value={reply}
          onChangeText={setReply}
          multiline
          textAlignVertical="top"
          textAlign={isRTL ? "right" : "left"}
        />
        <Pressable style={styles.submit} onPress={submit}>
          <Text style={styles.submitText}>{t("community.postReply")}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bgApp },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  back: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
  },
  scroll: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: c.textMuted,
    marginBottom: 8,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
    color: c.text,
    marginBottom: 20,
    backgroundColor: c.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
  },
  input: {
    minHeight: 140,
    backgroundColor: c.white,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    padding: 14,
    fontSize: 15,
    color: c.text,
    marginBottom: 20,
  },
  submit: {
    backgroundColor: c.brand,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: { color: c.white, fontSize: 16, fontWeight: "700" },
});
