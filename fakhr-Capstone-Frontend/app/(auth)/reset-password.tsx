import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, ActivityIndicator, View } from "react-native";
import PasswordRecoveryScreen from "../../components/screens/PasswordRecoveryScreen";
import { takeResetToken, clearResetToken } from "../../utils/resetEntry";
import { validResetToken } from "../../utils/passwordReset";
export default function ResetPassword() {
 const params=useLocalSearchParams<{token?:string|string[]}>(); const router=useRouter();
 const initialized=useRef(false); const [token,setToken]=useState<string|null>(null);
 // Keep static HTML and first hydration identical: no token in hydration diagnostics.
 useEffect(()=>{
  if(initialized.current) return;
  initialized.current=true;
  const entry=takeResetToken();
  setToken(entry ?? (validResetToken(params.token)?params.token:""));
  clearResetToken();
  if(Platform.OS!=="web" && params.token!==undefined) router.setParams({token:undefined});
 },[params.token,router]);
 if(token===null) return <View style={{flex:1,justifyContent:"center",backgroundColor:"#FFFFFF"}}><ActivityIndicator color="#607DCB" /></View>;
 return <PasswordRecoveryScreen reset token={token} />;
}
