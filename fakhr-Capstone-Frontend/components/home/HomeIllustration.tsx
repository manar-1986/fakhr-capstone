import React from "react";
import { Image, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
const palettes = {
 disability: { ink: "#DE8750", tint: "#FFF1E5", accent: "#F4BF5D", icon: "accessibility" },
 schools: { ink: "#467BC4", tint: "#EAF2FF", accent: "#F5BA5C", icon: "school" },
 doctors: { ink: "#8762C2", tint: "#F2ECFF", accent: "#EA92AE", icon: "people" },
 products: { ink: "#397FDB", tint: "#EAF3FF", accent: "#F4AD57", icon: "bag-handle" },
 homeServices: { ink: "#CB6E85", tint: "#FFF0F4", accent: "#F4B966", icon: "home" },
 sportsClubs: { ink: "#D99B27", tint: "#EAF7EF", accent: "#D99B27", icon: "trophy" },
} as const;
/** Local vector icons and decorative shapes; no external or generated brand assets. */
export function HomeIllustration({ kind }: { kind: string }) {
 if (kind === "doctors") return <View accessible={false} style={[s.art, { overflow: "hidden" }]}><Image testID="home-medical-team" source={require("../../assets/images/home-medical-team.png")} resizeMode="contain" style={{ width: 54, height: 50 }} /></View>;
 const p = palettes[kind as keyof typeof palettes] ?? palettes.products;
 return <View accessible={false} style={[s.art, { backgroundColor: p.tint }]}>
 <View style={[s.shadow, { backgroundColor: p.ink + "20" }]}/>
 <Ionicons name={p.icon} size={34} color={p.ink} style={{ textShadowColor: p.ink + "30", textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 3 }}/>
 </View>;
}
export function PlanIllustration() {
 return <View accessible={false} style={s.plan}>
 <View style={s.sheet}><View style={s.clip}/>{["#4C84DA", "#D7894B", "#9270C9"].map(color=><View key={color} style={s.checkRow}><Ionicons name="checkmark-circle" size={19} color={color}/><View style={[s.line,{backgroundColor:color+"60"}]}/></View>)}</View>
 <Ionicons name="sparkles" size={24} color="#F1B859" style={{position:"absolute",right:0,top:4}}/>
 </View>;
}
const s=StyleSheet.create({
 art:{width:54,height:50,borderRadius:17,alignItems:"center",justifyContent:"center",overflow:"visible"},shadow:{position:"absolute",width:38,height:8,borderRadius:26,bottom:4},
 plan:{width:94,height:120,alignItems:"center",justifyContent:"center"},sheet:{width:75,height:99,backgroundColor:"#FFFFFF",borderRadius:14,borderWidth:5,borderColor:"#4C84DA",paddingTop:17,paddingHorizontal:5,gap:7,transform:[{rotate:"-6deg"}],shadowColor:"#467BC4",shadowOffset:{width:0,height:5},shadowOpacity:.2,shadowRadius:7,elevation:3},clip:{position:"absolute",top:-11,left:18,width:30,height:17,borderRadius:6,backgroundColor:"#6E7CAF"},checkRow:{flexDirection:"row",alignItems:"center",gap:4},line:{height:5,width:23,borderRadius:3}
});
