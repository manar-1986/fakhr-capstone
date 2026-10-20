import { PlanIllustration } from "./HomeIllustration";
import { colors as fakhrColors } from "../../theme/colors";
import { homeReference as homeTheme } from "../../theme/homeReference";
import React from "react";
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { HOME_PRODUCTS, PRODUCT_SUPPORT_CATEGORIES } from "../../constants/homeProducts";
import { productIllustration } from "../../constants/productImages";
import { typography } from "../../theme/typography";

/** Home shortcuts only; the weekly plan remains at its existing /plan route. */
export default function HomeDiscoverySections() {
  const router = useRouter();
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const { width, fontScale } = useWindowDimensions();
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  const row = { flexDirection: tabRow };
  const narrow = width < 360 || fontScale > 1.3;
  return <View style={s.sections}>
    <Pressable testID="home-child-plan-shortcut" accessibilityRole="button" accessibilityLabel={text("عرض خطة طفلي", "View My Child's Plan")} onPress={() => router.push("/(tabs)/plan")} style={({ pressed }) => [s.plan, { flexDirection: isRTL ? "row" : "row-reverse" }, pressed && s.pressed]}>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={[s.heading, txt]}>{text("خطة طفلي", "My Child's Plan")}</Text>
        <Text style={[s.body, txt]}>{text("أنشطة طفلك وخطته اليومية في مكان واحد", "Your child’s activities and daily plan in one place")}</Text>
        <View style={[s.cta, row]}><Text style={s.ctaText}>{text("عرض خطتي", "View My Plan")}</Text><Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="white" /></View>
      </View>
      <View style={s.planArt} accessible={false}><PlanIllustration/></View>
    </Pressable>
    <View style={[s.sectionHeading, row]}>
      <Text accessibilityRole="header" style={[s.heading, txt, { flex: 1, color: "#0B093B" }]}>{text("اكتشف منتجاتنا", "Explore our products")}</Text>
      <Pressable testID="home-products-all" accessibilityRole="button" accessibilityLabel={text("عرض كل المنتجات", "View all products")} onPress={() => router.push("/(tabs)/products")} style={s.all}><Text style={s.link}>{text("عرض الكل", "View all")}</Text></Pressable>
    </View>
    <View style={[s.productRow, { flexDirection: narrow ? "column" : tabRow }]}>
      {HOME_PRODUCTS.slice(0, 2).map(product => {
        const illustration = product.id === "p-2" ? require("../../assets/images/product-2.png") : productIllustration(product.id);
        const category = PRODUCT_SUPPORT_CATEGORIES.find(item => item.id === product.supportCategories[0]);
        const name = isRTL ? product.nameAr : product.nameEn;
        return <Pressable key={product.id} testID={`home-product-${product.id}`} accessibilityRole="button" accessibilityLabel={text(`عرض المنتج: ${name}`, `View product: ${name}`)} onPress={() => router.push({ pathname: "/(tabs)/products/product-details", params: { id: product.id } })} style={({ pressed }) => [s.product, pressed && s.pressed]}>
          <View style={s.productImage}>{illustration ? <Image source={illustration} resizeMode="contain" style={s.image} accessibilityLabel={text("صورة توضيحية", "Illustration")} /> : <Ionicons name="albums-outline" size={52} color={homeTheme.muted} />}</View>
          <View style={s.productCopy}><Text style={[s.productTitle, txt]}>{name}</Text><Text style={[s.body, txt]}>{isRTL ? category?.nameAr : category?.nameEn}</Text>{!!product.priceLabel && <Text style={[s.price, txt]}>{product.priceLabel}</Text>}<Text style={[s.caption, txt]}>{text(illustration ? "صورة توضيحية" : "الصورة غير متوفرة", illustration ? "Illustration" : "Image unavailable")}</Text></View>
        </Pressable>;
      })}
    </View>
    <Text style={[s.caption, txt]}>{text("الأسعار والتوفر حسب الدليل الحالي وتحتاج إلى تأكيد.", "Prices and availability from the current directory require confirmation.")}</Text>
  </View>;
}
const s = StyleSheet.create({
  sections: { gap: 16 }, plan: { alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "#BCC3D8", shadowColor: "#8B91AF", shadowOffset: { width: 0, height: 3 }, shadowOpacity: .09, shadowRadius: 10, elevation: 1 },
  heading: { fontSize: typography.section, fontWeight: typography.weightSemibold, color: homeTheme.ink }, body: { fontSize: typography.body, color: homeTheme.muted }, caption: { fontSize: typography.helper, color: homeTheme.muted },
  cta: { alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#6E7CAF", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, marginTop: 4 }, ctaText: { color: homeTheme.white, fontSize: typography.button, fontWeight: typography.weightMedium },
  planArt: { width: 94, minHeight: 120, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "#F1F2F8" },
  sectionHeading: { alignItems: "center", gap: 8 }, all: { minHeight: 44, justifyContent: "center" }, link: { fontSize: typography.button, color: "#0B093B", fontWeight: typography.weightMedium },
  productRow: { gap: 12, alignItems: "stretch" }, product: { flex: 1, minWidth: 0, borderRadius: 20, overflow: "hidden", backgroundColor: "white", borderWidth: 1, borderColor: "#E8ECF5", shadowColor: "#263A72", shadowOffset: { width: 0, height: 3 }, shadowOpacity: .06, shadowRadius: 8, elevation: 1 },
  productImage: { height: 148, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F7FE" }, image: { width: "100%", height: "100%" }, productCopy: { padding: 10, gap: 4 }, productTitle: { fontSize: typography.cardTitle, fontWeight: typography.weightMedium, color: homeTheme.ink }, price: { fontSize: typography.body, color: homeTheme.ink, fontWeight: typography.weightRegular }, pressed: { opacity: .8 },
});
