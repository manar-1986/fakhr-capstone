import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { PRODUCT_SUPPORT_CATEGORIES, type HomeProduct } from "../../constants/homeProducts";

// Same image assets and photoIndex mapping used by the existing Products page.
const PHOTOS = [
  require("../../assets/images/product-1.png"),
  require("../../assets/images/product-2.png"),
  require("../../assets/images/product-3.png"),
  require("../../assets/images/product-4.png"),
];

type Props = {
  products: readonly HomeProduct[];
  personalized: boolean;
  isSaved: (product: HomeProduct) => boolean;
  busy: boolean;
  onSave: (product: HomeProduct) => void;
  onView: (product: HomeProduct) => void;
  onViewAll: () => void;
};

export function JourneyProducts({ products, personalized, isSaved, busy, onSave, onView, onViewAll }: Props) {
  const { isRTL, align, dir, tabRow } = useI18nLayout();
  const carousel = useRef<ScrollView>(null);
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const txt = { textAlign: align, writingDirection: dir };
  return <View style={s.section}>
    <View style={[s.heading, { flexDirection: tabRow }]}>
      <Ionicons name="bag-handle-outline" size={25} color="#6969D7" />
      <Text accessibilityRole="header" style={[s.title, txt]}>{text("منتجات مقترحة لطفلك", "Recommended Products for Your Child")}</Text>
    </View>
    <Text style={[s.caption, txt]}>{personalized
      ? text("منتجات للاستكشاف حسب احتياجات طفلك المسجلة", "Products to explore based on your child's selected needs")
      : text("منتجات متنوعة لاستكشاف ما يناسب عائلتك", "Explore a range of products for your family")}</Text>
    <ScrollView
      key={`${isRTL}-${products.map(product => product.id).join("-")}`}
      ref={carousel}
      horizontal
      showsHorizontalScrollIndicator
      style={{ direction: "ltr" }}
      contentContainerStyle={[s.track, { flexDirection: tabRow }]}
      onContentSizeChange={() => { if (isRTL) carousel.current?.scrollToEnd({ animated: false }); }}
    >
      {products.map(product => {
        const name = text(product.nameAr, product.nameEn);
        const category = PRODUCT_SUPPORT_CATEGORIES.find(item => item.id === product.supportCategories[0]);
        const selected = isSaved(product);
        return <View key={product.id} style={s.product}>
          <View style={[s.imageRow, { flexDirection: tabRow }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={() => onView(product)}>
              <Image source={PHOTOS[product.photoIndex % PHOTOS.length]} style={s.image} resizeMode="contain" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text(selected ? `إزالة ${name} من المحفوظات` : `حفظ ${name}`, selected ? `Unsave ${name}` : `Save ${name}`)}
              accessibilityState={{ selected, disabled: busy }}
              disabled={busy}
              onPress={() => onSave(product)}
              style={s.heart}
            ><Ionicons name={selected ? "heart" : "heart-outline"} size={23} color={selected ? "#BB7298" : "#7374CC"} /></Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={() => onView(product)}><Text style={[s.name, txt]}>{name}</Text></Pressable>
          <Text style={[s.category, txt]}>{category ? text(category.nameAr, category.nameEn) : ""}</Text>
          <Text style={[s.price, txt]}>{product.priceLabel}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={text(`عرض المنتج: ${name}`, `View Product: ${name}`)} onPress={() => onView(product)} style={s.action}>
            <Text style={s.actionText}>{text("عرض المنتج", "View Product")}</Text>
          </Pressable>
        </View>;
      })}
    </ScrollView>
    <Pressable accessibilityRole="button" onPress={onViewAll} style={s.all}>
      <Text style={s.actionText}>{text("عرض كل المنتجات", "View All Products")}</Text>
    </Pressable>
  </View>;
}


/** Journey-owned detail view: the existing Products list has no details route yet. */
export function JourneyProductDetails({ product, onClose }: { product?: HomeProduct; onClose: () => void }) {
  const { isRTL, align, dir } = useI18nLayout();
  if (!product) return null;
  const name = isRTL ? product.nameAr : product.nameEn;
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.backdrop}>
      <View accessibilityViewIsModal style={s.detail}>
        <Pressable accessibilityRole="button" accessibilityLabel={isRTL ? "إغلاق تفاصيل المنتج" : "Close product details"} onPress={onClose} style={[s.heart, { alignSelf: isRTL ? "flex-start" : "flex-end" }]}>
          <Ionicons name="close" size={24} color="#585DC4" />
        </Pressable>
        <ScrollView contentContainerStyle={{ gap: 14 }}>
          <Text accessibilityRole="header" style={[s.title, { textAlign: align }]}>{isRTL ? "تفاصيل المنتج" : "Product Details"}</Text>
          <Image source={PHOTOS[product.photoIndex % PHOTOS.length]} style={s.detailImage} resizeMode="contain" />
          <Text style={[s.name, { textAlign: align, writingDirection: dir }]}>{name}</Text>
          <Text style={[s.price, { textAlign: align }]}>{product.priceLabel}</Text>
          {product.supportCategories.map(categoryId => {
            const category = PRODUCT_SUPPORT_CATEGORIES.find(item => item.id === categoryId);
            return <Text key={categoryId} style={[s.caption, { textAlign: align }]}>{isRTL ? category?.nameAr : category?.nameEn}</Text>;
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(36, 42, 85, .35)", alignItems: "center", justifyContent: "center", padding: 20 },
  detail: { width: "100%", maxWidth: 390, maxHeight: "85%", backgroundColor: "#FFFFFF", borderRadius: 23, padding: 20, gap: 12 },
  detailImage: { width: "100%", height: 190, borderRadius: 15, backgroundColor: "#F6F6FD" },
  section: { backgroundColor: "#FFFFFF", borderRadius: 23, padding: 17, gap: 9, shadowColor: "#6D77B2", shadowOpacity: .035, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  heading: { alignItems: "center", gap: 9 },
  title: { flex: 1, fontSize: 20, fontWeight: "700", color: "#33418E" },
  caption: { fontSize: 12, lineHeight: 19, color: "#727CA5" },
  track: { gap: 10, paddingVertical: 5 },
  product: { width: 208, borderRadius: 17, backgroundColor: "#F6F6FD", padding: 12, gap: 7 },
  imageRow: { alignItems: "flex-start", justifyContent: "space-between" },
  image: { width: 112, height: 83, borderRadius: 12, backgroundColor: "#FFFFFF" },
  heart: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EFEEFC", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 14, lineHeight: 21, fontWeight: "600", color: "#35468F", minHeight: 42 },
  category: { fontSize: 11, lineHeight: 17, color: "#727CA5", minHeight: 34 },
  price: { color: "#535BAA", fontSize: 14, fontWeight: "700" },
  action: { marginTop: "auto", padding: 11, minHeight: 44, borderRadius: 12, backgroundColor: "#E9E9FB", alignItems: "center", justifyContent: "center" },
  actionText: { color: "#585DC4", fontSize: 13, textAlign: "center" },
  all: { padding: 12, minHeight: 44, backgroundColor: "#F0F0FF", borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
