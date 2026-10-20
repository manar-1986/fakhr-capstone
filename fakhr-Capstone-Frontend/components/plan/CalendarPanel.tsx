import React, { useRef, useState } from "react";
import { Modal, Platform, Pressable, View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, TextInput, ScrollView } from "../ui/AppText";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarEvent, CalendarInput, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, eventInput } from "../../api/calendar.api";
import { useCalendarEvents } from "../../hooks/useCalendarEvents";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { dateKey, taskDate } from "../../utils/childPlanWeek";
import { CarePathTask } from "../../api/care-path.api";
import { JourneyRecord } from "../../utils/journeyStore";
import { colors } from "../../theme/colors";
import CalendarEventList, { eventCategories } from "./CalendarEventList";
import { SafeAreaView } from "react-native-safe-area-context";

import { localAppointmentTime, personalCalendars, savePersonalEvent, removeLinkedPersonalEvent } from "../../utils/personalAppointmentCalendar";

type Props={accountId?:string;childId?:string;childName?:string;tasks:CarePathTask[];records:JourneyRecord[];onClose:()=>void};
export default function CalendarPanel({accountId,childId,childName,tasks,records,onClose}:Props){
 const {isRTL,align,tabRow}=useI18nLayout(),router=useRouter(),client=useQueryClient();
 const tr=(ar:string,en:string)=>isRTL?ar:en;
 const today=dateKey(new Date());const [selected,setSelected]=useState(today);const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const from=dateKey(new Date(month.getFullYear(),month.getMonth(),1)),to=dateKey(new Date(month.getFullYear(),month.getMonth()+1,0));
 const events=useCalendarEvents(accountId,childId,from,to);
 const upcomingEnd=new Date();upcomingEnd.setDate(upcomingEnd.getDate()+90);
 const upcoming=useCalendarEvents(accountId,childId,today,dateKey(upcomingEnd));
 const [form,setForm]=useState<CalendarInput>();const [editing,setEditing]=useState<CalendarEvent>();const [busy,setBusy]=useState(false),[error,setError]=useState(""),[confirmDelete,setConfirmDelete]=useState(false);
 const [calendarNotice,setCalendarNotice]=useState("");
 const [removeDevice,setRemoveDevice]=useState(false);
 const [pendingDeviceRemoval,setPendingDeviceRemoval]=useState<{accountId:string;appointmentId:string}>();
 const removeFromDevice=async(target:{accountId:string;appointmentId:string})=>{
  if(target.accountId!==accountId)return;
  try {const result=await removeLinkedPersonalEvent(target.appointmentId);setPendingDeviceRemoval(undefined);setCalendarNotice(result==="removed"?tr("حُذف التذكير من فخر ومن تقويم هذا الجهاز.","Reminder removed from Fakhr and this device’s Calendar."):result==="not-linked"?tr("حُذف من فخر. لا يوجد حدث تقويم مرتبط على هذا الجهاز.","Deleted from Fakhr. No linked Calendar event was found on this device."):tr("حُذف من فخر. احذف أي نسخة مستوردة يدوياً من تطبيق التقويم.","Deleted from Fakhr. Remove any manually imported copy in your calendar app."));}
  catch {setPendingDeviceRemoval(target);setCalendarNotice(tr("حُذف من فخر، لكن لم نتأكد من حذف حدث التقويم. تحقق من إذن التقويم ثم أعد محاولة حذف النسخة المرتبطة، أو احذفها يدوياً. إذا أغلقت هذه الشاشة، راجع تطبيق التقويم.","Deleted from Fakhr, but Calendar removal was not confirmed. Check Calendar permission and retry removing the linked copy, or remove it manually. If you close this screen, check your calendar app."));}
 };
 const saving=useRef(false),requestId=useRef("");
 const btn=(label:string,action:()=>void,disabled=false)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={action} style={[s.button,disabled&&{opacity:.5}]}><Text style={{color:"#0B093B",textAlign:"center"}}>{label}</Text></Pressable>;
 const edit=(event:CalendarEvent)=>{setEditing(event);setForm(eventInput(event));setConfirmDelete(false);setRemoveDevice(false);setError("");};
 const add=()=>{if(!accountId){onClose();router.push("/(auth)/login");return;}if(!childId)return;requestId.current=Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)+"-"+Math.random().toString(36).slice(2);setEditing(undefined);setConfirmDelete(false);setError("");setForm({title:"",date:selected,startTime:"09:00",timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Kuwait",category:"home",notes:"",status:"scheduled"});};
 const mutate=async(remove=false)=>{if(saving.current||!accountId||!childId||!form)return;
 if(!remove&&(!form.title.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(form.date)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.startTime)||form.endTime&&(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.endTime)||form.endTime<=form.startTime))){setError(tr("تحقق من العنوان والتاريخ والأوقات (24 ساعة).","Check the title, date and times (24-hour format)."));return;}
 saving.current=true;setBusy(true);setError("");setCalendarNotice("");try{
 let saved:CalendarEvent|undefined;
 if(remove&&editing) await deleteCalendarEvent(editing.id,editing.revision);
 else if(editing) saved=await updateCalendarEvent(editing.id,{...form,endTime:form.endTime||undefined,revision:editing.revision});
 else saved=await createCalendarEvent({...form,endTime:form.endTime||undefined,childId,requestId:requestId.current});
 setForm(undefined);setEditing(undefined);await client.invalidateQueries({queryKey:["calendar-events",accountId]});
 if(saved && ["doctor","center"].includes(saved.category)) {
   if(Platform.OS==="web") setCalendarNotice(tr("حُفظ التذكير الشخصي في خطة طفلك. الإضافة إلى تقويم الهاتف متاحة في تطبيق الهاتف؛ ليس حجزاً مؤكداً.","Personal reminder saved in your child's plan. Phone Calendar integration is available in the mobile app; this is not a confirmed booking."));
   else try {
     if(saved.timezone!==Intl.DateTimeFormat().resolvedOptions().timeZone) throw new Error("timezone");
     const start=localAppointmentTime(saved.date,saved.startTime);if(!start)throw new Error("date");
     const calendars=await personalCalendars();const chosen=calendars.find(c=>c.isPrimary)||calendars[0];if(!chosen)throw new Error("calendar");
     const result=await savePersonalEvent({identity:"plan",appointmentId:accountId+"-"+saved.id,name:saved.title,notes:"",start,language:isRTL?"ar":"en"},chosen.id);
     setCalendarNotice(result.late?tr("حُفظ في فخر والتقويم. بقي أقل من 24 ساعة، لذلك لم يُضف تنبيه في الماضي.","Saved in Fakhr and Calendar. Less than 24 hours remain, so no past alert was added."):result.reminders===1?tr("حُفظ في فخر والتقويم مع تذكير قبل 24 ساعة. ليس حجزاً مؤكداً.","Saved in Fakhr and Calendar with a 24-hour reminder. Not a confirmed booking."):tr("حُفظ في فخر والتقويم. راجع التنبيه في تطبيق التقويم.","Saved in Fakhr and Calendar. Check the alert in Calendar."));
   } catch {setCalendarNotice(tr("حُفظ في فخر، لكن تعذرت مزامنته مع تقويم الهاتف. تحقق من الإذن والتقويم والمنطقة الزمنية، ثم افتح الحدث وأعد الحفظ. لم نكرر إنشاء الحدث.","Saved in Fakhr, but phone Calendar sync could not be completed. Check permission, calendar and time zone, then reopen the event and save again. Event creation was not retried."));}
 }
 if(remove&&editing) {if(removeDevice)await removeFromDevice({accountId,appointmentId:accountId+"-"+editing.id});else setCalendarNotice(tr("حُذف من فخر فقط. لم نحذف أي نسخة من تقويم الهاتف.","Deleted from Fakhr only. Any phone Calendar copy was kept."));}
 }catch{setError(tr("لم يتم الحفظ. تحقق من الاتصال أو حدّث التقويم ثم أعد المحاولة.","Not saved. Check your connection or refresh the calendar and retry."));}finally{saving.current=false;setBusy(false);}};

 const first=(month.getDay()+1)%7,days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const datedTasks=tasks.filter(t=>taskDate(t)&&dateKey(taskDate(t)!)===selected);
 const localRecords=records.filter(r=>r.type==="appointment"&&r.childId===childId&&r.dateKey===selected);
 const markers=new Set([...(events.data||[]).map(e=>e.date),...tasks.map(t=>taskDate(t)?dateKey(taskDate(t)!):""),...records.filter(r=>r.type==="appointment"&&r.childId===childId).map(r=>r.dateKey||"")]);
 const input=(label:string,key:"title"|"date"|"startTime"|"endTime"|"notes"|"timezone")=><View><Text style={{textAlign:align,color:colors.text}}>{label}</Text><TextInput accessibilityLabel={label} value={form?.[key]||""} onChangeText={v=>setForm(f=>f?{...f,[key]:v}:f)} multiline={key==="notes"} maxLength={key==="notes"?2000:key==="title"?160:80} style={[s.input,{textAlign:align}]} /></View>;
 return <Modal visible animationType="slide" onRequestClose={()=>{if(!busy)onClose();}}><SafeAreaView testID="child-calendar" style={{flex:1,backgroundColor:"white"}}><ScrollView contentContainerStyle={{padding:16,paddingBottom:48,gap:12}} keyboardShouldPersistTaps="handled">
 <View style={{flexDirection:tabRow,alignItems:"center",gap:10}}><Text accessibilityRole="header" style={[s.title,{flex:1,textAlign:align}]}>{tr("تقويم طفلي","My Child Calendar")}</Text>{btn(tr("إغلاق","Close"),onClose,busy)}</View>
 <Text style={{textAlign:align,color:colors.textSecondary}}>{childName||tr("معاينة التقويم","Calendar preview")}</Text>
 {!accountId&&<Text style={{textAlign:align}}>{tr("سجّل الدخول لحفظ أحداث طفلك.","Sign in to save your child's events.")}</Text>}
 {accountId&&!childId&&<Text>{tr("أضف أو اختر طفلاً من الخطة أولاً.","Add or choose a child in the plan first.")}</Text>}
 <View style={{flexDirection:tabRow,alignItems:"center",gap:6}}>{btn(tr("الشهر السابق","Previous month"),()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1)))}<Text style={{flex:1,textAlign:"center",color:colors.text}}>{month.toLocaleDateString(isRTL?"ar-KW":"en-GB",{month:"long",year:"numeric",calendar:"gregory"})}</Text>{btn(tr("الشهر التالي","Next month"),()=>setMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1)))}</View>
 <View style={{flexDirection:tabRow}}>{["Sat","Sun","Mon","Tue","Wed","Thu","Fri"].map((d,i)=><Text key={d} style={{width:"14.285%",textAlign:"center",fontSize:11}}>{isRTL?["س","أ","إ","ث","ر","خ","ج"][i]:d}</Text>)}</View>
 {Array.from({length:Math.ceil((first+days)/7)},(_,week)=><View key={week} style={{flexDirection:tabRow}}>{Array.from({length:7},(_,col)=>{const n=week*7+col-first+1;if(n<1||n>days)return <View key={col} style={{width:"14.285%"}}/>;const key=dateKey(new Date(month.getFullYear(),month.getMonth(),n));return <Pressable key={col} accessibilityRole="button" accessibilityLabel={key+(key===today?tr(" اليوم"," Today"):"")+(markers.has(key)?tr(" أحداث مجدولة"," Scheduled events"):"")} accessibilityState={{selected:key===selected}} onPress={()=>setSelected(key)} style={[s.day,{backgroundColor:key===selected?colors.primary:colors.backgroundWash,borderColor:key===today?colors.primary:"transparent"}]}><Text style={{color:key===selected?"#0B093B":colors.text}}>{n.toLocaleString(isRTL?"ar-KW":"en")}</Text><View style={{height:4,width:4,borderRadius:2,backgroundColor:markers.has(key)?(key===selected?"white":colors.primary):"transparent"}}/></Pressable>})}</View>)}
 {btn(tr("اليوم","Today"),()=>{setSelected(today);setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1));})}
 {btn(tr("إضافة حدث","Add event"),add,!!accountId&&!childId||busy)}
 {!!calendarNotice&&<Text accessibilityLiveRegion="polite" style={{textAlign:align}}>{calendarNotice}</Text>}
 {pendingDeviceRemoval?.accountId===accountId&&pendingDeviceRemoval&&btn(tr("إعادة محاولة حذف حدث التقويم المرتبط","Retry removing linked Calendar event"),()=>{if(saving.current)return;saving.current=true;setBusy(true);void removeFromDevice(pendingDeviceRemoval).finally(()=>{saving.current=false;setBusy(false);});},busy)}
 {form&&<View style={s.card}><Text style={s.title}>{editing?tr("تعديل الحدث","Edit event"):tr("حدث جديد","New event")}</Text><Text>{childName}</Text>
 {input(tr("عنوان الحدث","Event title"),"title")}{input(tr("التاريخ YYYY-MM-DD","Date YYYY-MM-DD"),"date")}{input(tr("وقت البداية HH:mm","Start time HH:mm"),"startTime")}{input(tr("وقت النهاية اختياري HH:mm","Optional end time HH:mm"),"endTime")}{input(tr("المنطقة الزمنية","Time zone"),"timezone")}
 <View style={{flexDirection:tabRow,flexWrap:"wrap",gap:6}}>{eventCategories.map(c=><Pressable key={c.id} accessibilityRole="button" accessibilityState={{selected:form.category===c.id}} onPress={()=>setForm({...form,category:c.id})} style={[s.button,{backgroundColor:c.color,borderWidth:form.category===c.id?2:0}]}><Text>{c[isRTL?"ar":"en"]}</Text></Pressable>)}</View>
 {["doctor","center"].includes(form.category)&&<Text>{tr("تذكير شخصي وليس حجزاً مؤكداً. سيحاول التطبيق إضافته إلى تقويم الهاتف بإذنك مع تنبيه قبل 24 ساعة. لن تُنسخ بيانات الطفل أو الملاحظات إلى التقويم.","Personal reminder, not a confirmed booking. With your permission, the app will add it to phone Calendar with a 24-hour alert. Child details and notes are not copied to Calendar.")}</Text>}
 {input(tr("ملاحظات اختيارية","Optional notes"),"notes")}
 {editing&&["home","education","therapy"].includes(form.category)&&btn(form.status==="completed"?tr("إلغاء الاكتمال","Mark incomplete"):tr("وضع علامة مكتمل","Mark completed"),()=>setForm({...form,status:form.status==="completed"?"scheduled":"completed"}),busy)}
 {!!error&&<Text accessibilityRole="alert" style={{color:colors.error}}>{error}</Text>}
 {btn(tr("حفظ","Save"),()=>void mutate(),busy)}{btn(tr("إلغاء","Cancel"),()=>{setForm(undefined);setError("");},busy)}
 {editing&&btn(tr("حذف الحدث","Delete event"),()=>{setRemoveDevice(false);setConfirmDelete(true);},busy)}
 {confirmDelete&&<View><Text>{tr("هل تريد حذف هذا الحدث من فخر؟","Delete this event from Fakhr?")}</Text>{Platform.OS==="web"&&<Text>{tr("هذا المتصفح لا يستطيع حذف أحداث تقويم الهاتف. احذف أي نسخة مستوردة يدوياً من تطبيق التقويم.","This browser cannot remove phone Calendar events. Remove any imported copy manually in your calendar app.")}</Text>}{Platform.OS!=="web"&&<Pressable accessibilityRole="checkbox" accessibilityLabel={tr("حذف الحدث المرتبط من تقويم هذا الجهاز أيضاً","Also remove the linked event from this device’s Calendar")} accessibilityState={{checked:removeDevice,disabled:busy}} disabled={busy} onPress={()=>setRemoveDevice(value=>!value)} style={s.button}><Text style={{textAlign:align}}>{removeDevice?"☑ ":"☐ "}{tr("حذف الحدث المرتبط من تقويم هذا الجهاز أيضاً","Also remove the linked event from this device’s Calendar")}</Text><Text style={{textAlign:align}}>{tr("قد نطلب إذن التقويم. لن نحذف أحداثاً أخرى. اضغط تأكيد الحذف للموافقة.","Calendar permission may be requested. Other events will not be removed. Select Confirm delete to approve.")}</Text></Pressable>}{btn(tr("تأكيد الحذف","Confirm delete"),()=>void mutate(true),busy)}{btn(tr("الاحتفاظ بالحدث","Keep event"),()=>setConfirmDelete(false),busy)}</View>}
 </View>}
 {events.isFetching&&accountId&&childId&&<ActivityIndicator/>}
 {events.isError&&<Text accessibilityRole="alert">{tr("تعذر تحميل الأحداث. أعد المحاولة.","Could not load events. Retry.")}</Text>}
 {accountId&&childId&&btn(tr("تحديث التقويم","Refresh calendar"),()=>{void events.refetch();void upcoming.refetch();})}
 <Text style={s.title}>{selected}</Text><CalendarEventList events={(events.data||[]).filter(e=>e.date===selected)} onSelect={edit}/>
 {datedTasks.map(t=><View key={"task:"+t.id} style={s.card}><Text>{(isRTL?t.titleAr:t.titleEn)||t.title}</Text><Text>{t.status==="completed"?tr("مكتمل","Completed"):tr("نشاط الخطة","Plan activity")}</Text><Text>{(isRTL?t.descriptionAr:t.descriptionEn)||t.description}</Text></View>)}
 {localRecords.map(r=><View key={"local:"+r.id} style={s.card}><Text>{isRTL?r.titleAr:r.titleEn} {r.time}</Text><Text>{tr("موعد محفوظ على هذا الجهاز فقط","Appointment saved on this device only")}</Text></View>)}
 {!events.isError&&!(events.data||[]).some(e=>e.date===selected)&&!datedTasks.length&&!localRecords.length&&<Text>{tr("لا توجد أحداث في هذا اليوم.","No events on this date.")}</Text>}
 <Text style={s.title}>{tr("القادم خلال 90 يوماً","Upcoming in the next 90 days")}</Text>
 {upcoming.isError&&<Text>{tr("تعذر تحميل الأحداث القادمة.","Could not load upcoming events.")}</Text>}
 <CalendarEventList events={(upcoming.data||[]).filter(e=>e.status!=="completed")} onSelect={edit}/>
 </ScrollView></SafeAreaView></Modal>;
}
const s=StyleSheet.create({title:{fontSize:18,fontWeight:"600",color:colors.text},button:{minHeight:44,padding:10,borderRadius:12,backgroundColor:colors.backgroundWash,borderColor:colors.primary,justifyContent:"center"},day:{width:"14.285%",minHeight:46,alignItems:"center",justifyContent:"center",borderRadius:10,borderWidth:2},card:{padding:14,borderRadius:16,borderWidth:1,borderColor:colors.border,gap:10},input:{minHeight:44,borderWidth:1,borderColor:colors.border,borderRadius:10,padding:10,color:colors.text}});
