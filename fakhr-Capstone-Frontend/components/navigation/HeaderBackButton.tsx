import { colors as fakhrColors } from "../../theme/colors";
import { SharedHeaderContext, StepBackAction } from "./SharedHeaderContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import React, { useContext } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import {
  firstSearchParam,
  navigateToDisabilityServices,
} from "../../utils/disabilityFlowNav";

import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";

const DEFAULT_COLOR = colors.textSecondary;
const DEFAULT_SIZE = 26;

type HeaderBackButtonProps = { testID?: string; preserveAction?: boolean;
  color?: string;
  size?: number;
  fallbackHref?: Href;
  variant?: "overlay" | "inline";
  onPress?: () => void;
};

export function HeaderBackButton({
  testID, preserveAction = false, color = DEFAULT_COLOR,
  size = DEFAULT_SIZE,
  fallbackHref = "/(tabs)/home",
  variant = "overlay",
  onPress,
}: HeaderBackButtonProps) {
  const managed = useContext(SharedHeaderContext)?.managed;
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useI18nLayout();

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

  if (managed) return preserveAction && onPress ? <StepBackAction action={onPress} /> : null;
  return (
    <Pressable testID={testID}
      onPress={goBack}
      hitSlop={12}
      style={({ pressed }) => [
        variant === "inline"
          ? styles.inline
          : [styles.overlay, isRTL ? styles.overlayRtl : styles.overlayLtr],
        { height: 44, borderRadius: 14, backgroundColor: fakhrColors.backgroundWash },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
    >
      <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={fakhrColors.text} />
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
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  overlayLtr: {
    left: 0,
  },
  overlayRtl: {
    right: 0,
  },
  inline: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});

