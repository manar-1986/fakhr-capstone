import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getChildren } from "../../../api/children.api";
import { useAuth } from "../../../context/AuthContext";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { ageFromDate, asIdList, FOCUS_AREAS, parseStoredDate } from "../../../constants/childProfileOptions";
import { HOME_PRODUCTS, type HomeProduct } from "../../../constants/homeProducts";
import { addJourneyRecord, readJourney, removeJourneyRecord, upcomingAppointments, type JourneyKind, type JourneyRecord } from "../../../utils/journeyStore";
import { JourneyProducts, JourneyProductDetails } from "../../../components/journey/JourneyProducts";
import { journeyProductSuggestions } from "../../../utils/journeyProducts";
import { setPendingAuthHref } from "../../../utils/authRedirect";

type Icon = React.ComponentProps<typeof Ionicons>["name"];
const routes = { centers: "/(tabs)/directory/centers", products: "/(tabs)/products", videos: "/(tabs)/activity-library", articles: "/(tabs)/library" } as const;

  function Button({ title, onPress, icon = "chevron-forward-outline", disabled = false }: { title: string; onPress: () => void; icon?: Icon; disabled?: boolean }) {
    const { tabRow, align } = useI18nLayout(); const row = { flexDirection: tabRow }; const txt = { textAlign: align };
    return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.button, row, disabled && { opacity: .45 }]}><Ionicons name={icon} size={18} color="#6366CB" /><Text style={[s.buttonText, txt]}>{title}</Text></Pressable>;
  }
  function Section({ title, icon, children: content }: { title: string; icon: Icon; children: React.ReactNode }) {
    const { tabRow, align } = useI18nLayout(); const row = { flexDirection: tabRow }; const txt = { textAlign: align };
    return <View style={s.card}><View style={[s.sectionHeading, row]}><Ionicons name={icon} size={25} color="#6969D7" /><Text accessibilityRole="header" style={[s.sectionTitle, txt]}>{title}</Text></View>{content}</View>;
  }
  const Empty = ({ children: content }: { children: React.ReactNode }) => { const { align } = useI18nLayout(); return <Text style={[s.empty, { textAlign: align }]}>{content}</Text>; };

