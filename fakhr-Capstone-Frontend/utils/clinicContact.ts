import type { Professional } from "../types/directory.types";

/** Only stored clinic addresses/pins are used, never a doctor's city or name alone. */
export function clinicContact(p: Professional) {
  const ownLocation = Boolean(p.addressAr?.trim() || p.addressEn?.trim() || p.mapUrl?.trim() || p.latitude != null || p.longitude != null);
  const addressAr = ownLocation ? p.addressAr : p.centerAddressAr;
  const addressEn = ownLocation ? p.addressEn : p.centerAddressEn;
  const address = ownLocation ? undefined : p.centerAddress;
  const latitude = ownLocation ? p.latitude : p.centerLatitude;
  const longitude = ownLocation ? p.longitude : p.centerLongitude;
  const storedMapUrl = (ownLocation ? p.mapUrl : p.centerMapUrl)?.trim();
  const validPin = typeof latitude === "number" && Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
    typeof longitude === "number" && Number.isFinite(longitude) && Math.abs(longitude) <= 180;
  const query = validPin ? `${latitude},${longitude}` : addressEn?.trim() || addressAr?.trim() || address?.trim();
  const mapUrl = storedMapUrl && /^https?:\/\//i.test(storedMapUrl)
    ? storedMapUrl
    : query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : undefined;
  const phone = p.phone?.trim() || p.centerPhone?.trim();
  const dialNumber = phone?.replace(/[\s().-]/g, "");
  const telUrl = dialNumber && /^\+?\d+$/.test(dialNumber) ? `tel:${dialNumber}` : undefined;
  return { addressAr, addressEn, address, phone, telUrl, mapUrl, latitude: validPin ? latitude : undefined, longitude: validPin ? longitude : undefined };
}
