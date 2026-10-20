import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text } from '../ui/AppText';
import { useI18nLayout } from '../../hooks/useI18nLayout';
import { findInstitution, institutionDirectoryCategory, institutionMapUrl } from '../../utils/institutionDirectory';
import { educationProfile } from '../../utils/educationProfile';
import { centerWebUrl } from '../../utils/centerPublicProfile';
import { directoryPhoneUrl } from '../../utils/directoryCall';
import { schoolDirectoryVersion } from '../../data/ai/schoolDirectoryVersion';
import type { DirectoryRecommendation } from '../../types/recommendation';
import { institutionImages } from './InstitutionImage';
import { DoctorLink, v } from './DoctorVisuals';
import { colors } from '../../theme/colors';
import { recommendationName, recommendationCopy } from '../../utils/schoolRecommendationCopy';
import { statusColors } from '../../theme/controls';

export default function SchoolRecommendationCards({references,version,language}:{references:DirectoryRecommendation[];version?:string;language?:'ar'|'ar-KW'|'en'}) {
  const router=useRouter();
  const {isRTL}=useI18nLayout();
  const ar=language ? language!=='en' : isRTL;
  const text={textAlign:ar?'right' as const:'left' as const,writingDirection:ar?'rtl' as const:'ltr' as const};
  const row={flexDirection:ar?'row-reverse' as const:'row' as const};
  if(version!==schoolDirectoryVersion)return <Text>{ar?'تم تحديث الدليل؛ يرجى إعادة البحث بعد تحديث التطبيق.':'Directory version changed; please update the app and search again.'}</Text>;
  const seen=new Set<string>();
  return <View style={styles.list}>{references.slice(0,5).map(ref=>{
    if(ref.category!=='school'||seen.has(ref.id))return null;
    const item=findInstitution(ref.id);
    if(!item||institutionDirectoryCategory(item)!=='school')return null;
    seen.add(ref.id);
    // Resolve all names, media and links from canonical directory records.
    const branches=(item.branches||[item]).filter(b=>ref.branchIds.includes(b.id));
    if(!branches.length)return null;
    const {name,missing:missingName}=recommendationName(item,ar);
    return <View key={item.id} testID={`school-recommendation-${item.id}`} style={styles.list}>{branches.map(branch=>{
      const p=educationProfile(branch).publicProfile;
      const evidence=ref.evidence.filter(e=>e.branchId===branch.id);
      const rows=branch.observations.filter(o=>evidence.some(e=>e.sourceId===o.sourceId&&e.page===o.page&&e.needs===o.needsAr));
      if(!rows.length)return null;
      const verified=ref.verification==='verified' && evidence.length>0 && evidence.every(e=>e.verification==='verified');
      const {info,location}=recommendationCopy(branch,rows,ar);
      const phone=directoryPhoneUrl(p?.phone);
      const map=centerWebUrl(p?.mapUrl,'maps')||institutionMapUrl(branch);
      const instagram=p?.instagram && centerWebUrl(p.instagram,'instagram');
      const website=p?.website && centerWebUrl(p.website);
      const whatsapp=p?.whatsapp?.url?.startsWith('https://wa.me/')?p.whatsapp.url:undefined;
      const media=branch.mainImage||item.mainImage;
      const links=[
        {url:phone,label:ar?'اتصال':'Call',icon:'call-outline' as const},
        {url:map,label:ar?'خرائط Google':'Google Maps',icon:'location-outline' as const},
        {url:whatsapp,label:ar?'واتساب':'WhatsApp',icon:'logo-whatsapp' as const},
        {url:instagram,label:ar?'إنستقرام':'Instagram',icon:'logo-instagram' as const},
        {url:website,label:ar?'الموقع الإلكتروني':'Website',icon:'globe-outline' as const},
      ].filter(link=>!!link.url);
      return <View key={branch.id} style={[v.card,styles.card]} testID={`school-card-${branch.id}`}>
        <Text accessibilityRole="header" style={[v.title,text]}>{name}</Text>
        {missingName && <Text style={[v.secondary,text]}>Official English name unavailable — original Arabic name shown.</Text>}
        {branches.length>1 && <Text style={[v.secondary,text]}>{recommendationName(branch,ar).name}{recommendationName(branch,ar).missing?' (original Arabic branch name)':''}</Text>}
        <View style={[styles.information,row]}>
          {!!media && <Image testID={`school-logo-${branch.id}`} source={institutionImages[media]} contentFit="contain" accessibilityLabel={name} style={styles.logo}/>}
          <View style={styles.summary}>
            {!!location && <Text style={[v.secondary,text]}>{location}</Text>}
            {!!info && <Text testID={`school-summary-${branch.id}`} numberOfLines={3} ellipsizeMode="tail" style={[v.secondary,text]}>{info}</Text>}
          </View>
        </View>
        <View style={[styles.status,{backgroundColor:verified?colors.backgroundSecondary:statusColors.pending.background}]}>
          <Text style={[v.secondary,text,{color:verified?colors.primaryMuted:statusColors.pending.foreground,fontWeight:'600'}]}>{ar?(verified?'أهلية موثقة في الدليل — يُرجى تأكيد القبول':'للاستفسار فقط — الأهلية تحتاج تأكيد المدرسة'):(verified?'Verified directory eligibility — confirm admission':'Inquiry only — eligibility requires school confirmation')}</Text>
        </View>
        <View style={[styles.actions,row]} testID={`school-actions-${branch.id}`}>
          <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={()=>router.push({pathname:'/(tabs)/directory/institution-details',params:{id:item.id,origin:'ask-fakhr'}})} style={[v.primary,styles.action]}>
            <Text style={v.white}>{ar?'عرض التفاصيل':'View Details'}</Text>
          </Pressable>
          {links.map(link=><View key={link.icon} style={styles.action}><DoctorLink label={link.label} url={link.url!} icon={link.icon}/></View>)}
        </View>
      </View>;
    })}</View>;
  })}</View>;
}
const styles=StyleSheet.create({
  list:{gap:12,width:'100%'},
  card:{width:'100%',minWidth:0,gap:12},
  information:{gap:12,alignItems:'flex-start'},
  logo:{width:88,height:88,flexShrink:0,backgroundColor:colors.white},
  summary:{flex:1,minWidth:0,gap:6},
  status:{padding:10,borderRadius:12},
  actions:{flexWrap:'wrap',gap:8,borderTopWidth:1,borderTopColor:colors.borderLight,paddingTop:12},
  action:{flexBasis:'45%',flexGrow:1,minWidth:110},
});
