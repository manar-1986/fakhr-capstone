import nodemailer from 'nodemailer';
import { env } from '../config/env';
describe('Patched reset-email transport', () => {

 let send: jest.SpyInstance; let mail: typeof import('../utils/email'); let options: any; let config: any; let transport: any;
 beforeEach(() => {
  jest.isolateModules(() => {
   const nm = require('nodemailer');
   config = require('../config/env').env;
   config.EMAIL_FROM = 'no-reply@example.invalid'; config.FRONTEND_URL = 'https://fakhr.example.invalid';
   transport = nm.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
   send = jest.spyOn(transport, 'sendMail');
   jest.spyOn(nm, 'createTransport').mockImplementation((o: any) => { options = o; return transport; });
   mail = require('../utils/email');
  });
 });
 it('composes a real MIME reset email without any external delivery', async () => {
  await mail.sendPasswordResetEmail('parent@example.invalid', 'a'.repeat(64));
  expect(options).toMatchObject({ requireTLS: true, disableFileAccess: true, disableUrlAccess: true, connectionTimeout: 10000, socketTimeout: 20000 });
  expect(options.tls).toEqual({minVersion:'TLSv1.2',rejectUnauthorized:true});
  const result: any = await send.mock.results[0].value;
  expect(result.envelope.to).toEqual(['parent@example.invalid']);
  const mime = result.message.toString().replace(/=\r?\n/g, '').replace(/=3D/g, '=');
  const composed = send.mock.calls[0][0] as any;
  expect(composed.subject).toContain('Fakhr Password Reset');
  expect(composed.html).toContain('إعادة تعيين كلمة المرور');
  expect(composed.html).toContain('dir="rtl"');
  expect(composed.html).toContain('dir="ltr"');
  expect(composed.html).toContain('#607DCB');
  expect(composed.text).toContain('1 hour');
  expect(composed.text).toContain('/reset-password#token=');
  expect(composed.html).not.toContain('?token=');
  expect(composed.html).not.toMatch(/<script|<img|tracking/i);
  expect(mime).toContain('a'.repeat(64));
  expect(mime).toContain('text/plain'); expect(mime).toContain('text/html');
 });
 it.each(['victim@example.invalid,other@example.invalid','victim@example.invalid\r\nBcc: other@example.invalid','x'.repeat(255)+'@example.invalid'])('rejects unsafe recipient input', async email => {
  await expect(mail.sendPasswordResetEmail(email, 'a'.repeat(64))).rejects.toThrow('Invalid reset email recipient');
  expect(send).not.toHaveBeenCalled();
 });
 it('rejects injected reset tokens', async () => {
  await expect(mail.sendPasswordResetEmail('parent@example.invalid', '\"><script>')).rejects.toThrow('Invalid reset token');
  expect(send).not.toHaveBeenCalled();
 });
 it('propagates delivery failure without logging SMTP details', async () => {
  send.mockRejectedValue(new Error('synthetic-private-smtp-detail'));
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  await expect(mail.sendPasswordResetEmail('parent@example.invalid', 'a'.repeat(64))).rejects.toThrow('Failed to send password reset email');
  expect(JSON.stringify(log.mock.calls)).not.toContain('synthetic-private-smtp-detail');
 });
 it('does not send a localhost reset link in production', async () => {
  config.NODE_ENV='production';config.FRONTEND_URL='http://localhost:3000';
  await expect(mail.sendPasswordResetEmail('parent@example.invalid','a'.repeat(64))).rejects.toThrow('FRONTEND_URL');
  expect(send).not.toHaveBeenCalled();
 });
 it('redacts failed SMTP/TLS verification for the startup gate', async () => {
  jest.spyOn(transport,'verify').mockRejectedValue(new Error('private-fixture-password and TLS details'));
  const log=jest.spyOn(console,'error').mockImplementation(()=>{});
  await expect(mail.verifyEmailConfig()).resolves.toBe(false);
  expect(log).toHaveBeenCalledWith('Email configuration verification failed');
  expect(JSON.stringify(log.mock.calls)).not.toContain('private-fixture-password');
 });
});
