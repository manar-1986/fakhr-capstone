import { findInstitution } from "./institutionDirectory";

/** Old bookmarks may include an unrelated backend ID and a local object. Prefer the
 * known local object's identity; never merge its name with that backend's details. */
export function legacyInstitutionId(id: string | undefined, raw: string | undefined, allowBackend = false): string {
  if (raw) {
    try {
      let parsed;
      try { parsed = JSON.parse(decodeURIComponent(raw)); } catch { parsed = JSON.parse(raw); }
      if (typeof parsed?.id === "string" && findInstitution(parsed.id)) return parsed.id;
    } catch { /* Malformed old links must not resolve to the first institution. */ }
    return "not-found";
  }
  if (findInstitution(id)) return id!;
  if (allowBackend && id && /^[a-f\d]{24}$/i.test(id)) return `backend:${id}`;
  return "not-found";
}
