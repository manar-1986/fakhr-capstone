import { isAwarenessEvidence, type AwarenessEvidence } from "../types/awareness";
import type { AssessmentPresentation } from "../types/assessment";
import instance from "./axios";
import type { DirectoryRecommendation, SchoolContext } from "../types/recommendation";

export interface HelpMessageRequest { message: string; schoolContext?: SchoolContext; locale?: 'ar'|'ar-KW'|'en' }
interface AIResponse { success: boolean; data: { answer: string; language?: 'ar'|'ar-KW'|'en'; timestamp?: string; recommendations?: DirectoryRecommendation[]; directoryVersion?: string; awareness?: AwarenessEvidence; assessment?: AssessmentPresentation; schoolContext?: SchoolContext|null } }

/** Authenticated text-only AI endpoint; the shared interceptor supplies the session. */
export async function sendHelpMessage(request: HelpMessageRequest): Promise<{ message: string; language?: 'ar'|'ar-KW'|'en'; timestamp?: string; recommendations?: DirectoryRecommendation[]; directoryVersion?: string; awareness?: AwarenessEvidence; assessment?: AssessmentPresentation; schoolContext?: SchoolContext|null }> {
  const response = await instance.post("/ai/ask", { question: request.message, ...(request.schoolContext ? {schoolContext:request.schoolContext} : {}), ...(request.locale ? {locale:request.locale}: {}) }, { timeout: 60000 });
  const result = response as unknown as AIResponse;
  if (!result.success || !result.data?.answer?.trim()) throw new Error("AI returned no answer");
  return { ...(isAwarenessEvidence(result.data.awareness)?{awareness:result.data.awareness}:{}), ...(result.data.assessment?.version===1 ? {assessment:result.data.assessment}:{}), message: result.data.answer, language: result.data.language, timestamp: result.data.timestamp,
    ...(result.data.recommendations ? {recommendations:result.data.recommendations,directoryVersion:result.data.directoryVersion}:{}),
    ...(result.data.schoolContext !== undefined ? {schoolContext:result.data.schoolContext}:{}) };
}
