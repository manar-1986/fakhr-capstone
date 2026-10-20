export const AI_PILOT_UI = process.env.EXPO_PUBLIC_FAKHR_AI_ACCESS === 'pilot';
// This artifact targets the reviewed minimum backend. Enabling features requires a new release.
export const MINIMUM_RELEASE = true;
export const PLAN_CANDIDATE = process.env.EXPO_PUBLIC_FAKHR_RELEASE_PROFILE === 'minimum-plan' || (__DEV__ && process.env.EXPO_PUBLIC_SMART_PLAN_PREVIEW === 'true');
export const PRODUCTION_API = 'https://fakhrcapstone-36gs.onrender.com/api';
export const unavailableText = (ar: boolean) => ar ? 'هذه الميزة غير متاحة حالياً.' : 'This feature is currently unavailable.';
const cleanPath = (path: string) => path.replace(/\/\([^/]+\)/g, '').split(/[?#]/)[0].replace(/\/+$/, '') || '/';
export function unavailableRoute(path: string): boolean {
  const p = cleanPath(path);
  if(AI_PILOT_UI && p === '/directory/helpCenter')return false;
  if (PLAN_CANDIDATE && ['/plan','/generate-plan'].some(x=>p===x||p.startsWith(x+'/'))) return false;
  return ['/plan','/bookings','/favorites','/messages','/community','/calendar','/directory/helpCenter','/directory/booking','/profile/help-support','/forgot-password','/reset-password','/generate-plan','/delete-account'].some(x => p === x || p.startsWith(x + '/'));
}
export function unavailableApi(path: string, method = 'get'): boolean {
  const p = cleanPath(path).replace(/^\/api(?=\/)/, '');
  if(AI_PILOT_UI && p === '/ai/ask' && method.toLowerCase() === 'post')return false;
  if (PLAN_CANDIDATE && ['/care-paths','/care-path-tasks'].some(x=>p===x||p.startsWith(x+'/'))) return false;
  return ['/calendar-events','/favorites','/support','/ai','/care-paths','/care-path-tasks','/community','/help-center','/auth/forgot-password','/auth/reset-password','/auth/delete-account'].some(x => p === x || p.startsWith(x + '/')) ||
    (!['get','head','options'].includes(method.toLowerCase()) && ['/directory','/centers','/services'].some(x => p === x || p.startsWith(x + '/'))) ||
    (method.toLowerCase() === 'delete' && p.startsWith('/users/'));
}
export function releaseApiUrl(isDev: boolean, explicit?: string): string | undefined {
  if (isDev) return undefined;
  if (explicit && explicit.trim().replace(/\/+$/, '') !== PRODUCTION_API) throw new Error('Invalid production API configuration');
  return PRODUCTION_API;
}
export type ApiFailure = Error & {status?: number; code?: string; retryAfterSeconds?: number};
export function retryAfterSeconds(value: unknown, now = Date.now()): number | undefined {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  const seconds = /^\d+$/.test(text) ? Number(text) : (Date.parse(text) - now) / 1000;
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
}
export function featureDisabled(): ApiFailure {
  return Object.assign(new Error(unavailableText(false) + ' / ' + unavailableText(true)), {status:503, code:'FEATURE_DISABLED'});
}
export function retryQuery(count: number, error: ApiFailure): boolean {
  // No automatic retries for rate limits or intentionally disabled operations.
  return ![401,403,429].includes(error.status ?? 0) && error.code !== 'FEATURE_DISABLED' && error.retryAfterSeconds === undefined && count < 2;
}
export function requireGeneratedPlan<T extends {week: number; tasks: unknown[]}>(plan: T | null | undefined): T {
  if (!plan || !Number.isFinite(plan.week) || !Array.isArray(plan.tasks)) throw new Error('Plan generation was not confirmed / لم يتم تأكيد إنشاء الخطة');
  return plan;
}
