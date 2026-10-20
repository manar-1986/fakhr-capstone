import { Text, ScrollView } from "../../../components/ui/AppText";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getContentDetails } from "../../../api/content.api";
import { colors, sectionSpacing, spacing, typography } from "../../../theme";

export default function ContentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data: content, isLoading } = useQuery({
    queryKey: ["content", id],
    queryFn: () => getContentDetails(id as string),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.wrapper} edges={["top"]}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>{content?.title}</Text>
        <Text style={styles.content}>{content?.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.title,
    lineHeight: typography.titleLineHeight,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    marginBottom: sectionSpacing.default,
  },
  content: {
    fontSize: typography.body,
    lineHeight: typography.bodyLineHeight,
    color: colors.textSecondary,
  },
});
