import { CheckIn, Progress, Task, WeeklyPlan } from "../types/care-path.types";
import { getChildren as fetchChildren } from "./children.api";
import { extractBi } from "../utils/planBilingual";
import instance from "./axios";

export type CarePathTaskStatus = "pending" | "completed" | "skipped";

export interface CarePathTask {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  instructions?: string;
  instructionsAr?: string;
  instructionsEn?: string;
  expectedOutcome?: string;
  expectedOutcomeAr?: string;
  expectedOutcomeEn?: string;
  category?: string;
  frequency?: string;
  frequencyAr?: string;
  frequencyEn?: string;
  status: CarePathTaskStatus;
  week?: number;
  dueDate?: string;
  completedAt?: string;
  note?: string;
  noteAr?: string;
  noteEn?: string;
}

export interface CurrentCarePathResult {
  carePath: {
    id: string;
    childId?: string;
    startDate?: string;
    status?: string;
  } | null;
  tasks: CarePathTask[];
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeTask(raw: Record<string, unknown>): CarePathTask {
  const id = String(raw.id ?? raw._id ?? "");
  const statusRaw = String(raw.status ?? "pending").toLowerCase();
  const status: CarePathTaskStatus =
    statusRaw === "completed" || statusRaw === "skipped" ? statusRaw : "pending";
  const titleBi = extractBi(raw, "title");
  const nameBi = extractBi(raw, "name");
  const descriptionBi = extractBi(raw, "description");
  const instructionsBi = extractBi(raw, "instructions");
  const outcomeBi = extractBi(raw, "expectedOutcome");
  const frequencyBi = extractBi(raw, "frequency");
  const noteBi = extractBi(raw, "note");
  const title =
    optionalString(raw.title) ??
    optionalString(raw.name) ??
    titleBi.ar ??
    titleBi.en ??
    nameBi.ar ??
    nameBi.en ??
    "";
  return {
    id,
    title,
    titleAr: titleBi.ar ?? nameBi.ar,
    titleEn: titleBi.en ?? nameBi.en,
    description: optionalString(raw.description),
    descriptionAr: descriptionBi.ar,
    descriptionEn: descriptionBi.en,
    instructions: optionalString(raw.instructions),
    instructionsAr: instructionsBi.ar,
    instructionsEn: instructionsBi.en,
    expectedOutcome: optionalString(raw.expectedOutcome),
    expectedOutcomeAr: outcomeBi.ar,
    expectedOutcomeEn: outcomeBi.en,
    category: optionalString(raw.category),
    frequency: optionalString(raw.frequency),
    frequencyAr: frequencyBi.ar,
    frequencyEn: frequencyBi.en,
    status,
    week: typeof raw.week === "number" ? raw.week : undefined,
    dueDate: raw.dueDate ? String(raw.dueDate) : undefined,
    completedAt: raw.completedAt ? String(raw.completedAt) : undefined,
    note: optionalString(raw.note),
    noteAr: noteBi.ar,
    noteEn: noteBi.en,
  };
}

/** GET /api/care-paths/current?childId= */
export const getCurrentCarePath = async (
  childId: string
): Promise<CurrentCarePathResult> => {
  const response = await instance.get(`/care-paths/current`, {
    params: { childId },
  });
  const body = unwrap<{
    carePath?: Record<string, unknown> | null;
    tasks?: Record<string, unknown>[];
  }>(response);

  const rawPath = body?.carePath ?? null;
  const tasks = Array.isArray(body?.tasks) ? body.tasks.map(normalizeTask) : [];
  if (!rawPath) {
    return { carePath: null, tasks };
  }
  return {
    carePath: {
      id: String(rawPath.id ?? rawPath._id ?? ""),
      childId: rawPath.childId ? String(rawPath.childId) : undefined,
      startDate: rawPath.startDate ? String(rawPath.startDate) : undefined,
      status: rawPath.status ? String(rawPath.status) : undefined,
    },
    tasks,
  };
};

/** POST /api/care-path-tasks/:id/complete */
export const completeCarePathTask = async (taskId: string, note?: string) => {
  await instance.post(`/care-path-tasks/${taskId}/complete`, note ? { note } : {});
};

/** POST /api/care-path-tasks/:id/skip */
export const skipCarePathTask = async (taskId: string, note?: string) => {
  await instance.post(`/care-path-tasks/${taskId}/skip`, note ? { note } : {});
};

/** Registered check-in endpoint. Feedback is stored, not an automatic plan adjustment. */
export const savePlanCheckin = async (data: {
  childId: string;
  difficulty?: "easy" | "ok" | "hard";
  engagement?: "low" | "medium" | "high";
  note?: string;
  answers?: Record<string, unknown>;
}) => {
  const response = await instance.post("/care-paths/checkin", data);
  const body = unwrap<{ success?: boolean }>(response);
  if (body?.success !== true) throw new Error("Check-in was not confirmed");
};


/** Legacy views use the registered, parent-owned endpoints. Never guess among siblings. */
async function resolveChild(childId?: string): Promise<string> {
 if (childId) return childId;
 const children=await fetchChildren();
 if(children.length!==1) throw new Error('Select a child in My Child’s Plan / اختر طفلاً من خطة طفلي');
 return children[0].id;
}
const legacyTask=(task:CarePathTask):Task=>({...task,description:task.description??'',completed:task.status==='completed'});
export const getWeeklyPlan=async(childId?:string):Promise<WeeklyPlan|null>=>{
 const result=await getCurrentCarePath(await resolveChild(childId));
 if(!result.carePath)return null;
 const start=Date.parse(result.carePath.startDate??'');
 const week=Number.isFinite(start)?Math.max(1,Math.floor((Date.now()-start)/604800000)+1):1;
 return {week,tasks:result.tasks.filter(t=>(t.week??1)===week).map(legacyTask)};
};
export const getTaskDetails=async(id:string):Promise<Task|null>=>{
 const result=unwrap<{task:Record<string,unknown>}>(await instance.get('/care-path-tasks/'+encodeURIComponent(id)));
 return legacyTask(normalizeTask(result.task));
};
export const getProgress=async(childId?:string):Promise<Progress|null>=>{
 const result=await getCurrentCarePath(await resolveChild(childId));
 if(!result.carePath)return null;
 const completedTasks=result.tasks.filter(t=>t.status==='completed').length,totalTasks=result.tasks.length;
 return {completedTasks,totalTasks,completionRate:totalTasks?completedTasks/totalTasks*100:0};
};
export const submitCheckIn=async(data:{notes:string;rating:number;childId?:string}):Promise<CheckIn>=>{
 const result=unwrap<{success:boolean;checkin:{_id:string;createdAt:string;note?:string}}>(await instance.post('/care-paths/checkin',{
 childId:await resolveChild(data.childId),note:data.notes,answers:{rating:data.rating}
 }));
 if(!result.success||!result.checkin?._id)throw new Error('Check-in was not saved / لم يتم حفظ الملاحظات');
 return {id:result.checkin._id,date:result.checkin.createdAt,notes:result.checkin.note??'',rating:data.rating};
};
export const generateCarePath=async(childId?:string):Promise<WeeklyPlan>=>{
 const result=unwrap<{carePath?:{_id:string};tasks?:Record<string,unknown>[]}>(await instance.post('/care-paths/generate',{childId:await resolveChild(childId)}));
 if(!result.carePath?._id||!Array.isArray(result.tasks))throw new Error('Plan generation was not confirmed / لم يتم تأكيد إنشاء الخطة');
 return {week:1,tasks:result.tasks.map(t=>legacyTask(normalizeTask(t)))};
};
export const getChildren=fetchChildren;

