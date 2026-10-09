import { homeTheme } from "../../theme/home";
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
        <Text style={[s.body, txt]}>{text("أهداف وأنشطة ومواعيد في مكان واحد", "Goals, activities and appointments in one place")}</Text>
        <View style={[s.cta, row]}><Text style={s.ctaText}>{text("عرض الخطة", "View plan")}</Text><Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="white" /></View>
      </View>
      <View style={s.planArt} accessible={false}><MaterialCommunityIcons name="clipboard-check-outline" size={56} color={homeTheme.blue} /><Ionicons name="leaf-outline" size={23} color={homeTheme.muted} /></View>
    </Pressable>
    <View style={[s.sectionHeading, row]}>
      <Text accessibilityRole="header" style={[s.heading, txt, { flex: 1 }]}>{text("اكتشف منتجاتنا", "Explore our products")}</Text>
      <Pressable testID="home-products-all" accessibilityRole="button" accessibilityLabel={text("عرض كل المنتجات", "View all products")} onPress={() => router.push("/(tabs)/products")} style={s.all}><Text style={s.link}>{text("عرض الكل", "View all")}</Text></Pressable>
    </View>
    <View style={[s.productRow, { flexDirection: narrow ? "column" : tabRow }]}>
      {HOME_PRODUCTS.slice(0, 2).map(product => {
        const illustration = productIllustration(product.id);
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
  sections: { gap: 16 }, plan: { alignItems: "center", gap: 12, backgroundColor: "white", padding: 14, borderRadius: 24, borderWidth: 1, borderColor: "#E9ECF6", shadowColor: homeTheme.muted, shadowOffset: { width: 0, height: 3 }, shadowOpacity: .09, shadowRadius: 10, elevation: 1 },
  heading: { fontSize: 22, fontWeight: "700", color: homeTheme.ink }, body: { fontSize: 14, color: homeTheme.muted }, caption: { fontSize: typography.caption, color: "#737C9B" },
  cta: { alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: homeTheme.blue, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, marginTop: 4 }, ctaText: { color: "white", fontSize: typography.button, fontWeight: "600" },
  planArt: { width: 82, minHeight: 108, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: homeTheme.surface },
  sectionHeading: { alignItems: "center", gap: 8 }, all: { minHeight: 44, justifyContent: "center" }, link: { fontSize: typography.body, color: homeTheme.blue, fontWeight: "600" },
  productRow: { gap: 12, alignItems: "stretch" }, product: { flex: 1, minWidth: 0, borderRadius: 20, overflow: "hidden", backgroundColor: "white", borderWidth: 1, borderColor: "#E9ECF6" },
  productImage: { height: 116, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F5FB" }, image: { width: "100%", height: "100%" }, productCopy: { padding: 10, gap: 4 }, productTitle: { fontSize: 16, fontWeight: "700", color: homeTheme.ink }, price: { fontSize: typography.body, color: homeTheme.ink, fontWeight: "600" }, pressed: { opacity: .8 },
});
