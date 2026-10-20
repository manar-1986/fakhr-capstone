import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Svg,{Defs,LinearGradient,Stop,Rect,Path} from 'react-native-svg';
import {Ionicons} from '@expo/vector-icons';
import {Text} from '../ui/AppText';
import {typography} from '../../theme';

type Props={width:number;height:number;rtl:boolean;title:string;specialty:string;label:string;cta:string};
/** Doctor-only visual approval candidate. Original portrait remains untouched. */
export default function HadeelPromotion({width,height,rtl,title,specialty,label,cta}:Props){
 const text={textAlign:rtl?'right' as const:'left' as const,writingDirection:rtl?'rtl' as const:'ltr' as const};
 return <View style={StyleSheet.absoluteFill}>
  <Svg width={width} height={height} viewBox="0 0 660 270" preserveAspectRatio="none">
   <Defs><LinearGradient id="hadeelPastel" x1="0%" y1="0%" x2="100%" y2="30%"><Stop offset="0%" stopColor="#FFEBD9"/><Stop offset="36%" stopColor="#FBF0E9"/><Stop offset="67%" stopColor="#E6E8F7"/><Stop offset="100%" stopColor="#DFEAFC"/></LinearGradient></Defs>
   <Rect width="660" height="270" fill="url(#hadeelPastel)"/>
   <Path d="M400 0 C290 112 330 235 455 270 L660 270 L660 0Z" fill="#F8FAFF" opacity=".56"/>
   <Path d="M455 270 C460 148 569 98 660 135 L660 270Z" fill="#B7CCF0" opacity=".65"/>
   <Path d="M490 270 C495 188 585 155 660 172 L660 270Z" fill="#8CAAE3" opacity=".38"/>
  </Svg>
  <Image source={require('../../assets/images/hadeel-clinic/portrait-cutout-review.png')} resizeMode="contain" style={[styles.portrait,{width:height*1.02,height:height*1.02}]} accessibilityLabel={title}/>
  <View style={styles.copy}>
   <View style={styles.badge}><Text style={styles.badgeText}>{label}</Text></View>
   <View style={styles.words}><Text style={[styles.title,text,{fontSize:width<370?21:24,lineHeight:width<370?28:32}]}>{title}</Text><Text style={[styles.specialty,text]}>{specialty}</Text></View>
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
