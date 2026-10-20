import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Child, { IChild } from "../../models/Child.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";

function parseList(value?: string | null): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // fall through to comma-separated
    }
  }
  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

function serializeList(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return undefined;
}

function parseMedications(raw?: string | null) {
  let parsedMedications: unknown = raw;
  if (parsedMedications) {
    try {
      const parsed = JSON.parse(String(parsedMedications));
      if (Array.isArray(parsed)) {
        parsedMedications = parsed;
      }
    } catch {
      // keep as string
    }
  }
  return parsedMedications;
}

function formatChild(child: IChild) {
  const parsedDiagnosis = parseList(child.diagnosis);
  return {
    id: child._id.toString(),
    name: child.name,
    age: child.age,
    dateOfBirth: child.dateOfBirth,
    gender: child.gender,
    diagnosis: parsedDiagnosis,
    diagnoses: parsedDiagnosis,
    medicalHistory: child.medicalHistory,
    medications: parseMedications(child.medications),
    allergies: parseList(child.allergies),
    areasOfFocus: parseList(child.areasOfFocus),
    supportGoals: parseList(child.supportGoals),
    parentId: child.parentId.toString(),
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  };
}

/**
 * Get all children for the authenticated user
 * GET /api/children
 */
export const getChildren = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const children = await Child.find({ parentId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        children: children.map((child) => formatChild(child)),
        count: children.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get child by ID (only if belongs to authenticated user)
 * GET /api/children/:childId
 */
export const getChildById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const childId = Array.isArray(req.params.childId)
      ? req.params.childId[0]
      : req.params.childId;

    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      throw ApiError.badRequest("Invalid child ID format");
    }

    const child = await Child.findOne({
      _id: childId,
      parentId: req.user.id,
    });

    if (!child) {
      throw ApiError.notFound(
        "Child not found or you don't have permission to view it"
      );
    }

    if (child.parentId.toString() !== req.user.id) {
      throw ApiError.forbidden("You can only view your own children");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        child: formatChild(child),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new child for the authenticated user
 * POST /api/children
 */
export const createChild = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    if (req.body.parentId) {
      throw ApiError.forbidden(
        "Cannot set parentId. It is automatically assigned to your account."
      );
    }

    const {
      name,
      age,
      gender,
      dateOfBirth,
      diagnosis,
      medicalHistory,
      medications,
      allergies,
      areasOfFocus,
      supportGoals,
    } = req.body;

    if (!name || !gender) {
      throw ApiError.badRequest("Name and gender are required");
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      throw ApiError.badRequest("Name must be a non-empty string");
    }

    if (age !== undefined && (typeof age !== "number" || age < 0 || age > 120)) {
      throw ApiError.badRequest("Age must be a number between 0 and 120");
    }

    if (typeof gender !== "string" || gender.trim().length === 0) {
      throw ApiError.badRequest("Gender must be a non-empty string");
    }

    let diagnosisString: string | undefined;
    if (diagnosis) {
      if (Array.isArray(diagnosis)) {
        diagnosisString = diagnosis.length > 0 ? diagnosis.join(", ") : undefined;
      } else if (typeof diagnosis === "string") {
        diagnosisString = diagnosis.trim() || undefined;
      }
    }

    let medicationsString: string | undefined;
    if (medications) {
      if (Array.isArray(medications)) {
        medicationsString =
          medications.length > 0 ? JSON.stringify(medications) : undefined;
      } else if (typeof medications === "string") {
        medicationsString = medications.trim() || undefined;
      }
    }

    let allergiesString: string | undefined;
    if (allergies) {
      if (Array.isArray(allergies)) {
        allergiesString = allergies.length > 0 ? allergies.join(", ") : undefined;
      } else if (typeof allergies === "string") {
        allergiesString = allergies.trim() || undefined;
      }
    }

    const child = await Child.create({
      name: name.trim(),
      age: age !== undefined ? age : undefined,
      dateOfBirth: dateOfBirth?.trim() || undefined,
      gender: gender.trim(),
      diagnosis: diagnosisString,
      medicalHistory: medicalHistory?.trim() || undefined,
      medications: medicationsString,
      allergies: allergiesString,
      areasOfFocus: serializeList(areasOfFocus),
      supportGoals: serializeList(supportGoals),
      parentId: req.user.id,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        child: formatChild(child),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update child (only if belongs to authenticated user)
 * PUT /api/children/:childId
 */
export const updateChild = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const childId = Array.isArray(req.params.childId)
      ? req.params.childId[0]
      : req.params.childId;

    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      throw ApiError.badRequest("Invalid child ID format");
    }

    if (req.body.parentId) {
      throw ApiError.forbidden(
        "Cannot change parentId. Only the original creator can update this child."
      );
    }

    const {
      name,
      age,
      gender,
      dateOfBirth,
      diagnosis,
      medicalHistory,
      medications,
      allergies,
      areasOfFocus,
      supportGoals,
    } = req.body;

    const child = await Child.findOne({
      _id: childId,
      parentId: req.user.id,
    });

    if (!child) {
      throw ApiError.notFound(
        "Child not found or you don't have permission to update it"
      );
    }

    if (child.parentId.toString() !== req.user.id) {
      throw ApiError.forbidden("You can only update children you created");
    }

    const updateData: {
      name?: string;
      age?: number;
      dateOfBirth?: string;
      gender?: string;
      diagnosis?: string;
      medicalHistory?: string;
      medications?: string;
      allergies?: string;
      areasOfFocus?: string;
      supportGoals?: string;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        throw ApiError.badRequest("Name must be a non-empty string");
      }
      updateData.name = name.trim();
    }

    if (age !== undefined) {
      if (typeof age !== "number" || age < 0 || age > 120) {
        throw ApiError.badRequest("Age must be a number between 0 and 120");
      }
      updateData.age = age;
    }

    if (dateOfBirth !== undefined) {
      if (typeof dateOfBirth !== "string") {
        throw ApiError.badRequest("Date of birth must be a string");
      }
      updateData.dateOfBirth = dateOfBirth.trim() || undefined;
    }

    if (gender !== undefined) {
      if (typeof gender !== "string" || gender.trim().length === 0) {
        throw ApiError.badRequest("Gender must be a non-empty string");
      }
      updateData.gender = gender.trim();
    }

    if (diagnosis !== undefined) {
      if (Array.isArray(diagnosis)) {
        updateData.diagnosis =
          diagnosis.length > 0 ? diagnosis.join(", ") : undefined;
      } else if (typeof diagnosis === "string") {
        updateData.diagnosis = diagnosis.trim() || undefined;
      }
    }

    if (medicalHistory !== undefined) {
      updateData.medicalHistory = medicalHistory?.trim() || undefined;
    }

    if (medications !== undefined) {
      if (Array.isArray(medications)) {
        updateData.medications =
          medications.length > 0 ? JSON.stringify(medications) : undefined;
      } else if (typeof medications === "string") {
        updateData.medications = medications.trim() || undefined;
      }
    }

    if (allergies !== undefined) {
      if (Array.isArray(allergies)) {
        updateData.allergies =
          allergies.length > 0 ? allergies.join(", ") : undefined;
      } else if (typeof allergies === "string") {
        updateData.allergies = allergies.trim() || undefined;
      }
    }

    if (areasOfFocus !== undefined) {
      updateData.areasOfFocus = serializeList(areasOfFocus) ?? "";
    }

    if (supportGoals !== undefined) {
      updateData.supportGoals = serializeList(supportGoals) ?? "";
    }

    if (Object.keys(updateData).length === 0) {
      throw ApiError.badRequest("No valid fields to update");
    }

    const updatedChild = await Child.findOneAndUpdate({ _id: childId, parentId: req.user.id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedChild) {
      throw ApiError.notFound("Child not found");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        child: formatChild(updatedChild),
      },
    });
  } catch (error) {
    next(error);
  }
};
