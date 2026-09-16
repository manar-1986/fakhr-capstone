import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card } from "../../components/ui";
import {
  colors,
  radius,
  sectionSpacing,
  spacing,
  typography,
} from "../../theme";

/**
 * Onboarding / Landing Screen
 * - Fakhr title
 * - 3 benefit cards
 * - "Get Started" button
 * - "I already have an account" link
 */
export default function LandingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace("/(tabs)/home");
  };

  const handleAlreadyHaveAccount = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fakhr Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Fakhr</Text>
        </View>

        {/* 3 Benefit Cards */}
        <View style={styles.benefitsContainer}>
          <Card style={styles.benefitCard} noShadow>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="heart" size={32} color={colors.primary} />
            </View>
            <Text style={styles.benefitTitle}>Personalized Support</Text>
            <Text style={styles.benefitDescription}>
              Get tailored guidance for your child&apos;s unique needs
            </Text>
          </Card>

          <Card style={styles.benefitCard} noShadow>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="people" size={32} color={colors.primary} />
            </View>
            <Text style={styles.benefitTitle}>Community Connection</Text>
            <Text style={styles.benefitDescription}>
              Connect with other families on similar journeys
            </Text>
          </Card>

          <Card style={styles.benefitCard} noShadow>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="trail-sign" size={32} color={colors.primary} />
            </View>
            <Text style={styles.benefitTitle}>Care Path</Text>
            <Text style={styles.benefitDescription}>
              Follow a structured plan designed just for you
            </Text>
          </Card>
        </View>

        {/* Get Started Button */}
        <View style={styles.actionsContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            style={styles.getStartedButton}
          />

          {/* I already have an account */}
          <View style={styles.accountLinkContainer}>
            <Text style={styles.accountLinkText}>
              I already have an account
            </Text>
            <Text
              style={styles.accountLink}
              onPress={handleAlreadyHaveAccount}
              accessibilityRole="link"
              accessibilityLabel="Sign in to existing account"
            >
              Sign in
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl * 2,
    paddingBottom: spacing.pageBottom,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: sectionSpacing.loose,
  },
  title: {
    fontSize: typography.display + 8,
    lineHeight: typography.displayLineHeight + 10,
    fontWeight: typography.weightBold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  benefitsContainer: {
    gap: spacing.lg,
    marginBottom: sectionSpacing.loose,
  },
  benefitCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
  },
  benefitIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  benefitTitle: {
    fontSize: typography.h3,
    lineHeight: typography.h3LineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  benefitDescription: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
    textAlign: "center",
  },
  actionsContainer: {
    marginTop: "auto",
    paddingTop: sectionSpacing.default,
  },
  getStartedButton: {
    marginBottom: spacing.xl,
  },
  accountLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
  },
  accountLinkText: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textMuted,
  },
  accountLink: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.primary,
    fontWeight: typography.weightSemibold,
  },
});
