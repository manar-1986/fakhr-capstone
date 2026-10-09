import { Text } from "../ui/AppText";
import { typography } from "../../theme/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { libraryColors as c } from "../../constants/libraryTheme";

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
};

export function CategoryChip({ label, icon, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        selected && styles.wrapSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        <Ionicons
          name={icon}
          size={18}
          color={selected ? c.white : c.textMuted}
        />
        <Text
          style={[
            styles.label,
            selected && styles.labelSelected,
            styles.labelSpacing,
          ]}
        >
          {label}
        </Text>
      </View>
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
  labelSpacing: {
    marginLeft: 8,
  },
  label: {
    fontSize: typography.label,
    fontWeight: "600",
    color: c.text,
  },
  labelSelected: {
    color: c.white,
  },
  pressed: { opacity: 0.9 },
});
