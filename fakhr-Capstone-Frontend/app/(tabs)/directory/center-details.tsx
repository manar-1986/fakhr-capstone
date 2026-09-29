import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getCenterDetails } from "../../../api/directory.api";
import { colors, sectionSpacing, spacing, typography } from "../../../theme";
import { openInGoogleMaps } from "../../../utils/openMaps";
import { useTranslation } from "react-i18next";
import { knownText } from "../../../utils/knownText";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import {
  containsArabic,
  directoryText,
  type BilingualCenter,
} from "../../../constants/directoryBilingual";

function parseListing(raw: string | string[] | undefined): BilingualCenter | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return null;
  try {
    return JSON.parse(decodeURIComponent(s)) as BilingualCenter;
  } catch {
    try {
      return JSON.parse(s) as BilingualCenter;
    } catch {
      return null;
    }
  }
}

export default function CenterDetailsScreen() {
  const { t } = useTranslation();
  const { isRTL, dir } = useI18nLayout();
  const { id, listing: listingParam } = useLocalSearchParams<{ id?: string; listing?: string }>();
  const router = useRouter();

  const { data: center, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["center", id],
    queryFn: () => getCenterDetails(id as string),
    enabled: !!id && id !== "undefined",
    retry: 1,
  });
  
  const listing = parseListing(listingParam);
  const loc = (ar: string, en: string) => (isRTL ? ar : en);

  const handleCall = () => {
    if (center?.phone) {
      Linking.openURL(`tel:${center.phone}`);
    }
  };

  const handleEmail = () => {
    if (center?.email) {
      Linking.openURL(`mailto:${center.email}`);
    }
  };

  const mapsName = listing
    ? listing.nameEn
    : directoryText(center?.name, false, (v) => knownText(t, v));
  const mapsCity = directoryText(center?.city, false, (v) => knownText(t, v));
  const mapsAddress = directoryText(center?.address, false, (v) => knownText(t, v));

  const handleOpenGoogleMaps = () => {
    if (!center) return;
    const line = [mapsAddress, mapsCity]
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .join(", ");
    void openInGoogleMaps({
      mapUrl: center.mapUrl,
      latitude: center.latitude,
      longitude: center.longitude,
      addressLine: line || null,
      placeName: mapsName,
    });
  };

  const handleOpenGoogleSearch = () => {
    const query = mapsCity ? `${mapsName} ${mapsCity}` : mapsName;
    if (!query.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(searchUrl);
  };
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.wrapper, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((isError || !center) && !listing) {
    return (
      <SafeAreaView style={[styles.wrapper, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
        <View style={[styles.container, styles.emptyState]}>
          <Ionicons name="medical-outline" size={48} color={colors.primary} />
          <Text style={styles.emptyTitle}>
            {isError ? t("copy.failedLoadCenter") : t("copy.centerNotFound")}
          </Text>
          <Text style={styles.emptyText}>
            {isError
              ? error?.message && (isRTL || !containsArabic(error.message))
                ? error.message
                : t("copy.tryLater")
              : t("copy.centerUnavailable")}
          </Text>
          <View style={styles.errorActions}>
            {isError && (
              <Pressable onPress={() => refetch()} style={styles.retryButton}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>{t("copy.goBack")}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = listing
    ? loc(listing.nameAr, listing.nameEn)
    : directoryText(center?.name, isRTL, (v) => knownText(t, v));
  const displayCity = directoryText(center?.city, isRTL, (v) => knownText(t, v));
  const displayAddress = directoryText(center?.address, isRTL, (v) => knownText(t, v));
  const displayHours = directoryText(center?.operatingHours, isRTL, (v) => knownText(t, v));
  const displayDescription = directoryText(center?.description, isRTL, (v) => knownText(t, v));
  const uniqueSpecialties = [
    ...(listing ? [loc(listing.specialtyAr, listing.specialtyEn)] : []),
    ...(center?.specialties ?? []).map((s) => directoryText(s, isRTL, (v) => knownText(t, v))),
  ].filter((s, index, arr) => Boolean(s) && arr.indexOf(s) === index);

  const locationLine = [displayAddress, displayCity]
    .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    .join(", ");
  const lat = center?.latitude;
  const lng = center?.longitude;
  const hasCoords =
    lat != null &&
    lng != null &&
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng);
  const canShowLocation =
    Boolean(center?.mapUrl?.trim()) ||
    hasCoords ||
    locationLine.length > 0;
  const locationPrimaryText =
    locationLine ||
    (hasCoords ? t("copy.viewOnMap") : center?.mapUrl?.trim() ? displayName : "");
  const typeValue = center?.type || listing?.type;

  return (
    <SafeAreaView style={[styles.wrapper, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.title, { textAlign: isRTL ? "right" : "left", writingDirection: dir }]}>{displayName}</Text>
          {typeValue ? (
            <View style={[styles.typeBadge, typeValue === "public" ? styles.publicBadge : styles.privateBadge]}>
              <Text style={[styles.typeBadgeText, typeValue === "public" ? styles.publicText : styles.privateText]}>
                {typeValue === "public" || typeValue === "حكومي"
                  ? t("copy.gov")
                  : t("copy.priv")}
              </Text>
            </View>
          ) : null}
        </View>

        {canShowLocation && (
          <Pressable onPress={handleOpenGoogleMaps} style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.locationContent}>
              <Text style={[styles.address, { textAlign: isRTL ? "right" : "left", writingDirection: dir }]}>
                {locationPrimaryText || t("copy.tapMaps")}
              </Text>
              <Text style={styles.openInMapsHint}>{t("copy.tapMaps")}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.primary} />
          </Pressable>
        )}

        <Pressable onPress={handleOpenGoogleSearch} style={styles.googleSearchRow}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <View style={styles.locationContent}>
            <Text style={styles.googleSearchText}>{t("copy.viewGoogle")}</Text>
            <Text style={styles.openInMapsHint}>{t("copy.searchReviewsMore")}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.primary} />
        </Pressable>

        {center?.phone ? (
          <Pressable onPress={handleCall} style={styles.actionRow}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.phone}>{String(center.phone)}</Text>
          </Pressable>
        ) : null}

        {center?.email ? (
          <Pressable onPress={handleEmail} style={styles.actionRow}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.email}>{center?.email}</Text>
          </Pressable>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("copy.workingHours")}</Text>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={[styles.hoursText, { writingDirection: dir, textAlign: isRTL ? "right" : "left" }]}>
              {displayHours || t("copy.contactHours")}
            </Text>
          </View>
        </View>

        {displayDescription ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("copy.about")}</Text>
            <Text style={[styles.description, { textAlign: isRTL ? "right" : "left", writingDirection: dir }]}>{displayDescription}</Text>
          </View>
        ) : null}

        {uniqueSpecialties.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("ui.specialty")}</Text>
            <View style={styles.servicesContainer}>
              {uniqueSpecialties.map((s) => (
                <View key={s} style={styles.serviceChip}>
                  <Text style={styles.serviceChipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {center?.address ? (
          <Pressable onPress={handleOpenGoogleMaps} style={styles.mapLinkBtn}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.mapLinkText}>{t("copy.openGoogleMaps")}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: typography.weightBold,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  errorActions: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: typography.body,
  },
  titleSection: {
    marginBottom: sectionSpacing.default,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  email: {
    fontSize: typography.body,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  title: {
    fontSize: typography.title,
    lineHeight: typography.h1LineHeight,
    fontWeight: typography.weightBold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  address: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.text,
  },
  phone: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.brandPale,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "500",
  },
  header: {
    padding: 20,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  // title: {
  //   fontSize: 26,
  //   fontWeight: "bold",
  //   color: "#1f2937",
  //   marginBottom: 12,
  // },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  publicBadge: {
    backgroundColor: "#BCC3D8",
  },
  privateBadge: {
    backgroundColor: "#fef3c7",
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  publicText: {
    color: "#6E7CAF",
  },
  privateText: {
    color: "#b45309",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  description: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCard || "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationContent: {
    flex: 1,
  },
  openInMapsHint: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  googleSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCard || "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleSearchText: {
    fontSize: typography.body,
    fontWeight: typography.weightSemibold,
    color: colors.text,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
  },
  infoLink: {
    fontSize: 16,
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  actionsContainer: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ratingContainer: {
    marginTop: 12,
  },
  ratingText: {
    fontSize: 16,
    color: "#f59e0b",
    fontWeight: "600",
  },

    headerMeta: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
    },
    starsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    starFilled: {
      fontSize: 18,
      color: "#f59e0b",
    },
    starHalf: {
      fontSize: 18,
      color: "#fcd34d",
    },
    starEmpty: {
      fontSize: 18,
      color: "#d1d5db",
    },
    ratingNumber: {
      marginLeft: 6,
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
    },
    servicesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    serviceChip: {
      backgroundColor: "#dbeafe",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#93c5fd",
    },
    serviceChipText: {
      color: "#1e40af",
      fontSize: 14,
      fontWeight: "500",
    },
    hoursRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    hoursText: {
      flex: 1,
      fontSize: typography.body,
      lineHeight: typography.bodyLineHeight,
      color: colors.text,
    },
    cityText: {
      fontSize: 14,
      color: "#6b7280",
      marginTop: 2,
    },
    mapLinkBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: "#BCC3D8",
      borderRadius: 8,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: "#AAB3D6",
    },
    mapLinkText: {
      color: "#6E7CAF",
      fontWeight: "500",
      fontSize: 14,
    },
    secondaryButton: {
      backgroundColor: "#BCC3D8",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#AAB3D6",
      marginTop: 12,
    },
    secondaryButtonText: {
      color: "#6E7CAF",
      fontSize: 16,
      fontWeight: "600",
    },
    reviewCard: {
      backgroundColor: "#f9fafb",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    reviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    reviewerName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
    },
    reviewRating: {
      flexDirection: "row",
    },
    reviewStars: {
      fontSize: 14,
      color: "#f59e0b",
    },
    reviewComment: {
      fontSize: 14,
      color: "#4b5563",
      lineHeight: 20,
      marginBottom: 8,
    },
    reviewDate: {
      fontSize: 12,
      color: "#9ca3af",
    },
});
