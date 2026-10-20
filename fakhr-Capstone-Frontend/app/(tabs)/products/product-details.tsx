import { colors as fakhrColors } from "../../../theme/colors";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { HeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { HOME_PRODUCTS, PRODUCT_SUPPORT_CATEGORIES } from "../../../constants/homeProducts";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors, typography } from "../../../theme";
import { productIllustration } from "../../../constants/productImages";

export default function ProductDetails() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const product = HOME_PRODUCTS.find(item => item.id === id);
  const illustration = product && productIllustration(product.id);
  const { isRTL, align, dir } = useI18nLayout();
  const text = { textAlign: align, writingDirection: dir };
  return <SafeAreaView style={styles.screen} edges={["top"]}>
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <HeaderBackButton variant="inline" fallbackHref="/(tabs)/products" />
        <Text style={[styles.heading, text]}>{isRTL ? "تفاصيل المنتج" : "Product details"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!product ? <Text style={text}>{isRTL ? "المنتج غير موجود" : "Product not found"}</Text> : <>
          {illustration ? <Image source={illustration} resizeMode="contain" style={styles.image} accessibilityLabel={isRTL ? `صورة توضيحية: ${product.nameAr}` : `Illustration: ${product.nameEn}`} /> : <Ionicons name="cube-outline" size={80} color={colors.primary} />}
          <Text style={[styles.heading, text]}>{isRTL ? product.nameAr : product.nameEn}</Text>
          {product.priceLabel ? <Text style={text}>{product.priceLabel}</Text> : null}
          {PRODUCT_SUPPORT_CATEGORIES.filter(c => (product.supportCategories as readonly string[]).includes(c.id)).map(c => <Text key={c.id} style={text}>{isRTL ? c.nameAr : c.nameEn}</Text>)}
          <Text style={[styles.note, text]}>{isRTL ? "بيانات من دليل منتجات فخر الحالي. الصورة توضيحية وليست صورة موثقة للمنتج؛ السعر والتوفر يحتاجان تأكيداً." : "From Fakhr’s existing product directory. Illustration, not a verified product photo; price and availability require confirmation."}</Text>
        </>}
      </ScrollView>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: fakhrColors.background }, container: { flex: 1, width: "100%", maxWidth: 430, alignSelf: "center", direction: "ltr" },
  header: { alignItems: "center", padding: 12, gap: 8 }, heading: { flexShrink: 1, fontSize: typography.section, fontWeight: typography.weightSemibold, color: colors.text },
  content: { padding: 18, paddingBottom: 110, gap: 16 }, image: { width: "100%", height: 220, borderRadius: 22 },
  note: { fontSize: typography.helper, color: colors.textSecondary },
});
