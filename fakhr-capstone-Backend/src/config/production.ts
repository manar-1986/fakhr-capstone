import { minimumRelease, releaseOrigins } from './releaseProfile';
import { allowedBrowserOrigins } from './browserSecurity';
import { isIP } from 'node:net';
import { trustedProxies } from './proxy';

type Environment = Record<string, string | undefined>;
function invalid(field: string): never { throw new Error(`Invalid production configuration: ${field}`); }
function required(raw: Environment, key: string): string {
 const value = raw[key];
 if (!value || value !== value.trim() || /[\r\n\0]/.test(value)) invalid(key);
 return value;
}
function localHost(host: string): boolean {
 const h = host.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
 return h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h === '::1' || h === '0.0.0.0' || /^127\./.test(h);
}
function dnsHost(host: string): boolean {
 return host.length <= 253 && host.includes('.') && host.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}

/** An approved web origin, never a caller-controlled redirect or reset token. */
export function resetOrigin(value: string, production: boolean): URL {
 try {
  if (!value || value !== value.trim() || /[\s\\\u0000-\u001f]/.test(value)) throw new Error();
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error();
  if (production && (url.protocol !== 'https:' || url.port || localHost(url.hostname) || isIP(url.hostname.replace(/^\[|\]$/g, '')) || !dnsHost(url.hostname))) throw new Error();
  return url;
 } catch { return invalid('FRONTEND_URL'); }
}
export function passwordResetUrl(base: string, token: string, production: boolean): string {
 if (!/^[a-f0-9]{64}$/i.test(token)) throw new Error('Invalid reset token');
 const url = new URL('/reset-password', resetOrigin(base, production));
 url.hash = new URLSearchParams({token}).toString();
 return url.toString();
}

function databaseUri(value: string): void {
 try {
  if (/[\s\u0000-\u001f\\]/.test(value)) throw new Error();
  const m = /^(mongodb(?:\+srv)?):\/\/([^/]+)\/([^?]+)(?:\?(.*))?$/.exec(value);
  if (!m || !/^[a-zA-Z0-9_-]+$/.test(m[3])) throw new Error();
  const at = m[2].lastIndexOf('@');
  if (at < 0) throw new Error();
  const credentials = m[2].slice(0, at).split(':');
  if (credentials.length !== 2 || credentials.some(v => !decodeURIComponent(v) || /[\r\n\0]/.test(decodeURIComponent(v)))) throw new Error();
  const hosts = m[2].slice(at + 1).split(',');
  if (!hosts.length || (m[1] === 'mongodb+srv' && hosts.length !== 1)) throw new Error();
  for (const host of hosts) {
   const u = new URL('http://' + host);
   if (u.username || u.password || u.pathname !== '/' || u.search || u.hash || localHost(u.hostname) || (!isIP(u.hostname.replace(/^\[|\]$/g, '')) && !dnsHost(u.hostname))) throw new Error();
   if (m[1] === 'mongodb+srv' && (u.port || isIP(u.hostname))) throw new Error();
  }
  const options = new Map<string, string>();
  for (const [k, v] of new URLSearchParams(m[4] || '')) {
   const key = k.toLowerCase();
   if (options.has(key)) throw new Error();
   options.set(key, v.toLowerCase());
  }
  for (const key of ['tlsinsecure', 'tlsallowinvalidcertificates', 'tlsallowinvalidhostnames']) if (options.has(key) && options.get(key) !== 'false') throw new Error();
  for (const key of ['tls', 'ssl']) if (options.has(key) && options.get(key) !== 'true') throw new Error();
  if (m[1] === 'mongodb' && options.get('tls') !== 'true' && options.get('ssl') !== 'true') throw new Error();
 } catch { invalid('MONGODB_URI'); }
}

