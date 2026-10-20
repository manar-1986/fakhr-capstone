import {planActions} from '../../theme/planActions';
import { phoneIconColor } from "../ui/ContactIcon";
import React, { useState } from "react";
import { Linking, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../ui/AppText";
import { useI18nLayout } from "../../hooks/useI18nLayout";
import { colors } from "../../theme";
import { directoryPhoneUrl } from "../../utils/directoryCall";
import { v } from "./DoctorVisuals";

export default function DirectoryCallButton({ phone }: { phone?: string }) {
  const { isRTL } = useI18nLayout();
  const [failed, setFailed] = useState(false);
  const [webAttempt, setWebAttempt] = useState(false);
  const url = directoryPhoneUrl(phone);
  if (!url) return null;
  const label = isRTL ? "اتصال" : "Call";
  return <><Pressable accessibilityRole="link" accessibilityLabel={label}
    {...(Platform.OS === "web" ? { href: url } : {})}
    onPress={event => {
      event.stopPropagation();
      if (Platform.OS === "web") { setWebAttempt(true); return; }
      setFailed(false);
      void Linking.openURL(url).catch(() => setFailed(true));
    }}
    style={[v.outline, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
    <Ionicons name="call-outline" size={16} color={planActions.primary}/><Text style={v.link}>{label}</Text>
  </Pressable>
    {failed && <Text accessibilityRole="alert" style={v.secondary}>{isRTL ? "تعذر فتح تطبيق الاتصال على هذا الجهاز." : "Could not open a calling app on this device."}</Text>}
    {webAttempt && <Text accessibilityLiveRegion="polite" style={v.secondary}>{isRTL ? "إذا لم يفتح الاتصال، استخدم جهازاً يدعم المكالمات." : "If the dialer does not open, use a device with calling support."}</Text>}
  </>;
}
