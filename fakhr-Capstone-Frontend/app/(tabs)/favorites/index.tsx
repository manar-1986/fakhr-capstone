import React,{useEffect} from "react";
import {View,Pressable,ActivityIndicator,StyleSheet} from "react-native";
import {Text,ScrollView} from "../../../components/ui/AppText";
import {useRouter} from "expo-router";
import {useAuth} from "../../../context/AuthContext";
import {useFavorites} from "../../../hooks/useFavorites";
import {useI18nLayout} from "../../../hooks/useI18nLayout";
import {favoriteHref} from "../../../utils/favoriteNavigation";
import {ACCOUNT_REQUIRED_HREF,setPendingAuthHref} from "../../../utils/authRedirect";
import {colors as c} from "../../../theme/colors";
export default function FavoritesScreen(){
 const {user,loading}=useAuth(),router=useRouter(),{isRTL}=useI18nLayout(),favorites=useFavorites();
 const tr=(ar:string,en:string)=>isRTL?ar:en;
 useEffect(()=>{if(!loading&&!user){setPendingAuthHref("/(tabs)/favorites");router.replace(ACCOUNT_REQUIRED_HREF);}},[loading,user,router]);
 if(!user)return <ActivityIndicator/>;
 const text={textAlign:isRTL?"right" as const:"left" as const};
 return <ScrollView contentContainerStyle={s.content}><Text accessibilityRole="header" style={[s.heading,text]}>{tr("المفضلة","Favorites")}</Text><Text style={[s.note,text]}>{tr("احفظ الأطباء والمراكز والمدارس والحضانات والمنتجات باستخدام القلب في صفحة التفاصيل.","Save doctors, centers, schools, nurseries, and products using the heart on their Details page.")}</Text>
 {favorites.isPending&&<ActivityIndicator/>}
 {favorites.isError&&<Pressable accessibilityRole="button" onPress={()=>void favorites.refetch()}><Text accessibilityRole="alert">{tr("تعذر تحميل المفضلة — إعادة المحاولة","Could not load favorites — retry")}</Text></Pressable>}
 {!favorites.isPending&&!favorites.isError&&!favorites.data?.length&&<Text style={[s.note,text]}>{tr("لم تحفظ أي عناصر بعد.","You have not saved any items yet.")}</Text>}
 {favorites.mutation.isError&&<Text accessibilityRole="alert" style={text}>{tr("لم تتم الإزالة. حاول مرة أخرى.","Removal failed. Please try again.")}</Text>}
 {favorites.data?.map(item=><View key={item.kind+item.targetId} style={s.card}><Text style={[s.name,text]}>{(isRTL?item.nameAr:item.nameEn)||item.nameAr||tr("العنصر لم يعد متاحاً","Item no longer available")}</Text><View style={[s.row,{flexDirection:isRTL?"row-reverse":"row"}]}>{item.available&&<Pressable accessibilityRole="button" onPress={()=>router.push(favoriteHref(item))} style={s.button}><Text>{tr("التفاصيل","Details")}</Text></Pressable>}<Pressable accessibilityRole="button" disabled={favorites.mutation.isPending} onPress={()=>favorites.mutation.mutate({...item,saved:true})} style={s.button}><Text>{tr("إزالة من المفضلة","Remove from favorites")}</Text></Pressable></View></View>)}
 </ScrollView>;
}
const s=StyleSheet.create({content:{padding:20,paddingBottom:130,gap:16,backgroundColor:c.background,flexGrow:1},heading:{fontSize:25,fontWeight:"600",color:c.text},note:{fontSize:16,lineHeight:25,color:c.textMuted},name:{fontSize:18,lineHeight:28,color:c.text},card:{padding:16,gap:12,borderWidth:1,borderColor:c.borderLight,borderRadius:20},row:{gap:12,flexWrap:"wrap"},button:{minHeight:44,padding:12,borderRadius:14,backgroundColor:c.backgroundWash}});
