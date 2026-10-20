import { controls as sharedControls } from "../../theme/controls";
import DirectoryCallButton from "./DirectoryCallButton";
import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
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
          <DirectoryCallButton phone={item.phone}/>
        </View>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    
    
    marginBottom: 18,
    overflow: "hidden",
    
    
    
    
    
   ...sharedControls.card, backgroundColor: "#EBF1FD" },
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
    fontSize: typography.helper,
    fontWeight: typography.weightRegular,
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
    fontSize: typography.cardTitle,
    fontWeight: typography.weightMedium,
    color: c.text,
    lineHeight: typography.cardTitleLineHeight,
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
    fontSize: typography.helper,
    fontWeight: typography.weightRegular,
    letterSpacing: 0.3,
  },
  statusTextOpen: {
    color: c.articleBadgeText,
  },
  statusTextBusy: {
    color: c.textMuted,
  },
  subtitle: {
    fontSize: typography.body,
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
    fontSize: typography.secondary,
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
    fontSize: typography.helper,
    fontWeight: typography.weightRegular,
    color: c.chipText,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryBtn: {
    
    flex: 1,
    backgroundColor: c.primary,
    
    
    
    marginRight: 10,
   ...sharedControls.button },
  primaryBtnText: {
    color: "#0B093B",
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
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
