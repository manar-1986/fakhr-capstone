import React from "react";
import {Image, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import DirectoryCard from "./DirectoryCard";
import {providerImages} from "./HomeServiceProviderCard";
import {HOME_SERVICE_CATEGORIES, type HomeServiceProvider} from "../../constants/homeServiceProviders";
import {useI18nLayout} from "../../hooks/useI18nLayout";
import {colors} from "../../theme";

/** Compact public summary; the existing Details card retains all provider information. */
export default function HomeServiceListingCard({provider,onOpen}:{provider:HomeServiceProvider;onOpen:()=>void}) {
 const {isRTL}=useI18nLayout();const lang=isRTL?"ar":"en";
 const image=provider.image ? <Image source={providerImages[provider.image]} accessibilityLabel={provider.name[lang]} resizeMode="contain" style={{width:58,height:58,borderRadius:18,backgroundColor:colors.white}}/> : <View style={{width:58,height:58,alignItems:"center",justifyContent:"center"}}><Ionicons name={HOME_SERVICE_CATEGORIES.find(c=>c.id===provider.categories[0])!.icon} size={28} color={colors.primary}/></View>;
 return <DirectoryCard name={provider.name[lang]} image={image} specialty={provider.service[lang]} specialtyLines={2} location={provider.description[lang]} phone={provider.phone} onOpen={onOpen}/>;
}
