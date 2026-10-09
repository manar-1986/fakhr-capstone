import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "../../models/User.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS, USER_ROLES } from "../../config/constants";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { addToBlacklist } from "../../utils/tokenBlacklist";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { sendPasswordResetEmail } from "../../utils/email";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("=== Register Request Started ===");
    console.log("Request Body:", { 
      name: req.body?.name ? "provided" : "missing",
      email: req.body?.email ? "provided" : "missing",
      password: req.body?.password ? "***hidden***" : "missing"
    });

    const { name, email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("Validation Error: Email or password missing");
      throw ApiError.badRequest("Email and password are required");
    }

    if (typeof email !== "string" || typeof password !== "string") {
      console.log("Validation Error: Email or password not strings");
      throw ApiError.badRequest("Email and password must be strings");
    }

    if (password.length < 6) {
      console.log("Validation Error: Password too short");
      throw ApiError.badRequest("Password must be at least 6 characters");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation Error: Invalid email format", email);
      throw ApiError.badRequest("Invalid email format");
    }

    console.log("Checking if user exists...");
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log("Error: User already exists with email:", email);
      throw ApiError.conflict("Email already exists");
    }

    console.log("Hashing password...");
    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log("Password hashed successfully");

    console.log("Creating user in database...");
    // Create user with default role (parent)
    const user = await User.create({
      name: name?.trim() || undefined,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: USER_ROLES.PARENT, // Default role for new users
    });
    console.log("User created successfully:", { id: user._id.toString(), email: user.email });

    console.log("Generating JWT token...");
    // Generate token
    const token = generateToken({ userId: user._id.toString() });
    console.log("Token generated successfully");

    console.log("=== Register Request Completed Successfully ===");
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("=== Register Request Failed ===");
    console.error("Error Type:", error?.constructor?.name);
    console.error("Error Message:", error instanceof Error ? error.message : String(error));
    console.error("Error Stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Log specific error details
    if (error instanceof ApiError) {
      console.error("ApiError - Status Code:", error.statusCode);
    }
    
    if ((error as any).code === 11000) {
      console.error("MongoDB Duplicate Key Error - Key Pattern:", (error as any).keyPattern);
    }
    
    if (error instanceof mongoose.Error) {
      console.error("Mongoose Error - Name:", error.name);
      if (error instanceof mongoose.Error.ValidationError) {
        console.error("Validation Errors:", Object.keys(error.errors));
      }
    }
    
    console.error("=== End Error Details ===");
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw ApiError.badRequest("Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Generate token
    const token = generateToken({ userId: user._id.toString() });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user - invalidates the token by adding it to blacklist
 * POST /api/auth/logout
 * Requires authentication
 */
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);

    // Add token to blacklist to invalidate it
    addToBlacklist(token);

    console.log("User logged out successfully:", {
      userId: req.user.id,
      email: req.user.email,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: "Logged out successfully. Token has been invalidated.",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - generate reset token and send email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      throw ApiError.badRequest("Email is required");
    }

    if (typeof email !== "string") {
      throw ApiError.badRequest("Email must be a string");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw ApiError.badRequest("Invalid email format");
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          message: "If the email exists, a password reset link has been sent.",
        },
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token expiration (1 hour from now)
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    // Save reset token to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log("Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Still return success to user (don't reveal email service issues)
      // But log the error for admin review
      // In development, still return token for testing
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode - Token:", resetToken);
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: "If the email exists, a password reset link has been sent.",
        // Only return token in development for testing
        ...(process.env.NODE_ENV === "development" && {
          resetToken: resetToken,
          resetLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using reset token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      throw ApiError.badRequest("Token and password are required");
    }

    if (typeof password !== "string" || password.length < 6) {
      throw ApiError.badRequest("Password must be at least 6 characters");
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("Password reset successfully:", {
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: "Password has been reset successfully. You can now login with your new password.",
      },
    });
  } catch (error) {
    next(error);
  }
};
