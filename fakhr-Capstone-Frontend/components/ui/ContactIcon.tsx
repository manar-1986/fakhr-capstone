import React from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
export const phoneIconColor = "#E53935";
const instagram = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><radialGradient id="ig" cx="25%" cy="100%" r="110%"><stop offset="0" stop-color="#FFDC80"/><stop offset=".25" stop-color="#FCAF45"/><stop offset=".5" stop-color="#F56040"/><stop offset=".7" stop-color="#E1306C"/><stop offset=".9" stop-color="#C13584"/><stop offset="1" stop-color="#833AB4"/></radialGradient></defs><rect x="1" y="1" width="30" height="30" rx="8" fill="url(#ig)"/><rect x="7" y="7" width="18" height="18" rx="5" fill="none" stroke="white" stroke-width="2.4"/><circle cx="16" cy="16" r="4.5" fill="none" stroke="white" stroke-width="2.4"/><circle cx="22" cy="10" r="1.5" fill="white"/></svg>';
const maps = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><clipPath id="pin"><path d="M16 1C9.9 1 5 5.9 5 12c0 7.5 7 12 9.2 17.1.7 1.8 2.9 1.8 3.6 0C20 24 27 19.5 27 12 27 5.9 22.1 1 16 1Z"/></clipPath></defs><g clip-path="url(#pin)"><path fill="#34A853" d="M0 0h32v32H0z"/><path fill="#4285F4" d="M0 0h32v7L0 27z"/><path fill="#EA4335" d="M0 0h17L0 17z"/><path fill="#FBBC04" d="m0 17 9-9 7 7L0 31z"/><path fill="#1A73E8" d="m16 15 16-16v9L21 20z"/></g><circle cx="16" cy="12" r="4.3" fill="white"/></svg>';
const sources = { "logo-instagram": { uri: "data:image/svg+xml;utf8," + encodeURIComponent(instagram) }, "location-outline": { uri: "data:image/svg+xml;utf8," + encodeURIComponent(maps) } };
/** Decorative brand mark; the containing link supplies its accessible label. */
export function ContactIcon({ name, size = 20, color = colors.primary }: { name: React.ComponentProps<typeof Ionicons>["name"]; size?: number; color?: string }) {
 if (name === "logo-instagram" || name === "location-outline") return <Image testID={"contact-icon-" + name} source={sources[name]} contentFit="contain" accessible={false} style={{width:size,height:size,flexShrink:0}}/>;
 return <Ionicons name={name} size={size} color={name === "logo-whatsapp" ? "#25D366" : name === "call-outline" || name === "call" ? phoneIconColor : color} accessible={false}/>;
}
export const whatsappButtonSurface = { backgroundColor: "#FFFFFF" } as const;
