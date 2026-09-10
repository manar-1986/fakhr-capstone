import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { libraryColors as c } from "../../../constants/libraryTheme";
import { useTranslation } from "react-i18next";

/**
 * Discover tab — browse Library, Directory, and resources (expand when wired to APIs).
 */
export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.body}>
        <Text style={styles.title}>{t("discover.title")}</Text>
        <Text style={styles.sub}>{t("discover.subtitle")}</Text>

        <Pressable
          style={styles.linkCard}
          onPress={() => router.navigate("/directory")}
        >
          <Ionicons name="business-outline" size={24} color={c.primary} />
          <View style={styles.linkText}>
            <Text style={styles.linkTitle}>{t("discover.centers")}</Text>
            <Text style={styles.linkSub}>{t("discover.centersSub")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textLight} />
        </Pressable>

        <Pressable
          style={styles.linkCard}
          onPress={() =>
            Alert.alert(t("discover.comingSoon"), t("discover.comingSoonBody"))
          }
        >
          <Ionicons name="sparkles-outline" size={24} color={c.primary} />
          <View style={styles.linkText}>
            <Text style={styles.linkTitle}>{t("discover.forYou")}</Text>
            <Text style={styles.linkSub}>{t("discover.forYouSub")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textLight} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bgApp },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  title: { fontSize: 26, fontWeight: "800", color: c.text, marginBottom: 8 },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: c.textMuted,
    marginBottom: 24,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  linkText: { flex: 1, marginLeft: 12 },
  linkTitle: { fontSize: 16, fontWeight: "700", color: c.text },
  linkSub: { fontSize: 13, color: c.textMuted, marginTop: 2 },
});
