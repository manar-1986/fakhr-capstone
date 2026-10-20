import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { AppState } from "react-native";
import { listCalendarEvents } from "../api/calendar.api";
export function useCalendarEvents(accountId:string|undefined,childId:string|undefined,from:string,to:string) {
 const query=useQuery({queryKey:["calendar-events",accountId,childId,from,to],queryFn:()=>listCalendarEvents(childId!,from,to),enabled:!!accountId&&!!childId,refetchInterval:30000,refetchIntervalInBackground:false});
 const {refetch}=query;
 useFocusEffect(useCallback(()=>{if(!accountId||!childId)return;void refetch();const sub=AppState.addEventListener("change",state=>{if(state==="active")void refetch();});return()=>sub.remove();},[accountId,childId,refetch]));
 return query;
}
