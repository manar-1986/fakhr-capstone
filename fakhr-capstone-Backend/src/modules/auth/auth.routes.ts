import { minimumUnavailable } from '../../config/releaseProfile';
import { authRateLimit } from "../../middlewares/authRateLimit";
import { Router } from "express";
import { register, login, logout, forgotPassword, resetPassword, deleteAccount } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Public routes - no authentication required
router.post("/register", authRateLimit("register"), register);
router.post("/login", authRateLimit("login"), login);
router.post("/forgot-password", minimumUnavailable, authRateLimit("forgot-password"), forgotPassword);
router.post("/reset-password", minimumUnavailable, authRateLimit("reset-password"), resetPassword);

// Protected routes - requires authentication
router.post("/logout", authenticate, authRateLimit("logout"), logout);
router.delete("/delete-account", authenticate, minimumUnavailable, authRateLimit("delete-account"), deleteAccount);

export default router;