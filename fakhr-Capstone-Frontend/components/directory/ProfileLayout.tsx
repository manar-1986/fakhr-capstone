import { typography } from "../../theme/typography";
import { colors as fakhrColors } from "../../theme/colors";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../ui/AppText";
import { colors } from "../../theme";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { gradient } from "./DoctorVisuals";
export function ProfileHeader({title}:{title:string}) {const s=profileStyles;return (    <View style={[s.header,gradient]}>
      <View pointerEvents="none" style={s.shape}/><View pointerEvents="none" style={[s.shape,{right:-40,left:undefined,top:40,width:140,height:140}]}/>
      <Image source={require("../../assets/images/fakhr-wordmark-blue.png")} resizeMode="contain" accessibilityLabel="Fakhr" style={{width:70,height:54,alignSelf:"center",borderRadius:12,backgroundColor:colors.white}}/>
      <Text accessibilityRole="header" style={s.heading}>{title}</Text>
    </View>
);}
export function ProfileTabs({items,tab,setTab}:{items:{id:string;ar:string;en:string;icon:string}[];tab:string;setTab:(value:string)=>void}) {const s=profileStyles;const {isRTL}=useI18nLayout();const row={flexDirection:isRTL?"row-reverse" as const:"row" as const};return (      <View style={[row,s.tabs]}>{items.map(item=><Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={isRTL?item.ar:item.en} accessibilityState={{selected:tab===item.id}} onPress={()=>setTab(item.id)} style={[s.tab,row,tab===item.id && {backgroundColor:colors.primary}]}><Ionicons name={item.icon as any} size={17} color={tab===item.id?colors.white:colors.primary}/><Text style={{fontSize:typography.button,fontWeight:typography.weightMedium,color:tab===item.id?"#0B093B":colors.textSecondary}}>{isRTL?item.ar:item.en}</Text></Pressable>)}</View>);}
export const profileStyles=StyleSheet.create({
  screen:{flex:1,width:"100%",maxWidth:520,alignSelf:"center",backgroundColor:fakhrColors.background},
  header:{backgroundColor:colors.primary,paddingTop:10,paddingBottom:58,overflow:"hidden",borderBottomLeftRadius:24,borderBottomRightRadius:24},
  shape:{position:"absolute",width:200,height:200,borderRadius:100,backgroundColor:"rgba(255,255,255,0.08)",left:-90,top:-100},
  heading:{fontSize:typography.title,lineHeight:typography.titleLineHeight,color:colors.white,fontWeight:typography.weightSemibold,textAlign:"center",marginTop:6},
  content:{paddingHorizontal:12,gap:12},
  profile:{marginTop:-38,alignItems:"center",padding:14,minHeight:140},
  icon:{width:34,height:34,borderRadius:17,backgroundColor:colors.borderLight,alignItems:"center",justifyContent:"center"},
  tabs:{backgroundColor:colors.borderLight,borderRadius:16,padding:3,borderWidth:1,borderColor:colors.border},
  tab:{flex:1,minHeight:44,borderRadius:13,alignItems:"center",justifyContent:"center",gap:5},
});