/** No network access and no secret values in errors. Complete-profile reset email is required. */
export function validateProductionEnvironment(raw: Environment): void {
 if (raw.RENDER === 'true' && raw.NODE_ENV !== 'production') invalid('NODE_ENV');
 if (raw.NODE_ENV && !['production', 'development', 'test'].includes(raw.NODE_ENV)) invalid('NODE_ENV');
 const minimum = minimumRelease(raw);
 if (raw.NODE_ENV !== 'production') return;
 trustedProxies(raw);
 const secret = required(raw, 'JWT_SECRET');
 if (Buffer.byteLength(secret) < 32 || new Set(secret).size < 8 || /\s/.test(secret) || /changeme|replace.?me|example|synthetic|password|test.?secret/i.test(secret)) invalid('JWT_SECRET');
 databaseUri(required(raw, 'MONGODB_URI'));
 if (!minimum || raw.FRONTEND_URL !== undefined) resetOrigin(required(raw, 'FRONTEND_URL'), true);
 releaseOrigins(raw);
 if (raw.JWT_EXPIRES_IN && !/^[1-9]\d*(?:s|m|h|d)$/.test(raw.JWT_EXPIRES_IN)) invalid('JWT_EXPIRES_IN');
 if (raw.PORT && (!/^\d+$/.test(raw.PORT) || Number(raw.PORT) < 1 || Number(raw.PORT) > 65535)) invalid('PORT');
 if (!minimum) {
 const host = required(raw, 'EMAIL_HOST');
 if (localHost(host) || isIP(host) || !dnsHost(host)) invalid('EMAIL_HOST');
 const port = required(raw, 'EMAIL_PORT');
 const secure = required(raw, 'EMAIL_SECURE');
 if (!((port === '465' && secure === 'true') || (port === '587' && secure === 'false'))) invalid('EMAIL_PORT/EMAIL_SECURE');
 required(raw, 'EMAIL_USER');
 if (required(raw, 'EMAIL_PASS').length < 8) invalid('EMAIL_PASS');
 if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(required(raw, 'EMAIL_FROM'))) invalid('EMAIL_FROM');
 }
 if (raw.NODE_TLS_REJECT_UNAUTHORIZED === '0') invalid('NODE_TLS_REJECT_UNAUTHORIZED');
 if (raw.SEED_CARE_PATH && raw.SEED_CARE_PATH !== 'false') invalid('SEED_CARE_PATH');
 validateProductionAI(raw);
 if (raw.FAKHR_SUPPORT_LOCAL_TEST) invalid('FAKHR_SUPPORT_LOCAL_TEST');
}

/** Configuration only: the signed ledger and independent witness are verified before every dispatch. */
export function validateProductionAI(raw: Environment): void {
 if (raw.FAKHR_AI_ENABLED !== undefined && !['true','false'].includes(raw.FAKHR_AI_ENABLED)) invalid('FAKHR_AI_ENABLED');
 if (raw.FAKHR_AI_ACCESS !== undefined && !['off','pilot'].includes(raw.FAKHR_AI_ACCESS)) invalid('FAKHR_AI_ACCESS');
 if (raw.FAKHR_AI_RECOVERY_APPROVED) invalid('FAKHR_AI_RECOVERY_APPROVED');
 if (raw.FAKHR_AI_ENABLED !== 'true') return;
 if (raw.FAKHR_RELEASE_PROFILE !== 'minimum-plan' || raw.FAKHR_AI_ACCESS !== 'pilot') invalid('FAKHR_AI_ACCESS');
 const apiKey = required(raw,'FAKHR_AI_OPENAI_API_KEY');
 if (apiKey.length < 20 || /\s/.test(apiKey)) invalid('FAKHR_AI_OPENAI_API_KEY');
 for (const key of ['FAKHR_AI_LEDGER_ANCHOR','FAKHR_AI_LEDGER_SIGNING_KEY','FAKHR_AI_WITNESS_SIGNING_KEY']) {
  if (!/^[a-f0-9]{64}$/.test(required(raw,key))) invalid(key);
 }
 if (new Set([raw.FAKHR_AI_LEDGER_ANCHOR,raw.FAKHR_AI_LEDGER_SIGNING_KEY,raw.FAKHR_AI_WITNESS_SIGNING_KEY]).size !== 3) invalid('FAKHR_AI_SIGNING_KEYS');
 const witness=required(raw,'FAKHR_AI_WITNESS_URI');
 try { databaseUri(witness); } catch { invalid('FAKHR_AI_WITNESS_URI'); }
 const authority=(uri:string)=>uri.split('://')[1]?.split('/')[0]?.split('@').pop()?.toLowerCase();
 if (authority(witness)===authority(required(raw,'MONGODB_URI'))) invalid('FAKHR_AI_INDEPENDENT_WITNESS');
}

