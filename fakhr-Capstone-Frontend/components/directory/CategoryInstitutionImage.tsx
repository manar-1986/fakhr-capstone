import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../ui/AppText";
import type { Institution } from "../../types/institution";
import { institutionDirectoryCategory } from "../../utils/institutionDirectory";
import { institutionImages } from "../directory/InstitutionImage";

/** Category result artwork only: preserve canonical mappings and never borrow another logo. */
export default function CategoryInstitutionImage({item,isRTL}:{item:Institution;isRTL:boolean}) {
 const [failed,setFailed]=React.useState(false);
 const kind=institutionDirectoryCategory(item);
 const icon:React.ComponentProps<typeof Ionicons>["name"]=kind==="nursery"?"happy-outline":kind==="school"?"school-outline":"business-outline";
 const source=item.mainImage ? institutionImages[item.mainImage] : undefined;
 return <View testID={`category-artwork-${item.id}`} style={styles.frame}>
  {source&&!failed ? <Image testID={`category-image-${item.id}`} source={source} resizeMode="contain" onError={()=>setFailed(true)} accessibilityLabel={(isRTL?item.nameAr:item.nameEn)||item.nameAr} style={styles.image}/> : <View testID={`category-placeholder-${item.id}`} style={styles.fallback}><Ionicons name={icon} size={30} color="#556DA9"/><Text style={styles.caption}>{isRTL?"الصورة غير متوفرة":"Image unavailable"}</Text></View>}
 </View>;
}
const styles=StyleSheet.create({frame:{width:88,height:88,borderRadius:16,backgroundColor:"#EBF1FD",overflow:"hidden",alignItems:"center",justifyContent:"center",flexShrink:0},image:{width:88,height:88,borderRadius:16},fallback:{alignItems:"center",justifyContent:"center",gap:5,padding:4},caption:{fontSize:11,color:"#5E6486",textAlign:"center"}});
