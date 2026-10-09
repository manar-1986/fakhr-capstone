import { Response, NextFunction } from "express";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * Dummy AI response generator
 * In a real implementation, this would connect to an AI service like OpenAI, Anthropic, etc.
 */
const generateAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  // Simple keyword-based responses (dummy implementation)
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return "Hello! I'm here to help you with Fakhr. How can I assist you today?";
  }

  if (lowerMessage.includes("service") || lowerMessage.includes("services")) {
    return "Fakhr offers various services including speech therapy, behavioral therapy, occupational therapy, and more. You can explore all available services in the Services section of the app.";
  }

  if (lowerMessage.includes("professional") || lowerMessage.includes("therapist") || lowerMessage.includes("specialist")) {
    return "You can find qualified professionals in the Professionals section. They specialize in different areas like speech therapy, behavioral therapy, and more. Would you like help finding a specific type of professional?";
  }

  if (lowerMessage.includes("center") || lowerMessage.includes("clinic") || lowerMessage.includes("facility")) {
    return "You can find health centers near you in the Health Centers section. These centers offer specialized care for children with special needs. Would you like to search for centers in a specific city?";
  }

  if (lowerMessage.includes("child") || lowerMessage.includes("children") || lowerMessage.includes("kid")) {
    return "I can help you manage your child's profile, care path, and find resources. You can add or manage your children in the Profile section. Is there something specific you'd like to know about managing your child's information?";
  }

  if (lowerMessage.includes("care path") || lowerMessage.includes("plan") || lowerMessage.includes("treatment")) {
    return "The Care Path feature helps you track your child's weekly plan, tasks, and progress. You can view your care path in the Plan section. Would you like help understanding how to use it?";
  }

  if (lowerMessage.includes("community") || lowerMessage.includes("support") || lowerMessage.includes("parent")) {
    return "The Community section allows you to connect with other parents, share experiences, and find support. You can create posts, view events, and engage with the community there.";
  }

  if (lowerMessage.includes("document") || lowerMessage.includes("file") || lowerMessage.includes("paperwork")) {
    return "You can manage your documents in the Documents section. This helps you keep track of important paperwork, renewals, and medical records.";
  }

  if (lowerMessage.includes("help") || lowerMessage.includes("assist") || lowerMessage.includes("support")) {
    return "I'm here to help! You can ask me about:\n• Services and professionals\n• Health centers\n• Managing your child's profile\n• Care paths and plans\n• Community features\n• Documents\n\nWhat would you like to know more about?";
  }

  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You're welcome! If you have any other questions, feel free to ask. I'm here to help!";
  }

  // Default response
  return "Thank you for your message. I'm here to help you navigate Fakhr. You can ask me about services, professionals, health centers, care paths, or any other features. How can I assist you?";
};

/**
 * Send a message to the help center AI assistant
 * POST /api/help-center/message
 */
export const sendHelpMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throw ApiError.badRequest("Message is required and must be a non-empty string");
    }

    if (message.length > 1000) {
      throw ApiError.badRequest("Message is too long. Maximum 1000 characters allowed");
    }

    // Simulate AI processing delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate AI response (dummy implementation)
    const aiResponse = generateAIResponse(message.trim());

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get help center conversation history (optional feature)
 * GET /api/help-center/history
 */
export const getConversationHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    // In a real implementation, this would fetch conversation history from database
    // For now, return empty array as dummy implementation
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        messages: [],
        count: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
