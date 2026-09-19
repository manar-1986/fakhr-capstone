import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import {
  firstSearchParam,
  navigateToDisabilityServices,
} from "../../utils/disabilityFlowNav";

const DEFAULT_COLOR = "#3A4060";
const DEFAULT_SIZE = 26;

type HeaderBackButtonProps = {
  color?: string;
  size?: number;
  fallbackHref?: Href;
  variant?: "overlay" | "inline";
  onPress?: () => void;
};

export function HeaderBackButton({
  color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  fallbackHref = "/(tabs)/home",
  variant = "overlay",
  onPress,
}: HeaderBackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  };

  return (
    <Pressable
      onPress={goBack}
      hitSlop={12}
      style={({ pressed }) => [
        variant === "inline" ? styles.inline : styles.overlay,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="رجوع"
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </Pressable>
  );
}

/** Use on service listings opened from a disability so Back returns to that disability's services hub. */
export function DisabilityAwareHeaderBackButton(props: Omit<HeaderBackButtonProps, "onPress">) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    disabilityId?: string | string[];
    disabilityName?: string | string[];
  }>();
  const disabilityId = firstSearchParam(params.disabilityId);
  const disabilityName = firstSearchParam(params.disabilityName);

  return (
    <HeaderBackButton
      {...props}
      onPress={
        disabilityId
          ? () => navigateToDisabilityServices(router, disabilityId, disabilityName)
          : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  inline: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});
