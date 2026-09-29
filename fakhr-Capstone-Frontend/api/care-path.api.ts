import { CheckIn, Progress, Task, WeeklyPlan } from "../types/care-path.types";
import { Child } from "../types/child.types";
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

/**
 * Get weekly care plan (NOT REGISTERED IN BACKEND)
 * GET /api/care-path/weekly-plan
 */
export const getWeeklyPlan = async (): Promise<WeeklyPlan | null> => {
  // This endpoint is not registered in app.ts yet
  console.warn("Care-path weekly-plan endpoint is not registered in the backend");
  return null;
};

/**
 * Get task details by ID (NOT REGISTERED IN BACKEND)
 * GET /api/care-path/tasks/:taskId
 */
export const getTaskDetails = async (taskId: string): Promise<Task | null> => {
  // This endpoint is not registered in app.ts yet
  console.warn("Care-path task details endpoint is not registered in the backend");
  return null;
};

/**
 * Get care path progress (NOT REGISTERED IN BACKEND)
 * GET /api/care-path/progress
 */
export const getProgress = async (): Promise<Progress | null> => {
  // This endpoint is not registered in app.ts yet
  console.warn("Care-path progress endpoint is not registered in the backend");
  return null;
};

/**
 * Submit a check-in (NOT REGISTERED IN BACKEND)
 * POST /api/care-path/check-in
 */
export const submitCheckIn = async (data: { notes: string; rating: number }): Promise<CheckIn | null> => {
  // This endpoint is not registered in app.ts yet
  console.warn("Care-path check-in endpoint is not registered in the backend");
  return null;
};

/**
 * Generate a new care path (NOT REGISTERED IN BACKEND)
 * POST /api/care-path/generate
 */
export const generateCarePath = async (): Promise<WeeklyPlan | null> => {
  // This endpoint is not registered in app.ts yet
  console.warn("Care-path generate endpoint is not registered in the backend");
  return null;
};

/**
 * Get children (NOT REGISTERED IN BACKEND - use /api/children instead)
 * GET /api/care-path/children
 */
export const getChildren = async (): Promise<Child[]> => {
  // This endpoint is not registered in app.ts yet
  // Use /api/children instead
  console.warn("Care-path children endpoint is not registered. Use /api/children instead.");
  return [];
};
