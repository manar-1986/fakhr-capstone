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
import { getServiceById } from "../../../api/services.api";
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

export default function ServiceDetailsScreen() {
  const { t } = useTranslation();
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

  const getServiceSpecialty = (): string | undefined => {
    const map: Record<string, string> = {
      "Speech & Language Therapy": "speech",
      "Occupational Therapy": "occupational",
      "ABA Therapy": "behavioral",
      "Psychological Assessment": "behavioral",
      "Physical Therapy": "physical",
      "Parent Coaching": "behavioral",
      "Early Intervention": "speech",
      "School Readiness": "educational",
    };
    return map[service.name];
  };

  const handleViewProviders = () => {
    const specialty = getServiceSpecialty();
    router.push({
      pathname: "/(tabs)/professionals",
      params: specialty ? { specialty } : { search: service.name },
    });
  };

  const handleBookService = () => {
    Alert.alert(
      t("copy.bookService"),
      t("copy.findProvidersFor", { name: knownText(t, service.name) }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("copy.findProviders"), onPress: handleViewProviders },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
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
          <Text style={styles.serviceName}>{knownText(t, service.name)}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{knownText(t, service.category)}</Text>
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
            <Text style={styles.statLabel}>{t("copy.duration")}</Text>
            <Text style={styles.statValue}>{service.duration}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={styles.statLabel}>{t("copy.frequency")}</Text>
            <Text style={styles.statValue}>{service.frequency}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Ionicons name="people-outline" size={22} color={colors.primary} />
            <Text style={styles.statLabel}>{t("copy.ageGroup")}</Text>
            <Text style={styles.statValue}>{service.ageRange}</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("copy.aboutService")}</Text>
          <Text style={styles.longDescription}>{service.longDescription}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("copy.keyBenefits")}</Text>
          <View style={styles.benefitsList}>
            {service.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Providers Card */}
        <View style={styles.providersCard}>
          <View style={styles.providersInfo}>
            <Text style={styles.providersTitle}>{t("copy.availableProviders")}</Text>
            <Text style={styles.providersCount}>
              {service.providers} certified specialists in your area
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.viewProvidersBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleViewProviders}
          >
            <Text style={styles.viewProvidersBtnText}>{t("home.viewAll")}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCTA}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>{t("copy.startingFrom")}</Text>
          <Text style={styles.priceValue}>{t("copy.freeConsult")}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.bookButton,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleBookService}
        >
          <Text style={styles.bookButtonText}>{t("copy.bookNow")}</Text>
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
