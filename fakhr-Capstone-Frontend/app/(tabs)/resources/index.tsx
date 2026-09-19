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
import type { ResourceType } from "../../../constants/resources";

const colors = {
  bg: "#FFFFFF",
  title: "#1A1C29",
  subtitle: "#6A6D76",
  chevron: "#9AA0B3",
  back: "#3A4060",
  helpBg: "#EEF5FD",
  helpIcon: "#6F80B4",
  white: "#FFFFFF",
};

const DESIGN_W = 419;

type Category = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  resource?: ResourceType;
};

const CATEGORIES: Category[] = [
  {
    id: "autism",
    label: "اضطراب طيف التوحد\n(ASD)",
    icon: "people-outline",
    iconColor: "#5C6BB3",
    backgroundColor: "#EBEEF9",
    resource: "autism",
  },
  {
    id: "intellectual",
    label: "الإعاقة الذهنية",
    icon: "person-outline",
    iconColor: "#C45A78",
    backgroundColor: "#F8EEF4",
  },
  {
    id: "adhd",
    label: "اضطراب فرط الحركة\nوتشتت الانتباه (ADHD)",
    icon: "sunny-outline",
    iconColor: "#D4A017",
    backgroundColor: "#FEF6E8",
    resource: "adhd",
  },
  {
    id: "learning",
    label: "صعوبات التعلم",
    icon: "document-text-outline",
    iconColor: "#3E7A9A",
    backgroundColor: "#E8F4FC",
    resource: "add",
  },
  {
    id: "motor",
    label: "الإعاقة الحركية",
    icon: "body-outline",
    iconColor: "#4A7FA3",
    backgroundColor: "#E6F4FD",
  },
  {
    id: "hearing",
    label: "الإعاقة السمعية",
    icon: "ear-outline",
    iconColor: "#5B8FB0",
    backgroundColor: "#E4F6F4",
  },
  {
    id: "vision",
    label: "الإعاقة البصرية",
    icon: "eye-outline",
    iconColor: "#3D9B78",
    backgroundColor: "#E6F8F0",
  },
  {
    id: "speech",
    label: "اضطرابات النطق والتواصل",
    icon: "person-outline",
    iconColor: "#D16B75",
    backgroundColor: "#FDEFF2",
  },
  {
    id: "down",
    label: "متلازمة داون",
    icon: "people-outline",
    iconColor: "#D4A24A",
    backgroundColor: "#FEF6E9",
  },
  {
    id: "multiple",
    label: "إعاقات متعددة",
    icon: "people-outline",
    iconColor: "#3AA89A",
    backgroundColor: "#E8F6F4",
  },
  {
    id: "developmental",
    label: "التأخر النمائي",
    icon: "flower-outline",
    iconColor: "#4EA077",
    backgroundColor: "#E6F9F1",
  },
  {
    id: "mental",
    label: "الصحة النفسية والسلوكية",
    icon: "flower-outline",
    iconColor: "#7B6AA8",
    backgroundColor: "#EEEAF8",
  },
];

export default function DisabilityCategoriesScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const contentW = Math.min(windowWidth, 430);
  const s = contentW / DESIGN_W;
  const ms = (n: number) => Math.round(n * s);

  const goBack = () => {
    router.navigate("/(tabs)/home");
  };

  const openCategory = (item: Category) => {
    router.push({
      pathname: "/(tabs)/resources/disability-services",
      params: {
        id: item.id,
        name: item.label.replace(/\n/g, " "),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentW,
            paddingHorizontal: ms(20),
            paddingTop: ms(2),
            paddingBottom: ms(96),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { height: ms(44), marginBottom: ms(8) }]}>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
          >
            <Ionicons name="chevron-back" size={ms(26)} color={colors.back} />
          </Pressable>
          <Text
            style={[
              styles.title,
              { fontSize: ms(24), lineHeight: ms(32) },
            ]}
          >
            فئات الإعاقة
          </Text>
        </View>

        <Text
          style={[
            styles.subtitle,
            {
              fontSize: ms(13),
              lineHeight: ms(22),
              marginBottom: ms(12),
            },
          ]}
        >
          {"اختر الفئة المناسبة للحصول على\nالخدمات والمعلومات الملائمة"}
        </Text>

        <View style={{ gap: ms(6) }}>
          {CATEGORIES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openCategory(item)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: item.backgroundColor,
                  minHeight: ms(54),
                  borderRadius: ms(16),
                  paddingHorizontal: ms(12),
                  paddingVertical: ms(8),
                },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.label.replace("\n", " ")}
            >
              <Ionicons name={item.icon} size={ms(26)} color={item.iconColor} />
              <Text
                style={[
                  styles.cardLabel,
                  { fontSize: ms(14), lineHeight: ms(20) },
                ]}
              >
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={ms(18)}
                color={colors.chevron}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/directory/helpCenter")}
          style={({ pressed }) => [
            styles.helpCard,
            {
              marginTop: ms(16),
              borderRadius: ms(20),
              minHeight: ms(72),
              paddingHorizontal: ms(16),
              paddingVertical: ms(14),
            },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="لست متأكداً من الفئة؟"
        >
          <View style={styles.helpTextCol}>
            <Text style={[styles.helpTitle, { fontSize: ms(15), lineHeight: ms(22) }]}>
              لست متأكداً من الفئة؟
            </Text>
            <Text style={[styles.helpSub, { fontSize: ms(12), lineHeight: ms(18) }]}>
              مساعدتك في تحديد الفئة المناسبة
            </Text>
          </View>
          <View
            style={[
              styles.helpIconWrap,
              {
                width: ms(44),
                height: ms(44),
                borderRadius: ms(22),
                borderColor: colors.helpIcon,
              },
            ]}
          >
            <Text style={[styles.helpQuestion, { fontSize: ms(22) }]}>?</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignSelf: "center",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  title: {
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  cardLabel: {
    flex: 1,
    fontWeight: "700",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
  },
  helpCard: {
    backgroundColor: colors.helpBg,
    flexDirection: "row",
    alignItems: "center",
    flexDirection: "row",
  },
  helpTextCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  helpTitle: {
    fontWeight: "700",
    color: colors.title,
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  helpSub: {
    fontWeight: "500",
    color: colors.subtitle,
    textAlign: "right",
    writingDirection: "rtl",
    alignSelf: "stretch",
  },
  helpIconWrap: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  helpQuestion: {
    fontWeight: "700",
    color: colors.helpIcon,
  },
  pressed: {
    opacity: 0.88,
  },
});
