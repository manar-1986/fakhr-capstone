import { Router } from "express";
import { getServices, getServiceById } from "./services.controller";

const router = Router();

// Services are public - no auth required to browse
// GET /api/services - Get all services
router.get("/", getServices);

// GET /api/services/:serviceId - Get service by ID
router.get("/:serviceId", getServiceById);

export default router;
