import { Response, NextFunction } from "express";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { askFakhrAI } from "./ai.service";

const MAX_QUESTION_LENGTH = 2000;

function readQuestion(body: { question?: unknown; message?: unknown }): string {
  const raw = body.question ?? body.message;

  if (raw === undefined || raw === null || raw === "") {
    throw ApiError.badRequest("Question is required");
  }

  if (typeof raw !== "string") {
    throw ApiError.badRequest("Question must be a string");
  }

  const question = raw.trim();

  if (!question) {
    throw ApiError.badRequest("Question must be a non-empty string");
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    throw ApiError.badRequest(
      `Question is too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed`
    );
  }

  return question;
}

/**
 * Ask the Fakhr AI assistant
 * POST /api/ai/ask
 */
export const askAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const question = readQuestion(req.body);
    const answer = await askFakhrAI(question);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        answer,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
