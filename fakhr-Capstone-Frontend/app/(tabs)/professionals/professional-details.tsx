import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getProfessionalDetails } from "../../../api/directory.api";
import type { Professional } from "../../../types/directory.types";
import { openInGoogleMaps, toFiniteNumber } from "../../../utils/openMaps";
import { useTranslation } from "react-i18next";
import { knownText } from "../../../utils/knownText";

// Design system colors
const colors = {
  bgApp: "#FAF9F6",
  bgCard: "#FFFFFF",
  primary: "#7FB77E",
  primaryLight: "#E8F5E8",
  secondary: "#5F8F8B",
  text: "#2F2F2F",
  textSecondary: "#4A4A4A",
  textMuted: "#8A8A8A",
  border: "rgba(0, 0, 0, 0.06)",
};

function openCenterInGoogleMaps(p: Professional) {
  void openInGoogleMaps({
    mapUrl: p.centerMapUrl,
    latitude: p.centerLatitude,
    longitude: p.centerLongitude,
    addressLine: p.centerAddress || p.location,
    placeName: p.centerName,
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
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Fetch professional details from API
  const { data: professional, isLoading, error } = useQuery({
    queryKey: ["professional", id],
    queryFn: () => getProfessionalDetails(id as string),
    enabled: !!id && id !== "undefined",
    retry: 1,
  });

  const handleBookAppointment = () => {
    if (!professional) return;
    Alert.alert(
      t("copy.bookAppointment"),
      t("copy.bookWithName", { name: professional.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("copy.confirmBooking"),
          onPress: () => {
            Alert.alert(t("copy.success"), t("copy.bookingRequestSent"));
          },
        },
      ]
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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

  // Error State
  if (error || !professional) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroAvatar,
              { backgroundColor: `${professional.color}20` },
            ]}
          >
            <Text style={[styles.heroAvatarText, { color: professional.color }]}>
              {professional.name.split(" ").slice(1, 3).map(n => n[0]).join("")}
            </Text>
            {professional.verified && (
              <View style={styles.verifiedBadgeLarge}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.professionalName}>{professional.name}</Text>
          <Text style={[styles.specialtyLabel, { color: professional.color }]}>
            {knownText(t, professional.specialtyLabel)}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <Ionicons name="star" size={18} color="#F5A623" />
              </View>
              <Text style={styles.statValue}>{professional.rating}</Text>
              <Text style={styles.statLabel}>{t("copy.reviewsCount", { count: professional.reviews })}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{professional.experience}</Text>
              <Text style={styles.statLabel}>{t("copy.experience")}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <Ionicons name="business-outline" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">
                {professional.centerName || "—"}
              </Text>
              <Text style={styles.statLabel}>{t("copy.center")}</Text>
            </View>
          </View>
        </View>

        {/* Quick Info Card */}
        <View style={styles.quickInfoCard}>
          <View style={styles.quickInfoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Next Available</Text>
              <Text style={styles.quickInfoValue}>{professional.nextAvailable}</Text>
            </View>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoRow}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
            <View style={styles.quickInfoContent}>
              <Text style={styles.quickInfoLabel}>Consultation Fee</Text>
              <Text style={styles.quickInfoValue}>{professional.consultationFee}</Text>
            </View>
          </View>
          <View style={styles.quickInfoDivider} />
          {canOpenCenterInMaps(professional) ? (
            <Pressable
              style={({ pressed }) => [styles.quickInfoRow, pressed && { opacity: 0.7 }]}
              onPress={() => openCenterInGoogleMaps(professional)}
            >
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <View style={styles.quickInfoContent}>
                <Text style={styles.quickInfoLabel}>{t("copy.centerLocation")}</Text>
                <Text style={styles.quickInfoValue}>
                  {professional.centerAddress || professional.location || professional.centerName || "—"}
                </Text>
                <Text style={styles.mapsHint}>{t("copy.tapMapsShort")}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </Pressable>
          ) : (
            <View style={styles.quickInfoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textMuted} />
              <View style={styles.quickInfoContent}>
                <Text style={styles.quickInfoLabel}>{t("copy.centerLocation")}</Text>
                <Text style={styles.quickInfoValue}>
                  {professional.centerAddress || professional.location || "—"}
                </Text>
              </View>
            </View>
          )}
          {(() => {
            const phone = professional.phone?.trim();
            const email = professional.email?.trim();
            const centerPhone = professional.centerPhone?.toString?.()?.trim();
            const centerEmail = professional.centerEmail?.toString?.()?.trim();
            const contactPhone = phone || centerPhone;
            const contactEmail = email || centerEmail;
            const contactLabel = phone || email ? t("copy.contactProfessional") : t("copy.contactViaCenter");
            const contactValue = contactPhone || contactEmail || "—";
            if (!contactValue || contactValue === "—") return null;
            return (
              <>
                <View style={styles.quickInfoDivider} />
                <Pressable
                  style={({ pressed }) => [styles.quickInfoRow, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    if (contactPhone) Linking.openURL(`tel:${contactPhone}`);
                    else if (contactEmail) Linking.openURL(`mailto:${contactEmail}`);
                  }}
                >
                  <Ionicons name="call-outline" size={20} color={colors.primary} />
                  <View style={styles.quickInfoContent}>
                    <Text style={styles.quickInfoLabel}>{contactLabel}</Text>
                    <Text style={styles.quickInfoValue}>{contactValue}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </>
            );
          })()}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("copy.about")}</Text>
          <Text style={styles.bioText}>{professional.bio}</Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesList}>
            {professional.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={[styles.serviceDot, { backgroundColor: professional.color }]} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {professional.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Ionicons name="school-outline" size={18} color={colors.textMuted} />
              <Text style={styles.educationText}>{edu}</Text>
            </View>
          ))}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <View style={styles.certificationsList}>
            {professional.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationBadge}>
                <Ionicons name="ribbon-outline" size={14} color={colors.primary} />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Languages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languagesRow}>
            {professional.languages.map((lang, index) => (
              <View key={index} style={styles.languageBadge}>
                <Text style={styles.languageText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <Pressable style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.callButton}>
          <Ionicons name="call-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.bookButton,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookButtonText}>{t("copy.bookAppointment")}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
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
    backgroundColor: colors.bgCard,
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
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    borderColor: colors.bgApp,
  },
  professionalName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  specialtyLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 20,
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconWrap: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  // Quick Info Card
  quickInfoCard: {
    backgroundColor: colors.bgCard,
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
  mapsHint: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: "500",
  },
  quickInfoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
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
    gap: 10,
  },
  languageBadge: {
    backgroundColor: colors.bgCard,
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
  // Bottom CTA
  bottomCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  callButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 16,
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
  headerRight: {
    width: 40,
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
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
});
