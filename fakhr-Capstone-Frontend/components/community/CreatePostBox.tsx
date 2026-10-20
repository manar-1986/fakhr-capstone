import { controls as sharedControls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../ui/AppText";
import { useTranslation } from "react-i18next";
import { libraryColors as c } from "../../constants/libraryTheme";
import { useLanguage } from "../../context/LanguageContext";

type Props = {
  draft: string;
  onChangeDraft: (value: string) => void;
  onOpenModal: () => void;
  onPhoto: () => void;
  onTagTopics: () => void;
  onPrivacy: () => void;
};

export function CreatePostBox({
  draft,
  onChangeDraft,
  onOpenModal,
  onPhoto,
  onTagTopics,
  onPrivacy,
}: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const reverseRows = isRTL !== I18nManager.isRTL;

  return (
    <View style={styles.card}>
      <View style={[styles.topRow, reverseRows && styles.rowReverse]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={c.textLight} />
        </View>
        <TextInput
          style={[styles.input, isRTL && styles.inputRtl]}
          placeholder={t("community.sharePlaceholder")}
          placeholderTextColor={c.textLight}
          value={draft}
          onChangeText={onChangeDraft}
          onFocus={onOpenModal}
          multiline
          textAlign={isRTL ? "right" : "left"}
        />
      </View>
      <View style={styles.divider} />
      <View style={[styles.actions, reverseRows && styles.rowReverse]}>
        <Pressable
          style={[styles.actionBtn, reverseRows && styles.rowReverse]}
          onPress={onPhoto}
        >
          <Ionicons name="image-outline" size={18} color={c.textMuted} />
          <Text style={styles.actionText}>{t("community.photo")}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, reverseRows && styles.rowReverse]}
          onPress={onTagTopics}
        >
          <Ionicons name="pricetag-outline" size={18} color={c.textMuted} />
          <Text style={styles.actionText}>{t("community.tagTopics")}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, reverseRows && styles.rowReverse]}
          onPress={onPrivacy}
        >
          <Ionicons name="eye-outline" size={18} color={c.textMuted} />
          <Text style={styles.actionText}>{t("community.privacy")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    
    
    
    marginBottom: 16,
    
    
    
    
    
   ...sharedControls.card },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rowReverse: { flexDirection: "row-reverse" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.headerIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: fakhrColors.backgroundWash,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: typography.body,
    color: c.text,
    marginHorizontal: 8,
  },
  inputRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: c.textMuted,
  },
});
