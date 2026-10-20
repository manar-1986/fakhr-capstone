import { controls as sharedControls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, I18nManager, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../ui/AppText";
import { useTranslation } from "react-i18next";
import { libraryColors as c } from "../../constants/libraryTheme";
import { useLanguage } from "../../context/LanguageContext";
import type { CommunityPost } from "./types";

type Props = {
  post: CommunityPost;
  onReport: () => void;
};

export function PostCard({ post, onReport }: Props) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const reverseRows = isRTL !== I18nManager.isRTL;
  const router = useRouter();

  const initiallyLiked = post.kind === "image" ? Boolean(post.liked) : false;
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(
    post.kind === "question" ? 0 : post.likes
  );
  const [comments, setComments] = useState(
    post.kind === "question" ? post.responseCount : post.comments
  );

  const name = t(post.nameKey);
  const meta = t("community.metaLine", {
    time: t(post.timeKey),
    role: t(post.roleKey),
  });
  const body = t(post.bodyKey);
  const isAnonymous = post.kind === "question";

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
  };

  const onComment = () => {
    setComments((n) => n + 1);
    Alert.alert(t("community.comment"), t("community.commentThanks"));
  };

  const onShare = () => {
    Alert.alert(t("community.share"), t("community.shareSheet"));
  };

  const giveAdvice = () => {
    router.push({
      pathname: "/(tabs)/community/advice",
      params: {
        postId: post.id,
        preview: encodeURIComponent(body.slice(0, 180)),
      },
    });
  };

  return (
    <View style={[styles.card, isAnonymous && styles.anonCard]}>
      <View style={[styles.header, reverseRows && styles.rowReverse]}>
        <View style={styles.avatar}>
          {post.kind !== "question" && "avatarUrl" in post && post.avatarUrl ? (
            <Image
              source={{ uri: post.avatarUrl }}
              style={styles.avatarImg}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="person" size={18} color={c.textLight} />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, isRTL && styles.textRtl]}>{name}</Text>
          <Text style={[styles.meta, isRTL && styles.textRtl]}>{meta}</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={onReport}
          style={styles.flagBtn}
          accessibilityRole="button"
          accessibilityLabel={t("community.report")}
        >
          <Ionicons name="flag-outline" size={18} color={c.textLight} />
        </Pressable>
      </View>

      {isAnonymous ? (
        <View style={[styles.badge, isRTL && styles.badgeRtl]}>
          <Text style={styles.badgeText}>{t(post.badgeKey)}</Text>
        </View>
      ) : null}

      <Text
        style={[
          styles.body,
          isAnonymous && styles.questionBody,
          isRTL && styles.textRtl,
        ]}
      >
        {body}
      </Text>

      {post.kind === "image" ? (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      ) : null}

      {isAnonymous ? (
        <View style={[styles.adviceRow, reverseRows && styles.rowReverse]}>
          <Pressable
            style={[styles.adviceBtn, reverseRows && styles.rowReverse]}
            onPress={giveAdvice}
            accessibilityRole="button"
            accessibilityLabel={t("community.giveAdvice")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={c.brand}
            />
            <Text style={styles.adviceText}>{t("community.giveAdvice")}</Text>
          </Pressable>
          <Text style={styles.responses}>
            {t("community.responses", { count: comments })}
          </Text>
        </View>
      ) : (
        <View style={[styles.footer, reverseRows && styles.rowReverse]}>
          <Pressable
            style={[styles.footerItem, reverseRows && styles.rowReverse]}
            onPress={toggleLike}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={20}
              color={c.brand}
            />
            <Text style={styles.footerCount}>{likes}</Text>
          </Pressable>
          <Pressable
            style={[styles.footerItem, reverseRows && styles.rowReverse]}
            onPress={onComment}
          >
            <Ionicons name="chatbubble-outline" size={20} color={c.brand} />
            <Text style={styles.footerCount}>{comments}</Text>
          </Pressable>
          <View style={styles.spacer} />
          <Pressable
            onPress={onShare}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("community.share")}
          >
            <Ionicons name="share-social-outline" size={20} color={c.brand} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    
    
    
    marginBottom: 14,
    
    
    
    
    
   ...sharedControls.card },
  anonCard: {
    backgroundColor: fakhrColors.backgroundWash,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rowReverse: { flexDirection: "row-reverse" },
  textRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.headerIconBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  headerText: { flex: 1, marginHorizontal: 10 },
  name: { fontSize: typography.cardTitle, fontWeight: typography.weightMedium, color: c.text },
  meta: { fontSize: typography.secondary, color: c.textMuted, marginTop: 2 },
  flagBtn: { padding: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: c.brand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeRtl: { alignSelf: "flex-end" },
  badgeText: {
    fontSize: typography.helper,
    fontWeight: typography.weightRegular,
    letterSpacing: 0.4,
    color: c.text,
  },
  body: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: c.text,
    marginBottom: 12,
    fontWeight: typography.weightRegular,
  },
  questionBody: {
    fontWeight: typography.weightMedium,
    fontSize: typography.cardTitle,
    lineHeight: typography.cardTitleLineHeight,
  },
  imageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: c.chipBg,
  },
  postImage: {
    width: "100%",
    height: 188,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginEnd: 20,
  },
  footerCount: {
    marginStart: 6,
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: "#0B093B",
  },
  spacer: { flex: 1 },
  adviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
    paddingTop: 12,
  },
  adviceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adviceText: {
    fontSize: typography.body,
    fontWeight: typography.weightRegular,
    color: "#0B093B",
  },
  responses: {
    fontSize: typography.secondary,
    fontWeight: typography.weightRegular,
    color: c.textMuted,
  },
});
