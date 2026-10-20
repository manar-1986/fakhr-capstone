import { phoneIconColor } from "../ui/ContactIcon";
import { controls as sharedControls } from "../../theme/controls";
import { typography } from "../../theme/typography";
import React, {useState} from "react";
import {View, Pressable, Linking, Platform, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Text} from "../ui/AppText";
import {useI18nLayout} from "../../hooks/useI18nLayout";
import {institutionPhoneUrl} from "../../utils/institutionDirectory";
import {colors} from "../../theme";
export default function EducationPhoneCard({contacts, extension}: {contacts: {phone: string; label?: string}[]; extension?: string}) {
 const {isRTL,align,dir}=useI18nLayout();const [error,setError]=useState(false);
 const rows=contacts.map(c=>({...c,url:institutionPhoneUrl(c.phone)})).filter(c=>c.url);
 if(!rows.length)return null;
 return <View testID="education-phone-card" style={s.card}>
  {rows.map((c,i)=><Pressable key={c.phone+":"+i} accessibilityRole="link" accessibilityLabel={(isRTL?"اتصال ":"Call ")+c.phone+(c.label?" "+c.label:"")}
   {...(Platform.OS==="web"?{href:c.url}:{})}
   onPress={Platform.OS==="web"?undefined:()=>{void Linking.openURL(c.url!).catch(()=>setError(true));}}
   style={[s.row,i>0&&s.divider,{flexDirection:isRTL?"row-reverse":"row"}]}>
   <Ionicons name="call-outline" size={18} color={phoneIconColor}/>
   <View style={{flex:1,minWidth:0}}><Text style={[s.number,{textAlign:align}]}>{c.phone}</Text>
   {!!c.label&&!['رقم إضافي','Additional contact'].includes(c.label)&&<Text style={[s.label,{textAlign:align,writingDirection:dir}]}>{c.label}</Text>}
   {i===0&&!!extension&&<Text style={[s.label,{textAlign:align}]}>{isRTL?"الرقم الداخلي: ":"Extension: "}{extension}</Text>}
   </View>
  </Pressable>)}
  {error&&<Text accessibilityRole="alert" style={s.label}>{isRTL?"تعذر فتح تطبيق الهاتف على هذا الجهاز":"Could not open a phone app on this device"}</Text>}
 </View>;
}
const s=StyleSheet.create({card:{overflow:"hidden", ...sharedControls.card },row:{minHeight:48,paddingHorizontal:12,paddingVertical:10,alignItems:"center",gap:10},divider:{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:colors.border},number:{color:"#0B093B",fontSize:typography.cardTitle,lineHeight:typography.cardTitleLineHeight,writingDirection:"ltr",fontWeight:typography.weightMedium},label:{color:colors.textSecondary,fontSize:typography.secondary,lineHeight:typography.secondaryLineHeight}});
