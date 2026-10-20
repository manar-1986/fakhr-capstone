import { Response, NextFunction } from "express";
import { ApiError } from "./apiError";
import { AuthRequest } from "./auth.middleware";

/**
 * Authorization middleware to check user roles
 * Usage: router.get("/admin", authenticate, authorize("admin"), controller)
 * Usage: router.get("/admin", authenticate, authorize("admin", "professional"), controller)
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    if (!req.user.role) {
      throw ApiError.forbidden("User role not found");
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required roles: ${roles.join(", ")}`
      );
    }

    next();
  };
};
