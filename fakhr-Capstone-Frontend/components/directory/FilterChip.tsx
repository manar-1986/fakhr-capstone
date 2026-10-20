import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";

type Props = {
  label: string;
  selected: boolean;
  showDropdownChevron?: boolean;
  onPress: () => void;
};

export function FilterChip({
  label,
  selected,
  showDropdownChevron = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        selected && styles.wrapSelected,
        pressed && styles.pressed,
      ]}
    >
      {selected ? (
        <View style={styles.inner}>
          <Ionicons name="navigate" size={16} color={c.white} />
          <Text style={styles.labelSelected}>{label}</Text>
        </View>
      ) : (
        <View style={styles.inner}>
          <Text style={styles.label}>{label}</Text>
          {showDropdownChevron ? (
            <Ionicons
              name="chevron-down"
              size={16}
              color={c.textMuted}
              style={styles.chevron}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: c.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.inputBorder,
  },
  wrapSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: c.text,
  },
  labelSelected: {
    fontSize: typography.button,
    fontWeight: typography.weightMedium,
    color: "#0B093B",
    marginLeft: 6,
  },
  chevron: {
    marginLeft: 6,
  },
  pressed: { opacity: 0.9 },
});
