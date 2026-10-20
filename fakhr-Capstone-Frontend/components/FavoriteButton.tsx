import { MINIMUM_RELEASE, unavailableText } from '../utils/minimumRelease';
import React,{useState} from "react";
import {Modal,View,Pressable,StyleProp,ViewStyle} from "react-native";
import {Text} from "./ui/AppText";
import {Ionicons} from "@expo/vector-icons";
import {useFavorites} from "../hooks/useFavorites";
import {useRequireAuth} from "../hooks/useRequireAuth";
import {useI18nLayout} from "../hooks/useI18nLayout";
import {FavoriteKey} from "../api/favorites.api";
import {favoriteHref} from "../utils/favoriteNavigation";
import {colors} from "../theme/colors";
export default function FavoriteButton({item,style,testID}:{item:FavoriteKey;style?:StyleProp<ViewStyle>;testID?:string}){
 const {isRTL}=useI18nLayout(),{requireAuth}=useRequireAuth(),favorites=useFavorites();
 const [error,setError]=useState(false);
 const saved=!!favorites.data?.some(i=>i.kind===item.kind&&i.targetId===item.targetId);
 const press=async()=>{
  if(!requireAuth(favoriteHref(item)))return;
  if(favorites.isError){await favorites.refetch();return;}
  try{await favorites.mutation.mutateAsync({...item,saved});}catch{setError(true);}
 };
 return <><Pressable testID={testID||"favorite-toggle"} accessibilityRole="button" accessibilityLabel={favorites.isError?(isRTL?"إعادة تحميل المفضلة":"Retry favorites"):(saved?(isRTL?"إزالة من المفضلة":"Remove from favorites"):(isRTL?"حفظ في المفضلة":"Save to favorites"))} accessibilityState={{selected:saved,disabled:MINIMUM_RELEASE||favorites.mutation.isPending|| (!!favorites.user&&favorites.isPending)}} accessibilityHint={MINIMUM_RELEASE?unavailableText(isRTL):undefined} disabled={MINIMUM_RELEASE||favorites.mutation.isPending|| (!!favorites.user&&favorites.isPending)} onPress={()=>void press()} style={[{minWidth:44,minHeight:44,alignItems:"center",justifyContent:"center",borderRadius:14,backgroundColor:colors.backgroundWash},style]}><Ionicons name={saved?"heart":"heart-outline"} color={colors.primary} size={23}/></Pressable>
 <Modal visible={error} transparent onRequestClose={()=>setError(false)}><View style={{flex:1,justifyContent:"center",padding:24,backgroundColor:"rgba(0,0,0,.3)"}}><View style={{padding:24,borderRadius:20,backgroundColor:colors.background,gap:16}}><Text accessibilityRole="alert" style={{textAlign:isRTL?"right":"left",color:colors.text}}>{isRTL?"تعذر تحديث المفضلة. حاول مرة أخرى.":"Could not update favorites. Please try again."}</Text><Pressable accessibilityRole="button" onPress={()=>setError(false)} style={{padding:12}}><Text>{isRTL?"إغلاق":"Close"}</Text></Pressable></View></View></Modal></>;
}
