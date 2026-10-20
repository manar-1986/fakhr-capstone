import { minimumRelease } from '../config/releaseProfile';
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { passwordResetUrl } from '../config/production';

// Create transporter
const transporter = nodemailer.createTransport({
  disableFileAccess: true,
  disableUrlAccess: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  requireTLS: !env.EMAIL_SECURE, // STARTTLS required when not using implicit TLS
  secure: env.EMAIL_SECURE, // true for 465, false for other ports
  tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  if (minimumRelease()) throw new Error('Email delivery disabled');
  if (typeof email !== "string" || email.length > 254 || /[\r\n,;<>]/.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid reset email recipient");
  if (!/^[a-f0-9]{64}$/i.test(resetToken)) throw new Error("Invalid reset token");
  const resetUrl = passwordResetUrl(env.FRONTEND_URL, resetToken, env.NODE_ENV === 'production');

  const mailOptions = {
    from: `"Fakhr" <${env.EMAIL_FROM}>`,
    to: { address: email, name: "" },
    subject: "فخر | إعادة تعيين كلمة المرور — Fakhr Password Reset",
    html: `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background:#FFFFFF;color:#0B093B;font-family:Arial,sans-serif">
    <main style="max-width:480px;margin:auto;padding:24px;background:#EBF1FD;border-radius:20px">
    <h1>إعادة تعيين كلمة المرور</h1><p>طلبت إعادة تعيين كلمة المرور لحسابك في فخر.</p>
    <p>ينتهي هذا الرابط خلال ساعة واحدة ويمكن استخدامه مرة واحدة فقط. إذا لم تطلبه، فتجاهل هذه الرسالة.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:14px;background:#607DCB;color:#0B093B;border-radius:12px">إعادة تعيين كلمة المرور</a></p>
    <section lang="en" dir="ltr"><h2>Reset your Fakhr password</h2><p>You requested a password reset.</p>
    <p>This link expires in 1 hour and can be used once. If you did not request it, ignore this email.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:14px;background:#607DCB;color:#0B093B;border-radius:12px">Reset Password</a></p></section>
    <p dir="ltr" style="overflow-wrap:anywhere">${resetUrl}</p></main></body></html>`,
    text: `فخر — إعادة تعيين كلمة المرور
ينتهي الرابط خلال ساعة واحدة ويمكن استخدامه مرة واحدة. إذا لم تطلبه، فتجاهل هذه الرسالة.
${resetUrl}

Fakhr — Password Reset
This link expires in 1 hour and can be used once. If you did not request it, ignore this email.
${resetUrl}`,

  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Password reset delivery failed");
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Verify email transporter configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    if (await transporter.verify() !== true) throw new Error('SMTP verification unsuccessful');
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email configuration verification failed");
    return false;
  }
};
