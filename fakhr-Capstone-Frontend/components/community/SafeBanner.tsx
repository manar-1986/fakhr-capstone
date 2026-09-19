import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { I18nManager, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { libraryColors as c } from "../../constants/libraryTheme";
import { useLanguage } from "../../context/LanguageContext";

export function SafeBanner() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const reverseRows = isRTL !== I18nManager.isRTL;

  return (
    <View style={[styles.wrap, reverseRows && styles.rowReverse]}>
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark" size={22} color={c.brand} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, isRTL && styles.textRtl]}>
          {t("community.safeTitle")}
        </Text>
        <Text style={[styles.sub, isRTL && styles.textRtl]}>
          {t("community.safeSubtitle")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECEEF2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.white,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  textBlock: { flex: 1, marginHorizontal: 8 },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
    color: c.textMuted,
  },
});
