import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useTranslation } from "react-i18next";
import { HOME_SERVICES, type Service } from "../../../api/services.api";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors as palette } from "../../../theme";

const colors = {
  bg: palette.background,
  title: palette.textSecondary,
  text: palette.textSecondary,
  selected: palette.primary,
  unselectedBg: palette.borderLight,
  star: palette.star,
  chevron: palette.chevron,
  divider: palette.divider,
  white: palette.white,
  iconBg: palette.primarySoft ?? "#EBEEF9",
};

const DESIGN_W = 390;

const NAME_KEYS: Record<string, string> = {
  "hs-behavioral": "ui.homeTherapyBehavioral",
  "hs-occupational": "ui.homeTherapyOccupational",
  "hs-speech": "ui.homeTherapySpeech",
};

function loc(isRTL: boolean, ar?: string, en?: string, fallback = ""): string {
  if (isRTL) return ar || fallback || en || "";
  return en || fallback || "";
}

export default function ServicesScreen() {
  const { t } = useTranslation();
  const { isRTL, dir, align } = useI18nLayout();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const openService = (id: string) => {
    router.push({
      pathname: "/(tabs)/services/service-details",
      params: { id },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
      <View style={[styles.column, { width: contentW }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: ms(18),
            paddingTop: ms(10),
            paddingBottom: ms(28),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { height: ms(44), marginBottom: ms(16) }]}>
            <DisabilityAwareHeaderBackButton color={colors.title} />
            <Text
              style={[
                styles.title,
                {
                  fontSize: ms(24),
                  lineHeight: ms(32),
                  writingDirection: dir,
                },
              ]}
            >
              {t("ui.homeServicesOneLine")}
            </Text>
          </View>

          {HOME_SERVICES.map((service: Service, index) => {
            const imageSize = ms(68);
            const name = NAME_KEYS[service.id]
              ? t(NAME_KEYS[service.id])
              : loc(isRTL, service.nameAr, service.nameEn, service.name);
            const subtitle = loc(
              isRTL,
              service.descriptionAr,
              service.descriptionEn,
              service.description,
            );
            return (
              <Pressable
                key={service.id}
                onPress={() => openService(service.id)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    minHeight: ms(88),
                    paddingVertical: ms(12),
                    gap: ms(14),
                    flexDirection: isRTL ? "row" : "row-reverse",
                    borderBottomWidth:
                      index === HOME_SERVICES.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={name}
              >
                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={ms(16)}
                  color={colors.chevron}
                />
                <View style={[styles.info, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
                  <Text
                    style={[
                      styles.name,
                      {
                        fontSize: ms(16),
                        lineHeight: ms(22),
                        textAlign: align,
                        writingDirection: dir,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  {!!subtitle && (
                    <Text
                      style={[
                        styles.subtitle,
                        {
                          fontSize: ms(13),
                          lineHeight: ms(18),
                          marginTop: ms(4),
                          textAlign: align,
                          writingDirection: dir,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    width: imageSize,
                    height: imageSize,
                    borderRadius: ms(10),
                    backgroundColor: colors.iconBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={service.icon as React.ComponentProps<typeof Ionicons>["name"]}
                    size={ms(28)}
                    color={colors.selected}
                  />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
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
  column: {
    flex: 1,
    maxWidth: 430,
    width: "100%",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    color: colors.title,
    textAlign: "center",
  },
  row: {
    width: "100%",
    alignItems: "center",
    borderBottomColor: colors.divider,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontWeight: "500",
    color: colors.text,
    opacity: 0.75,
  },
  pressed: {
    opacity: 0.88,
  },
});
