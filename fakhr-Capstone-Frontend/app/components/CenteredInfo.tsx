import { Text } from "../../components/ui/AppText";
import { typography } from "../../theme/typography";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme";

type Props = {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
};

export default function CenteredInfo({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: typography.title,
    fontWeight: typography.weightSemibold,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.bodyLineHeight,
    maxWidth: 320,
  },
});
