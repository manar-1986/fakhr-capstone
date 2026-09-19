import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryTab } from "../../../components/community/CategoryTab";
import { CATEGORY_TABS, postsForCategory } from "../../../components/community/communityMockData";
import { CreatePostBox } from "../../../components/community/CreatePostBox";
import { PostCard } from "../../../components/community/PostCard";
import { SafeBanner } from "../../../components/community/SafeBanner";
import type { CommunityCategoryId, CommunityPost } from "../../../components/community/types";
import { libraryColors as c } from "../../../constants/libraryTheme";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useLanguage } from "../../../context/LanguageContext";

const HEADER_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80";

export default function ParentCommunityScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const reverseRows = isRTL !== I18nManager.isRTL;
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState<CommunityCategoryId>("all");
  const [draft, setDraft] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBody, setModalBody] = useState("");

  const data = useMemo(() => postsForCategory(category), [category]);

  const report = useCallback(
    (nameKey: string) => {
      Alert.alert(
        t("community.reportContent"),
        t("community.reportPostBy", { name: t(nameKey) }),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("community.report"), style: "destructive" },
        ]
      );
    },
    [t]
  );

  const renderItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard post={item} onReport={() => report(item.nameKey)} />
    ),
    [report]
  );

  const listHeader = (
    <>
      <View style={[styles.topHeader, reverseRows && styles.rowReverse]}>
        <HeaderBackButton variant="inline" color={c.text} />
        <View style={[styles.brandRow, reverseRows && styles.rowReverse]}>
          <View style={styles.brandIcon}>
            <Ionicons name="people" size={20} color={c.white} />
          </View>
          <Text style={[styles.brandName, isRTL && styles.textRtl]}>
            {t("community.brand")}
          </Text>
        </View>
        <View style={[styles.headerRight, reverseRows && styles.rowReverse]}>
          <Pressable
            style={styles.roundBtn}
            onPress={() =>
              Alert.alert(t("home.notifications"), t("community.noNewNotifications"))
            }
            accessibilityRole="button"
            accessibilityLabel={t("community.notificationsA11y")}
          >
            <Ionicons name="notifications-outline" size={22} color={c.text} />
          </Pressable>
          <Image
            source={{ uri: HEADER_AVATAR }}
            style={styles.profilePic}
            contentFit="cover"
            accessibilityLabel={t("community.profileA11y")}
          />
        </View>
      </View>

      <SafeBanner />

      <CreatePostBox
        draft={draft}
        onChangeDraft={setDraft}
        onOpenModal={() => setModalVisible(true)}
        onPhoto={() => Alert.alert(t("community.photo"), t("community.pickPhoto"))}
        onTagTopics={() =>
          Alert.alert(t("community.tagTopics"), t("community.tagTopicsAlert"))
        }
        onPrivacy={() =>
          Alert.alert(t("community.privacy"), t("community.privacyAlert"))
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.catScroll,
          reverseRows && styles.rowReverse,
        ]}
      >
        {CATEGORY_TABS.map((tab) => (
          <CategoryTab
            key={tab.id}
            label={t(tab.labelKey)}
            selected={category === tab.id}
            onPress={() => setCategory(tab.id)}
          />
        ))}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.flex}>
        <FlatList
          data={data}
          extraData={`${category}-${isRTL}`}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 120 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        />

        <Pressable
          style={[
            styles.shieldFab,
            isRTL
              ? { bottom: 72 + insets.bottom, left: 16 }
              : { bottom: 72 + insets.bottom, right: 16 },
          ]}
          onPress={() =>
            Alert.alert(t("community.safetyHelp"), t("community.safetyBody"))
          }
          accessibilityRole="button"
          accessibilityLabel={t("community.safetyFabA11y")}
        >
          <Ionicons name="shield-checkmark" size={22} color={c.white} />
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, isRTL && styles.textRtl]}>
              {t("community.createPostTitle")}
            </Text>
            <TextInput
              style={[styles.modalInput, isRTL && styles.textRtl]}
              placeholder={t("community.sharePlaceholder")}
              placeholderTextColor={c.textLight}
              value={modalBody}
              onChangeText={setModalBody}
              multiline
              textAlignVertical="top"
              textAlign={isRTL ? "right" : "left"}
            />
            <View style={[styles.modalRow, reverseRows && styles.rowReverse]}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalSecondaryText}>{t("common.cancel")}</Text>
              </Pressable>
              <Pressable
                style={styles.modalPrimary}
                onPress={() => {
                  Alert.alert(t("community.posted"), t("community.postedBody"));
                  setModalVisible(false);
                  setModalBody("");
                  setDraft("");
                }}
              >
                <Text style={styles.modalPrimaryText}>{t("community.post")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  flex: { flex: 1, position: "relative" },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: c.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.headerIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.chipBg,
  },
  catScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginTop: 4,
  },
  shieldFab: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.shieldFab,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: c.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    padding: 12,
    fontSize: 15,
    color: c.text,
    marginBottom: 16,
    backgroundColor: c.bgApp,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  modalSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  modalSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: c.textMuted,
  },
  modalPrimary: {
    backgroundColor: c.brand,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  modalPrimaryText: {
    color: c.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
