import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Service from "../../models/Service.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";

/**
 * Get all services
 * GET /api/services
 */
export const getServices = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const services = await Service.find().sort({ name: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        services: services.map((service) => ({
          id: service._id.toString(),
          name: service.name,
          description: service.description,
          longDescription: service.longDescription,
          icon: service.icon,
          category: service.category,
          rating: service.rating,
          reviews: service.reviews,
          providers: service.providers,
          color: service.color,
          benefits: service.benefits,
          duration: service.duration,
          frequency: service.frequency,
          ageRange: service.ageRange,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        })),
        count: services.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 * GET /api/services/:serviceId
 */
export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const serviceId = Array.isArray(req.params.serviceId)
      ? req.params.serviceId[0]
      : req.params.serviceId;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      throw ApiError.badRequest("Invalid service ID format");
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      throw ApiError.notFound("Service not found");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        service: {
          id: service._id.toString(),
          name: service.name,
          description: service.description,
          longDescription: service.longDescription,
          icon: service.icon,
          category: service.category,
          rating: service.rating,
          reviews: service.reviews,
          providers: service.providers,
          color: service.color,
          benefits: service.benefits,
          duration: service.duration,
          frequency: service.frequency,
          ageRange: service.ageRange,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
