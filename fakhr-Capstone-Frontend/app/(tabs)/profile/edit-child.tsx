import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getChildById, updateChild } from "../../../api/children.api";
import { colors } from "../../../theme";

// Form steps
const STEPS = [
    { id: 1, title: "Basic Info", icon: "person-outline" },
    { id: 2, title: "Diagnosis", icon: "medical-outline" },
    { id: 3, title: "Medications", icon: "medkit-outline" },
    { id: 4, title: "Allergies", icon: "warning-outline" },
];

// Diagnosis options
const DIAGNOSIS_OPTIONS = [
    { id: "add", label: "ADD", description: "Attention Deficit Disorder" },
    { id: "adhd", label: "ADHD", description: "Attention Deficit Hyperactivity Disorder" },
    { id: "autism", label: "Autism", description: "Autism Spectrum Disorder" },
    { id: "dyslexia", label: "Dyslexia", description: "Reading and Learning Disorder" },
    { id: "speech", label: "Speech Delay", description: "Speech and Language Delay" },
    { id: "sensory", label: "SPD", description: "Sensory Processing Disorder" },
    { id: "other", label: "Other", description: "Other diagnosis" },
];

// Common allergies
const COMMON_ALLERGIES = [
    "Peanuts",
    "Tree Nuts",
    "Milk",
    "Eggs",
    "Wheat",
    "Soy",
    "Fish",
    "Shellfish",
    "Latex",
    "Penicillin",
];

