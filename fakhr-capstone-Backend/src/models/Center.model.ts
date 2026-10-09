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
