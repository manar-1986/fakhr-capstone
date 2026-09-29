import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getServiceById, type Service } from "../../../api/services.api";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors } from "../../../theme";

function loc(isRTL: boolean, ar?: string, en?: string, fallback = ""): string {
  if (isRTL) return ar || fallback || en || "";
  return en || fallback || "";
}

function locList(isRTL: boolean, ar?: string[], en?: string[], fallback: string[] = []): string[] {
  if (isRTL) return (ar && ar.length ? ar : fallback) || [];
  return (en && en.length ? en : fallback.filter((item) => !/[\u0600-\u06FF]/.test(item))) || [];
}

export default function ServiceDetailsScreen() {
  const { t } = useTranslation();
  const { isRTL, dir, align } = useI18nLayout();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getServiceById(String(id)),
    enabled: !!id,
    retry: false,
  });

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("copy.serviceDetails")}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t("copy.loadingService")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error || !service) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("copy.serviceDetails")}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>
            {error ? t("copy.failedLoadService") : t("copy.serviceNotFound")}
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t("copy.goBack")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const getServiceSpecialty = (item: Service): string | undefined => {
    if (item.specialty) return item.specialty;
    const map: Record<string, string> = {
      "hs-behavioral": "behavioral",
      "hs-occupational": "occupational",
      "hs-speech": "speech",
      "Speech & Language Therapy": "speech",
      "Occupational Therapy": "occupational",
      "Behavioral Therapy": "behavioral",
      "العلاج السلوكي": "behavioral",
      "العلاج الوظيفي": "occupational",
      "علاج النطق": "speech",
      "ABA Therapy": "behavioral",
      "Psychological Assessment": "behavioral",
      "Physical Therapy": "physical",
      "Parent Coaching": "behavioral",
      "Early Intervention": "speech",
      "School Readiness": "educational",
    };
    return map[item.id] || map[item.name] || map[item.nameEn ?? ""] || map[item.nameAr ?? ""];
  };

  const displayName = loc(isRTL, service.nameAr, service.nameEn, service.name);
  const displayCategory = loc(isRTL, service.categoryAr, service.categoryEn, service.category);
  const displayAbout = loc(
    isRTL,
    service.longDescriptionAr,
    service.longDescriptionEn,
    service.longDescription,
  );
  const displayDuration = loc(isRTL, service.durationAr, service.durationEn, service.duration);
  const displayFrequency = loc(isRTL, service.frequencyAr, service.frequencyEn, service.frequency);
  const displayAge = loc(isRTL, service.ageRangeAr, service.ageRangeEn, service.ageRange);
  const displayBenefits = locList(
    isRTL,
    service.benefitsAr,
    service.benefitsEn,
    service.benefits,
  );

  const handleViewProviders = () => {
    const specialty = getServiceSpecialty(service);
    router.push({
      pathname: "/(tabs)/professionals",
      params: specialty ? { specialty } : { search: displayName },
    });
  };

  const handleBookService = () => {
    Alert.alert(
      t("copy.bookService"),
      t("copy.findProvidersFor", { name: displayName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("copy.findProviders"), onPress: handleViewProviders },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { writingDirection: dir }]}>{t("copy.serviceDetails")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: `${service.color}20` },
            ]}
          >
            <Ionicons
              name={service.icon as any}
              size={40}
              color={service.color}
            />
          </View>
          <Text style={[styles.serviceName, { writingDirection: dir, textAlign: "center" }]}>{displayName}</Text>
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { writingDirection: dir }]}>{displayCategory}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(service.rating) ? "star" : "star-outline"}
                  size={18}
                  color="#F5A623"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {service.rating} ({t("copy.reviewsCount", { count: service.reviews })})
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={[styles.statLabel, { writingDirection: dir, textAlign: "center" }]}>{t("copy.duration")}</Text>
            <Text style={[styles.statValue, { writingDirection: dir, textAlign: "center" }]}>{displayDuration}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={[styles.statLabel, { writingDirection: dir, textAlign: "center" }]}>{t("copy.frequency")}</Text>
            <Text style={[styles.statValue, { writingDirection: dir, textAlign: "center" }]}>{displayFrequency}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="people-outline" size={22} color={colors.primary} />
            <Text style={[styles.statLabel, { writingDirection: dir, textAlign: "center" }]}>{t("copy.ageGroup")}</Text>
            <Text style={[styles.statValue, { writingDirection: dir, textAlign: "center" }]}>{displayAge}</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: align, writingDirection: dir }]}>{t("copy.aboutService")}</Text>
          <Text style={[styles.longDescription, { textAlign: align, writingDirection: dir }]}>{displayAbout}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: align, writingDirection: dir }]}>{t("copy.keyBenefits")}</Text>
          <View style={styles.benefitsList}>
            {displayBenefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitItem, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <View style={styles.benefitIcon}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={[styles.benefitText, { textAlign: align, writingDirection: dir }]}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Providers Card */}
        <View style={[styles.providersCard, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <View style={styles.providersInfo}>
            <Text style={[styles.providersTitle, { textAlign: align, writingDirection: dir }]}>{t("copy.availableProviders")}</Text>
            <Text style={[styles.providersCount, { textAlign: align, writingDirection: dir }]}>
              {t("copy.specialistsInArea", { count: service.providers })}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.viewProvidersBtn,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleViewProviders}
          >
            <Text style={styles.viewProvidersBtnText}>{t("home.viewAll")}</Text>
            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={16} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={styles.priceInfo}>
          <Text style={[styles.priceLabel, { textAlign: align, writingDirection: dir }]}>{t("copy.startingFrom")}</Text>
          <Text style={[styles.priceValue, { textAlign: align, writingDirection: dir }]}>{t("copy.freeConsult")}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.bookButton,
            { flexDirection: isRTL ? "row-reverse" : "row" },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleBookService}
        >
          <Text style={styles.bookButtonText}>{t("copy.bookNow")}</Text>
          <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={18} color="#FFFFFF" />
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
    backgroundColor: colors.bgApp,
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
  headerRight: {
    width: 40,
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Hero
  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  categoryBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Stats Card
  statsCard: {
    flexDirection: "row",
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  statDivider: {
    width: 1,
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
  longDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Benefits
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  // Providers Card
  providersCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  providersInfo: {
    flex: 1,
  },
  providersTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  providersCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  viewProvidersBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 10,
  },
  viewProvidersBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  // Bottom CTA
  bottomCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceInfo: {},
  priceLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
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
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
