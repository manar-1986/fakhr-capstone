import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  category: string;
  rating: number;
  reviews: number;
  providers: number;
  color: string;
  benefits: string[];
  duration: string;
  frequency: string;
  ageRange: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    providers: { type: Number, default: 0 },
    color: { type: String, required: true },
    benefits: [{ type: String }],
    duration: { type: String, required: true },
    frequency: { type: String, required: true },
    ageRange: { type: String, required: true },
  },
  { timestamps: true }
);

const Service = mongoose.model<IService>("Service", serviceSchema);

export default Service;