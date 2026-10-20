import { MINIMUM_RELEASE } from '../utils/minimumRelease';
import {useQuery,useMutation,useQueryClient} from "@tanstack/react-query";
import {useCallback} from "react";
import {useFocusEffect} from "expo-router";
import {useAuth} from "../context/AuthContext";
import {listFavorites,saveFavorite,removeFavorite,FavoriteKey} from "../api/favorites.api";
export function useFavorites(){
 const {user}=useAuth(),client=useQueryClient();
 const key=["favorites",user?.id];
 const query=useQuery({queryKey:key,queryFn:listFavorites,enabled:!!user&&!MINIMUM_RELEASE,gcTime:0,retry:false});
 useFocusEffect(useCallback(()=>{if(user&&!MINIMUM_RELEASE)void query.refetch();},[user?.id,query.refetch]));
 const mutation=useMutation({mutationFn:async(input:FavoriteKey & {saved:boolean})=>{if(!user)throw new Error("Login required"); const identity={kind:input.kind,targetId:input.targetId}; if(input.saved)await removeFavorite(identity);else await saveFavorite(identity);},onSuccess:()=>client.invalidateQueries({queryKey:key}),retry:false});
 return {...query,mutation,user};
}
