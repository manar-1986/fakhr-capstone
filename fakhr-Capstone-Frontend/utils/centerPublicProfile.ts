import type { HealthCenter } from "../types/directory.types";
import type { Institution } from "../types/institution";

type Profile = NonNullable<Institution["publicProfile"]>;
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const digits = (value: string) => value.replace(/[٠-٩]/g, c => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)))
  .replace(/[۰-۹]/g, c => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));

export function centerPhone(value: unknown): string | undefined {
  const phone = digits(typeof value === "number" ? String(value) : clean(value)).replace(/[\s()-]/g, "");
  return /^(?:\+965)?[1-9]\d{7}$/.test(phone) || /^(?:\+965)?1\d{6}$/.test(phone) ? phone : undefined;
}

export function centerWebUrl(value: unknown, kind: "website" | "maps" | "instagram" = "website"): string | undefined {
  try {
    const url = new URL(clean(value));
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return;
    const host = url.hostname.toLowerCase();
    if (kind === "instagram" && !["instagram.com", "www.instagram.com"].includes(host)) return;
    if (kind === "maps" && !(host === "maps.app.goo.gl" || host === "maps.google.com" ||
      (["google.com", "www.google.com"].includes(host) && url.pathname.startsWith("/maps")))) return;
    return url.href;
  } catch { return; }
}

export function centerWhatsApp(value: unknown, explicitUrl?: unknown): Profile["whatsapp"] {
  const object = value && typeof value === "object" ? value as { phone?: unknown; url?: unknown } : undefined;
  const input = clean(explicitUrl) || clean(object?.url) || (/^https?:/i.test(clean(value)) ? clean(value) : "");
  let phone = centerPhone(object?.phone ?? (input === clean(value) ? undefined : value));
  if (input) {
    try {
      const url = new URL(input);
      if (url.protocol !== "https:" || url.username || url.password) return;
      if (url.hostname === "wa.me" && /^\/message\/[A-Za-z0-9]+$/.test(url.pathname) && !url.search && !url.hash) return { url: url.href };
      if (url.hostname === "wa.link" && /^\/[A-Za-z0-9]{6}$/.test(url.pathname) && !url.search && !url.hash) return { url: url.href };
      const number = url.hostname === "wa.me" ? url.pathname.slice(1) :
        ["api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname) && ["/send", "/send/"].includes(url.pathname) ? url.searchParams.get("phone") : null;
      if (!number || !/^\+?[1-9]\d{7,14}$/.test(number)) return;
      // The published URL determines the destination; never display a different number.
      const target = number.replace(/^\+/, "");
      phone = target.startsWith("965") && target.length === 11 ? target.slice(3) : `+${target}`;
      return { phone, url: `https://wa.me/${target}` };
    } catch { return; }
  }
  if (phone && /^(?:\+965)?[1-9]\d{7}$/.test(phone)) return { phone, url: `https://wa.me/${phone.startsWith("+") ? phone.slice(1) : "965" + phone}` };
}

export function validCenterRating(rating: Profile["rating"]): Profile["rating"] {
  if (!rating || !Number.isFinite(rating.value) || rating.value < 1 || rating.value > 5 ||
    !clean(rating.evidence) || !clean(rating.verifiedAt) || !Number.isFinite(Date.parse(rating.verifiedAt))) return;
  return { ...rating, count: Number.isInteger(rating.count) && rating.count! > 0 ? rating.count : undefined };
}

/** Map public API fields once. Historical PDF observations are deliberately not a fallback. */
export function centerApiPublicProfile(center: HealthCenter): Profile {
  const address = clean(center.address);
  const rating = validCenterRating(center.ratingVerification && {
    value: center.rating!, count: center.reviewCount,
    verifiedAt: center.ratingVerification.verifiedAt, evidence: center.ratingVerification.evidence,
  });
  const profile: Profile = {
    phone: centerPhone(center.phone),
    whatsapp: centerWhatsApp(center.whatsapp ?? center.whatsappNumber, center.whatsappUrl),
    address: address && !/\b(verify|seeded|see .+page)\b/i.test(address) ? { ar: address, en: address } : undefined,
    mapUrl: centerWebUrl(center.googleMapsUrl, "maps") || centerWebUrl(center.mapUrl, "maps"),
    website: centerWebUrl(center.website), instagram: centerWebUrl(center.instagram, "instagram"), rating,
  };
  return Object.fromEntries(Object.entries(profile).filter(([, value]) => value !== undefined)) as Profile;
}
