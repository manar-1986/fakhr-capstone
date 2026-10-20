import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  generateCarePathController,
  getCurrentCarePathController,
  completeTaskController,
  skipTaskController,
  createCheckinController,
} from "./carePath.controller";

import { getTaskDetails } from "./carePath.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
const router = Router();
router.get("/care-path-tasks/:id", authenticate, async (req: AuthRequest, res, next) => {
 try { res.json({task: await getTaskDetails(req.user!.id, String(req.params.id))}); } catch(error) { next(error); }
});

/**
 * MVP Care Path
 * - Generate: creates an active CarePath + tasks
 * - Current: fetches active carePath + tasks
 * - Task actions: complete/skip
 * - Check-in: store quick feedback
 */

router.post("/care-paths/generate", authenticate, generateCarePathController);
router.get("/care-paths/current", authenticate, getCurrentCarePathController);

router.post("/care-path-tasks/:id/complete", authenticate, completeTaskController);
router.post("/care-path-tasks/:id/skip", authenticate, skipTaskController);

router.post("/care-paths/checkin", authenticate, createCheckinController);

export default router;
