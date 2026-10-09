import { Response, NextFunction } from "express";
import User from "../../models/User.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";
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

    if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
      throw ApiError.badRequest("Invalid user ID format");
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

    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const { name, email } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw ApiError.badRequest("Invalid user ID format");
    }

    // Users can only update their own profile
    if (userId !== req.user.id) {
      throw ApiError.forbidden("You can only update your own profile");
    }

    // Validate input
    const updateData: { name?: string; email?: string } = {};

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
      updateData.email = email.toLowerCase().trim();
    }

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No valid fields to update");
    }

    // Check if email already exists (if email is being updated)
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw ApiError.conflict("Email already exists");
      }
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

    if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
      throw ApiError.badRequest("Invalid user ID format");
    }

    // Users can only delete their own account
    if (userId !== req.user.id) {
      throw ApiError.forbidden("You can only delete your own account");
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: "User account deleted successfully",
      },
    });
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

    const users = await User.find().select("-password").sort({ createdAt: -1 });

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