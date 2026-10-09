import { Router } from "express";
import { sendHelpMessage, getConversationHistory } from "./helpCenter.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All help center routes require authentication
router.use(authenticate);

// POST /api/help-center/message - Send a message to AI assistant
router.post("/message", sendHelpMessage);

// GET /api/help-center/history - Get conversation history (optional)
router.get("/history", getConversationHistory);

export default router;
