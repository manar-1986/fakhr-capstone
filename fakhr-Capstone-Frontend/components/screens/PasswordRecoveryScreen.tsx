import React, { useRef, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, View, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { Text, TextInput, ScrollView } from "../ui/AppText";
import { changeAppLanguage } from "../../i18n";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { forgotPassword, resetPassword } from "../../api/auth.api";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors, radius, spacing, typography } from "../../theme";
import { controls } from "../../theme/controls";
import { validResetToken, validNewPassword, resetErrorKind } from "../../utils/passwordReset";
import { clearResetToken } from "../../utils/resetEntry";
const copy = {
 en: { reset:"Reset Password", forgot:"Forgot Password", intro:"Choose a new password for your Fakhr account.", forgotIntro:"Enter your email to request a password-reset link.", email:"Email address", password:"New password", confirm:"Confirm password", hint:"Use at least 6 characters (maximum 72 UTF-8 bytes).", submit:"Reset Password", send:"Send Reset Link", sent:"If this email is registered, a reset link will be sent. Check your inbox and spam folder.", success:"Your password has been reset. Sign in again with your new password.", expired:"This reset link is invalid, expired, or already used. Request a new link.", limited:"Too many requests. Please wait before trying again.", network:"We could not complete the request. Check your connection and try again.", mismatch:"Passwords do not match.", invalidPassword:"Enter at least 6 characters and no more than 72 UTF-8 bytes.", invalidEmail:"Enter a valid email address.", login:"Return to Login", request:"Request a new link", show:"Show passwords", hide:"Hide passwords" },
 ar: { reset:"إعادة تعيين كلمة المرور", forgot:"نسيت كلمة المرور", intro:"اختر كلمة مرور جديدة لحسابك في فخر.", forgotIntro:"أدخل بريدك الإلكتروني لطلب رابط إعادة تعيين كلمة المرور.", email:"البريد الإلكتروني", password:"كلمة المرور الجديدة", confirm:"تأكيد كلمة المرور", hint:"استخدم 6 أحرف على الأقل (بحد أقصى 72 بايت بترميز UTF-8).", submit:"إعادة تعيين كلمة المرور", send:"إرسال رابط الاستعادة", sent:"إذا كان البريد مسجلاً، فسيتم إرسال رابط الاستعادة. تحقق من صندوق الوارد والبريد غير المرغوب فيه.", success:"تم تغيير كلمة المرور. سجّل الدخول مجدداً بكلمة المرور الجديدة.", expired:"رابط الاستعادة غير صالح أو منتهي الصلاحية أو مستخدم. اطلب رابطاً جديداً.", limited:"طلبات كثيرة. يرجى الانتظار قبل المحاولة مجدداً.", network:"تعذر إكمال الطلب. تحقق من الاتصال وحاول مجدداً.", mismatch:"كلمتا المرور غير متطابقتين.", invalidPassword:"أدخل 6 أحرف على الأقل ولا تتجاوز 72 بايت بترميز UTF-8.", invalidEmail:"أدخل بريداً إلكترونياً صالحاً.", login:"العودة لتسجيل الدخول", request:"طلب رابط جديد", show:"إظهار كلمات المرور", hide:"إخفاء كلمات المرور" }
};
export default function PasswordRecoveryScreen({ token, reset = false }: { token?: string; reset?: boolean }) {
 const router = useRouter(); const { isRTL, initialized } = useI18nLayout();
 // Follow asynchronous preference hydration until the user explicitly switches.
 const [chosenArabic, setArabic] = useState<boolean | null>(null);
 const arabic = chosenArabic ?? isRTL; const t = copy[arabic ? "ar" : "en"];
 const secret = useRef(token); const busy = useRef(false);
 const [email,setEmail] = useState(""); const [password,setPassword] = useState(""); const [confirmation,setConfirmation] = useState("");
 const [visible,setVisible] = useState(false); const [pending,setPending] = useState(false); const [done,setDone] = useState(false);
 const [error,setError] = useState<keyof typeof t | null>(null);
 const invalid = reset && !validResetToken(secret.current) && !done;
 const textDirection = { textAlign: arabic ? "right" as const : "left" as const, writingDirection: arabic ? "rtl" as const : "ltr" as const };
 const submit = async () => {
  if (busy.current || done || invalid) return;
  if (reset && !validNewPassword(password)) { setError("invalidPassword"); return; }
  if (reset && password !== confirmation) { setError("mismatch"); return; }
  if (!reset && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254)) { setError("invalidEmail"); return; }
  busy.current=true;setPending(true);setError(null);
  try {
   if (reset) await resetPassword({token:secret.current!,password}); else await forgotPassword({email:email.trim()});
   clearResetToken();secret.current=undefined;setPassword("");setConfirmation("");setDone(true);
  } catch (e) { setError(!reset && (e as {status?:number})?.status===400 ? "invalidEmail" : resetErrorKind(e)); }
  finally {busy.current=false;setPending(false);}
 };
 if (initialized === false) return <View style={s.page}><ActivityIndicator color={colors.primary} /></View>;
 return <SafeAreaView style={s.page} edges={["bottom"]}><KeyboardAvoidingView style={s.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
 <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled"><View testID="recovery-card" style={s.card}>
 <Image accessibilityLabel="Fakhr" source={require("../../assets/images/fakhr-wordmark-blue-transparent.png")} style={s.logo} resizeMode="contain" />
 <Pressable accessibilityRole="button" accessibilityLabel={arabic ? "English" : "العربية"} onPress={()=>{setArabic(!arabic);void changeAppLanguage(arabic ? "en" : "ar", false);}} style={s.link}><Text style={s.linkText}>{arabic ? "English" : "العربية"}</Text></Pressable>
 <Text accessibilityRole="header" style={[s.title,textDirection]}>{reset ? t.reset : t.forgot}</Text>
 <Text style={[s.description,textDirection]}>{reset ? t.intro : t.forgotIntro}</Text>
 {(done || invalid || error) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.message,textDirection]}>{done ? reset ? t.success : t.sent : invalid ? t.expired : t[error!]}</Text>}
 {!done && !invalid && <>
 {!reset ? <><Text style={[s.label,textDirection]}>{t.email}</Text><TextInput accessibilityLabel={t.email} style={s.input} autoComplete="email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} editable={!pending} /></> : <>
 <Text style={[s.label,textDirection]}>{t.password}</Text><TextInput accessibilityLabel={t.password} style={[s.input,textDirection]} autoComplete="new-password" secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} value={password} onChangeText={setPassword} editable={!pending} />
 <Text style={[s.label,textDirection]}>{t.confirm}</Text><TextInput accessibilityLabel={t.confirm} style={[s.input,textDirection]} autoComplete="new-password" secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false} value={confirmation} onChangeText={setConfirmation} editable={!pending} />
 <Text style={[s.description,textDirection]}>{t.hint}</Text><Pressable accessibilityRole="button" onPress={()=>setVisible(!visible)} style={s.link}><Text style={s.linkText}>{visible ? t.hide : t.show}</Text></Pressable>
 </>}
 <Pressable accessibilityRole="button" accessibilityLabel={reset ? t.submit : t.send} accessibilityState={{disabled:pending,busy:pending}} disabled={pending} onPress={submit} style={[s.button, reset && controls.primary]}>{pending ? <ActivityIndicator color={colors.text} /> : <Text style={[s.buttonText, reset && {color:colors.text}]}>{reset ? t.submit : t.send}</Text>}</Pressable>
 </>}
 {reset && !done && <Pressable accessibilityRole="link" style={s.link} onPress={()=>router.replace("/(auth)/forgot-password")}><Text style={s.linkText}>{t.request}</Text></Pressable>}
 {(reset || done) && <Pressable accessibilityRole="link" style={s.link} onPress={()=>router.replace("/(auth)/login")}><Text style={s.linkText}>{t.login}</Text></Pressable>}
 </View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const s=StyleSheet.create({
 page:{flex:1,backgroundColor:"#FFFFFF"},scroll:{flexGrow:1,padding:spacing.lg,justifyContent:"center",alignItems:"center"},
 card:{width:"100%",maxWidth:480,backgroundColor:"#EBF1FD",borderRadius:radius.lg,padding:spacing.lg,gap:12,borderWidth:1,borderColor:colors.border},
 logo:{width:100,height:64,alignSelf:"center"},title:{fontSize:typography.title,fontWeight:"600",color:"#0B093B"},description:{fontSize:typography.body,color:"#5E6486"},
 label:{fontSize:typography.body,color:"#0B093B"},input:{minHeight:48,backgroundColor:"#FFFFFF",borderWidth:1,borderColor:colors.border,borderRadius:radius.md,padding:12,color:"#0B093B",fontSize:typography.body},
 button:{minHeight:48,backgroundColor:"#607DCB",borderRadius:radius.md,padding:12,justifyContent:"center",alignItems:"center"},buttonText:{color:"#0B093B",fontSize:typography.button,fontWeight:"600",textAlign:"center"},
 link:{minHeight:44,justifyContent:"center",alignItems:"center"},linkText:{color:"#0B093B",fontSize:typography.body,textAlign:"center"},message:{color:"#0B093B",fontSize:typography.body}
});
