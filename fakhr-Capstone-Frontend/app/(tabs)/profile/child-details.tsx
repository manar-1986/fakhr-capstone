import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
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
import { getChildById } from "../../../api/children.api";
import { colors } from "../../../theme";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth?: string): number | undefined => {
  if (!dateOfBirth) return undefined;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return "Not provided";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export default function ChildDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Fetch child details from API
  const { data: child, isLoading, error } = useQuery({
    queryKey: ["child", id],
    queryFn: () => getChildById(id as string),
    enabled: !!id,
    retry: false,
  });

  // Transform child data for display
  const childData = React.useMemo(() => {
    if (!child) return null;

    // Handle diagnosis - backend returns array, but handle both cases
    let diagnoses: string[] = [];
    if (Array.isArray(child.diagnosis)) {
      diagnoses = child.diagnosis;
    } else if (Array.isArray(child.diagnoses)) {
      diagnoses = child.diagnoses;
    } else if (child.diagnosis) {
      const diagnosisStr = String(child.diagnosis);
      diagnoses = diagnosisStr.split(",").map((d: string) => d.trim()).filter(Boolean);
    }

    // Handle medications
    let medications: { name: string; dosage?: string; frequency?: string }[] = [];
    if (Array.isArray(child.medications)) {
      medications = child.medications;
    } else if (child.medications && typeof child.medications === "string") {
      try {
        const parsed = JSON.parse(child.medications);
        medications = Array.isArray(parsed) ? parsed : [];
      } catch {
        medications = [];
      }
    }

    // Handle allergies
    let allergies: string[] = [];
    if (Array.isArray(child.allergies)) {
      allergies = child.allergies;
    } else if (child.allergies) {
      const allergiesStr = String(child.allergies);
      allergies = allergiesStr.split(",").map((a: string) => a.trim()).filter(Boolean);
    }

    const age = child.age || calculateAge(child.dateOfBirth);

    return {
      ...child,
      diagnoses,
      medications,
      allergies,
      age,
      formattedDateOfBirth: formatDate(child.dateOfBirth),
    };
  }, [child]);

  const handleEdit = () => {
    if (!id) return;
    router.push({
      pathname: "/(tabs)/profile/edit-child" as any,
      params: {
        id: id as string,
      },
    });
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
          <Text style={styles.headerTitle}>Child Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading child details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error || !childData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Child Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>Child not found</Text>
          <Text style={styles.errorSubtext}>
            {error ? "Failed to load child details" : "The child you're looking for doesn't exist"}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
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
        <Text style={styles.headerTitle}>Child Details</Text>
        <Pressable
          style={({ pressed }) => [
            styles.editBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
          <Text style={styles.editBtnText}>Edit</Text>
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
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <Text style={[styles.heroAvatarText, { color: colors.primary }]}>
              {childData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.childName}>{childData.name}</Text>
          {childData.age && (
            <Text style={styles.childAge}>{childData.age} years old</Text>
          )}
        </View>

        {/* Basic Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{childData.name}</Text>
            </View>
          </View>

          {childData.gender && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="transgender-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{childData.gender}</Text>
                </View>
              </View>
            </>
          )}

          {childData.age && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{childData.age} years</Text>
                </View>
              </View>
            </>
          )}

          {childData.dateOfBirth && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-number-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>{childData.formattedDateOfBirth}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Diagnosis Section */}
        {childData.diagnoses && childData.diagnoses.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diagnosis</Text>
            <View style={styles.diagnosisTags}>
              {childData.diagnoses.map((diagnosis, idx) => (
                <View key={`${diagnosis}-${idx}`} style={styles.diagnosisTag}>
                  <Text style={styles.diagnosisTagText}>{diagnosis}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Medical History Section */}
        {childData.medicalHistory && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Medical History</Text>
            <Text style={styles.medicalHistoryText}>{childData.medicalHistory}</Text>
          </View>
        )}

        {/* Medications Section */}
        {childData.medications && childData.medications.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Medications</Text>
            <View style={styles.medicationsList}>
              {childData.medications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Ionicons name="medkit-outline" size={18} color={colors.primary} />
                  <View style={styles.medicationContent}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    {med.dosage && (
                      <Text style={styles.medicationDetails}>Dosage: {med.dosage}</Text>
                    )}
                    {med.frequency && (
                      <Text style={styles.medicationDetails}>Frequency: {med.frequency}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Allergies Section */}
        {childData.allergies && childData.allergies.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Allergies</Text>
            <View style={styles.allergiesList}>
              {childData.allergies.map((allergy, index) => (
                <View key={index} style={styles.allergyItem}>
                  <Ionicons name="warning-outline" size={18} color={colors.error} />
                  <Text style={styles.allergyText}>{allergy}</Text>
                </View>
              ))}
            </View>
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
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
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
    paddingTop: 8,
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
  },
  heroAvatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  childName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  childAge: {
    fontSize: 15,
    color: colors.textMuted,
  },
  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  // Diagnosis Tags
  diagnosisTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  diagnosisTag: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  diagnosisTagText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  // Medical History
  medicalHistoryText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Medications
  medicationsList: {
    gap: 12,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  medicationContent: {
    flex: 1,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  // Allergies
  allergiesList: {
    gap: 12,
  },
  allergyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  allergyText: {
    fontSize: 15,
    color: colors.error,
    fontWeight: "500",
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