export default function EditChildScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [currentStep, setCurrentStep] = React.useState(1);
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

    // Fetch child data
    const { data: child, isLoading: isLoadingChild } = useQuery({
        queryKey: ["child", id],
        queryFn: () => getChildById(id as string),
        enabled: !!id,
        retry: false,
    });

    // Form state
    const [formData, setFormData] = React.useState({
        // Basic Info
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        // Diagnosis
        diagnoses: [] as string[],
        diagnosisNotes: "",
        // Medications
        medications: [] as { name: string; dosage: string; frequency: string }[],
        currentMedication: { name: "", dosage: "", frequency: "" },
        // Allergies
        allergies: [] as string[],
        allergyNotes: "",
    });

    // Load child data into form when fetched
    React.useEffect(() => {
        if (child) {
            // Parse name into first and last name
            const nameParts = child.name.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Parse diagnosis
            let diagnoses: string[] = [];
            if (Array.isArray(child.diagnosis)) {
                diagnoses = child.diagnosis;
            } else if (Array.isArray(child.diagnoses)) {
                diagnoses = child.diagnoses;
            } else if (child.diagnosis) {
                const diagnosisStr = String(child.diagnosis);
                diagnoses = diagnosisStr.split(",").map((d: string) => d.trim()).filter(Boolean);
            }

            // Parse medications
            let medications: { name: string; dosage: string; frequency: string }[] = [];
            if (Array.isArray(child.medications)) {
                medications = child.medications.map((med: any) => ({
                    name: med.name || med,
                    dosage: med.dosage || "",
                    frequency: med.frequency || "",
                }));
            }

            // Parse allergies
            let allergies: string[] = [];
            if (Array.isArray(child.allergies)) {
                allergies = child.allergies;
            } else if (child.allergies) {
                const allergiesStr = String(child.allergies);
                allergies = allergiesStr.split(",").map((a: string) => a.trim()).filter(Boolean);
            }

            // Parse date of birth
            let dateOfBirth = "";
            if (child.dateOfBirth) {
                try {
                    const date = new Date(child.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        const day = date.getDate().toString().padStart(2, "0");
                        const month = (date.getMonth() + 1).toString().padStart(2, "0");
                        const year = date.getFullYear();
                        dateOfBirth = `${day}/${month}/${year}`;
                        setSelectedDate(date);
                    }
                } catch {
                    dateOfBirth = child.dateOfBirth;
                }
            }

            setFormData({
                firstName,
                lastName,
                dateOfBirth,
                gender: child.gender || "",
                diagnoses,
                diagnosisNotes: child.medicalHistory || "",
                medications,
                currentMedication: { name: "", dosage: "", frequency: "" },
                allergies,
                allergyNotes: "",
            });
        }
    }, [child]);

    // Format date to DD/MM/YYYY
    const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Handle date picker change
    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
            if (date) {
                setSelectedDate(date);
                setFormData((prev) => ({ ...prev, dateOfBirth: formatDate(date) }));
            }
        } else if (Platform.OS === "ios") {
            if (date) {
                setSelectedDate(date);
            }
        }
    };

    // Open date picker
    const openDatePicker = () => {
        if (!selectedDate) {
            setSelectedDate(new Date());
        }
        setShowDatePicker(true);
    };

    // Confirm date on iOS
    const confirmDate = () => {
        if (selectedDate) {
            setFormData((prev) => ({ ...prev, dateOfBirth: formatDate(selectedDate) }));
        }
        setShowDatePicker(false);
    };

    // Cancel date picker on iOS
    const cancelDatePicker = () => {
        if (formData.dateOfBirth) {
            const parts = formData.dateOfBirth.split("/");
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                setSelectedDate(new Date(year, month, day));
            }
        }
        setShowDatePicker(false);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const validateStep1 = (): boolean => {
        if (!formData.firstName.trim()) {
            Alert.alert("Validation Error", "Please enter the child's first name.");
            return false;
        }
        if (!formData.lastName.trim()) {
            Alert.alert("Validation Error", "Please enter the child's last name.");
            return false;
        }
        if (!formData.dateOfBirth) {
            Alert.alert("Validation Error", "Please select the child's date of birth.");
            return false;
        }
        return true;
    };

    const handleStep1Submit = () => {
        if (validateStep1()) {
            setCurrentStep(2);
        }
    };

    const validateStep2 = (): boolean => {
        if (formData.diagnoses.length === 0) {
            Alert.alert("Validation Error", "Please select at least one diagnosis.");
            return false;
        }
        return true;
    };

    const handleStep2Submit = () => {
        if (validateStep2()) {
            setCurrentStep(3);
        }
    };

    const handleStep3Submit = () => {
        setCurrentStep(4);
    };

    // Update child mutation
    const updateChildMutation = useMutation({
        mutationFn: (data: Parameters<typeof updateChild>[1]) => updateChild(id as string, data),
        onSuccess: () => {
            Alert.alert(
                "Child Updated Successfully",
                `${formData.firstName} ${formData.lastName}'s information has been updated.`,
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        },
        onError: (error: any) => {
            Alert.alert(
                "Error",
                error?.message || "Failed to update child. Please try again."
            );
        },
    });

    const handleSubmit = () => {
        // Calculate age from date of birth
        const calculateAge = (dateOfBirth: string): number | undefined => {
            if (!dateOfBirth) return undefined;
            const parts = dateOfBirth.split("/");
            if (parts.length !== 3) return undefined;
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const birthDate = new Date(year, month, day);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Prepare data for API
        const childData = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            age: calculateAge(formData.dateOfBirth),
            gender: formData.gender || undefined,
            dateOfBirth: formData.dateOfBirth || undefined,
            diagnosis: formData.diagnoses.length > 0 ? formData.diagnoses : undefined,
            medicalHistory: formData.diagnosisNotes || undefined,
            medications: formData.medications.length > 0 ? formData.medications : undefined,
            allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
        };

        updateChildMutation.mutate(childData);
    };

    const toggleDiagnosis = (diagnosisId: string) => {
        setFormData((prev) => ({
            ...prev,
            diagnoses: prev.diagnoses.includes(diagnosisId)
                ? prev.diagnoses.filter((d) => d !== diagnosisId)
                : [...prev.diagnoses, diagnosisId],
        }));
    };

    const toggleAllergy = (allergy: string) => {
        setFormData((prev) => ({
            ...prev,
            allergies: prev.allergies.includes(allergy)
                ? prev.allergies.filter((a) => a !== allergy)
                : [...prev.allergies, allergy],
        }));
    };

    const addMedication = () => {
        if (formData.currentMedication.name.trim()) {
            setFormData((prev) => ({
                ...prev,
                medications: [...prev.medications, prev.currentMedication],
                currentMedication: { name: "", dosage: "", frequency: "" },
            }));
        }
    };

    const removeMedication = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index),
        }));
    };

    // Loading state while fetching child data
    if (isLoadingChild) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable
                        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Edit Child</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading child information...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!child) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.header}>
                    <Pressable
                        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Edit Child</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={styles.errorText}>Child not found</Text>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Render step indicator (same as add-child)
    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                    <Pressable
                        style={[
                            styles.stepDot,
                            currentStep >= step.id && styles.stepDotActive,
                            currentStep === step.id && styles.stepDotCurrent,
                        ]}
                        onPress={() => step.id < currentStep && setCurrentStep(step.id)}
                    >
                        {currentStep > step.id ? (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        ) : (
                            <Text
                                style={[
                                    styles.stepNumber,
                                    currentStep >= step.id && styles.stepNumberActive,
                                ]}
                            >
                                {step.id}
                            </Text>
                        )}
                    </Pressable>
                    {index < STEPS.length - 1 && (
                        <View
                            style={[
                                styles.stepLine,
                                currentStep > step.id && styles.stepLineActive,
                            ]}
                        />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    // Render basic info step (same structure as add-child but with pre-filled data)
    const renderBasicInfo = () => (
        <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="person-outline" size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <Text style={styles.sectionSubtitle}>
                        Update your child basic details
                    </Text>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter first name"
                    placeholderTextColor={colors.textMuted}
                    value={formData.firstName}
                    onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, firstName: text }))
                    }
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter last name"
                    placeholderTextColor={colors.textMuted}
                    value={formData.lastName}
                    onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, lastName: text }))
                    }
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth *</Text>
                <Pressable style={styles.dateInput} onPress={openDatePicker}>
                    <Text
                        style={[
                            styles.dateInputText,
                            !formData.dateOfBirth && styles.dateInputPlaceholder,
                        ]}
                    >
                        {formData.dateOfBirth || "Select date of birth"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </Pressable>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderOptions}>
                    {["Male", "Female"].map((gender) => (
                        <Pressable
                            key={gender}
                            style={[
                                styles.genderOption,
                                formData.gender === gender && styles.genderOptionActive,
                            ]}
                            onPress={() => setFormData((prev) => ({ ...prev, gender }))}
                        >
                            <Text
                                style={[
                                    styles.genderOptionText,
                                    formData.gender === gender && styles.genderOptionTextActive,
                                ]}
                            >
                                {gender}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <Pressable
                style={[
                    styles.submitButton,
                    updateChildMutation.isPending && styles.submitButtonDisabled,
                ]}
                onPress={handleStep1Submit}
                disabled={updateChildMutation.isPending}
            >
                <Text style={styles.submitButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
        </View>
    );

    // Render diagnosis step
    const renderDiagnosis = () => (
        <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="medical-outline" size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.sectionTitle}>Diagnosis</Text>
                    <Text style={styles.sectionSubtitle}>
                        Select at least one diagnosis *
                    </Text>
                </View>
            </View>

            <View style={styles.diagnosisGrid}>
                {DIAGNOSIS_OPTIONS.map((option) => (
                    <Pressable
                        key={option.id}
                        style={[
                            styles.diagnosisCard,
                            formData.diagnoses.includes(option.id) &&
                            styles.diagnosisCardActive,
                        ]}
                        onPress={() => toggleDiagnosis(option.id)}
                    >
                        <Text
                            style={[
                                styles.diagnosisLabel,
                                formData.diagnoses.includes(option.id) &&
                                styles.diagnosisLabelActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                        <Text
                            style={[
                                styles.diagnosisDescription,
                                formData.diagnoses.includes(option.id) &&
                                styles.diagnosisDescriptionActive,
                            ]}
                        >
                            {option.description}
                        </Text>
                        {formData.diagnoses.includes(option.id) && (
                            <View style={styles.checkmark}>
                                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                            </View>
                        )}
                    </Pressable>
                ))}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add any additional medical history or notes..."
                    placeholderTextColor={colors.textMuted}
                    value={formData.diagnosisNotes}
                    onChangeText={(text) =>
                        setFormData((prev) => ({ ...prev, diagnosisNotes: text }))
                    }
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            <Pressable
                style={[
                    styles.submitButton,
                    updateChildMutation.isPending && styles.submitButtonDisabled,
                ]}
                onPress={handleStep2Submit}
                disabled={updateChildMutation.isPending}
            >
                <Text style={styles.submitButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
        </View>
    );

    // Render medications step
    const renderMedications = () => (
        <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="medkit-outline" size={22} color={colors.primary} />
                </View>
                <View>
                    <Text style={styles.sectionTitle}>Medications</Text>
                    <Text style={styles.sectionSubtitle}>
                        Add current medications (optional)
                    </Text>
                </View>
            </View>

            {formData.medications.map((med, index) => (
                <View key={index} style={styles.medicationCard}>
                    <View style={styles.medicationHeader}>
                        <Text style={styles.medicationName}>{med.name}</Text>
                        <Pressable onPress={() => removeMedication(index)}>
                            <Ionicons name="close-circle" size={24} color={colors.error} />
                        </Pressable>
                    </View>
                    {med.dosage && (
                        <Text style={styles.medicationDetail}>Dosage: {med.dosage}</Text>
                    )}
                    {med.frequency && (
                        <Text style={styles.medicationDetail}>
                            Frequency: {med.frequency}
                        </Text>
                    )}
                </View>
            ))}

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Medication Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter medication name"
                    placeholderTextColor={colors.textMuted}
                    value={formData.currentMedication.name}
                    onChangeText={(text) =>
                        setFormData((prev) => ({
                            ...prev,
                            currentMedication: { ...prev.currentMedication, name: text },
                        }))
                    }
                />
            </View>

            <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Dosage</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 5mg"
                        placeholderTextColor={colors.textMuted}
                        value={formData.currentMedication.dosage}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                currentMedication: { ...prev.currentMedication, dosage: text },
                            }))
                        }
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Frequency</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Twice daily"
                        placeholderTextColor={colors.textMuted}
                        value={formData.currentMedication.frequency}
                        onChangeText={(text) =>
                            setFormData((prev) => ({
                                ...prev,
                                currentMedication: { ...prev.currentMedication, frequency: text },
                            }))
                        }
                    />
                </View>
            </View>

            <Pressable
                style={styles.addButton}
                onPress={addMedication}
                disabled={!formData.currentMedication.name.trim()}
            >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addButtonText}>Add Medication</Text>
            </Pressable>

            <Pressable
                style={[
                    styles.submitButton,
                    updateChildMutation.isPending && styles.submitButtonDisabled,
                ]}
                onPress={handleStep3Submit}
                disabled={updateChildMutation.isPending}
            >
                <Text style={styles.submitButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
        </View>
    );

    // Render allergies step
    const renderAllergies = () => (
        <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name="warning-outline" size={22} color={colors.error} />
                </View>
                <View>
                    <Text style={styles.sectionTitle}>Allergies</Text>
                    <Text style={styles.sectionSubtitle}>
                        Select known allergies (optional)
                    </Text>
                </View>
            </View>

            <View style={styles.allergiesGrid}>
                {COMMON_ALLERGIES.map((allergy) => (
                    <Pressable
                        key={allergy}
                        style={[
                            styles.allergyChip,
                            formData.allergies.includes(allergy) && styles.allergyChipActive,
                        ]}
                        onPress={() => toggleAllergy(allergy)}
                    >
                        <Text
                            style={[
                                styles.allergyChipText,
                                formData.allergies.includes(allergy) &&
                                styles.allergyChipTextActive,
                            ]}
                        >
                            {allergy}
                        </Text>
                        {formData.allergies.includes(allergy) && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                    </Pressable>
                ))}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Other Allergies</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter other allergies separated by commas"
                    placeholderTextColor={colors.textMuted}
                    value={formData.allergyNotes}
                    onChangeText={(text) => {
                        setFormData((prev) => ({ ...prev, allergyNotes: text }));
                        // Auto-add comma-separated allergies
                        if (text.includes(",")) {
                            const newAllergies = text
                                .split(",")
                                .map((a) => a.trim())
                                .filter((a) => a && !COMMON_ALLERGIES.includes(a));
                            setFormData((prev) => ({
                                ...prev,
                                allergies: [
                                    ...prev.allergies.filter((a) => COMMON_ALLERGIES.includes(a)),
                                    ...newAllergies,
                                ],
                                allergyNotes: "",
                            }));
                        }
                    }}
                />
            </View>

            <Pressable
                style={[
                    styles.doneButton,
                    updateChildMutation.isPending && styles.doneButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={updateChildMutation.isPending}
            >
                {updateChildMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <>
                        <Text style={styles.doneButtonText}>Save Changes</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </>
                )}
            </Pressable>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Edit Child</Text>
                    <View style={styles.headerRight} />
                </View>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Form Content */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {currentStep === 1 && renderBasicInfo()}
                    {currentStep === 2 && renderDiagnosis()}
                    {currentStep === 3 && renderMedications()}
                    {currentStep === 4 && renderAllergies()}
                </ScrollView>

                {/* Date Picker Modal */}
                {showDatePicker && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={showDatePicker}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {Platform.OS === "ios" && (
                                    <View style={styles.modalHeader}>
                                        <Pressable onPress={cancelDatePicker}>
                                            <Text style={styles.modalButton}>Cancel</Text>
                                        </Pressable>
                                        <Text style={styles.modalTitle}>Select Date</Text>
                                        <Pressable onPress={confirmDate}>
                                            <Text style={[styles.modalButton, styles.modalButtonPrimary]}>
                                                Done
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                                <DateTimePicker
                                    value={selectedDate || new Date()}
                                    mode="date"
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            </View>
                        </View>
                    </Modal>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Styles (same as add-child screen)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgApp,
    },
    keyboardView: {
        flex: 1,
    },
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
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.bgApp,
    },
    stepDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    stepDotActive: {
        backgroundColor: colors.primary,
    },
    stepDotCurrent: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textMuted,
    },
    stepNumberActive: {
        color: "#FFFFFF",
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: colors.primary,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    formSection: {
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        gap: 12,
    },
    sectionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    dateInput: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateInputText: {
        fontSize: 16,
        color: colors.text,
    },
    dateInputPlaceholder: {
        color: colors.textMuted,
    },
    genderOptions: {
        flexDirection: "row",
        gap: 12,
    },
    genderOption: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    genderOptionActive: {
        backgroundColor: `${colors.primary}15`,
        borderColor: colors.primary,
    },
    genderOptionText: {
        fontSize: 15,
        fontWeight: "500",
        color: colors.text,
    },
    genderOptionTextActive: {
        color: colors.primary,
        fontWeight: "600",
    },
    diagnosisGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },
    diagnosisCard: {
        width: "47%",
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.border,
        position: "relative",
    },
    diagnosisCardActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    diagnosisLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 4,
    },
    diagnosisLabelActive: {
        color: "#FFFFFF",
    },
    diagnosisDescription: {
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 16,
    },
    diagnosisDescriptionActive: {
        color: "#FFFFFF",
        opacity: 0.9,
    },
    checkmark: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    medicationCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    medicationHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    medicationName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        flex: 1,
    },
    medicationDetail: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    inputRow: {
        flexDirection: "row",
        marginBottom: 20,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: `${colors.primary}15`,
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 20,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.primary,
    },
    allergiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    allergyChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.bgCard,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    allergyChipActive: {
        backgroundColor: colors.error,
        borderColor: colors.error,
    },
    allergyChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text,
    },
    allergyChipTextActive: {
        color: "#FFFFFF",
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    doneButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 8,
    },
    doneButtonDisabled: {
        opacity: 0.6,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.bgCard,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: colors.text,
    },
    modalButton: {
        fontSize: 16,
        color: colors.textMuted,
    },
    modalButtonPrimary: {
        color: colors.primary,
        fontWeight: "600",
    },
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
