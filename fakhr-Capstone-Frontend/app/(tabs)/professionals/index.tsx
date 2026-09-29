import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getProfessionals } from "../../../api/directory.api";
import { colors } from "../../../theme";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { doctorLocaleText } from "../../../utils/professionalBilingual";

// Specializations for filtering
const SPECIALIZATIONS = [
  { id: "all", label: "All", icon: "apps-outline" },
  { id: "speech", label: "Speech", icon: "chatbubble-outline" },
  { id: "behavioral", label: "Behavioral", icon: "heart-outline" },
  { id: "occupational", label: "Occupational", icon: "hand-left-outline" },
  { id: "physical", label: "Physical", icon: "fitness-outline" },
  { id: "educational", label: "Educational", icon: "school-outline" },
];

const SPECIALIZATION_KEYS: Record<string, string> = {
  all: "ui.all",
  speech: "copy.speech",
  behavioral: "copy.behavioral",
  occupational: "copy.ot",
  physical: "copy.pt",
  educational: "copy.educationalSupport",
};

const VALID_SPECIALTIES = ["speech", "behavioral", "occupational", "physical", "educational"];

export default function ProfessionalsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useI18nLayout();
  const loc = (ar?: string, en?: string, legacy?: string) =>
    doctorLocaleText(isRTL, { ar, en, legacy }, t);
  const specLabel = (id: string) => t(SPECIALIZATION_KEYS[id] || id);
  const router = useRouter();
  const { search: searchParam, specialty: specialtyParam } = useLocalSearchParams<{
    search?: string;
    specialty?: string;
  }>();
  const [selectedFilter, setSelectedFilter] = React.useState(() => {
    if (specialtyParam && VALID_SPECIALTIES.includes(specialtyParam)) return specialtyParam;
    return "all";
  });
  const [searchQuery, setSearchQuery] = React.useState(() => {
    if (specialtyParam) return "";
    return searchParam || "";
  });

  useEffect(() => {
    if (specialtyParam && VALID_SPECIALTIES.includes(specialtyParam)) {
      setSelectedFilter(specialtyParam);
      setSearchQuery("");
    } else if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [specialtyParam, searchParam]);

  // Fetch professionals from API
  const { data: professionals = [], isLoading, error } = useQuery({
    queryKey: ["professionals", selectedFilter, searchQuery],
    queryFn: () =>
      getProfessionals({
        specialty: selectedFilter === "all" ? undefined : selectedFilter,
        search: searchQuery || undefined,
      }),
    retry: false,
  });

  // Calculate counts for each specialty
  const specialtyCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    professionals.forEach((prof) => {
      counts[prof.specialty] = (counts[prof.specialty] || 0) + 1;
    });
    return counts;
  }, [professionals]);

  const specializationsWithCounts = SPECIALIZATIONS.map((spec) => ({
    ...spec,
    count: spec.id === "all" ? professionals.length : specialtyCounts[spec.id] || 0,
  }));

  const filteredProfessionals = professionals;

  const handleProfessionalPress = (professional: { id?: string; _id?: string }) => {
    const id = professional.id || (professional as { _id?: string })._id;
    if (!id) return;
    router.push({
      pathname: "/(tabs)/professionals/professional-details",
      params: { id: String(id) },
    });
  };

  const showBackButton = !!(specialtyParam || searchParam);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {showBackButton ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.7 },
              ]}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.headerIcon}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{t("directory.healthcareProfessionals")}</Text>
            <Text style={styles.subtitle}>
              {t("copy.findSpecialists")}
            </Text>
          </View>
        </View>

        {/* Search / Service filter hint */}
        {searchQuery || (specialtyParam && selectedFilter !== "all") ? (
          <View style={styles.searchHint}>
            <Ionicons name="filter" size={18} color={colors.primary} />
            <Text style={styles.searchHintText}>
              {searchQuery
                ? t("copy.showingProviders", { query: searchQuery })
                : t("copy.showingSpecialty", { specialty: specLabel(selectedFilter) })}
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery("");
                setSelectedFilter("all");
                router.replace("/(tabs)/professionals");
              }}
              hitSlop={8}
            >
              <Text style={styles.clearSearchText}>{t("copy.clearFilter")}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>{t("copy.searchProfessionalsPlaceholder")}</Text>
          </Pressable>
        )}

        {/* Filter Section */}
        <Text style={styles.sectionLabel}>{t("copy.filterBySpecialty")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {specializationsWithCounts.map((spec) => (
            <Pressable
              key={spec.id}
              style={({ pressed }) => [
                styles.filterChip,
                selectedFilter === spec.id && styles.filterChipActive,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              onPress={() => setSelectedFilter(spec.id)}
            >
              <Ionicons
                name={spec.icon as any}
                size={18}
                color={selectedFilter === spec.id ? "#FFFFFF" : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === spec.id && styles.filterChipTextActive,
                ]}
              >
                {specLabel(spec.id)}
              </Text>
              {spec.id !== "all" && (
                <View
                  style={[
                    styles.filterCount,
                    selectedFilter === spec.id && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selectedFilter === spec.id && styles.filterCountTextActive,
                    ]}
                  >
                    {spec.count}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t("directory.loadingProfessionals")}</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
            <Text style={styles.errorText}>{t("copy.failedLoadPro")}</Text>
            <Text style={styles.errorSubtext}>{t("common.tryAgain")}</Text>
          </View>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredProfessionals.length === 1
                  ? t("copy.professionalFoundOne")
                  : t("copy.professionalsFound", { count: filteredProfessionals.length })}
              </Text>
              <Pressable style={styles.sortButton}>
                <Ionicons name="funnel-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.sortButtonText}>{t("copy.sort")}</Text>
              </Pressable>
            </View>

            {/* Professionals List */}
            <View style={styles.professionalsList}>
              {filteredProfessionals.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="search-outline" size={32} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>{t("copy.noProfessionalsFound")}</Text>
                  <Text style={styles.emptySubtitle}>
                    {t("copy.tryDifferentSpecialty")}
                  </Text>
                  <Pressable
                    style={styles.resetButton}
                    onPress={() => setSelectedFilter("all")}
                  >
                    <Text style={styles.resetButtonText}>{t("copy.showAll")}</Text>
                  </Pressable>
                </View>
              ) : (
                filteredProfessionals.map((professional) => (
                  <Pressable
                    key={professional.id || (professional as { _id?: string })._id}
                    style={({ pressed }) => [
                      styles.professionalCard,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => handleProfessionalPress(professional)}
                  >
                    {/* Avatar */}
                    <View
                      style={[
                        styles.avatarContainer,
                        { backgroundColor: `${professional.color}15` },
                      ]}
                    >
                      <Text style={[styles.avatarText, { color: professional.color }]}>
                        {loc(professional.nameAr, professional.nameEn, professional.name)
                          .split(" ")
                          .slice(1, 3)
                          .map((n) => n[0])
                          .join("")}
                      </Text>
                      {professional.verified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.professionalContent}>
                      <View style={styles.nameRow}>
                        <Text style={styles.professionalName}>
                          {loc(professional.nameAr, professional.nameEn, professional.name)}
                        </Text>
                      </View>
                      <Text style={[styles.specialtyLabel, { color: professional.color }]}>
                        {loc(
                          professional.specialtyLabelAr,
                          professional.specialtyLabelEn,
                          professional.specialtyLabel,
                        )}
                      </Text>

                      {/* Meta Row */}
                      <View style={styles.metaRow}>
                        <View style={styles.ratingWrap}>
                          <Ionicons name="star" size={14} color="#F5A623" />
                          <Text style={styles.ratingText}>{professional.rating}</Text>
                          <Text style={styles.reviewsText}>({professional.reviews})</Text>
                        </View>
                        <View style={styles.metaDot} />
                        <Text style={styles.experienceText}>
                          {loc(
                            professional.experienceAr,
                            professional.experienceEn,
                            professional.experience,
                          )}
                        </Text>
                      </View>

                      {/* Availability */}
                      <View style={styles.availabilityRow}>
                        <View
                          style={[
                            styles.availabilityDot,
                            (professional.availabilityEn || professional.availability || "")
                              .toLowerCase()
                              .includes("today") && styles.availabilityDotActive,
                          ]}
                        />
                        <Text
                          style={[
                            styles.availabilityText,
                            (professional.availabilityEn || professional.availability || "")
                              .toLowerCase()
                              .includes("today") && styles.availabilityTextActive,
                          ]}
                        >
                          {loc(
                            professional.availabilityAr,
                            professional.availabilityEn,
                            professional.availability,
                          ) || t("copy.notAvailable")}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow */}
                    <View style={styles.arrowWrap}>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: colors.textMuted,
  },
  searchHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}15`,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  searchHintText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  // Filter Section
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.bgCard,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterCount: {
    backgroundColor: colors.bgApp,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterCountTextActive: {
    color: "#FFFFFF",
  },
  // Results Header
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Professionals List
  professionalsList: {
    gap: 12,
  },
  professionalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    position: "relative",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bgCard,
  },
  professionalContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  specialtyLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  reviewsText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: 8,
  },
  experienceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  availabilityDotActive: {
    backgroundColor: "#4CAF50",
  },
  availabilityText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  availabilityTextActive: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.bgApp,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Loading & Error States
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
  },
});
