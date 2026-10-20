import React,{useEffect,useState} from "react";
import {View,Pressable,ActivityIndicator,StyleSheet} from "react-native";
import {Text,ScrollView} from "../../../components/ui/AppText";
import {useQuery} from "@tanstack/react-query";
import {useRouter} from "expo-router";
import {useAuth} from "../../../context/AuthContext";
import {useI18nLayout} from "../../../hooks/useI18nLayout";
import {getChildren} from "../../../api/children.api";
import {useCalendarEvents} from "../../../hooks/useCalendarEvents";
import {readJourney} from "../../../utils/journeyStore";

import CalendarPanel from "../../../components/plan/CalendarPanel";
import CalendarEventList from "../../../components/plan/CalendarEventList";
import {ACCOUNT_REQUIRED_HREF,setPendingAuthHref} from "../../../utils/authRedirect";
import {colors as c} from "../../../theme/colors";
export default function BookingsScreen(){
 const {user,loading}=useAuth(),router=useRouter(),{isRTL}=useI18nLayout();
 const tr=(ar:string,en:string)=>isRTL?ar:en;
 const [selection,setSelection]=useState<{account:string;child:string}>(),[calendar,setCalendar]=useState(false),[year,setYear]=useState(new Date().getFullYear());
 const children=useQuery({queryKey:["children",user?.id],queryFn:getChildren,enabled:!!user,gcTime:0});
 const child=children.data?.find(i=>selection?.account===user?.id&&i.id===selection?.child)||children.data?.[0];
 const events=useCalendarEvents(user?.id,child?.id,`${year}-01-01`,`${year}-12-31`);
 const journey=useQuery({queryKey:["journey",user?.id],queryFn:()=>readJourney(user!.id),enabled:!!user,refetchInterval:30000,gcTime:0});
 useEffect(()=>{if(!loading&&!user){setPendingAuthHref("/(tabs)/bookings");router.replace(ACCOUNT_REQUIRED_HREF);}},[loading,user,router]);
 if(!user)return <ActivityIndicator/>;
 const appointments=(events.data||[]).filter(e=>["doctor","center","therapy"].includes(e.category));
 const local=(journey.data||[]).filter(e=>e.type==="appointment"&&e.dateKey?.startsWith(String(year))&&(!e.childId||e.childId===child?.id));
 const text={textAlign:isRTL?"right" as const:"left" as const};
 return <View style={s.screen}><ScrollView contentContainerStyle={s.content}>
 <Text accessibilityRole="header" style={[s.heading,text]}>{tr("الحجوزات والطلبات","Bookings & Orders")}</Text>
 <Text style={[s.note,text]}>{tr("مواعيدك الشخصية من خطة طفلي. لا تؤكد هذه السجلات حجزاً لدى مقدم الخدمة. الطلبات غير متاحة حالياً.","Your personal appointments from My Child’s Plan. These records do not confirm a provider booking. Product orders are not available.")}</Text>
 {children.isPending&&<ActivityIndicator/>}
 {children.isError&&<Pressable onPress={()=>void children.refetch()}><Text accessibilityRole="alert">{tr("تعذر تحميل الأطفال — إعادة المحاولة","Could not load children — retry")}</Text></Pressable>}
 <View style={[s.row,{flexDirection:isRTL?"row-reverse":"row"}]}>{children.data?.map(i=><Pressable key={i.id} accessibilityRole="button" accessibilityState={{selected:i.id===child?.id}} onPress={()=>setSelection({account:user.id,child:i.id})} style={[s.button,i.id===child?.id&&s.selected]}><Text>{(isRTL?i.nameAr:i.nameEn)||i.name}</Text></Pressable>)}</View>
 <View style={[s.row,{flexDirection:isRTL?"row-reverse":"row"}]}><Pressable accessibilityRole="button" onPress={()=>setYear(y=>y-1)} style={s.button}><Text>{tr("السنة السابقة","Previous year")}</Text></Pressable><Text>{year}</Text><Pressable accessibilityRole="button" onPress={()=>setYear(y=>y+1)} style={s.button}><Text>{tr("السنة التالية","Next year")}</Text></Pressable></View>
 {!children.isPending&&!children.isError&&!child&&<Text style={text}>{tr("أضف طفلاً من حسابك لاستخدام تقويم خطة طفلي.","Add a child from your account to use My Child’s Plan calendar.")}</Text>}
 {child&&<Pressable accessibilityRole="button" onPress={()=>setCalendar(true)} style={s.button}><Text>{tr("إدارة تقويم خطة طفلي","Manage My Child’s Plan calendar")}</Text></Pressable>}
 {child&&events.isPending&&<ActivityIndicator/>}
 {child&&events.isError&&<Pressable onPress={()=>void events.refetch()}><Text accessibilityRole="alert">{tr("تعذر تحميل المواعيد — إعادة المحاولة","Could not load appointments — retry")}</Text></Pressable>}
 {child&&!events.isPending&&!events.isError&&!appointments.length&&<Text style={[s.note,text]}>{tr("لا توجد مواعيد طبيب أو مركز أو جلسات مسجلة لهذه السنة.","No doctor, center, or therapy appointments recorded for this year.")}</Text>}
 <CalendarEventList events={appointments}/>
 <Text style={[s.note,text]}>{tr("اسم مقدم الخدمة يظهر فقط إذا أدخلته في عنوان الموعد. لا نستورد تقويم جهازك تلقائياً.","Provider names appear only when entered in the appointment title. Your device calendar is not imported automatically.")}</Text>
 {journey.isError&&<Pressable onPress={()=>void journey.refetch()}><Text accessibilityRole="alert">{tr("تعذر قراءة سجلات هذا الجهاز — إعادة المحاولة","Could not read device records — retry")}</Text></Pressable>}
 {!!local.length&&<Text accessibilityRole="header" style={[s.heading,text]}>{tr("سجلات محفوظة على هذا الجهاز","Records saved on this device")}</Text>}
 {local.map(e=><View key={e.id} style={s.card}><Text style={text}>{tr(e.titleAr,e.titleEn)}</Text><Text style={text}>{tr(e.centerAr||"",e.centerEn||e.centerAr||"")}</Text><Text style={text}>{e.dateKey} · {e.time||tr("الوقت غير مسجل","Time not recorded")}</Text><Text style={[s.note,text]}>{tr("سجل شخصي محلي — تأكيد مقدم الخدمة غير متوفر","Local personal record — provider confirmation unavailable")}</Text></View>)}
 </ScrollView>{calendar&&child&&<CalendarPanel accountId={user.id} childId={child.id} childName={(isRTL?child.nameAr:child.nameEn)||child.name} tasks={[]} records={journey.data||[]} onClose={()=>setCalendar(false)}/>}</View>;
}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:c.background},content:{padding:20,paddingBottom:130,gap:16},heading:{fontSize:23,fontWeight:"600",color:c.text},note:{fontSize:15,lineHeight:24,color:c.textMuted},row:{flexDirection:"row",flexWrap:"wrap",gap:10,alignItems:"center"},button:{padding:12,borderRadius:16,backgroundColor:c.backgroundWash},selected:{borderWidth:1,borderColor:c.primary},card:{padding:16,borderRadius:18,borderWidth:1,borderColor:c.borderLight,gap:8}});


