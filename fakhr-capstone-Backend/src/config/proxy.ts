import { isIP } from 'node:net';
import type { Express } from 'express';

/** Explicit verified proxy networks only. Never infer trust from arbitrary headers or hop counts. */
export function trustedProxies(raw: Record<string, string | undefined>): string[] | false {
 const value = raw.TRUSTED_PROXY_CIDRS;
 if (!value) {
  if (raw.RENDER === 'true' && raw.NODE_ENV === 'production')
   throw new Error('Invalid production configuration: TRUSTED_PROXY_CIDRS');
  return false;
 }
 const entries = value.split(',');
 if (entries.length > 16 || entries.some(entry => {
  if (entry !== entry.trim()) return true;
  const parts = entry.split('/'), family = isIP(parts[0]);
  if (!family || parts.length !== 2 || !/^\d{1,3}$/.test(parts[1])) return true;
  const bits = Number(parts[1]);
  // No all-address, named private-network aliases, booleans, or numeric hop counts.
  return bits < (family === 4 ? 8 : 32) || bits > (family === 4 ? 32 : 128);
 })) throw new Error('Invalid production configuration: TRUSTED_PROXY_CIDRS');
 return entries;
}

export function configureProxy(app: Express, raw: Record<string, string | undefined>): void {
 app.set('trust proxy', trustedProxies(raw));
}

export function normalizedClientIp(value: string | undefined): string {
 if (!value || !isIP(value)) throw new Error('INVALID_CLIENT_IP');
 if (isIP(value) === 4) return value;
 // Canonical IPv6 prevents spelling variants producing separate rate-limit buckets.
 const canonical = new URL('http://[' + value + ']/').hostname.slice(1, -1);
 const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(canonical);
 if (mapped) {
  const a = parseInt(mapped[1], 16), b = parseInt(mapped[2], 16);
  return [a >> 8, a & 255, b >> 8, b & 255].join('.');
 }
 return canonical;
}
