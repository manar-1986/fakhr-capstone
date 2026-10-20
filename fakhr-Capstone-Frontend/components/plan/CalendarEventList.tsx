import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "../ui/AppText";
import { CalendarEvent, EventCategory } from "../../api/calendar.api";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme/colors";
export const eventCategories: {id:EventCategory;ar:string;en:string;color:string}[] = [
{id:"therapy",ar:"جلسة علاجية",en:"Therapy session",color:"#F1ECFC"},{id:"doctor",ar:"موعد طبيب",en:"Doctor appointment",color:"#EAF2FF"},{id:"center",ar:"موعد مركز",en:"Center appointment",color:"#F2EDFC"},{id:"school",ar:"موعد مدرسة",en:"School appointment",color:"#EDF1F8"},{id:"home",ar:"نشاط منزلي",en:"Home activity",color:"#FFF2E9"},{id:"education",ar:"نشاط تعليمي",en:"Educational activity",color:"#EAF2FF"},{id:"reminder",ar:"تذكير مهم",en:"Important reminder",color:"#F1ECFC"}];
export default function CalendarEventList({events,onSelect}:{events:CalendarEvent[];onSelect?:(event:CalendarEvent)=>void}) {
 const {isRTL,align}=useI18nLayout();
 return <View style={{gap:8}}>{events.map(event=><Pressable key={event.id} accessibilityRole={onSelect?"button":undefined} onPress={()=>onSelect?.(event)} style={{padding:12,borderRadius:14,backgroundColor:event.status==="completed"?"#E7F5ED":eventCategories.find(c=>c.id===event.category)?.color}}>
 <Text style={{color:colors.text,textAlign:align,fontWeight:"600"}}>{event.title}</Text>
 <Text style={{color:colors.textSecondary,textAlign:align}}>{event.date} · {event.startTime}{event.endTime?" – "+event.endTime:""} · {event.timezone}</Text>
 <Text style={{color:event.status==="completed"?"#248A58":"#0B093B",textAlign:align}}>{eventCategories.find(c=>c.id===event.category)?.[isRTL?"ar":"en"]} · {event.status==="completed"?(isRTL?"مكتمل":"Completed"):(isRTL?"موعد شخصي — ليس حجزاً مؤكداً":"Personal event — not a confirmed booking")}</Text>
 </Pressable>)}</View>;
}
