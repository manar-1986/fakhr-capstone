import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  generateCarePath,
  getCurrentCarePath,
  completeTask,
  skipTask,
  createCheckin,
} from "./carePath.controller";

const router = Router();

/**
 * MVP Care Path
 * - Generate: creates an active CarePath + tasks
 * - Current: fetches active carePath + tasks
 * - Task actions: complete/skip
 * - Check-in: store quick feedback
 */

router.post("/care-paths/generate", authenticate, generateCarePath);
router.get("/care-paths/current", authenticate, getCurrentCarePath);

router.post("/care-path-tasks/:id/complete", authenticate, completeTask);
router.post("/care-path-tasks/:id/skip", authenticate, skipTask);

router.post("/care-paths/checkin", authenticate, createCheckin);

export default router;
