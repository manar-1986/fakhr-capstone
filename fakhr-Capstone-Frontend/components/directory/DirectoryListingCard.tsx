import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import {
  doctorLocaleList,
  listingLocaleName,
  listingLocaleSubtitle,
} from "../../utils/professionalBilingual";
import type { DirectoryListing } from "./types";

export type ListingCardProps = {
  item: DirectoryListing;
  onBookAppointment?: () => void;
  onCall?: () => void;
  onViewDetails?: () => void;
};

export function DirectoryListingCard({
  item,
  onBookAppointment,
  onCall,
  onViewDetails,
}: ListingCardProps) {
  const { t } = useTranslation();
  const { isRTL } = useI18nLayout();
  const displayName = listingLocaleName(item, isRTL, t);
  const displaySubtitle = listingLocaleSubtitle(item, isRTL, t);
  const displayLocation = listingLocaleName(
    {
      name: item.locationLine,
      nameAr: item.locationLineAr,
      nameEn: item.locationLineEn,
    },
    isRTL,
    t,
  );
  const visibleTags = doctorLocaleList(
    isRTL,
    item.tagsAr,
    item.tagsEn,
    t,
    item.tags,
  ).slice(0, 2);
  const more = item.moreTagCount;
  const CardContainer = item.kind === "doctor" ? Pressable : View;

  return (
    <CardContainer style={styles.card} onPress={item.kind === "doctor" ? onViewDetails : undefined}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#D4A017" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>
          <View
            style={[
              styles.statusPill,
              item.status === "OPEN" ? styles.statusOpen : styles.statusBusy,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "OPEN" ? styles.statusTextOpen : styles.statusTextBusy,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>{displaySubtitle}</Text>

        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={16} color={c.textMuted} />
          <Text style={styles.locText}>{displayLocation}</Text>
        </View>

        <View style={styles.tagsRow}>
          {visibleTags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
          {more != null && more > 0 ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{more} more</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={item.kind === "doctor" ? onViewDetails : onBookAppointment}
          >
            <Text style={styles.primaryBtnText}>{t(item.kind === "doctor" ? "clinic.viewDetails" : "copy.bookAppointment")}</Text>
          </Pressable>
          {item.kind === "center" && <Pressable
            style={({ pressed }) => [styles.phoneBtn, pressed && styles.pressed]}
            onPress={onCall}
          >
            <Ionicons name="call-outline" size={22} color={c.primary} />
          </Pressable>}
        </View>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: c.white,
    borderRadius: 20,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    height: 160,
    position: "relative",
    backgroundColor: c.chipBg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: c.text,
    marginLeft: 4,
  },
  body: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: c.text,
    lineHeight: 22,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusOpen: {
    backgroundColor: c.articleBadgeBg,
  },
  statusBusy: {
    backgroundColor: c.chipBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statusTextOpen: {
    color: c.articleBadgeText,
  },
  statusTextBusy: {
    color: c.textMuted,
  },
  subtitle: {
    fontSize: 14,
    color: c.textMuted,
    marginBottom: 10,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locText: {
    marginLeft: 6,
    fontSize: 13,
    color: c.textMuted,
    flex: 1,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    backgroundColor: c.chipBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: c.chipText,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: c.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 10,
  },
  primaryBtnText: {
    color: c.white,
    fontSize: 15,
    fontWeight: "700",
  },
  phoneBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
    backgroundColor: c.white,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.9 },
});
