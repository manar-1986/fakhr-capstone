import { Alert, Linking, Platform } from "react-native";

/** Coerce API values (number, numeric string, etc.) to a finite number or null. */
export function toFiniteNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function normalizeExternalMapUrl(url: string): string {
  const t = url.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `https://${t}`;
}

export function isLikelyValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Pull ?query= or &q= from a Google Maps web URL to reuse in native map apps. */
export function extractQueryFromGoogleMapsUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("google.")) return null;
    const q = u.searchParams.get("query") ?? u.searchParams.get("q");
    if (q && q.trim()) return q.trim();
  } catch {
    /* ignore */
  }
  return null;
}

async function openFirstWorking(urls: string[]): Promise<boolean> {
  for (const url of urls) {
    if (!url) continue;
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

function buildSearchQuery(opts: {
  addressLine?: string | null;
  placeName?: string | null;
  mapUrl?: string | null;
}): string {
  const line = (opts.addressLine || "").trim();
  const name = (opts.placeName || "").trim();
  let q = line || name;
  const fromUrl = opts.mapUrl ? extractQueryFromGoogleMapsUrl(normalizeExternalMapUrl(opts.mapUrl)) : null;
  if (fromUrl) q = fromUrl;
  if (!q) return "";
  if (!q.toLowerCase().includes("kuwait")) {
    return `${q}, Kuwait`;
  }
  return q;
}

/**
 * Open Maps in the device map app (not an in-app browser tab — avoids blank WebView pages in Expo).
 * Android: geo: intents → Google Maps
 * iOS: Google Maps app scheme, then Apple Maps web URL
 */
export async function openInGoogleMaps(opts: {
  mapUrl?: string | null;
  latitude?: unknown;
  longitude?: unknown;
  addressLine?: string | null;
  placeName?: string | null;
}): Promise<void> {
  const lat = toFiniteNumber(opts.latitude);
  const lng = toFiniteNumber(opts.longitude);
  const label = ((opts.placeName || opts.addressLine || "Location") as string).trim();
  const searchQuery = buildSearchQuery({
    addressLine: opts.addressLine,
    placeName: opts.placeName,
    mapUrl: opts.mapUrl,
  });

  if (Platform.OS === "web") {
    const q = lat !== null && lng !== null ? `${lat},${lng}` : searchQuery;
    if (!q) return;
    const ok = await openFirstWorking([`https://www.google.com/maps?q=${encodeURIComponent(q)}`]);
    if (!ok) Alert.alert("Could not open maps");
    return;
  }

  // Coordinates → native pins first (most reliable)
  if (lat !== null && lng !== null) {
    const encLabel = encodeURIComponent(label || `${lat},${lng}`);
    const urls =
      Platform.OS === "android"
        ? [
            `geo:${lat},${lng}?q=${lat},${lng}(${encLabel})`,
            `https://maps.google.com/?q=${encodeURIComponent(`${lat},${lng}`)}`,
          ]
        : [
            `comgooglemaps://?q=${encodeURIComponent(`${lat},${lng}`)}`,
            `comgooglemaps://?center=${lat},${lng}&zoom=15`,
            `http://maps.apple.com/?ll=${lat},${lng}&q=${encLabel}`,
            `https://maps.google.com/?q=${encodeURIComponent(`${lat},${lng}`)}`,
          ];
    if (await openFirstWorking(urls)) return;
  }

  // Text search → native
  if (searchQuery) {
    const encQ = encodeURIComponent(searchQuery);
    const urls =
      Platform.OS === "android"
        ? [
            `geo:0,0?q=${encQ}`,
            `https://maps.google.com/?q=${encQ}`,
          ]
        : [
            `comgooglemaps://?q=${encQ}`,
            `http://maps.apple.com/?q=${encQ}`,
            `https://maps.google.com/?q=${encQ}`,
          ];
    if (await openFirstWorking(urls)) return;
  }

  // Last resort: open curated link in browser (may be blank in some WebViews)
  const curated = opts.mapUrl?.trim();
  if (curated) {
    const u = normalizeExternalMapUrl(curated);
    if (isLikelyValidHttpUrl(u) && (await openFirstWorking([u]))) return;
  }

  Alert.alert(
    "Could not open Maps",
    "Install Google Maps or use Apple Maps, then search for this address manually."
  );
}
