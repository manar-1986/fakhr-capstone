import nodemailer from 'nodemailer';
import {sendPasswordResetEmail} from '../utils/email';
// The mock is hoisted before transporter creation; no SMTP is contacted.
jest.mock('nodemailer',()=>({__esModule:true,default:{createTransport:jest.fn(()=>({sendMail:jest.fn(),verify:jest.fn()}))}}));
it('minimum profile refuses direct email delivery as defense in depth',async()=>{
 const old=process.env.FAKHR_RELEASE_PROFILE;process.env.FAKHR_RELEASE_PROFILE='minimum';
 try {await expect(sendPasswordResetEmail('fixture@example.invalid','a'.repeat(64))).rejects.toThrow('Email delivery disabled');
 const transport=(nodemailer.createTransport as jest.Mock).mock.results[0].value;expect(transport.sendMail).not.toHaveBeenCalled();}
 finally{if(old===undefined)delete process.env.FAKHR_RELEASE_PROFILE;else process.env.FAKHR_RELEASE_PROFILE=old;}
});
