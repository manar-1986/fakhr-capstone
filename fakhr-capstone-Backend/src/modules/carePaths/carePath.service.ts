import mongoose from "mongoose";
import CarePath, { ICarePath, CarePathStatus } from "../../models/CarePath.model";
import CarePathTemplate, { ICarePathTemplate } from "../../models/CarePathTemplate.model";
import Task, { ITask, TaskStatus } from "../../models/Task.model";
import Checkin, { ICarePathCheckin } from "../../models/Checkin.model";
import Child from "../../models/Child.model";
import { ApiError } from "../../middlewares/apiError";

/**
 * Service layer for care path business logic
 */

/**
 * Verify child belongs to user
 */
export const verifyChildOwnership = async (
  childId: string,
  userId: string
): Promise<void> => {
  const child = await Child.findById(childId);
  if (!child) {
    throw ApiError.notFound("Child not found");
  }

  if (child.parentId.toString() !== userId) {
    throw ApiError.forbidden("You don't have permission to access this child");
  }
};

/**
 * Verify care path belongs to user's child
 */
export const verifyCarePathOwnership = async (
  carePathId: string,
  userId: string
): Promise<ICarePath> => {
  const carePath = await CarePath.findById(carePathId).populate("childId", "parentId");
  if (!carePath) {
    throw ApiError.notFound("Care path not found");
  }

  const child = carePath.childId as any;
  if (child.parentId.toString() !== userId) {
    throw ApiError.forbidden("You don't have permission to access this care path");
  }

  return carePath;
};

/**
 * Verify task belongs to user's child's care path
 */
export const verifyTaskOwnership = async (
  taskId: string,
  userId: string
): Promise<ITask> => {
  const task = await Task.findById(taskId).populate({
    path: "carePathId",
    populate: { path: "childId", select: "parentId" },
  });

  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  const carePath = task.carePathId as any;
  const child = carePath.childId as any;

  if (child.parentId.toString() !== userId) {
    throw ApiError.forbidden("You don't have permission to access this task");
  }

  return task;
};

/**
 * Check if child has an active care path
 */
export const checkActiveCarePath = async (childId: string): Promise<void> => {
  const existingActiveCarePath = await CarePath.findOne({
    childId: new mongoose.Types.ObjectId(childId),
    status: "active",
  });

  if (existingActiveCarePath) {
    throw ApiError.conflict("An active care path already exists for this child");
  }
};

/**
 * Get care path template
 */
export const getCarePathTemplate = async (
  templateId?: string
): Promise<ICarePathTemplate> => {
  let template;
  if (templateId) {
    template = await CarePathTemplate.findById(templateId);
  } else {
    template = await CarePathTemplate.findOne();
  }

  if (!template) {
    throw ApiError.notFound("No care path template found");
  }

  return template;
};

/**
 * Generate care path and tasks
 */
export const generateCarePathWithTasks = async (
  childId: string,
  templateId: mongoose.Types.ObjectId
): Promise<{ carePath: ICarePath; tasks: ITask[] }> => {
  // Create care path
  const carePath = new CarePath({
    childId: new mongoose.Types.ObjectId(childId),
    templateId,
    startDate: new Date(),
    status: "active",
  });

  await carePath.save();

  // Get template to create tasks
  const template = await CarePathTemplate.findById(templateId);
  if (!template) {
    throw ApiError.notFound("Template not found");
  }

  // Create tasks from template
  const tasks = template.tasks.map((taskTemplate) => ({
    carePathId: carePath._id,
    week: taskTemplate.week,
    title: taskTemplate.title,
    titleAr: taskTemplate.titleAr,
    titleEn: taskTemplate.titleEn,
    description: taskTemplate.description,
    descriptionAr: taskTemplate.descriptionAr,
    descriptionEn: taskTemplate.descriptionEn,
    instructions: taskTemplate.instructions,
    instructionsAr: taskTemplate.instructionsAr,
    instructionsEn: taskTemplate.instructionsEn,
    expectedOutcome: taskTemplate.expectedOutcome,
    expectedOutcomeAr: taskTemplate.expectedOutcomeAr,
    expectedOutcomeEn: taskTemplate.expectedOutcomeEn,
    category: taskTemplate.category,
    difficulty: taskTemplate.difficulty,
    frequency: taskTemplate.frequency,
    frequencyAr: taskTemplate.frequencyAr,
    frequencyEn: taskTemplate.frequencyEn,
    status: "pending" as TaskStatus,
    dueDate: new Date(
      Date.now() + taskTemplate.week * 7 * 24 * 60 * 60 * 1000
    ),
  }));

  const createdTasks = await Task.insertMany(tasks);

  return { carePath, tasks: createdTasks };
};

/**
 * Get current active care path for child
 */
export const getCurrentActiveCarePath = async (
  childId: string
): Promise<ICarePath> => {
  const carePath = await CarePath.findOne({
    childId: new mongoose.Types.ObjectId(childId),
    status: "active",
  })
    .populate("templateId", "name description duration")
    .lean();

  if (!carePath) {
    throw ApiError.notFound("No active care path found for this child");
  }

  return carePath as any;
};

/**
 * Get tasks for care path
 */
export const getCarePathTasks = async (
  carePathId: string
): Promise<ITask[]> => {
  const tasks = await Task.find({
    carePathId: new mongoose.Types.ObjectId(carePathId),
  })
    .sort({ week: 1 })
    .lean();

  return tasks as any;
};

/**
 * Complete a task
 */
export const completeTaskById = async (
  taskId: string
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  task.status = "completed";
  task.completedAt = new Date();
  await task.save();

  return task;
};

/**
 * Skip a task
 */
export const skipTaskById = async (taskId: string): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  task.status = "skipped";
  task.completedAt = new Date();
  await task.save();

  return task;
};

/**
 * Create check-in
 */
export const createCheckinForCarePath = async (
  carePathId: string,
  checkinData: {
    date?: string;
    difficulty?: "easy" | "ok" | "hard";
    engagement?: "low" | "medium" | "high";
    note?: string;
    answers?: Record<string, any>;
  }
): Promise<ICarePathCheckin> => {
  const checkin = new Checkin({
    carePathId: new mongoose.Types.ObjectId(carePathId),
    date: checkinData.date ? new Date(checkinData.date) : new Date(),
    difficulty: checkinData.difficulty,
    engagement: checkinData.engagement,
    note: checkinData.note,
    answers: checkinData.answers,
  });

  await checkin.save();
  return checkin;
};

/**
 * Get check-ins for care path
 */
export const getCarePathCheckins = async (
  carePathId: string
): Promise<ICarePathCheckin[]> => {
  const checkins = await Checkin.find({
    carePathId: new mongoose.Types.ObjectId(carePathId),
  })
    .sort({ date: -1 })
    .lean();

  return checkins as any;
};
