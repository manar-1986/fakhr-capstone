import { Response, NextFunction } from "express";
import User from "../../models/User.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS, USER_ROLES } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";
import mongoose from "mongoose";

/**
 * Get current logged-in user's profile
 * GET /api/users/me
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:userId
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const { userId } = req.params;

    if (typeof userId !== "string" || !mongoose.isObjectIdOrHexString(userId)) {
      throw ApiError.badRequest("Invalid user ID format");
    }

    if (userId.toLowerCase() !== req.user.id) {
      throw ApiError.forbidden("You can only view your own profile");
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Users can only view their own profile
    if (user._id.toString() !== req.user.id) {
      throw ApiError.forbidden("You can only view your own profile");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/:userId
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const { userId } = req.params;
    const { name, email } = req.body;

    if (typeof userId !== "string" || !mongoose.isObjectIdOrHexString(userId)) {
      throw ApiError.badRequest("Invalid user ID format");
    }

    // Users can only update their own profile
    if (userId.toLowerCase() !== req.user.id) {
      throw ApiError.forbidden("You can only update your own profile");
    }

    // Validate input
    const updateData: { name?: string } = {};
    const currentUser = await User.findById(userId);
    if (!currentUser) throw ApiError.notFound("User not found");

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        throw ApiError.badRequest("Name must be a non-empty string");
      }
      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.includes("@")) {
        throw ApiError.badRequest("Invalid email format");
      }
      // Existing clients submit the unchanged email when editing their name.
      // Never write an email until reauthentication and verification are supported.
      if (email.toLowerCase().trim() !== currentUser.email.toLowerCase().trim()) {
        throw ApiError.forbidden("Email changes are disabled pending secure verification support");
      }
    }

    if (Object.keys(updateData).length === 0 && email === undefined) {
      throw ApiError.badRequest("No valid fields to update");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * DELETE /api/users/:userId
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const { userId } = req.params;

    if (typeof userId !== "string" || !mongoose.isObjectIdOrHexString(userId)) {
      throw ApiError.badRequest("Invalid user ID format");
    }

    // Users can only delete their own account
    if (userId.toLowerCase() !== req.user.id) {
      throw ApiError.forbidden("You can only delete your own account");
    }

    // Retention and related-record deletion are not approved yet. Fail closed.
    throw new ApiError(503, "Account deletion is unavailable pending privacy-policy approval");
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (optional - for admin use)
 * GET /api/users
 */
export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
      throw ApiError.forbidden("Administrator access required");
    }

    const users = await User.find().select("name email role createdAt updatedAt").sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        count: users.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
