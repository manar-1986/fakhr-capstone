import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User from "../../models/User.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS, USER_ROLES } from "../../config/constants";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateToken } from "../../utils/jwt";
import { revokeToken } from "../../utils/sessionSecurity";
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

    const { name, email, password } = req.body;

    // Validate input
    if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || Buffer.byteLength(password) > 72 || !email || !password) {

      throw ApiError.badRequest("Email and password are required");
    }

    if (typeof email !== "string" || typeof password !== "string") {

      throw ApiError.badRequest("Email and password must be strings");
    }

    if (password.length < 6) {

      throw ApiError.badRequest("Password must be at least 6 characters");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {

      throw ApiError.badRequest("Invalid email format");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {

      throw ApiError.conflict("Email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default role (parent)
    const user = await User.create({
      name: name?.trim() || undefined,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: USER_ROLES.PARENT, // Default role for new users
    });

    // Generate token
    const token = generateToken({ userId: user._id.toString(), authVersion: user.authVersion ?? 0 });

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
    if (!user || user.isDisabled) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Generate token
    const token = generateToken({ userId: user._id.toString(), authVersion: user.authVersion ?? 0 });

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
    await revokeToken(token);

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

    if (typeof email !== "string" || email.length > 254) {
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
    if (!user || user.isDisabled) {
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

    } catch (emailError) {

      // Still return success to user (don't reveal email service issues)
      // But log the error for admin review
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: "If the email exists, a password reset link has been sent.",
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
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token) || !password) {
      throw ApiError.badRequest("Token and password are required");
    }

    if (typeof password !== "string" || Buffer.byteLength(password) > 72 || password.length < 6) {
      throw ApiError.badRequest("Password must be at least 6 characters");
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      isDisabled: { $ne: true },
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Consume the reset token and invalidate all old sessions atomically.
    const updated = await User.findOneAndUpdate({ _id: user._id, isDisabled: { $ne: true }, resetPasswordToken: resetTokenHash, resetPasswordExpires: { $gt: new Date() } }, { $set: { password: hashedPassword }, $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }, $inc: { authVersion: 1 } }, { writeConcern: { w: "majority" } });
    if (!updated) throw ApiError.badRequest("Invalid or expired reset token");

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

/**
 * Account deletion is blocked pending approved retention and deletion policy
 * DELETE /api/auth/delete-account
 * Requires authentication
 */
export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    throw new ApiError(503, "Account deletion is unavailable pending privacy-policy approval");
  } catch (error) {
    next(error);
  }
};