import React from 'react';
import {View, Pressable} from 'react-native';
import {useRouter} from 'expo-router';
import {Text} from '../ui/AppText';
import {useI18nLayout} from '../../hooks/useI18nLayout';
import {unavailableText} from '../../utils/minimumRelease';
import {colors} from '../../theme/colors';
export default function MinimumUnavailable() {
 const {isRTL}=useI18nLayout(); const router=useRouter();
 return <View testID="minimum-unavailable" style={{flex:1,justifyContent:'center',padding:24,backgroundColor:colors.background,gap:20}}>
  <Text accessibilityRole="alert" style={{color:colors.text,textAlign:isRTL?'right':'left',writingDirection:isRTL?'rtl':'ltr'}}>{unavailableText(isRTL)}</Text>
  <Pressable accessibilityRole="button" onPress={()=>router.replace('/(tabs)/home')} style={{padding:16,borderRadius:14,backgroundColor:colors.backgroundWash}}><Text style={{color:colors.text,textAlign:'center'}}>{isRTL?'العودة للرئيسية':'Return to Home'}</Text></Pressable>
 </View>;
}
