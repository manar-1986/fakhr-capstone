export const LOGOUT_PENDING = 'logout_pending';
let generation = 0;
let blocked = false;
export const sessionGeneration = () => generation;
export const sessionBlocked = () => blocked;
export function beginSignOut() { blocked = true; generation++; }
export function finishSignIn() { blocked = false; generation++; }
export type LogoutResult = {revoked: boolean; cleanupComplete: boolean};
export async function closeSession(deps: {
  revoke: () => Promise<unknown>; mark: () => Promise<unknown>;
  remove: (key: string) => Promise<unknown>; cancel: () => Promise<unknown>;
  clear: () => void; clearUser: () => void;
}): Promise<LogoutResult> {
  beginSignOut();
  let revoked = false;
  // Persist a tombstone so a failed token removal cannot resurrect a session on restart.
  let marked = false;
  try { await deps.mark(); marked = true; } catch { /* cleanup still required */ }
  try { await deps.revoke(); revoked = true; } catch (e) {
    revoked = (e as {status?:number})?.status === 401;
  } finally {
    const results = await Promise.allSettled([deps.cancel(), deps.remove('token'), deps.remove('user_profile_cache')]);
    deps.clear(); deps.clearUser();
    const cleanupComplete = results.every(r => r.status === 'fulfilled');
    // Keep the tombstone until a subsequent successful sign-in, including after successful cleanup.
    if (!marked && !cleanupComplete) return {revoked, cleanupComplete:false};
    return {revoked, cleanupComplete};
  }
}
