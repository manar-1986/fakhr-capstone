import React from 'react';
import {Image, ImageSourcePropType, StyleSheet, View} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Rect,Path,ClipPath,Image as SvgImage,G} from 'react-native-svg';
import {Ionicons} from '@expo/vector-icons';
import {Text} from '../ui/AppText';
import {typography} from '../../theme';

type Props={width:number;height:number;rtl:boolean;title:string;specialty:string;label:string;cta:string;image:ImageSourcePropType;kind:string;onImageError:()=>void};
/** Approved Hadeel composition reused for every curated campaign. Original assets remain intact. */
export default function PromotionBanner({width,height,rtl,title,specialty,label,cta,image,kind,onImageError}:Props){
 const compact=kind!=='doctor';
 const text={textAlign:rtl?'right' as const:'left' as const,writingDirection:rtl?'rtl' as const:'ltr' as const};
 return <View style={StyleSheet.absoluteFill}>
  <Svg width={width} height={height} viewBox="0 0 660 270" preserveAspectRatio="none">
   <Defs><LinearGradient id="hadeelPastel" x1="0%" y1="0%" x2="100%" y2="30%"><Stop offset="0%" stopColor="#FFEBD9"/><Stop offset="36%" stopColor="#FBF0E9"/><Stop offset="67%" stopColor="#E6E8F7"/><Stop offset="100%" stopColor="#DFEAFC"/></LinearGradient></Defs>
   <Rect width="660" height="270" fill="url(#hadeelPastel)"/>
   <Path d="M400 0 C290 112 330 235 455 270 L660 270 L660 0Z" fill="#F8FAFF" opacity=".56"/>
   <Path d="M455 270 C460 148 569 98 660 135 L660 270Z" fill="#B7CCF0" opacity=".65"/>
   <Path d="M490 270 C495 188 585 155 660 172 L660 270Z" fill="#8CAAE3" opacity=".38"/>
  </Svg>
  {kind === 'activity' ? <View style={{position:'absolute',right:0,bottom:0,width:width*.49,height:height*.76}}>
   <Svg width="100%" height="100%" viewBox="195 80 285 235" preserveAspectRatio="xMidYMid meet" accessibilityLabel={title}>
    <Defs><ClipPath id="originalActivitySilhouette"><Path d="M214 111 Q224 109 225 119 L221 193 L234 209 L264 228 L319 209 L346 194 L357 181 Q347 161 349 140 Q342 114 361 100 Q390 79 423 100 Q448 116 442 146 L438 168 L446 191 L480 215 L480 315 L275 315 L285 270 L236 252 L214 233 L199 218 L201 199 L214 192Z"/></ClipPath></Defs>
    <G clipPath="url(#originalActivitySilhouette)"><SvgImage href={image} width="480" height="360" preserveAspectRatio="xMidYMid meet"/></G>
   </Svg>
  </View> : <Image source={image} onError={onImageError} resizeMode="contain" style={kind==='doctor'?[styles.portrait,{width:height*1.02,height:height*1.02}]:{position:'absolute',right:'2%',top:'12%',width:'46%',height:'76%'}} accessibilityLabel={title}/>}
  <View style={styles.copy}>
   <View style={styles.badge}><Text style={styles.badgeText}>{label}</Text></View>
   <View style={styles.words}><Text style={[styles.title,text,{fontSize:compact?18:width<370?21:24,lineHeight:compact?23:width<370?28:32}]}>{title}</Text><Text numberOfLines={compact?3:undefined} style={[styles.specialty,text,compact&&{fontSize:12,lineHeight:17}]}>{specialty}</Text>{kind === "product" && <Text style={[styles.badgeText,text]}>{rtl?"صورة توضيحية":"Illustration"}</Text>}</View>
   <View style={styles.cta}><Ionicons name={rtl?'arrow-back':'arrow-forward'} color="white" size={20}/><Text style={styles.ctaText}>{cta}</Text></View>
  </View>
 </View>;
}
const styles=StyleSheet.create({
 portrait:{position:'absolute',right:-3,bottom:0},
 copy:{position:'absolute',left:'4%',top:'9%',bottom:30,width:'46%',justifyContent:'space-between'},
 badge:{alignSelf:'flex-start',backgroundColor:'#F5F7FF',paddingHorizontal:9,paddingVertical:4,borderRadius:16},
 badgeText:{fontSize:10,lineHeight:14,color:'#607DCB',fontWeight:typography.weightSemibold},
 words:{gap:4},title:{color:'#0B093B',fontWeight:typography.weightSemibold},specialty:{fontSize:14,lineHeight:21,color:'#747CA4',fontWeight:typography.weightMedium},
 cta:{backgroundColor:'#607DCB',borderRadius:19,minHeight:37,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:6,paddingHorizontal:8},
 ctaText:{color:'#FFFFFF',fontSize:14,lineHeight:20,fontWeight:typography.weightMedium}
});



