import { Request, Response, NextFunction } from "express";
import {
  generateCarePathSchema,
  getCurrentSchema,
  completeTaskSchema,
  skipTaskSchema,
  checkinSchema,
} from "./carePath.schemas";
import {
  generateCarePath,
  getCurrentCarePath,
  completeTask,
  skipTask,
  createCheckin,
} from "./carePath.service";

const getUserId = (req: Request) => (req as any).user?.id as string;

export const generateCarePathController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = generateCarePathSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

    const result = await generateCarePath({
      userId: getUserId(req),
      childId: parsed.data.childId,
      templateId: parsed.data.templateId,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCurrentCarePathController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = getCurrentSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: "Invalid childId" });

    const result = await getCurrentCarePath({
      userId: getUserId(req),
      childId: parsed.data.childId,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const completeTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!taskId) return res.status(400).json({ message: "Missing taskId" });

    const parsed = completeTaskSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

    const result = await completeTask({
      userId: getUserId(req),
      taskId,
      note: parsed.data.note,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const skipTaskController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!taskId) return res.status(400).json({ message: "Missing taskId" });

    const parsed = skipTaskSchema.safeParse(req.body || {});
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

    const result = await skipTask({
      userId: getUserId(req),
      taskId,
      note: parsed.data.note,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createCheckinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = checkinSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

    const result = await createCheckin({
      userId: getUserId(req),
      ...parsed.data,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
