import request from 'supertest';
import {createApp} from '../application';
import User from '../models/User.model';
import {AuthLimit,RevokedToken} from '../models/AuthSecurity.model';
import {clearBlacklist} from '../utils/tokenBlacklist';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn(),verifyEmailConfig:jest.fn()}));
const previous=process.env.FAKHR_RELEASE_PROFILE;
beforeAll(()=>{process.env.FAKHR_RELEASE_PROFILE='minimum';});
afterAll(()=>{if(previous===undefined)delete process.env.FAKHR_RELEASE_PROFILE;else process.env.FAKHR_RELEASE_PROFILE=previous;});
it('preserves registration/login/profile/children/logout and persisted revocation in minimum mode',async()=>{
 const app=createApp(), credentials={email:'minimal-fixture@example.invalid',password:'synthetic-safe-password',name:'Synthetic'};
 const reg=await request(app).post('/api/auth/register').send(credentials).expect(201);
 const login=await request(app).post('/api/auth/login').send(credentials).expect(200);
 const token=login.body.data.token;expect(typeof token).toBe('string');
 await request(app).get('/api/users/me').auth(token,{type:'bearer'}).expect(200);
 await request(app).get('/api/children').auth(token,{type:'bearer'}).expect(200);
 await request(app).put('/api/users/'+reg.body.data.user.id).auth(token,{type:'bearer'}).send({name:'Synthetic renamed',email:credentials.email}).expect(200);
 await request(app).post('/api/auth/forgot-password').send({email:credentials.email}).expect(503);
 expect((await User.findOne({email:credentials.email}))?.resetPasswordToken).toBeFalsy();
 expect(await AuthLimit.countDocuments()).toBeGreaterThan(0);
 await request(app).post('/api/auth/logout').auth(token,{type:'bearer'}).expect(200);
 expect(await RevokedToken.countDocuments()).toBe(1);clearBlacklist();
 await request(app).get('/api/users/me').auth(token,{type:'bearer'}).expect(401);
});
it('fails closed on rate-store failure without creating a user',async()=>{
 const spy=jest.spyOn(AuthLimit,'findOneAndUpdate').mockRejectedValueOnce(new Error('synthetic failure'));
 try{await request(createApp()).post('/api/auth/register').send({email:'blocked@example.invalid',password:'synthetic-safe-password'}).expect(503);expect(await User.countDocuments()).toBe(0);}finally{spy.mockRestore();}
});
