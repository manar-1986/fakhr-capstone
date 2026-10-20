import mongoose, { Schema, Document } from "mongoose";

export interface IReview {
    userId: mongoose.Types.ObjectId;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface ICenter extends Document {
    name: string;
    type: "public" | "private";
    address: string;
    city: string;
    phone: string;
    email?: string;
  description?: string;
  specialties: string[];
  operatingHours?: string;
  rating: number;
  mapUrl?: string;
  googleMapsUrl?: string;
  whatsapp?: string | { phone?: string; url?: string };
  whatsappNumber?: string;
  whatsappUrl?: string;
  website?: string;
  instagram?: string;
  reviewCount?: number;
  ratingVerification?: { verifiedAt: string; evidence: string };
  latitude?: number;
  longitude?: number;
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  const CenterSchema = new Schema<ICenter>(
    {
      name: { type: String, required: true },
      type: { type: String, enum: ["public", "private"], required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      description: { type: String },
      specialties: [{ type: String }],
      operatingHours: { type: String },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      // Optional public contact fields; no defaults or migrations change existing records.
      mapUrl: { type: String },
      googleMapsUrl: { type: String },
      whatsapp: { type: Schema.Types.Mixed },
      whatsappNumber: { type: String },
      whatsappUrl: { type: String },
      website: { type: String },
      instagram: { type: String },
      reviewCount: { type: Number, min: 0 },
      // A default zero or an unsupported numeric score must not become a public rating.
      ratingVerification: { type: new Schema({ verifiedAt: String, evidence: String }, { _id: false }), default: undefined },
      latitude: { type: Number },
      longitude: { type: Number },
      reviews: [ReviewSchema],
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },

     }
  );
  CenterSchema.virtual('id').get(function() {
    return this._id.toHexString();
  });

  CenterSchema.index({ city: 1, type: 1});
  CenterSchema.index({ specialties: 1 });

  export default mongoose.model<ICenter>("Center", CenterSchema);
