import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBackButton } from "../../components/navigation/HeaderBackButton";
import { colors } from "../../theme";
import { useTranslation } from "react-i18next";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { doctorLocaleText } from "../../utils/professionalBilingual";

// Specializations for filtering
const SPECIALIZATIONS = [
  { id: "all", label: "All" },
  { id: "speech", label: "Speech" },
  { id: "behavioral", label: "Behavioral" },
  { id: "occupational", label: "Occupational" },
  { id: "educational", label: "Educational" },
];

// Mock professionals data
const PROFESSIONALS = [
  {
    id: "1",
    nameAr: "د. سارة أحمد",
    nameEn: "Dr. Sarah Ahmed",
    specialty: "speech",
    specialtyLabelAr: "أخصائية نطق",
    specialtyLabelEn: "Speech Therapist",
    experienceAr: "١٠ سنوات خبرة",
    experienceEn: "10 years experience",
    rating: 4.9,
  },
  {
    id: "2",
    nameAr: "د. محمد علي",
    nameEn: "Dr. Mohammed Ali",
    specialty: "behavioral",
    specialtyLabelAr: "أخصائي سلوكي",
    specialtyLabelEn: "Behavioral Specialist",
    experienceAr: "٨ سنوات خبرة",
    experienceEn: "8 years experience",
    rating: 4.8,
  },
  {
    id: "3",
    nameAr: "د. فاطمة حسن",
    nameEn: "Dr. Fatima Hassan",
    specialty: "occupational",
    specialtyLabelAr: "أخصائية علاج وظيفي",
    specialtyLabelEn: "Occupational Therapist",
    experienceAr: "١٢ سنة خبرة",
    experienceEn: "12 years experience",
    rating: 4.9,
  },
  {
    id: "4",
    nameAr: "د. عمر خالد",
    nameEn: "Dr. Omar Khalid",
    specialty: "educational",
    specialtyLabelAr: "أخصائي نفسي تربوي",
    specialtyLabelEn: "Educational Psychologist",
    experienceAr: "٦ سنوات خبرة",
    experienceEn: "6 years experience",
    rating: 4.7,
  },
  {
    id: "5",
    nameAr: "د. ليلى منصور",
    nameEn: "Dr. Layla Mansour",
    specialty: "speech",
    specialtyLabelAr: "أخصائية نطق",
    specialtyLabelEn: "Speech Therapist",
    experienceAr: "١٥ سنة خبرة",
    experienceEn: "15 years experience",
    rating: 5.0,
  },
  {
    id: "6",
    nameAr: "د. يوسف إبراهيم",
    nameEn: "Dr. Youssef Ibrahim",
    specialty: "behavioral",
    specialtyLabelAr: "محلل سلوك",
    specialtyLabelEn: "Behavioral Analyst",
    experienceAr: "٩ سنوات خبرة",
    experienceEn: "9 years experience",
    rating: 4.8,
  },
];

export default function ProfessionalsScreen() {
  const { t } = useTranslation();
  const { isRTL } = useI18nLayout();
  const loc = (ar?: string, en?: string) => doctorLocaleText(isRTL, { ar, en }, t);
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  const filteredProfessionals =
    selectedFilter === "all"
      ? PROFESSIONALS
      : PROFESSIONALS.filter((p) => p.specialty === selectedFilter);

  const handleProfessionalPress = (professional: (typeof PROFESSIONALS)[0]) => {
    Alert.alert(
      loc(professional.nameAr, professional.nameEn),
      `${loc(professional.specialtyLabelAr, professional.specialtyLabelEn)}\n${loc(professional.experienceAr, professional.experienceEn)}\nRating: ${professional.rating}⭐\n\nProfessional details page coming soon.`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <HeaderBackButton color={colors.text} />
          <Text style={styles.title}>{t("directory.healthcareProfessionals")}</Text>
        </View>
        <Text style={styles.subtitle}>
          {t("copy.findSpecialists")}
        </Text>

        {/* Filter Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {SPECIALIZATIONS.map((spec) => (
            <Pressable
              key={spec.id}
              style={[
                styles.filterChip,
                selectedFilter === spec.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(spec.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === spec.id && styles.filterChipTextActive,
                ]}
              >
                {spec.id === "all" ? t("ui.all") : spec.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Professionals List */}
        <View style={styles.professionalsList}>
          {filteredProfessionals.map((professional) => (
            <Pressable
              key={professional.id}
              style={({ pressed }) => [
                styles.professionalCard,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => handleProfessionalPress(professional)}
            >
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
              <View style={styles.professionalContent}>
                <Text style={styles.professionalName}>
                  {loc(professional.nameAr, professional.nameEn)}
                </Text>
                <Text style={styles.professionalSpecialty}>
                  {loc(professional.specialtyLabelAr, professional.specialtyLabelEn)}
                </Text>
                <View style={styles.professionalMeta}>
                  <Text style={styles.experienceText}>
                    {loc(professional.experienceAr, professional.experienceEn)}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#F5A623" />
                    <Text style={styles.ratingText}>{professional.rating}</Text>
                  </View>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>

        {filteredProfessionals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No professionals found for this specialty
            </Text>
          </View>
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
    paddingTop: 8,
    paddingBottom: 120,
  },
  header: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
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
  professionalsList: {
    gap: 12,
  },
  professionalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  professionalContent: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  professionalSpecialty: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  professionalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  experienceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
  },
});
