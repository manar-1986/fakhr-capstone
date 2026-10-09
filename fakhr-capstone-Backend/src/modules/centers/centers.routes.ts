import { Router } from "express";
import {
  getCenters,
  getCenterById,
  createCenter,
  deleteCenter,
} from "./centers.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const centerRoutes = Router();

// All center routes require authentication
centerRoutes.use(authenticate);

// GET /api/directory/centers - Get all centers (with optional filters)
centerRoutes.get("/", getCenters);

// GET /api/directory/centers/:centerId - Get center by ID
centerRoutes.get("/:centerId", getCenterById);

// POST /api/directory/centers - Create a new center
centerRoutes.post("/", createCenter);

// DELETE /api/directory/centers/:centerId - Delete center by ID
centerRoutes.delete("/:centerId", deleteCenter);

export default centerRoutes;
