import { ApiError } from "../../middlewares/apiError";
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
 * - no unrelated fallback template
 */
const pickTemplateForChild = async (child: any, templateId?: string, session?: mongoose.ClientSession) => {
  if (templateId) {
    const forced = await CarePathTemplate.findById(templateId).session(session ?? null);
    if (!forced) throw ApiError.notFound("Template not found");
    return forced;
  }

  let values: unknown = child.diagnosis;
  if (typeof values === 'string') { try { values = JSON.parse(values); } catch { values = [values]; } }
  const diagnoses = (Array.isArray(values) ? values : [values]).filter((v): v is string => typeof v === 'string').map(v=>v.trim().toLowerCase()).filter(Boolean);

  // 1) match by targetDiagnoses
  if (diagnoses.length) {
    const byDx = await CarePathTemplate.findOne({
      targetDiagnoses: { $in: diagnoses },
    }).session(session ?? null);
    if (byDx) return byDx;
  }

  throw ApiError.notFound("No matching plan template is available for this child");
};

const ensureChildOwnership = async (userId: string, childId: string) => {
  const child = await Child.findOne({ _id: childId, parentId: userId });
  if (!child) throw ApiError.notFound("Child not found");
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
  return mongoose.connection.transaction(async (session) => {
  const child = await Child.findOneAndUpdate({ _id: childId, parentId: userId }, { $inc: { __v: 1 } }, { session, new: true });
  if (!child) throw ApiError.notFound("Child not found");

  // Stop duplicates: if active exists, return it
  const existing = await CarePath.findOne({ childId, status: "active" }).session(session);
  if (existing) {
    const tasks = await Task.find({ carePathId: existing._id }).sort({ week: 1, createdAt: 1 }).session(session);
    return { message: "Active care path already exists", carePath: existing, tasks };
  }

  const template = await pickTemplateForChild(child, templateId, session);
  if (!template.tasks.length) throw ApiError.notFound("Matching plan template has no activities");

  // Create CarePath
  const [carePath] = await CarePath.create([{
    childId,
    templateId: template._id,
    startDate: new Date(),
    status: "active",
  }], { session });

  // Generate Tasks from template.tasks
  const tasksToInsert = (template.tasks || []).map((t: any) => ({
    carePathId: carePath._id,
    week: t.week,
    title: t.title,
    description: t.description,
    instructions: t.instructions,
    expectedOutcome: t.expectedOutcome,
    category: t.category,
    difficulty: t.difficulty,
    frequency: t.frequency,
    status: "pending",
    dueDate: new Date(Date.now() + (t.week - 1) * 7 * 24 * 60 * 60 * 1000),
  }));

  const tasks = await Task.insertMany(tasksToInsert, { session });

  return { message: "Care path generated", carePath, template, tasks };
  });
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
    .lean() ?? await CarePath.findOne({ childId, status: "completed" })
      .sort({ updatedAt: -1, _id: -1 }).populate("templateId").lean();

  if (!carePath) return { carePath: null, tasks: [], message: "No active care path" };

  const tasks = await Task.find({ carePathId: carePath._id })
    .sort({ week: 1, createdAt: 1 })
    .lean();

  return { carePath, tasks };
};

const ensureTaskOwnership = async (userId: string, taskId: string) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) throw ApiError.badRequest("Invalid taskId");

  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");

  const carePath = await CarePath.findById(task.carePathId);
  if (!carePath) throw ApiError.notFound("Task not found");

  const child = await Child.findOne({ _id: carePath.childId, parentId: userId });
  if (!child) throw ApiError.notFound("Task not found");

  return { task, carePath };
};

const resolveTask = async ({userId,taskId,note,status}:{userId:string;taskId:string;note?:string;status:'completed'|'skipped'}) => mongoose.connection.transaction(async session=>{
  // Authorize before touching the shared parent; serialize completion of sibling tasks.
  const owned = await ensureTaskOwnership(userId,taskId);
  const carePath = await CarePath.findOneAndUpdate({_id:owned.carePath._id},{$inc:{__v:1}},{session,new:true});
  if (!carePath) throw ApiError.notFound('Task not found');
  const task = await Task.findById(taskId).session(session);
  if (!task) throw ApiError.notFound('Task not found');
  if(task.status!=='pending') throw ApiError.badRequest('Task already resolved');
  task.dashboardRevision=(task.dashboardRevision||0)+1;
  task.status=status; if(note!==undefined) task.note=note; task.completedAt=new Date();
  await task.save({session});
  const remaining=await Task.countDocuments({carePathId:task.carePathId,status:'pending'}).session(session);
  await CarePath.updateOne({_id:carePath._id},{$set:{status:remaining===0?'completed':'active'}},{session});
  return {success:true,task,note};
});
export const completeTask = (args:{userId:string;taskId:string;note?:string}) => resolveTask({...args,status:'completed'});
export const skipTask = (args:{userId:string;taskId:string;note?:string}) => resolveTask({...args,status:'skipped'});

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

  const carePath = await CarePath.findOne({ childId, status: "active" })
    ?? await CarePath.findOne({ childId, status: "completed" }).sort({ updatedAt: -1, _id: -1 });
  if (!carePath) throw ApiError.notFound("No care path available for check-in");

  const checkin = await CarePathCheckin.create({
    carePathId: carePath._id,
    difficulty,
    engagement,
    note,
    answers,
  });

  return { success: true, checkin };
};

export const getTaskDetails = async (userId: string, taskId: string) => (await ensureTaskOwnership(userId, taskId)).task;
