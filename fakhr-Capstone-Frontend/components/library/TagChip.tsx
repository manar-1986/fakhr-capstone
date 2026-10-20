import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import React from "react";
import { StyleSheet, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";

type Props = { label: string };

export function TagChip({ label }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: c.chipBg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: typography.helper,
    fontWeight: typography.weightRegular,
    color: c.chipText,
  },
});
