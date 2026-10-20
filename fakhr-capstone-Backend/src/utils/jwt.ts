import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  [key: string]: any;
}

// Validate JWT_SECRET is set
if (!env.JWT_SECRET || env.JWT_SECRET.trim() === "") {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// Store validated secret - TypeScript will infer non-empty string
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN: StringValue = (env.JWT_EXPIRES_IN || "7d") as StringValue;

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(
    { ...payload, authVersion: payload.authVersion ?? 0, jti: crypto.randomUUID() },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const value = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JwtPayload;
    if (typeof value.userId !== "string" || !/^[a-f0-9]{24}$/i.test(value.userId) || !Number.isSafeInteger(value.authVersion) || value.authVersion < 0 || !Number.isSafeInteger(value.exp)) throw new Error("Invalid token claims");
    return value;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
