import { Router } from "express";
import { completeTask, skipTask } from "../carePaths/carePath.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// POST /api/tasks/:id/complete
router.post("/:id/complete", completeTask);

// POST /api/tasks/:id/skip
router.post("/:id/skip", skipTask);

export default router;
