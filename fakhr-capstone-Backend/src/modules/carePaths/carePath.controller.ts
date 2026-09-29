import { Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { ApiError } from "../../middlewares/apiError";
import {
  validateChildId,
  validateCarePathId,
  validateTaskId,
  validateTemplateId,
  validateCheckinBody,
  GenerateCarePathBody,
} from "./carePath.schemas";
import {
  verifyChildOwnership,
  verifyCarePathOwnership,
  verifyTaskOwnership,
  checkActiveCarePath,
  getCarePathTemplate,
  generateCarePathWithTasks,
  getCurrentActiveCarePath,
  getCarePathTasks,
  completeTaskById,
  skipTaskById,
  createCheckinForCarePath,
  getCarePathCheckins,
} from "./carePath.service";

/**
 * Generate a new care path for a child
 * POST /api/care-paths/generate?childId=...
 */
export const generateCarePath = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const childId = validateChildId(req.query.childId);
    const templateId = validateTemplateId(req.body.templateId);

    // Verify child belongs to user
    await verifyChildOwnership(childId, req.user.id);

    // Check if there's already an active care path (MVP constraint)
    await checkActiveCarePath(childId);

    // Get template
    const template = await getCarePathTemplate(templateId);

    // Generate care path and tasks
    const { carePath, tasks } = await generateCarePathWithTasks(
      childId,
      template._id
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        carePath: {
          id: carePath._id.toString(),
          childId: carePath.childId.toString(),
          templateId: carePath.templateId.toString(),
          status: carePath.status.toUpperCase(),
          startDate: carePath.startDate,
        },
        tasks: tasks.map((task) => ({
          id: task._id.toString(),
          name: task.title,
          title: task.title,
          titleAr: task.titleAr,
          titleEn: task.titleEn,
          status: task.status.toUpperCase(),
          week: task.week,
          description: task.description,
          descriptionAr: task.descriptionAr,
          descriptionEn: task.descriptionEn,
          instructions: task.instructions,
          instructionsAr: task.instructionsAr,
          instructionsEn: task.instructionsEn,
          expectedOutcome: task.expectedOutcome,
          expectedOutcomeAr: task.expectedOutcomeAr,
          expectedOutcomeEn: task.expectedOutcomeEn,
          category: task.category,
          difficulty: task.difficulty,
          frequency: task.frequency,
          frequencyAr: task.frequencyAr,
          frequencyEn: task.frequencyEn,
          dueDate: task.dueDate,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current active care path for a child
 * GET /api/care-paths/current?childId=...
 */
export const getCurrentCarePath = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const childId = validateChildId(req.query.childId);

    // Verify child belongs to user
    await verifyChildOwnership(childId, req.user.id);

    // Get active care path
    const carePath = await getCurrentActiveCarePath(childId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        carePath: {
          id: carePath._id.toString(),
          childId: carePath.childId.toString(),
          templateId: carePath.templateId,
          status: carePath.status.toUpperCase(),
          startDate: carePath.startDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for a care path
 * GET /api/care-paths/:id/tasks
 */
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const carePathId = validateCarePathId(req.params.id);

    // Verify care path belongs to user's child
    await verifyCarePathOwnership(carePathId, req.user.id);

    // Get tasks
    const tasks = await getCarePathTasks(carePathId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        tasks: tasks.map((task) => ({
          id: task._id.toString(),
          name: task.title,
          title: task.title,
          titleAr: task.titleAr,
          titleEn: task.titleEn,
          status: task.status.toUpperCase(),
          week: task.week,
          description: task.description,
          descriptionAr: task.descriptionAr,
          descriptionEn: task.descriptionEn,
          instructions: task.instructions,
          instructionsAr: task.instructionsAr,
          instructionsEn: task.instructionsEn,
          expectedOutcome: task.expectedOutcome,
          expectedOutcomeAr: task.expectedOutcomeAr,
          expectedOutcomeEn: task.expectedOutcomeEn,
          category: task.category,
          difficulty: task.difficulty,
          frequency: task.frequency,
          frequencyAr: task.frequencyAr,
          frequencyEn: task.frequencyEn,
          completedAt: task.completedAt,
          dueDate: task.dueDate,
          note: task.note,
          noteAr: task.noteAr,
          noteEn: task.noteEn,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a task as complete
 * POST /api/tasks/:id/complete
 */
export const completeTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const taskId = validateTaskId(req.params.id);

    // Verify task belongs to user's child's care path
    await verifyTaskOwnership(taskId, req.user.id);

    // Complete task
    const task = await completeTaskById(taskId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        task: {
          id: task._id.toString(),
          name: task.title,
          status: task.status.toUpperCase(),
          week: task.week,
          description: task.description,
          completedAt: task.completedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Skip a task
 * POST /api/tasks/:id/skip
 */
export const skipTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const taskId = validateTaskId(req.params.id);

    // Verify task belongs to user's child's care path
    await verifyTaskOwnership(taskId, req.user.id);

    // Skip task
    const task = await skipTaskById(taskId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        task: {
          id: task._id.toString(),
          name: task.title,
          status: task.status.toUpperCase(),
          week: task.week,
          description: task.description,
          completedAt: task.completedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a check-in for a care path
 * POST /api/care-paths/:id/checkins
 */
export const createCheckin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const carePathId = validateCarePathId(req.params.id);
    const checkinData = validateCheckinBody(req.body);

    // Verify care path belongs to user's child
    await verifyCarePathOwnership(carePathId, req.user.id);

    // Create check-in
    const checkin = await createCheckinForCarePath(carePathId, checkinData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        checkin: {
          id: checkin._id.toString(),
          carePathId: checkin.carePathId.toString(),
          date: checkin.date,
          difficulty: checkin.difficulty,
          engagement: checkin.engagement,
          note: checkin.note,
          answers: checkin.answers,
          createdAt: checkin.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all check-ins for a care path
 * GET /api/care-paths/:id/checkins
 */
export const getCheckins = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const carePathId = validateCarePathId(req.params.id);

    // Verify care path belongs to user's child
    await verifyCarePathOwnership(carePathId, req.user.id);

    // Get check-ins
    const checkins = await getCarePathCheckins(carePathId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        checkins: checkins.map((checkin) => ({
          id: checkin._id.toString(),
          carePathId: checkin.carePathId.toString(),
          date: checkin.date,
          difficulty: checkin.difficulty,
          engagement: checkin.engagement,
          note: checkin.note,
          answers: checkin.answers,
          createdAt: checkin.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
