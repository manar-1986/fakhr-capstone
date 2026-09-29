import mongoose from "mongoose";
import Child from "../../models/Child.model";
import CarePathTemplate from "../../models/CarePathTemplate.model";
import CarePath from "../../models/CarePath.model";
import Task from "../../models/Task.model";
import CarePathCheckin from "../../models/Checkin.model";

/**
 * MVP Template Matching:
 * - If templateId provided -> use it
 * - else: try match by child.diagnosis and/or child.tags (if you have tags)
 * - fallback: first template
 */
const pickTemplateForChild = async (child: any, templateId?: string) => {
  if (templateId) {
    const forced = await CarePathTemplate.findById(templateId);
    if (!forced) throw new Error("Template not found");
    return forced;
  }

  const diagnosis = (child.diagnosis || "").toLowerCase();

  // 1) match by targetDiagnoses
  if (diagnosis) {
    const byDx = await CarePathTemplate.findOne({
      targetDiagnoses: { $in: [diagnosis] },
    });
    if (byDx) return byDx;
  }

  // 2) fallback first
  const first = await CarePathTemplate.findOne({});
  if (!first) throw new Error("No templates exist. Seed templates first.");
  return first;
};

const ensureChildOwnership = async (userId: string, childId: string) => {
  const child = await Child.findOne({ _id: childId, parentId: userId });
  if (!child) throw new Error("Child not found or not authorized");
  return child;
};

export const generateCarePath = async ({
  userId,
  childId,
  templateId,
}: {
  userId: string;
  childId: string;
  templateId?: string;
}) => {
  const child = await ensureChildOwnership(userId, childId);

  // Stop duplicates: if active exists, return it
  const existing = await CarePath.findOne({ childId, status: "active" });
  if (existing) {
    const tasks = await Task.find({ carePathId: existing._id }).sort({ week: 1, createdAt: 1 });
    return { message: "Active care path already exists", carePath: existing, tasks };
  }

  const template = await pickTemplateForChild(child, templateId);

  // Create CarePath
  const carePath = await CarePath.create({
    childId,
    templateId: template._id,
    startDate: new Date(),
    status: "active",
  });

  // Generate Tasks from template.tasks
  const tasksToInsert = (template.tasks || []).map((t: any) => ({
    carePathId: carePath._id,
    week: t.week,
    title: t.title,
    titleAr: t.titleAr,
    titleEn: t.titleEn,
    description: t.description,
    descriptionAr: t.descriptionAr,
    descriptionEn: t.descriptionEn,
    instructions: t.instructions,
    instructionsAr: t.instructionsAr,
    instructionsEn: t.instructionsEn,
    expectedOutcome: t.expectedOutcome,
    expectedOutcomeAr: t.expectedOutcomeAr,
    expectedOutcomeEn: t.expectedOutcomeEn,
    category: t.category,
    difficulty: t.difficulty,
    frequency: t.frequency,
    frequencyAr: t.frequencyAr,
    frequencyEn: t.frequencyEn,
    status: "pending",
    dueDate: new Date(Date.now() + t.week * 7 * 24 * 60 * 60 * 1000),
  }));

  const tasks = await Task.insertMany(tasksToInsert);

  return { message: "Care path generated", carePath, template, tasks };
};

export const getCurrentCarePath = async ({
  userId,
  childId,
}: {
  userId: string;
  childId: string;
}) => {
  await ensureChildOwnership(userId, childId);

  const carePath = await CarePath.findOne({ childId, status: "active" })
    .populate("templateId")
    .lean();

  if (!carePath) return { carePath: null, tasks: [], message: "No active care path" };

  const tasks = await Task.find({ carePathId: carePath._id })
    .sort({ week: 1, createdAt: 1 })
    .lean();

  return { carePath, tasks };
};

const ensureTaskOwnership = async (userId: string, taskId: string) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw new Error("Invalid taskId");

  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  const carePath = await CarePath.findById(task.carePathId);
  if (!carePath) throw new Error("Care path not found");

  const child = await Child.findOne({ _id: carePath.childId, parentId: userId });
  if (!child) throw new Error("Not authorized");

  return { task, carePath };
};

export const completeTask = async ({
  userId,
  taskId,
  note,
}: {
  userId: string;
  taskId: string;
  note?: string;
}) => {
  const { task, carePath } = await ensureTaskOwnership(userId, taskId);

  task.status = "completed";
  task.completedAt = new Date();
  if (note) {
    task.note = note;
    if (/[\u0600-\u06FF]/.test(note)) task.noteAr = note;
    else task.noteEn = note;
  }
  await task.save();

  // If all tasks done or skipped => complete carePath
  const remaining = await Task.countDocuments({
    carePathId: task.carePathId,
    status: "pending",
  });

  if (remaining === 0) {
    await CarePath.updateOne({ _id: carePath._id }, { $set: { status: "completed" } });
  }

  // Optional: store note inside check-in answers later. For MVP we just return it.
  return { success: true, task, note };
};

export const skipTask = async ({
  userId,
  taskId,
  note,
}: {
  userId: string;
  taskId: string;
  note?: string;
}) => {
  const { task, carePath } = await ensureTaskOwnership(userId, taskId);

  task.status = "skipped";
  task.completedAt = new Date();
  if (note) {
    task.note = note;
    if (/[\u0600-\u06FF]/.test(note)) task.noteAr = note;
    else task.noteEn = note;
  }
  await task.save();

  const remaining = await Task.countDocuments({
    carePathId: task.carePathId,
    status: "pending",
  });

  if (remaining === 0) {
    await CarePath.updateOne({ _id: carePath._id }, { $set: { status: "completed" } });
  }

  return { success: true, task, note };
};

export const createCheckin = async ({
  userId,
  childId,
  difficulty,
  engagement,
  note,
  answers,
}: {
  userId: string;
  childId: string;
  difficulty?: "easy" | "ok" | "hard";
  engagement?: "low" | "medium" | "high";
  note?: string;
  answers?: Record<string, any>;
}) => {
  await ensureChildOwnership(userId, childId);

  const carePath = await CarePath.findOne({ childId, status: "active" });
  if (!carePath) throw new Error("No active care path");

  const checkin = await CarePathCheckin.create({
    carePathId: carePath._id,
    difficulty,
    engagement,
    note,
    answers,
  });

  return { success: true, checkin };
};
