import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import {consumeAIQuotas} from './ai.quotas';

// A separate switch is required in addition to the transport's default-off switch.
export function aiPilotEnabled(raw:NodeJS.ProcessEnv=process.env) {
 return raw.FAKHR_AI_ACCESS === 'pilot' && raw.FAKHR_AI_ENABLED === 'true';
}
export async function aiActivation(req:AuthRequest,res:Response,next:NextFunction) {
 res.setHeader('Cache-Control','no-store');
 if(!req.user?.id){res.status(401).json({success:false,code:'AUTH_REQUIRED'});return;}
 if(!aiPilotEnabled()){res.status(503).json({success:false,code:'FEATURE_DISABLED'});return;}
 // Reuse the persistent atomic authlimits counter, separate namespace, no raw account ID.
 // Three requests per 15 minutes per account; TTL is cleanup, not authorization.
 try {
  const result=await consumeAIQuotas(req.user.id);
  if(!result.allowed){res.setHeader('Retry-After',result.retryAfter);res.status(429).json({success:false,code:'AI_RATE_LIMITED'});return;}
  next();
 } catch {res.status(503).json({success:false,code:'AI_UNAVAILABLE'});}
}
