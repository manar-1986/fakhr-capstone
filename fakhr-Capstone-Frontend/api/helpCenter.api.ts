import instance from "./axios";

export interface HelpMessageRequest { message: string }
interface AIResponse { success: boolean; data: { answer: string; timestamp?: string } }

/** Authenticated text-only AI endpoint; the shared interceptor supplies the session. */
export async function sendHelpMessage(request: HelpMessageRequest): Promise<{ message: string; timestamp?: string }> {
  const response = await instance.post("/ai/ask", { question: request.message }, { timeout: 60000 });
  const result = response as unknown as AIResponse;
  if (!result.success || !result.data?.answer?.trim()) throw new Error("AI returned no answer");
  return { message: result.data.answer, timestamp: result.data.timestamp };
}
