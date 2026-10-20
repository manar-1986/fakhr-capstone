import * as storage from "./secureStorage";
const KEY = "welcome_completed_v1";
let completedThisSession = false;
export async function hasCompletedWelcome() {
  return completedThisSession || (await storage.getItemAsync(KEY)) === "1";
}
export async function completeWelcome() {
  completedThisSession = true;
  try { await storage.setItemAsync(KEY, "1"); } catch { /* Guest browsing remains available if device storage is blocked. */ }
}
