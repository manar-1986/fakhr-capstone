import { Router } from "express";
import {
  getCenters,
  getCenterById,
  getCities,
  getSpecialties,
  createCenter,
  getProfessionals,
  getProfessionalById,
  getProfessionalSpecialties,
} from "./directory.controller";

const router = Router();

// Centers
router.get("/centers", getCenters);
router.post("/centers", createCenter);
router.get("/centers/cities", getCities);
router.get("/centers/specialties", getSpecialties);
router.get("/centers/:id", getCenterById);

// Professionals (specific routes before :id)
router.get("/professionals", getProfessionals);
router.get("/professionals/specialties/list", getProfessionalSpecialties);
router.get("/professionals/:id", getProfessionalById);

export default router;
