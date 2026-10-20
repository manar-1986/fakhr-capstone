import { typography } from "../../theme/typography";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "../ui/AppText";
import { libraryColors as c } from "../../constants/libraryTheme";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function CategoryTab({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginEnd: 10,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.brand,
  },
  chipSelected: {
    backgroundColor: c.brand,
    borderColor: c.brand,
  },
  label: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: c.text,
  },
  labelSelected: {
    color: "#0B093B",
  },
  pressed: { opacity: 0.92 },
});
