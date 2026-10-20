import express from 'express';
import request from 'supertest';
import crypto from 'crypto';
import User from '../models/User.model';
import routes from '../modules/auth/auth.routes';
import users from '../modules/users/users.routes';
import {generateToken} from '../utils/jwt';
import {hashPassword} from '../utils/hash';
import {errorHandler} from '../middlewares/error.middleware';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn().mockResolvedValue(undefined)}));
const app=express();app.use(express.json());app.use('/api/auth',routes);app.use('/api/users',users);app.use(errorHandler);
async function fixture(expired=false){const token=crypto.randomBytes(32).toString('hex');const user=await User.create({email:'reset@example.invalid',password:await hashPassword('OldSynthetic123!'),resetPasswordToken:crypto.createHash('sha256').update(token).digest('hex'),resetPasswordExpires:new Date(Date.now()+(expired?-1000:3600000))});return {token,user};}
it('rejects expired token without changing password or revoking sessions',async()=>{const {token,user}=await fixture(true);await request(app).post('/api/auth/reset-password').send({token,password:'NewSynthetic123!'}).expect(400);const after=await User.findById(user.id);expect(after!.password).toBe(user.password);});
it.each(['bad','a'.repeat(63),['a'.repeat(64)],{token:'a'.repeat(64)}])('rejects malformed token without mutation',async token=>{await request(app).post('/api/auth/reset-password').send({token,password:'NewSynthetic123!'}).expect(400);expect(await User.countDocuments()).toBe(0);});
it('concurrent reset succeeds once, reused token fails and old session is revoked',async()=>{const {token,user}=await fixture();const session=generateToken({userId:user.id});const results=await Promise.all([1,2].map(()=>request(app).post('/api/auth/reset-password').send({token,password:'NewSynthetic123!'})));expect(results.map(r=>r.status).sort()).toEqual([200,400]);await request(app).post('/api/auth/reset-password').send({token,password:'OtherSynthetic123!'}).expect(400);await request(app).get('/api/users/me').auth(session,{type:'bearer'}).expect(401);const after=await User.findById(user.id);expect(after!.resetPasswordToken).toBeUndefined();expect(after!.authVersion).toBe(1);});
