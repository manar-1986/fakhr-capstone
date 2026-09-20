import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const colors = {
  bg: "#FFFFFF",
  title: "#19181E",
  cardTitle: "#19181E",
  cardDesc: "#6A6D76",
  cardParentBg: "#EBEEF9",
  cardParentIcon: "#5C6BB3",
  cardIndividualBg: "#EEF9F3",
  cardIndividualIcon: "#3FA67C",
  cardOrgBg: "#FEF5EB",
  cardOrgIcon: "#E8913C",
};

const DESIGN_W = 387;

type UserTypeOption = {
  key: "parent" | "individual" | "organization";
  titleKey: string;
  descriptionKey: string;
  backgroundColor: string;
  iconColor: string;
};

const OPTIONS: UserTypeOption[] = [
  {
    key: "parent",
    titleKey: "ui.parent",
    descriptionKey: "ui.parentDesc",
    backgroundColor: colors.cardParentBg,
    iconColor: colors.cardParentIcon,
  },
  {
    key: "individual",
    titleKey: "ui.individualUser",
    descriptionKey: "ui.individualDesc",
    backgroundColor: colors.cardIndividualBg,
    iconColor: colors.cardIndividualIcon,
  },
  {
    key: "organization",
    titleKey: "ui.organization",
    descriptionKey: "ui.orgDesc",
    backgroundColor: colors.cardOrgBg,
    iconColor: colors.cardOrgIcon,
  },
];

export default function UserTypeSelectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const onSelect = (key: UserTypeOption["key"]) => {
    router.push(`/(signup)/intro?role=${key}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            width: contentW,
            paddingHorizontal: ms(22),
            paddingTop: ms(22),
          },
        ]}
      >
        <Text
          style={[
            styles.heading,
            {
              fontSize: ms(27),
              lineHeight: ms(36),
              marginBottom: ms(28),
            },
          ]}
        >
          {t("ui.chooseUserType")}
        </Text>

        <View style={{ gap: ms(18) }}>
          {OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => onSelect(option.key)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: option.backgroundColor,
                  height: ms(162),
                  borderRadius: ms(28),
                  paddingLeft: ms(24),
                  paddingRight: ms(28),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${t(option.titleKey)}. ${t(option.descriptionKey)}`}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconSlot, { width: ms(64) }]}>
                  <Ionicons
                    name={
                      option.key === "parent"
                        ? "people"
                        : option.key === "individual"
                          ? "person-outline"
                          : "people-outline"
                    }
                    size={option.key === "individual" ? ms(50) : ms(52)}
                    color={option.iconColor}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        fontSize: ms(20),
                        lineHeight: ms(28),
                        marginBottom: ms(6),
                      },
                    ]}
                  >
                    {t(option.titleKey)}
                  </Text>
                  <Text
                    style={[
                      styles.cardDesc,
                      { fontSize: ms(14), lineHeight: ms(22) },
                    ]}
                  >
                    {t(option.descriptionKey)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
  },
  content: {
    flex: 1,
    maxWidth: 430,
    alignSelf: "center",
  },
  heading: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  card: {
    justifyContent: "center",
    width: "100%",
    overflow: "hidden",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
  },
  iconSlot: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    alignItems: "flex-end",
  },
  cardTitle: {
    fontWeight: "700",
    color: colors.cardTitle,
    textAlign: "right",
    writingDirection: "rtl",
  },
  cardDesc: {
    fontWeight: "400",
    color: colors.cardDesc,
    textAlign: "right",
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
