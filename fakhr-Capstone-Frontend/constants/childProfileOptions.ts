export const FOCUS_AREAS = [
  { id: "speech", labelKey: "editProfile.focusSpeech", icon: "volume-high-outline" as const },
  { id: "behavior", labelKey: "editProfile.focusBehavior", icon: "settings-outline" as const },
  { id: "sensory", labelKey: "editProfile.focusSensory", icon: "ear-outline" as const },
  { id: "motor", labelKey: "editProfile.focusMotor", icon: "walk-outline" as const },
] as const;

export const SUPPORT_GOALS = [
  { id: "comm", labelKey: "editProfile.goalCommunication" },
  { id: "school", labelKey: "editProfile.goalSchool" },
  { id: "social", labelKey: "editProfile.goalSocial" },
] as const;

export function asIdList(value?: string[] | string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function formatMMDDYYYY(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function parseStoredDate(value?: string | null): Date | null {
  if (!value) return null;
  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime()) && !/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(value.trim())) {
    return iso;
  }
  const parts = value.trim().split(/[/-]/).map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [a, b, y] = parts;
  if (a > 12) return new Date(y, b - 1, a);
  const date = new Date(y, a - 1, b);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ageFromDate(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}
