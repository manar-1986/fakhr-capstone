import { Request, Response, NextFunction } from "express";
import { ApiError } from "./apiError";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants";
import mongoose from "mongoose";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error with context
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: errors.join(", "),
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_ID,
    });
    return;
  }

  // Handle duplicate key error (MongoDB error code 11000)
  if ((err as any).code === 11000 || (err as any).codeName === "DuplicateKey") {
    const field = Object.keys((err as any).keyPattern || {})[0] || "field";
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: "Invalid or expired token",
    });
    return;
  }

  // Invalid JSON body (express.json) — was reported as Internal server error on POST /api/auth/login
  if (err instanceof SyntaxError && "body" in err) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: "Invalid JSON in request body",
    });
    return;
  }

  // Default error response
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES.INTERNAL_ERROR,
  });
};
