import { Router } from "express";
import { register, login, logout, forgotPassword, resetPassword } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Public routes - no authentication required
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected route - requires authentication to logout
router.post("/logout", authenticate, logout);

export default router;
