import React from "react";
import {Image, View} from "react-native";
import type {Institution} from "../../types/institution";
import {Text} from "../ui/AppText";
import {useI18nLayout} from "../../hooks/useI18nLayout";
import {v} from "./DoctorVisuals";
const photos={"conductive-rehabilitation-building":{source:require("../../assets/images/schools/conductive-rehabilitation-building.jpg"),ar:"مبنى مؤسسة التأهيل الإرشادي ومدخلها",en:"Conductive Rehabilitation Establishment building and entrance",aspectRatio:537/608},"al-bayan-building":{source:require("../../assets/images/schools/al-bayan-international-building.jpg"),ar:"مبنى مدرسة البيان الدولية ومدخلها",en:"Al-Bayan International School building and entrance",aspectRatio:2}};
export default function InstitutionPhotoGallery({item}:{item:Institution}){
 const {isRTL,align,dir}=useI18nLayout();
 if(!item.galleryPhotos?.length)return null;
 return <View testID="institution-photo-gallery" style={v.card}>
  <Text accessibilityRole="header" style={[v.title,{textAlign:align,writingDirection:dir}]}>{isRTL?"صور المدرسة":"School Photos"}</Text>
  {item.galleryPhotos.map(key=>{const photo=photos[key];return <View key={key} style={{gap:8}}><View style={{width:"100%",aspectRatio:photo.aspectRatio}}><Image source={photo.source} accessibilityLabel={isRTL?photo.ar:photo.en} resizeMode="contain" style={{width:"100%",height:"100%",position:"absolute"}}/></View><Text style={[v.secondary,{textAlign:align,writingDirection:dir}]}>{isRTL?photo.ar:photo.en}</Text></View>;})}
 </View>;
}
