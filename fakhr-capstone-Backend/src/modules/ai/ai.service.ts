import OpenAI from "openai";
import { ApiError } from "../../middlewares/apiError";

const FAKHR_INSTRUCTIONS = `You are Fakhr AI, an AI assistant inside the Fakhr application.

Fakhr supports parents and caregivers of children with disabilities.

Rules:
- Be supportive, clear, and practical.
- Answer in Arabic when the user writes in Arabic.
- Answer in English when the user writes in English.
- Do not provide medical diagnoses.
- Do not replace doctors, therapists, or qualified specialists.
- Do not claim that a child has a specific condition based on symptoms alone.
- For emergencies or serious health concerns, advise the user to contact an appropriate healthcare professional.
- Keep responses concise and suitable for a mobile application.`;

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw ApiError.internal("AI assistant is not configured");
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

export async function askFakhrAI(message: string): Promise<string> {
  try {
    const response = await getOpenAIClient().responses.create({
      model: "gpt-5-mini",
      instructions: FAKHR_INSTRUCTIONS,
      input: message,
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      throw ApiError.internal("AI assistant returned an empty response");
    }

    return reply;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof OpenAI.RateLimitError) {
      throw ApiError.internal("AI assistant is busy. Please try again shortly");
    }

    if (error instanceof OpenAI.AuthenticationError) {
      throw ApiError.internal("AI assistant authentication failed");
    }

    if (error instanceof OpenAI.APIConnectionError) {
      throw ApiError.internal("Could not reach the AI assistant. Please try again");
    }

    throw ApiError.internal("Failed to get a response from the AI assistant");
  }
}