export default function JourneyScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { user, loading } = useAuth();
  const { isRTL, align, tabRow, locale } = useI18nLayout();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const text = (ar: string, en: string) => isRTL ? ar : en;
  const [selectedId, setSelectedId] = useState<string>();
  const [switching, setSwitching] = useState(false);
  const [savedKind, setSavedKind] = useState<JourneyKind>();
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [viewedProduct, setViewedProduct] = useState<HomeProduct>();




  const [busy, setBusy] = useState(false);
  const mutationBusy = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const activityY = useRef(0);
  useEffect(() => { setSelectedId(undefined); setSavedKind(undefined); setViewedProduct(undefined); }, [user?.id]);
  useEffect(() => { setViewedProduct(HOME_PRODUCTS.find(product => product.id === productId)); }, [productId]);
  const children = useQuery({ queryKey: ["journey-children", user?.id], queryFn: getChildren, enabled: !!user });
  const journey = useQuery({ queryKey: ["journey", user?.id], queryFn: () => readJourney(user!.id), enabled: !!user });
  const { refetch: refreshChildren } = children;
  const { refetch: refreshJourney } = journey;
  useFocusEffect(useCallback(() => { if (user?.id) { void refreshChildren(); void refreshJourney(); } }, [user?.id, refreshChildren, refreshJourney]));
  const child = children.data?.find(c => c.id === selectedId) ?? children.data?.[0];
  const records = journey.data ?? [];
  const history = records.filter(r => ["activity", "appointment", "note", "report"].includes(r.type));
  const saved = records.filter(r => r.type === "saved");

  const appointments = upcomingAppointments(records);
  const dob = parseStoredDate(child?.dateOfBirth);
  const age = child?.age ?? (dob ? ageFromDate(dob) : undefined);
  const focus = asIdList(child?.areasOfFocus);
  const diagnosisKeys: Record<string, string> = { autism: "copy.tagAutism", asd: "copy.tagAutism", adhd: "copy.tagAdhd", sensory: "copy.tagSensory", behavior: "copy.tagBehavior", speech: "copy.tagCommunication", developmental: "copy.tagDelay", delay: "copy.tagDelay" };
  const tags = [...new Set([...asIdList(child?.diagnosis ?? child?.diagnoses).map(d => diagnosisKeys[d.toLowerCase()] ? t(diagnosisKeys[d.toLowerCase()]) : d), ...focus.map(id => { const option = FOCUS_AREAS.find(f => f.id === id); return option ? t(option.labelKey) : id; })])];
  const productSuggestions = journeyProductSuggestions(child);
  const go = (href: string) => router.push(href as Href);
  async function mutate(work: () => Promise<unknown>) {
    if (mutationBusy.current || !user) return;
    mutationBusy.current = true;
    setBusy(true);
    try { await work(); await journey.refetch(); } catch { Alert.alert(text("تعذر الحفظ", "Could not save"), text("حاول مرة أخرى. لم يتم حفظ التغيير.", "Please try again. Your change was not saved.")); } finally { mutationBusy.current = false; setBusy(false); }
  }
  async function toggleSave(kind: JourneyKind, titleAr: string, titleEn: string, href: string) {
    const existing = saved.find(r => r.kind === kind && (kind === "product" || r.href === href) && r.titleEn === titleEn);
    await mutate(async () => {
      if (existing) await removeJourneyRecord(user!.id, existing.id);
      else {
        await addJourneyRecord(user!.id, { type: "saved", kind, titleAr, titleEn, href });
        await addJourneyRecord(user!.id, { type: "activity", action: "saved", kind, titleAr, titleEn, href });
      }
    });
  }
  const openLink = async (url: string) => { try { await Linking.openURL(url); } catch { Alert.alert(text("تعذر فتح الرابط", "Could not open link")); } };
  const label = (r: JourneyRecord) => text(r.titleAr, r.titleEn);
  const row = { flexDirection: tabRow };
  const txt = { textAlign: align };
  if (loading) return <View style={s.loading}><ActivityIndicator color="#6667D4" /></View>;
  if (!user) return <SafeAreaView style={s.safe}><View style={s.card}><Text style={[s.title, txt]}>{text("رحلتي", "My Journey")}</Text><Empty>{text("سجّل الدخول لتنظيم رحلتك مع طفلك.", "Sign in to organize your journey with your child.")}</Empty><Button title={text("تسجيل الدخول", "Sign in")} icon="log-in-outline" onPress={() => { setPendingAuthHref("/(tabs)/plan" as Href); go("/(auth)/login"); }} /></View></SafeAreaView>;
  return <SafeAreaView style={s.safe} edges={["top"]}>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content, { paddingBottom: 86 + insets.bottom }]} showsVerticalScrollIndicator={false}>
      <View style={[s.header, row]}>
        <View style={{ flex: 1 }}><Text accessibilityRole="header" style={[s.title, txt]}>{text("رحلتي", "My Journey")}</Text><Text style={[s.subtitle, txt]}>{text("كل خطوة تقربنا من مستقبل أفضل لطفلك", "Every step brings your child closer to a better future")}</Text></View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.illustration}><View style={s.path} /><View style={s.pathEnd} /><Ionicons style={{ position: "absolute", top: 5, left: 14 }} name="location" size={26} color="#8C9ADC" /><Ionicons style={{ position: "absolute", bottom: 6, right: 10 }} name="location" size={30} color="#8C9ADC" /><Ionicons style={{ position: "absolute", top: 0, right: 8 }} name="heart" size={26} color="#D5BFE0" /></View>
      </View>
      <View style={s.card}>
        {children.isPending ? <ActivityIndicator color="#6667D4" /> : children.isError ? <><Empty>{text("تعذر تحميل بيانات الأطفال.", "Could not load child profiles.")}</Empty><Button title={text("إعادة المحاولة", "Try again")} onPress={() => { void children.refetch(); }} /></> : child ? <>
          <View style={[s.profile, row]}><View style={s.avatar}>{child.photoUrl ? <Image accessibilityLabel={text("صورة الطفل", "Child photo")} source={{ uri: child.photoUrl }} style={s.avatar} /> : <Ionicons name="person-outline" size={42} color="#969BD1" />}</View><View style={{ flex: 1 }}><Text style={[s.childName, txt]}>{text(child.nameAr || child.name, child.nameEn || child.name)}</Text><Text style={[s.body, txt]}>{age === undefined ? text("العمر غير مضاف", "Age not provided") : text(`${age} سنوات`, `${age} years old`)}</Text>{!child.photoUrl && <Text style={[s.small, txt]}>{text("لم تُضف صورة للطفل بعد", "No child photo added yet")}</Text>}</View></View>
          {tags.length > 0 && <View style={[s.tags, row]}>{tags.map(tag => <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>)}</View>}
          {(children.data?.length ?? 0) > 1 && <Button title={text("تبديل الطفل", "Switch child")} icon="people-outline" onPress={() => setSwitching(!switching)} />}
          {switching && children.data?.map(c => <Button key={c.id} icon={c.id === child.id ? "checkmark-circle" : "person-outline"} title={text(c.nameAr || c.name, c.nameEn || c.name)} onPress={() => { setSelectedId(c.id); setSwitching(false); }} />)}
        </> : <><Empty>{text("أضف ملف طفلك لتبدأ رحلتكما معًا.", "Add your child's profile to begin your journey together.")}</Empty><Button title={text("إضافة طفل", "Add child")} icon="person-add-outline" onPress={() => go("/(tabs)/profile/add-child")} /></>}
      </View>
      <Section title={text("رحلتنا معًا", "Our Journey Together")} icon="map-outline">
        <Text style={[s.small, txt]}>{text("خطوات بسيطة لرحلة أسهل — استكشف بالترتيب الذي يناسبك", "Small steps for an easier journey — explore at your own pace")}</Text>
        <View style={[s.steps, row]}><View style={s.connector} />{([
          ["compass-outline", text("فهم الاحتياج", "Understand needs"), () => go("/(tabs)/profile/manage-children")],
          ["search-outline", text("البحث عن خدمات", "Explore services"), () => go(routes.centers)],
          ["heart-outline", text("الاختيار والحجز", "Choose & book"), () => go(routes.centers)],
          ["calendar-outline", text("المتابعة والتقييم", "Follow up & reflect"), () => { scroll.current?.scrollTo({ y: activityY.current, animated: true }); }],
          ["star-outline", text("مستقبل أكثر إشراقًا", "A brighter future"), () => go(routes.videos)],
        ] as [Icon, string, () => void][]).map(([icon, title, action]) => <Pressable accessibilityRole="button" key={title} onPress={action} style={s.step}><View style={s.stepCircle}><Ionicons name={icon} size={23} color="#6B6AD6" /></View><Text style={s.stepLabel}>{title}</Text></Pressable>)}</View>
      </Section>
      <View onLayout={event => { activityY.current = event.nativeEvent.layout.y; }}><Section title={text("أحدث نشاط", "Recent Activity")} icon="time-outline">
        <Text style={[s.small, txt]}>{text("نشاط حسابك على هذا الجهاز", "Your account's activity on this device")}</Text>
        {journey.isPending ? <ActivityIndicator /> : journey.isError ? <Button title={text("تعذر تحميل النشاط — إعادة المحاولة", "Could not load activity — retry")} onPress={() => { void journey.refetch(); }} /> : !history.length ? <Empty>{text("تبدأ قصتك من هنا. سيظهر نشاطك الجديد عند مشاهدة الفيديوهات أو حفظ العناصر.", "Your story starts here. New video views and saved items will appear here.")}</Empty> : (expandedHistory ? history : history.slice(0, 5)).map(r => <View key={r.id} style={[s.timeline, row]}><View style={s.timelineIcon}><Ionicons name={r.type === "appointment" ? "calendar-outline" : r.type === "report" ? "document-text-outline" : r.type === "note" ? "create-outline" : r.action === "saved" ? "heart" : "play-circle-outline"} size={22} color="#7979D7" /></View><View style={{ flex: 1 }}><Text style={[s.itemTitle, txt]}>{r.type === "appointment" ? text("أضفت موعد مركز محليًا", "Added a local center appointment") : r.type === "note" ? text("أضفت ملاحظة", "Added a note") : r.type === "report" ? text("أضفت رابط مستند", "Added a document link") : r.action === "saved" ? text("حفظت عنصرًا", "Saved an item") : text("فتحت فيديو", "Opened a video")}</Text><Text style={[s.body, txt]}>{label(r)}</Text><Text style={[s.small, txt]}>{new Date(r.createdAt).toLocaleString(locale === "ar" ? "ar-KW" : "en-GB", { dateStyle: "medium", timeStyle: "short" })}</Text></View></View>)}
        {history.length > 5 && <Button title={expandedHistory ? text("عرض أقل", "Show less") : text("عرض كل الأنشطة", "View all activity")} onPress={() => setExpandedHistory(!expandedHistory)} />}
      </Section>
      </View>
      <Section title={text("مواعيدي القادمة", "Upcoming Appointments")} icon="calendar-outline">
        <Text style={[s.small, txt]}>{text("مواعيد المراكز المحفوظة على هذا الجهاز فقط. يرجى تأكيد الحجز مع المركز.", "Center appointments saved on this device only. Please confirm your booking with the center.")}</Text>
        {!appointments.length ? <Empty>{text("لا توجد مواعيد مراكز قادمة محفوظة.", "No upcoming center appointments saved.")}</Empty> : appointments.map(r => <View key={r.id} style={s.inset}><Text style={[s.itemTitle, txt]}>{label(r)}</Text><Text style={[s.body, txt]}>{text(r.centerAr || "", r.centerEn || "")}</Text><Text style={[s.body, txt]}>{r.dateKey} · {r.time}</Text><Text style={[s.small, txt]}>{text(r.locationAr || "الموقع غير متاح", r.locationEn || "Location unavailable")}</Text></View>)}
        <Button title={text("استكشاف المراكز والخدمات", "Explore centers & services")} icon="business-outline" onPress={() => go(routes.centers)} />
      </Section>
      <Section title={text("محفوظاتي", "Saved Items")} icon="heart-outline">
        <View style={[s.savedGrid, row]}>{([
          ["center", "business-outline", text("المراكز", "Centers"), "#EFECFF"], ["product", "cart-outline", text("المنتجات", "Products"), "#FFF0F5"], ["video", "play-circle-outline", text("الفيديوهات", "Videos"), "#E9F7F5"], ["article", "document-text-outline", text("المقالات", "Articles"), "#EDF1FF"],
        ] as [JourneyKind, Icon, string, string][]).map(([kind, icon, title, backgroundColor]) => <Pressable accessibilityRole="button" accessibilityState={{ selected: savedKind === kind }} key={kind} onPress={() => setSavedKind(savedKind === kind ? undefined : kind)} style={[s.savedTile, { backgroundColor }]}><Ionicons name={icon} size={28} color="#7977CA" /><Text style={s.savedLabel}>{title}</Text><Text style={s.savedLabel}>{journey.isSuccess ? `(${saved.filter(r => r.kind === kind).length})` : "—"}</Text></Pressable>)}</View>
        {savedKind && <View style={s.inset}>{!saved.some(r => r.kind === savedKind) && <Empty>{text("لم تحفظ عناصر في هذه الفئة بعد.", "No saved items in this category yet.")}</Empty>}{saved.filter(r => r.kind === savedKind).map(r => <View key={r.id}><Button title={label(r)} onPress={() => { const product = r.kind === "product" ? HOME_PRODUCTS.find(item => item.nameEn === r.titleEn) : undefined; if (product) setViewedProduct(product); else if (r.href?.startsWith("https://")) void openLink(r.href); else if (r.href) go(r.href); }} /><Button title={text("إزالة من المحفوظات", "Remove saved item")} icon="heart-dislike-outline" onPress={() => { void mutate(() => removeJourneyRecord(user.id, r.id)); }} /></View>)}</View>}
        {savedKind && <Button title={text("استكشاف المزيد", "Explore more")} onPress={() => go(savedKind === "center" ? routes.centers : savedKind === "product" ? routes.products : savedKind === "video" ? routes.videos : routes.articles)} />}
      </Section>
      <Section title={text("اقتراحات لك", "Suggestions for You")} icon="bulb-outline">
        <Text style={[s.small, txt]}>{text("أفكار عامة لاستكشاف فخر", "General ideas to explore Fakhr")}</Text>
        <Button title={text("استكشاف المراكز", "Explore centers")} icon="location-outline" onPress={() => go(routes.centers)} />
      </Section>
      <JourneyProducts
        products={productSuggestions.products}
        personalized={productSuggestions.personalized}
        busy={busy || !journey.isSuccess}
        isSaved={product => saved.some(record => record.kind === "product" && record.titleEn === product.nameEn)}
        onView={setViewedProduct}
        onSave={product => { void toggleSave("product", product.nameAr, product.nameEn, `/(tabs)/plan?productId=${product.id}`); }}
        onViewAll={() => go(routes.products)}
      />
      <View style={[s.footer, row]}><Ionicons name="heart" size={32} color="#8A8DD2" /><Text style={[s.footerText, txt]}>{text("كل خطوة صغيرة .. تصنع فرقًا كبيرًا", "Every small step makes a big difference")}</Text></View>
      <Text style={[s.storageNotice, txt]}>{text("ملفات الأطفال مرتبطة بحسابك. النشاط والمحفوظات والمواعيد هنا محلية لهذا الجهاز؛ لا تتم مزامنتها بين الأجهزة.", "Child profiles come from your account. Activity, saves, and appointments here are local to this device and do not sync across devices.")}</Text>
    </ScrollView>
    <JourneyProductDetails product={viewedProduct} onClose={() => setViewedProduct(undefined)} />
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EEF0FD" }, loading: { flex: 1, alignItems: "center", justifyContent: "center" }, content: { paddingHorizontal: 16, gap: 14 },
  header: { alignItems: "center", paddingTop: 16, paddingBottom: 3, gap: 8 }, title: { fontSize: 34, fontWeight: "800", color: "#293A94" }, subtitle: { fontSize: 15, color: "#727FBB", lineHeight: 24, marginTop: 5 },
  illustration: { width: 90, height: 102 }, path: { position: "absolute", left: 21, top: 19, width: 49, height: 43, borderColor: "#CDD5F4", borderWidth: 7, borderLeftWidth: 0, borderRadius: 28, transform: [{ rotate: "-20deg" }] },
  pathEnd: { position: "absolute", left: 9, top: 51, width: 49, height: 43, borderColor: "#CDD5F4", borderWidth: 7, borderRightWidth: 0, borderRadius: 28, transform: [{ rotate: "-20deg" }] },
  card: { backgroundColor: "#FFFFFF", borderRadius: 23, padding: 17, gap: 9, shadowColor: "#6D77B2", shadowOpacity: .035, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  profile: { gap: 14, alignItems: "center" }, avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#F0F1FC", alignItems: "center", justifyContent: "center" }, childName: { fontSize: 23, fontWeight: "700", color: "#334399" },
  tags: { flexWrap: "wrap", gap: 6, marginTop: 5 }, tag: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "#EEEEFF" }, tagText: { fontSize: 12, color: "#4A50A1" },
  sectionHeading: { alignItems: "center", gap: 9 }, sectionTitle: { flex: 1, fontSize: 20, fontWeight: "700", color: "#33418E" }, body: { fontSize: 14, lineHeight: 22, color: "#63709F" }, small: { fontSize: 12, lineHeight: 19, color: "#727CA5" }, empty: { color: "#727C9E", fontSize: 13, lineHeight: 22, paddingVertical: 12 },
  button: { paddingHorizontal: 12, paddingVertical: 11, backgroundColor: "#F0F0FF", borderRadius: 13, alignItems: "center", justifyContent: "center", gap: 7, minHeight: 44, marginTop: 4 }, buttonText: { color: "#585DC4", fontSize: 13, flexShrink: 1 },
  steps: { gap: 3, marginTop: 8, alignItems: "flex-start" }, connector: { position: "absolute", left: 25, right: 25, top: 21, height: 2, backgroundColor: "#DDDDF6" }, step: { flex: 1, alignItems: "center", gap: 6 }, stepCircle: { width: 43, height: 43, borderRadius: 22, backgroundColor: "#EEEDFF", borderWidth: 4, borderColor: "#F7F7FF", alignItems: "center", justifyContent: "center" }, stepLabel: { textAlign: "center", fontSize: 10, lineHeight: 17, color: "#5662A4" },
  timeline: { alignItems: "flex-start", gap: 12, paddingTop: 14, paddingBottom: 5 }, timelineIcon: { backgroundColor: "#F0F0FC", width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" }, itemTitle: { fontSize: 14, fontWeight: "600", lineHeight: 22, color: "#35468F" },
  inset: { padding: 12, backgroundColor: "#F6F6FD", borderRadius: 15, gap: 5 }, savedGrid: { gap: 7, marginTop: 5 }, savedTile: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center", gap: 5 }, savedLabel: { fontSize: 10, color: "#505B9E", textAlign: "center" },
  footer: { padding: 22, backgroundColor: "#E0E4FA", borderRadius: 22, alignItems: "center", gap: 15 }, footerText: { flex: 1, fontSize: 18, fontWeight: "600", color: "#41519B", lineHeight: 28 }, storageNotice: { fontSize: 11, lineHeight: 18, color: "#828AAA", paddingHorizontal: 8 },
});
