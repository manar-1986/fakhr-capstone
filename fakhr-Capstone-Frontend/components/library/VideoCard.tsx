import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";
import { youtubeThumbnailUrl } from "./libraryMockData";
import type { LibraryVideoItem } from "./types";

type Props = { item: LibraryVideoItem };

export function VideoCard({ item }: Props) {
  const openVideo = () => {
    Linking.openURL(item.youtubeUrl).catch(() => {});
  };

  return (
    <Pressable
      onPress={openVideo}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.thumbWrap}>
        <Image
          source={{ uri: youtubeThumbnailUrl(item.youtubeId) }}
          style={styles.thumb}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.playCircle}>
          <Ionicons name="play" size={28} color={c.white} style={styles.playIcon} />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.durationLabel}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={14} color={c.textLight} />
          </View>
          <Text style={styles.author}>{item.authorName}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbWrap: {
    height: 200,
    backgroundColor: c.chipBg,
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  playCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.38)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { marginLeft: 3 },
  durationBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: c.videoBadgeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  durationText: {
    color: c.white,
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  title: {
    fontSize: typography.cardTitle,
    fontWeight: "700",
    color: c.text,
    lineHeight: typography.bodyLineHeight,
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.headerIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  author: {
    fontSize: typography.caption,
    fontWeight: "500",
    color: c.textMuted,
  },
  pressed: { opacity: 0.95 },
});
