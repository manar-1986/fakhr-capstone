import { RequestHandler } from 'express';
import { allowedBrowserOrigins } from './browserSecurity';
type Raw = Record<string,string|undefined>;
export function minimumRelease(raw:Raw=process.env):boolean {
 if(raw.FAKHR_RELEASE_PROFILE !== undefined && !['minimum','minimum-plan','complete'].includes(raw.FAKHR_RELEASE_PROFILE)) throw new Error('Invalid production configuration: FAKHR_RELEASE_PROFILE');
 return ['minimum','minimum-plan'].includes(raw.FAKHR_RELEASE_PROFILE ?? '');
}
export function releaseOrigins(raw:Raw):Set<string> {
 if(minimumRelease(raw) && raw.FRONTEND_URL === undefined && raw.CORS_ALLOWED_ORIGINS === undefined) return new Set();
 return allowedBrowserOrigins(raw.FRONTEND_URL || (raw.NODE_ENV === 'production' ? '' : 'http://localhost:3000'),raw.CORS_ALLOWED_ORIGINS,raw.NODE_ENV === 'production');
}
export const minimumUnavailable:RequestHandler=(req,res,next)=>{
 if(!minimumRelease()) { next(); return; }
 res.setHeader('Cache-Control','no-store');
 res.status(503).json({success:false,code:'FEATURE_DISABLED',error:'This feature is temporarily unavailable.',message:'This feature is temporarily unavailable.'});
};


