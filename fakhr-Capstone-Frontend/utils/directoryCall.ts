import type { Institution } from "../types/institution";
import { institutionPhoneUrl } from "./institutionDirectory";

export function directoryPhoneUrl(phone?: string): string | undefined {
  if (phone?.trim() === "18202") return "tel:18202"; // Supplied specialist short contact number.
  return phone ? institutionPhoneUrl(phone.trim()) : undefined;
}

/** Public primary contact only; never promote an unverified source observation. */
export function institutionPrimaryPhone(item: Institution): string | undefined {
  return [item.publicProfile?.phone, item.publicContact?.phone].find(phone => !!directoryPhoneUrl(phone));
}
