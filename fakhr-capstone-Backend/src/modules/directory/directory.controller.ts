import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import Center from "../../models/Center.model";
import Professional from "../../models/Professional.model";

// محافظات الكويت 
const KUWAIT_CITIES = [
  "Kuwait City",
  "Hawalli",
  "Farwaniya",
  "Ahmadi",
  "Jahra",
  "Mubarak Al-Kabeer",
];


export const getCenters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, type, search, specialty } = req.query;

    const filter: Record<string, unknown> = {};

    if (city) filter.city = String(city);
    if (type) filter.type = String(type);

    if (specialty) {
      filter.specialties = { $in: [String(specialty)] };
    }

    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
        { specialties: { $regex: q, $options: "i" } },
      ];
    }

    const centers = await Center.find(filter).sort({ createdAt: -1 }).select("-reviews").lean();
    const withId = centers.map((c) => {
      const doc = c as { _id?: { toString?: () => string } };
      return { ...c, id: doc._id?.toString?.() ?? doc._id };
    });
    res.status(200).json({ success: true, data: withId });
  } catch (err) {
    next(err);
  }
};


export const getCenterById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid center ID format" });
    }
    const center = await Center.findById(id).lean();
    if (!center) return res.status(404).json({ success: false, message: "Center not found" });
    const c = center as { _id?: { toString?: () => string } | string };
    const withId = { ...center, id: typeof c._id === "string" ? c._id : c._id?.toString?.() ?? "" };
    res.status(200).json({ success: true, data: withId });
  } catch (err) {
    next(err);
  }
};


export const getCities = async (_req: Request, res: Response) => {
  try {
    const citiesInDb = await Center.distinct("city");
    res.status(200).json({
      success: true,
      data: citiesInDb.length > 0 ? citiesInDb : KUWAIT_CITIES,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
    });
  }
};


export const getSpecialties = async (_req: Request, res: Response) => {
  try {
    const specialties = await Center.distinct("specialties");
    res.status(200).json({
      success: true,
      data: specialties,
    });
  } catch (error) {
    console.error("Error fetching specialties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch specialties",
    });
  }
};
/**
 * POST /api/directory/centers
 * Create a new center
 */
export const createCenter = async (req: Request, res: Response) => {
    try {
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
        latitude,
        longitude,
      } = req.body;
  
      if (!name || !type || !address || !city || !phone) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name, type, address, city, phone",
        });
      }
  
      const newCenter = await Center.create({
        name,
        type,
        address,
        city,
        phone,
        email,
        description,
        specialties: specialties || [],
        operatingHours,
        latitude,
        longitude,
        rating: 0,
        reviews: [],
      });
  
      res.status(201).json({
        success: true,
        data: newCenter,
      });
    } catch (error) {
      console.error("Error creating center:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create center",
      });
    }
  };

export const getProfessionals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty, city, centerId, search, verified } = req.query;

    const filter: Record<string, unknown> = {};

    if (specialty) filter.specialty = String(specialty);
    if (city) filter.location = { $regex: String(city), $options: "i" };
    if (centerId) filter.centerId = String(centerId);

    if (verified !== undefined) {
      filter.verified = String(verified) === "true";
    }

    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { nameAr: { $regex: q, $options: "i" } },
        { nameEn: { $regex: q, $options: "i" } },
        { specialtyLabel: { $regex: q, $options: "i" } },
        { specialtyLabelAr: { $regex: q, $options: "i" } },
        { specialtyLabelEn: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { bioAr: { $regex: q, $options: "i" } },
        { bioEn: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { locationAr: { $regex: q, $options: "i" } },
        { locationEn: { $regex: q, $options: "i" } },
        { services: { $in: [new RegExp(q, "i")] } },
      ];
    }

    const professionals = await Professional.find(filter)
      .populate("centerId")
      .sort({ verified: -1, rating: -1 })
      .lean();

    const withId = professionals.map((p) => {
      const doc = p as { _id?: { toString?: () => string } };
      return { ...p, id: doc._id?.toString?.() ?? doc._id };
    });
    res.status(200).json({ success: true, data: { professionals: withId } });
  } catch (err) {
    next(err);
  }
};

export const getProfessionalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid professional ID format" });
    }
    const professional = await Professional.findById(id).populate("centerId").lean();
    if (!professional) return res.status(404).json({ success: false, message: "Professional not found" });
    const doc = professional as { _id?: { toString?: () => string }; centerId?: { name?: string; address?: string; city?: string; phone?: string; email?: string } };
    const center = doc.centerId as { name?: string; address?: string; city?: string; phone?: string; email?: string } | undefined;
    const withId = {
      ...professional,
      id: doc._id?.toString?.() ?? doc._id,
      centerName: center?.name,
      centerAddress: center?.address ? `${center.address}${center.city ? `, ${center.city}` : ""}` : undefined,
      centerPhone: center?.phone,
      centerEmail: center?.email,
    };
    res.status(200).json({ success: true, data: { professional: withId } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/directory/professionals/specialties/list
 * Get list of professional specialties
 */
export const getProfessionalSpecialties = async (_req: Request, res: Response) => {
  try {
    const specialties = await Professional.distinct("specialtyLabel");
    res.status(200).json({
      success: true,
      data: specialties.sort(),
    });
  } catch (error) {
    console.error("Error fetching professional specialties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch professional specialties",
    });
  }
};
