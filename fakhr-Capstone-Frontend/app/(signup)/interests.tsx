import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
  title: "#1A1C29",
  subtitle: "#6E7479",
  brand: "#6F80B4",
  icon: "#6F80B4",
  cardBorder: "#D8DCE8",
  cardBg: "#FFFFFF",
  cardSelectedBg: "#EBEEF9",
  white: "#FFFFFF",
};

const DESIGN_W = 405;

type Interest = {
  id: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const INTERESTS: Interest[] = [
  { id: "apps", labelKey: "ui.apps", icon: "grid-outline" },
  { id: "centers", labelKey: "ui.centers", icon: "business-outline" },
  { id: "doctors", labelKey: "ui.doctorsShort", icon: "person-outline" },
  { id: "events", labelKey: "ui.events", icon: "people-outline" },
  { id: "products", labelKey: "ui.products", icon: "bag-handle-outline" },
  { id: "institutes", labelKey: "ui.institutes", icon: "home-outline" },
  { id: "consultations", labelKey: "ui.consultations", icon: "chatbubble-ellipses-outline" },
  { id: "services", labelKey: "ui.servicesShort", icon: "extension-puzzle-outline" },
  { id: "education", labelKey: "ui.education", icon: "play-circle-outline" },
];

export default function InterestsSelectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const padX = ms(28);
  const gap = ms(12);
  const cardW = Math.floor((contentW - padX * 2 - gap * 2) / 3);
  const cardH = ms(118);
  const iconSize = ms(34);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    if (role === "parent") {
      router.push("/(signup)/child-profile-setup");
      return;
    }
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            width: contentW,
            paddingHorizontal: padX,
            paddingTop: ms(22),
            paddingBottom: ms(22),
          },
        ]}
      >
        <Text
          style={[
            styles.heading,
            {
              fontSize: ms(28),
              lineHeight: ms(38),
              marginBottom: ms(10),
            },
          ]}
        >
          {t("ui.chooseInterests")}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: ms(15),
              lineHeight: ms(24),
              marginBottom: ms(28),
            },
          ]}
        >
          {t("ui.pickInterestsSub")}
        </Text>

        <View style={[styles.grid, { gap }]}>
          {INTERESTS.map((item) => {
            const isOn = selected.has(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => toggle(item.id)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    width: cardW,
                    height: cardH,
                    borderRadius: ms(20),
                    borderColor: isOn ? colors.brand : colors.cardBorder,
                    backgroundColor: isOn ? colors.cardSelectedBg : colors.cardBg,
                    borderWidth: isOn ? 1.75 : 1.4,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isOn }}
                accessibilityLabel={t(item.labelKey)}
              >
                <Ionicons
                  name={item.icon}
                  size={iconSize}
                  color={colors.icon}
                />
                <Text
                  style={[
                    styles.cardLabel,
                    {
                      fontSize: ms(13),
                      lineHeight: ms(18),
                      marginTop: ms(10),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {t(item.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                minHeight: ms(58),
                borderRadius: ms(18),
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("ui.saveContinue")}
          >
            <Text style={[styles.primaryButtonText, { fontSize: ms(18) }]}>
              {t("ui.saveContinue")}
            </Text>
          </Pressable>
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
  subtitle: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "center",
    writingDirection: "rtl",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    flexDirection: "row",
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBg,
  },
  cardLabel: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "center",
    writingDirection: "rtl",
  },
  footer: {
    marginTop: "auto",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontWeight: "700",
    color: colors.white,
    writingDirection: "rtl",
  },
  pressed: {
    opacity: 0.88,
  },
});
