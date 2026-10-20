import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./AppText";
import { statusColors } from "../../theme/controls";
import { typography } from "../../theme/typography";
import { useI18nLayout } from "../../hooks/useI18nLayout";
const labels = {
 confirmed: ["حجز مؤكد", "Confirmed Booking", "checkmark-circle"],
 pending: ["بانتظار التأكيد", "Pending Confirmation", "time-outline"],
 cancelled: ["حجز ملغي", "Cancelled Booking", "close-circle-outline"],
 suggested: ["نشاط مقترح", "Suggested Activity", "sparkles-outline"],
} as const;
/** Unknown/missing states must never imply provider confirmation. */
export function StatusBadge({ status }: { status?: string }) {
 const { isRTL } = useI18nLayout();
 if (!status || !Object.prototype.hasOwnProperty.call(labels, status)) return null;
 const key = status as keyof typeof labels;
 const [ar, en, icon] = labels[key]; const color = statusColors[key];
 return <View accessibilityLabel={isRTL ? ar : en} style={{ alignSelf: isRTL ? "flex-end" : "flex-start", flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: color.background }}>
 <Ionicons name={icon} size={18} color={color.foreground}/><Text style={{ flexShrink: 1, color: color.foreground, fontSize: typography.helper, fontWeight: typography.weightMedium, textAlign: isRTL ? "right" : "left" }}>{isRTL ? ar : en}</Text></View>;
}
