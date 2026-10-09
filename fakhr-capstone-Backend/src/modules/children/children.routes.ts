import { Router } from "express";
import {
  getChildren,
  getChildById,
  createChild,
  updateChild,
} from "./children.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All children routes require authentication
router.use(authenticate);

// GET /api/children - Get all children for authenticated user
router.get("/", getChildren);

// GET /api/children/:childId - Get child by ID (only if belongs to user)
router.get("/:childId", getChildById);

// POST /api/children - Create a new child (automatically assigned to authenticated user)
router.post("/", createChild);

// PUT /api/children/:childId - Update child (only if belongs to user)
router.put("/:childId", updateChild);

export default router;
