import PlanActionPressable from '../ui/PlanActionPressable';
import { directoryListing } from "../../theme/directoryListing";
import { typography } from "../../theme/typography";
import DirectoryCallButton from "./DirectoryCallButton";
import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { DoctorLink, gradient, v } from "./DoctorVisuals";
export default function DirectoryCard({name,image,specialty,organization,location,phone,whatsappUrl,mapUrl,onOpen,specialtyLines}:{name:string;image:React.ReactNode;specialty?:string;organization?:string;location?:string;phone?:string;whatsappUrl?:string;mapUrl?:string;onOpen:()=>void;specialtyLines?:number}) {
const {isRTL,align,dir}=useI18nLayout();const text={textAlign:align,writingDirection:dir};
return <View style={[v.card,directoryListing.card,{flexDirection:isRTL?"row-reverse":"row",gap:8,alignItems:"center"}]}>
                <View style={{flex:1,flexDirection:isRTL?"row-reverse":"row",gap:8,alignItems:"center"}}>
                  {image}
                  <View style={{flex:1,gap:3}}><Text style={[v.title,text,{fontSize:typography.cardTitle,lineHeight:typography.cardTitleLineHeight}]}>{name}</Text>{!!specialty && <Text numberOfLines={specialtyLines} style={[v.secondary,text,{fontSize:typography.secondary,lineHeight:typography.secondaryLineHeight}]}>{specialty}</Text>}
                    {!!organization && <Text style={[v.secondary,text,{fontSize:typography.secondary,lineHeight:typography.secondaryLineHeight}]}>{organization}</Text>}
                    {!!location && <Text numberOfLines={2} style={[v.secondary,text,{fontSize:typography.secondary}]}>{location}</Text>}
                  </View>
                </View>
                <View style={{width:92,gap:6,alignItems:"stretch"}}>
                  <DirectoryCallButton phone={phone}/>
                  {!!whatsappUrl && <DoctorLink label={isRTL?"واتساب":"WhatsApp"} url={whatsappUrl} icon="logo-whatsapp"/>}
                  {!!mapUrl && <DoctorLink label={isRTL?"الموقع":"Location"} url={mapUrl} icon="location-outline"/>}
                  <PlanActionPressable accessibilityRole="button" accessibilityLabel={name} onPress={onOpen} style={[v.primary,gradient,directoryListing.primary,{paddingHorizontal:6}]}><Text style={[v.white,directoryListing.primaryText]}>{isRTL?"عرض الملف":"View Profile"}</Text></PlanActionPressable>
                </View>
              </View>;
}
