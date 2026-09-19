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

// Design system colors
const colors = {
  bgApp: "#FAF9F6",
  bgCard: "#FFFFFF",
  primary: "#7FB77E",
  secondary: "#5F8F8B",
  text: "#2F2F2F",
  textSecondary: "#4A4A4A",
  textMuted: "#8A8A8A",
  border: "rgba(0, 0, 0, 0.06)",
};

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
    name: "Dr. Sarah Ahmed",
    specialty: "speech",
    specialtyLabel: "Speech Therapist",
    experience: "10 years experience",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Dr. Mohammed Ali",
    specialty: "behavioral",
    specialtyLabel: "Behavioral Specialist",
    experience: "8 years experience",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Dr. Fatima Hassan",
    specialty: "occupational",
    specialtyLabel: "Occupational Therapist",
    experience: "12 years experience",
    rating: 4.9,
  },
  {
    id: "4",
    name: "Dr. Omar Khalid",
    specialty: "educational",
    specialtyLabel: "Educational Psychologist",
    experience: "6 years experience",
    rating: 4.7,
  },
  {
    id: "5",
    name: "Dr. Layla Mansour",
    specialty: "speech",
    specialtyLabel: "Speech Therapist",
    experience: "15 years experience",
    rating: 5.0,
  },
  {
    id: "6",
    name: "Dr. Youssef Ibrahim",
    specialty: "behavioral",
    specialtyLabel: "Behavioral Analyst",
    experience: "9 years experience",
    rating: 4.8,
  },
];

export default function ProfessionalsScreen() {
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  const filteredProfessionals =
    selectedFilter === "all"
      ? PROFESSIONALS
      : PROFESSIONALS.filter((p) => p.specialty === selectedFilter);

  const handleProfessionalPress = (professional: (typeof PROFESSIONALS)[0]) => {
    Alert.alert(
      professional.name,
      `${professional.specialtyLabel}\n${professional.experience}\nRating: ${professional.rating}⭐\n\nProfessional details page coming soon.`
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
          <Text style={styles.title}>Professionals</Text>
        </View>
        <Text style={styles.subtitle}>
          Find specialists for your child&apos;s needs
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
                {spec.label}
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
                <Text style={styles.professionalName}>{professional.name}</Text>
                <Text style={styles.professionalSpecialty}>
                  {professional.specialtyLabel}
                </Text>
                <View style={styles.professionalMeta}>
                  <Text style={styles.experienceText}>
                    {professional.experience}
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
