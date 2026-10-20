import { z } from "zod";
import mongoose from "mongoose";
import { ApiError } from "../../middlewares/apiError";

/**
 * Validation schemas for care path operations using Zod
 */

// Helper to validate MongoDB ObjectId
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ObjectId format" }
);

// Generate care path schema (query params + body)
export const generateCarePathSchema = z.object({
  childId: objectIdSchema,
  // optional: allow forcing a template for demo
  templateId: objectIdSchema.optional(),
});

// Get current care path schema (query params)
export const getCurrentSchema = z.object({
  childId: objectIdSchema,
});

// Complete task schema (body)
export const completeTaskSchema = z.object({
  note: z.string().max(500).optional(),
});

// Skip task schema (body)
export const skipTaskSchema = z.object({
  note: z.string().max(500).optional(),
});

// Check-in schema (body)
export const checkinSchema = z.object({
  childId: objectIdSchema,
  difficulty: z.enum(["easy", "ok", "hard"]).optional(),
  engagement: z.enum(["low", "medium", "high"]).optional(),
  note: z.string().max(1000).optional(),
  answers: z.record(z.string(), z.any()).optional(), // JSON
});

// Validation helper functions that integrate with ApiError
export const validateChildId = (childId: unknown): string => {
  try {
    return objectIdSchema.parse(childId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest(error.issues[0]?.message || "Invalid childId format");
    }
    throw ApiError.badRequest("childId query parameter is required");
  }
};

export const validateCarePathId = (id: unknown): string => {
  try {
    return objectIdSchema.parse(id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest(error.issues[0]?.message || "Invalid care path ID format");
    }
    throw ApiError.badRequest("Care path ID is required");
  }
};

export const validateTaskId = (id: unknown): string => {
  try {
    return objectIdSchema.parse(id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest(error.issues[0]?.message || "Invalid task ID format");
    }
    throw ApiError.badRequest("Task ID is required");
  }
};

export const validateTemplateId = (templateId: unknown): string | undefined => {
  if (!templateId) {
    return undefined;
  }
  try {
    return objectIdSchema.parse(templateId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest(error.issues[0]?.message || "Invalid templateId format");
    }
    throw ApiError.badRequest("Invalid templateId format");
  }
};

export const validateCheckinBody = (body: unknown): CheckinInput => {
  try {
    return checkinSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest(error.issues[0]?.message || "Invalid check-in body format");
    }
    throw ApiError.badRequest("Invalid check-in payload");
  }
};

// Type exports for TypeScript
export type GenerateCarePathInput = z.infer<typeof generateCarePathSchema>;
export type GenerateCarePathBody = GenerateCarePathInput; // Alias for controller import
export type GetCurrentInput = z.infer<typeof getCurrentSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type SkipTaskInput = z.infer<typeof skipTaskSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;