import { Router } from "express";
import { askAI } from "./ai.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// POST /api/ai/ask
router.post("/ask", askAI);

export default router;
