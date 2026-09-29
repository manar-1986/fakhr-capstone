import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfessionalDetails } from "../../../api/directory.api";
import type { Professional } from "../../../types/directory.types";
import { colors, sectionSpacing, spacing, typography } from "../../../theme";
import { openInGoogleMaps, toFiniteNumber } from "../../../utils/openMaps";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { centerLocale, doctorLocaleText } from "../../../utils/professionalBilingual";

function openCenterInGoogleMaps(p: Professional) {
  void openInGoogleMaps({
    mapUrl: p.centerMapUrl,
    latitude: p.centerLatitude,
    longitude: p.centerLongitude,
    addressLine: p.centerAddressEn || p.centerAddress || p.locationEn || p.location,
    placeName: p.centerNameEn || p.centerName,
  });
}

function canOpenCenterInMaps(p: Professional): boolean {
  const lat = toFiniteNumber(p.centerLatitude);
  const lng = toFiniteNumber(p.centerLongitude);
  return Boolean(
    p.centerMapUrl?.trim() ||
      (lat !== null && lng !== null) ||
      (p.centerAddress || p.location || "").trim() ||
      p.centerName?.trim()
  );
}

export default function ProfessionalDetailsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useI18nLayout();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const loc = (ar?: string, en?: string, legacy?: string) =>
    doctorLocaleText(isRTL, { ar, en, legacy }, t);
  const locCenter = (ar?: string, en?: string, legacy?: string) =>
    centerLocale(isRTL, ar ?? "", en ?? "", legacy, t);

  const { data: professional, isLoading, error } = useQuery({
    queryKey: ["professional", id],
    queryFn: () => getProfessionalDetails(id as string),
    enabled: !!id,
    retry: false,
  });

  const handleCall = () => {
    const n =
      professional?.phone?.trim() ||
      professional?.centerPhone?.toString?.()?.trim();
    if (n) Linking.openURL(`tel:${n}`);
  };

  const handleEmail = () => {
    const e =
      professional?.email?.trim() ||
      professional?.centerEmail?.toString?.()?.trim();
    if (e) Linking.openURL(`mailto:${e}`);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starFilled}>★</Text>
        ))}
        {hasHalfStar && <Text style={styles.starHalf}>★</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={styles.starEmpty}>☆</Text>
        ))}
        <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.wrapper} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("copy.proProfile")}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t("copy.loadingPro")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !professional) {
    return (
      <SafeAreaView style={styles.wrapper} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("copy.proProfile")}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{t("copy.proNotFound")}</Text>
          <Text style={styles.errorSubtext}>
            {error ? t("copy.failedLoadPro") : t("copy.proMissing")}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t("copy.goBack")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("copy.proProfile")}</Text>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.professionalName}>
          {loc(professional?.nameAr, professional?.nameEn, professional?.name)}
        </Text>
        
        {/* Specialty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("ui.specialty")}</Text>
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>
              {loc(
                professional?.specialtyAr,
                professional?.specialtyEn,
                professional?.specialtyLabel || professional?.specialty,
              )}
            </Text>
          </View>
        </View>

        {/* Rating */}
        {professional?.rating !== undefined && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("ui.rating")}</Text>
            {renderStars(professional.rating)}
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("copy.contact")}</Text>
          {(professional.phone?.trim() ||
            professional.centerPhone?.toString?.()?.trim()) && (
            <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
              <Text style={styles.infoLabel}>{t("auth.phone")}</Text>
              <Text style={styles.infoLink}>
                📞{" "}
                {professional.phone?.trim() || professional.centerPhone}
              </Text>
            </TouchableOpacity>
          )}
          {(professional.email?.trim() ||
            professional.centerEmail?.toString?.()?.trim()) && (
            <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
              <Text style={styles.infoLabel}>{t("auth.email")}</Text>
              <Text style={styles.infoLink}>
                ✉️ {professional.email?.trim() || professional.centerEmail}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location — same Maps behavior as Professionals tab detail */}
        {(professional.location ||
          professional.centerAddress ||
          professional.centerName ||
          canOpenCenterInMaps(professional)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("copy.location")}</Text>
            {canOpenCenterInMaps(professional) ? (
              <TouchableOpacity
                style={styles.mapsRow}
                activeOpacity={0.7}
                onPress={() => openCenterInGoogleMaps(professional)}
              >
                {professional.centerName ? (
                  <Text style={styles.infoValue}>
                    🏥 {locCenter(professional.centerNameAr, professional.centerNameEn, professional.centerName)}
                  </Text>
                ) : null}
                <Text style={styles.infoValue}>
                  📍{" "}
                  {locCenter(
                    professional.centerAddressAr || professional.locationAr,
                    professional.centerAddressEn || professional.locationEn,
                    professional.centerAddress ||
                      professional.location ||
                      professional.centerName,
                  ) || "—"}
                </Text>
                {professional.centerAddress &&
                  professional.location &&
                  professional.centerAddress.trim() !==
                    professional.location.trim() && (
                    <Text style={styles.cityText}>
                      {loc(professional.locationAr, professional.locationEn, professional.location)}
                    </Text>
                  )}
                <Text style={styles.mapsHint}>{t("copy.tapMapsShort")}</Text>
              </TouchableOpacity>
            ) : (
              <>
                {professional.location ? (
                  <Text style={styles.infoValue}>
                    📍 {loc(professional.locationAr, professional.locationEn, professional.location)}
                  </Text>
                ) : null}
                {professional.centerAddress ? (
                  <Text style={styles.cityText}>
                    {locCenter(
                      professional.centerAddressAr,
                      professional.centerAddressEn,
                      professional.centerAddress,
                    )}
                  </Text>
                ) : null}
                {professional.centerName ? (
                  <Text style={styles.infoValue}>
                    🏥 {locCenter(professional.centerNameAr, professional.centerNameEn, professional.centerName)}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        )}

        {/* Description */}
        {professional?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("copy.about")}</Text>
            <Text style={styles.bioText}>
              {loc(professional.bioAr, professional.bioEn, professional.bio)}
            </Text>
          </View>
        )} 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 40,
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  heroAvatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  heroAvatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  verifiedBadgeLarge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.background,
  },
  professionalName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  section: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  specialtyBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: typography.body,
    color: "#1d4ed8",
    fontWeight: "600",
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
    color: colors.text,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.bodyLineHeight,
  },
  infoLink: {
    fontSize: typography.body,
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  cityText: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  mapsRow: {
    paddingVertical: spacing.xs,
  },
  mapsHint: {
    fontSize: 12,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  // Quick Info Card
  quickInfoCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  quickInfoContent: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  quickInfoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  // Legacy section variants (kept for future UI blocks)
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Services
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serviceText: {
    fontSize: 15,
    color: colors.text,
  },
  // Education
  educationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  educationText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Certifications
  certificationsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  certificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  certificationText: {
    fontSize: 13,
    color: colors.text,
  },
  // Languages
  languagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  languageBadge: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  // Contact
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
