import { RequestHandler } from 'express';
import cors from 'cors';
/** Exact origins only. No wildcard, suffix matching, credentials, paths or null origins. */
export function allowedBrowserOrigins(frontend: string, extra: string | undefined, production: boolean): Set<string> {
 const entries = [frontend, ...(extra === undefined ? [] : extra.split(','))];
 return new Set(entries.map(value => {
  try {
   if (!value || value !== value.trim()) throw new Error();
   const u = new URL(value);
   if (u.origin !== value && u.origin + '/' !== value) throw new Error();
   if (u.username || u.password || !['http:', 'https:'].includes(u.protocol)) throw new Error();
   if (production && (u.protocol !== 'https:' || u.port || !u.hostname.includes('.') || /^(localhost|127\.|0\.|\[)/i.test(u.hostname) || /\.(localhost|local)$/.test(u.hostname))) throw new Error();
   return u.origin;
  } catch { throw new Error('Invalid production configuration: CORS_ALLOWED_ORIGINS'); }
 }));
}
export function browserSecurity(origins: Set<string>): RequestHandler {
 const corsHandler = cors({origin: (origin, cb) => cb(null, !!origin && origins.has(origin)),
  credentials:false, methods:['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders:['Content-Type','Authorization'], maxAge:600});
 return (req,res,next) => {
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  if (req.path.startsWith('/api/auth')) res.setHeader('Cache-Control','no-store');
  res.vary('Origin');
  const origin=req.headers.origin;
  // Native clients commonly omit Origin. This is not an authentication bypass.
  if(origin !== undefined && !origins.has(origin)) { res.status(403).json({message:'Origin not allowed'}); return; }
  corsHandler(req,res,next);
 };
}
