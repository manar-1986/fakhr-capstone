import { Router } from "express";
import {
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser,
  getUsers,
} from "./users.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user's profile
router.get("/me", getCurrentUser);

// GET /api/users - Get all users
router.get("/", getUsers);

// GET /api/users/:userId - Get user by ID
router.get("/:userId", getUserById);

// PUT /api/users/:userId - Update user profile
router.put("/:userId", updateUser);

// DELETE /api/users/:userId - Delete user account
router.delete("/:userId", deleteUser);

export default router;
