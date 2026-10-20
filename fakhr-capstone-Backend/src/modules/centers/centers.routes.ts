import { authorize } from "../../middlewares/authorize.middleware";
import { USER_ROLES } from "../../config/constants";
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
centerRoutes.post("/", authorize(USER_ROLES.ADMIN), createCenter);

// DELETE /api/directory/centers/:centerId - Delete center by ID
centerRoutes.delete("/:centerId", authorize(USER_ROLES.ADMIN), deleteCenter);

export default centerRoutes;
