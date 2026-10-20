import { minimumUnavailable } from '../../config/releaseProfile';
import { authRateLimit } from "../../middlewares/authRateLimit";
import { Router } from "express";
import {
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser,
  getUsers,
} from "./users.controller";
import { authenticate } from "../../middlewares/auth.middleware";

import { authorize } from "../../middlewares/authorize.middleware";
import { USER_ROLES } from "../../config/constants";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user's profile
router.get("/me", getCurrentUser);

// GET /api/users - Get all users
router.get("/", authorize(USER_ROLES.ADMIN), getUsers);

// GET /api/users/:userId - Get user by ID
router.get("/:userId", getUserById);

// PUT /api/users/:userId - Update user profile
router.put("/:userId", authRateLimit("profile"), updateUser);

// DELETE /api/users/:userId - Delete user account
router.delete("/:userId", minimumUnavailable, authRateLimit("delete-account"), deleteUser);

export default router;
