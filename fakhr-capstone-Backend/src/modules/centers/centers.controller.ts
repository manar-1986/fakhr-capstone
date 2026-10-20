import { publicCenterQuery, isPublicCenter } from "../../utils/centerVisibility";
import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Center from "../../models/Center.model";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";

/**
 * Get all centers with optional filters
 * GET /api/directory/centers
 * Query params: type, city, specialties
 */
export const getCenters = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const { type, city, specialties } = req.query;

    // Build query
    const query: any = { ...publicCenterQuery };

    if (type && (type === "public" || type === "private")) {
      query.type = type;
    }

    if (city && typeof city === "string") {
      query.city = { $regex: city, $options: "i" };
    }

    if (specialties) {
      const specialtiesArray = Array.isArray(specialties)
        ? specialties
        : typeof specialties === "string"
        ? specialties.split(",")
        : [];
      if (specialtiesArray.length > 0) {
        query.specialties = { $in: specialtiesArray };
      }
    }

    const centers = await Center.find(query).sort({ name: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        centers: centers.map((center) => ({
          id: center._id.toString(),
          name: center.name,
          type: center.type,
          address: center.address,
          city: center.city,
          phone: center.phone,
          email: center.email,
          description: center.description,
          specialties: center.specialties,
          operatingHours: center.operatingHours,
          rating: center.rating,
          ratingVerification: center.ratingVerification,
          reviewCount: center.reviewCount,
          mapUrl: center.mapUrl,
          googleMapsUrl: center.googleMapsUrl,
          whatsapp: center.whatsapp,
          whatsappNumber: center.whatsappNumber,
          whatsappUrl: center.whatsappUrl,
          website: center.website,
          instagram: center.instagram,
          latitude: center.latitude,
          longitude: center.longitude,
          createdAt: center.createdAt,
          updatedAt: center.updatedAt,
        })),
        count: centers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get center by ID
 * GET /api/directory/centers/:centerId
 */
export const getCenterById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const centerId = Array.isArray(req.params.centerId)
      ? req.params.centerId[0]
      : req.params.centerId;

    if (!centerId || !mongoose.Types.ObjectId.isValid(centerId)) {
      throw ApiError.badRequest("Invalid center ID format");
    }

    const center = await Center.findById(centerId);

    if (!center || !isPublicCenter(center)) {
      throw ApiError.notFound("Center not found");
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        center: {
          id: center._id.toString(),
          name: center.name,
          type: center.type,
          address: center.address,
          city: center.city,
          phone: center.phone,
          email: center.email,
          description: center.description,
          specialties: center.specialties,
          operatingHours: center.operatingHours,
          rating: center.rating,
          ratingVerification: center.ratingVerification,
          reviewCount: center.reviewCount,
          mapUrl: center.mapUrl,
          googleMapsUrl: center.googleMapsUrl,
          whatsapp: center.whatsapp,
          whatsappNumber: center.whatsappNumber,
          whatsappUrl: center.whatsappUrl,
          website: center.website,
          instagram: center.instagram,
          latitude: center.latitude,
          longitude: center.longitude,
          createdAt: center.createdAt,
          updatedAt: center.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new center
 * POST /api/directory/centers
 */
export const createCenter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const {
      name,
      type,
      address,
      city,
      phone,
      email,
      description,
      specialties,
      operatingHours,
      rating,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (!name || !address || !city || !phone) {
      throw ApiError.badRequest("Name, address, city, and phone are required");
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      throw ApiError.badRequest("Name must be a non-empty string");
    }

    if (typeof address !== "string" || address.trim().length === 0) {
      throw ApiError.badRequest("Address must be a non-empty string");
    }

    if (typeof city !== "string" || city.trim().length === 0) {
      throw ApiError.badRequest("City must be a non-empty string");
    }

    if (typeof phone !== "string" || phone.trim().length === 0) {
      throw ApiError.badRequest("Phone must be a non-empty string");
    }

    // Validate type
    if (type && type !== "public" && type !== "private") {
      throw ApiError.badRequest("Type must be either 'public' or 'private'");
    }

    // Validate rating if provided
    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 0 || rating > 5) {
        throw ApiError.badRequest("Rating must be a number between 0 and 5");
      }
    }

    // Validate specialties if provided
    let validSpecialties: string[] = [];
    if (specialties) {
      if (!Array.isArray(specialties)) {
        throw ApiError.badRequest("Specialties must be an array");
      }
      validSpecialties = specialties
        .filter((spec: any) => typeof spec === "string" && spec.trim().length > 0)
        .map((spec: string) => spec.trim());
    }

    // Create center
    const center = await Center.create({
      name: name.trim(),
      type: type || "public",
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      description: description?.trim(),
      specialties: validSpecialties,
      operatingHours: operatingHours?.trim(),
      rating: rating || 0,
      latitude,
      longitude,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        center: {
          id: center._id.toString(),
          name: center.name,
          type: center.type,
          address: center.address,
          city: center.city,
          phone: center.phone,
          email: center.email,
          description: center.description,
          specialties: center.specialties,
          operatingHours: center.operatingHours,
          rating: center.rating,
          ratingVerification: center.ratingVerification,
          reviewCount: center.reviewCount,
          mapUrl: center.mapUrl,
          googleMapsUrl: center.googleMapsUrl,
          whatsapp: center.whatsapp,
          whatsappNumber: center.whatsappNumber,
          whatsappUrl: center.whatsappUrl,
          website: center.website,
          instagram: center.instagram,
          latitude: center.latitude,
          longitude: center.longitude,
          createdAt: center.createdAt,
          updatedAt: center.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete center by ID
 * DELETE /api/directory/centers/:centerId
 */
export const deleteCenter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const centerId = Array.isArray(req.params.centerId)
      ? req.params.centerId[0]
      : req.params.centerId;

    if (!centerId || !mongoose.Types.ObjectId.isValid(centerId)) {
      throw ApiError.badRequest("Invalid center ID format");
    }

    const center = await Center.findById(centerId);

    if (!center) {
      throw ApiError.notFound("Center not found");
    }

    // Delete the center
    await Center.findByIdAndDelete(centerId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        message: "Center deleted successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};
