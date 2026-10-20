import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "./apiError";
import { isBlacklisted } from "../utils/tokenBlacklist";
import { tokenRevoked } from "../utils/sessionSecurity";
import User from "../models/User.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted (logged out)
    if (isBlacklisted(token)) {
      throw ApiError.unauthorized("Token has been invalidated. Please login again.");
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.isDisabled || decoded.authVersion !== (user.authVersion ?? 0) || await tokenRevoked(token)) {
      throw ApiError.unauthorized("User not found");
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      ...user.toObject(),
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized("Invalid token"));
    }
  }
};
