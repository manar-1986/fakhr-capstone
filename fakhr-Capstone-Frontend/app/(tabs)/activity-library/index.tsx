import { categoryColors } from "../../../theme/categories";
import { Text, ScrollView } from "../../../components/ui/AppText";
import { typography } from "../../../theme/typography";
import React from "react";
import { HOME_ACTIVITY_VIDEOS } from "../../../constants/homeActivityLibrary";
import { useTranslation } from "react-i18next";
import { StyleSheet, useWindowDimensions, View, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DisabilityAwareHeaderBackButton } from "../../../components/navigation/HeaderBackButton";
import { useI18nLayout } from "../../../hooks/useI18nLayout";
import { colors } from "../../../theme";

export default function HomeActivityLibraryScreen() {
  const { t } = useTranslation();
  const { isRTL, dir } = useI18nLayout();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width, 430);
  const ms = (n: number) => Math.round(n * contentW / 390);
  // Video source data is retained in constants/homeActivityLibrary.ts.
  // This page currently has no separate non-video activities to display.
  return <SafeAreaView style={[styles.safe, { direction: isRTL ? "rtl" : "ltr" }]} edges={["top"]}>
    <View style={[styles.column, { width: contentW }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={{paddingHorizontal:ms(18),paddingTop:ms(10),paddingBottom:ms(108)}} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, {marginBottom:ms(8)}]}>
          <DisabilityAwareHeaderBackButton color={colors.textSecondary}/>
          <Text style={[styles.title,{writingDirection:dir}]}>{t("ui.activitiesOneLine")}</Text>
        </View>
        <Text style={[styles.subtitle,{marginBottom:ms(14),writingDirection:dir}]}>{t("activityLibrary.subtitle")}</Text>
        {HOME_ACTIVITY_VIDEOS.map(video => <Pressable key={video.youtubeUrl} accessibilityRole="link" onPress={() => Linking.openURL(video.youtubeUrl)} style={{padding:16,marginBottom:12,borderRadius:16,backgroundColor:colors.primaryLight}}>
          <Text style={{color:colors.text,writingDirection:dir,fontWeight:'600'}}>{isRTL ? video.titleAr : video.titleEn}</Text>
          <Text style={{color:colors.textSecondary,writingDirection:dir,marginTop:8}}>{isRTL ? video.descriptionAr : video.descriptionEn}</Text>
          <Text style={{color:colors.primary,writingDirection:dir,marginTop:8}}>{isRTL ? video.sourceAr : video.sourceEn} · {isRTL ? 'مشاهدة الفيديو' : 'Watch video'}</Text>
        </Pressable>)}
        <Text style={styles.empty}>{isRTL ? 'المحتوى إرشادي؛ اتبع توجيهات المختص بما يناسب طفلك.' : 'Informational resources; follow your specialist’s guidance for your child.'}</Text>
      </ScrollView>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.background,alignItems:"center"},
  column:{flex:1,maxWidth:430,width:"100%"},
  scroll:{flex:1,width:"100%"},
  header:{justifyContent:"center",alignItems:"center",minHeight:56,paddingHorizontal:44},
  title:{fontWeight:typography.weightSemibold,color:categoryColors.activities.foreground,textAlign:"center",fontSize:typography.title,lineHeight:typography.titleLineHeight},
  subtitle:{fontWeight:typography.weightRegular,color:colors.textMuted,textAlign:"center",fontSize:typography.helper,lineHeight:typography.helperLineHeight},
  empty:{fontWeight:typography.weightRegular,color:colors.textMuted,marginTop:24,textAlign:"center",fontSize:typography.body,lineHeight:typography.bodyLineHeight},
});
