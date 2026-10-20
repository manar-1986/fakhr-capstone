import crypto from 'crypto';
import User from '../models/User.model';
import { RevokedToken } from '../models/AuthSecurity.model';
import { verifyToken } from './jwt';
const digest = (token:string) => crypto.createHash('sha256').update(token).digest('hex');
export async function revokeToken(token:string) {
 const payload=verifyToken(token);
 await RevokedToken.init();
 await RevokedToken.updateOne({_id:digest(token)},{$setOnInsert:{expiresAt:new Date(payload.exp * 1000)}},{upsert:true,writeConcern:{w:"majority"}});
}
export async function tokenRevoked(token:string) {return !!await RevokedToken.exists({_id:digest(token)});}
// Trusted administrative operation only; deliberately not exposed as a public route.
// Re-enabling an account must never decrement authVersion.
export async function disableAccount(userId:string) {
 return User.updateOne({_id:userId},{$set:{isDisabled:true},$inc:{authVersion:1}},{writeConcern:{w:"majority"}});
}
