import PromotionBanner from "./PromotionBanner";
import { promotionArtwork } from "../../utils/promotionArtwork";
import { homeReference as homeTheme } from "../../theme/homeReference";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";


import { buildHomePromotions } from "../../utils/homePromotions";
import { useI18nLayout } from "../../hooks/useI18nLayout";

export default function HomeAdCarousel() {
  const { isRTL } = useI18nLayout();
  const { fontScale } = useWindowDimensions();
  const router = useRouter();
  const focused = useIsFocused();

  const [failedImages,setFailedImages]=useState<Set<string>>(()=>new Set());
  const ads = useMemo(() => buildHomePromotions().filter(ad=>!failedImages.has(ad.id)), [failedImages]);

  const [bannerWidth, setBannerWidth] = useState(350);
  const bannerHeight = Math.max(bannerWidth / 2.45, 214 * fontScale);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  const ignorePressUntil = useRef(0);
  const change = useCallback((step: number) => setIndex(i => ads.length ? (i + step + ads.length) % ads.length : 0), [ads.length]);
  const displayIndex = ads.length ? index % ads.length : 0;

  useEffect(() => {
    const app = AppState.addEventListener("change", state => setActive(state === "active"));
    return () => app.remove();
  }, []);

  const autoRotate = focused && active && !paused && !dragging && ads.length > 1;
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => change(1), 5000);
    return () => clearInterval(timer);
  }, [autoRotate, change, index]); // A manual change receives a fresh five seconds.

  const swipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderGrant: () => { ignorePressUntil.current = Date.now() + 400; setDragging(true); setPaused(true); },
    onPanResponderRelease: (_, gesture) => {
      // Browsers can emit a click after a drag; a swipe must never open an ad.
      setPaused(true); ignorePressUntil.current = Date.now() + 400;
      if (Math.abs(gesture.dx) >= 40) change((gesture.dx < 0 ? 1 : -1) * (isRTL ? -1 : 1));
      setDragging(false);
    },
    onPanResponderTerminate: () => { ignorePressUntil.current = Date.now() + 400; setDragging(false); },
    onPanResponderTerminationRequest: () => true,
  }), [change, isRTL]);

  const ad = ads[displayIndex];
  if (!ad) return null;
  const lang = isRTL ? "ar" : "en";
  const title = ad.name[lang];
  const cta = isRTL ? 'عرض التفاصيل' : 'View Details';
  return <View testID="home-ad-carousel" onLayout={e=>setBannerWidth(e.nativeEvent.layout.width)} style={[styles.banner,{backgroundColor:"#FBF0E9",minHeight:bannerHeight}]}>
    <View {...swipe.panHandlers} onTouchStart={()=>setPaused(true)} testID="ad-swipe-surface" style={styles.swipe}>
      <Pressable testID="home-carousel-record" accessibilityRole="button" accessibilityLabel={`${title}. ${ad.note[lang]}. ${cta}`} onPress={()=>{if(Date.now()>=ignorePressUntil.current){setPaused(true);router.push(ad.href);}}} style={({pressed})=>[styles.ad,{height:bannerHeight},pressed&&{opacity:.9}]}>
        <PromotionBanner width={bannerWidth} height={bannerHeight} rtl={isRTL} title={title} specialty={ad.note[lang]} label={ad.description[lang]} cta={cta} kind={ad.category} image={promotionArtwork(ad)} onImageError={()=>setFailedImages(current=>new Set([...current,ad.id]))}/>
      </Pressable>
    </View>
    <View style={styles.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel={isRTL?'الإعلان السابق':'Previous advertisement'} onPress={()=>{setPaused(true);change(-1);}} style={styles.control}><Ionicons name={isRTL?'chevron-forward':'chevron-back'} size={13} color={homeTheme.blue}/></Pressable>
      <View style={styles.dots} accessibilityLabel={`${displayIndex+1} / ${ads.length}`}>
        {ads.map((record,i)=><Pressable key={record.id} accessibilityRole="button" accessibilityLabel={`${isRTL?'الإعلان':'Advertisement'} ${i+1}`} accessibilityState={{selected:i===displayIndex}} onPress={()=>{setPaused(true);setIndex(i);}} style={styles.dotTarget}><View style={[styles.dot,i===displayIndex&&styles.selectedDot]}/></Pressable>)}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={paused?(isRTL?'تشغيل الإعلانات':'Play advertisements'):(isRTL?'إيقاف الإعلانات مؤقتاً':'Pause advertisements')} onPress={()=>setPaused(v=>!v)} style={styles.control}><Ionicons name={paused?'play':'pause'} size={12} color={homeTheme.blue}/></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={isRTL?'الإعلان التالي':'Next advertisement'} onPress={()=>{setPaused(true);change(1);}} style={styles.control}><Ionicons name={isRTL?'chevron-back':'chevron-forward'} size={13} color={homeTheme.blue}/></Pressable>
    </View>
  </View>;
}

const styles=StyleSheet.create({
 banner:{width:'100%',borderRadius:16,marginBottom:18,overflow:'hidden',direction:'ltr'},
 swipe:{flex:1},ad:{overflow:'hidden',justifyContent:'center'},
 controls:{height:44,flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#F5F7FF'},
 control:{width:44,height:44,alignItems:'center',justifyContent:'center'},
 dots:{flexDirection:'row',alignItems:'center'},dotTarget:{width:24,height:44,justifyContent:'center',alignItems:'center'},
 dot:{width:7,height:7,borderRadius:4,backgroundColor:'#BDB8BE'},selectedDot:{backgroundColor:'#607DCB'},
});






