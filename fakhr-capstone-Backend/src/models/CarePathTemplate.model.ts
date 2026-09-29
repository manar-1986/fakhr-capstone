import mongoose, { Document, Schema } from "mongoose";

export interface ICarePathTaskTemplate {
  week: number;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  instructions?: string;
  instructionsAr?: string;
  instructionsEn?: string;
  expectedOutcome?: string;
  expectedOutcomeAr?: string;
  expectedOutcomeEn?: string;
  category?: string; // optional: "language" | "routine" | ...
  difficulty?: "beginner" | "intermediate" | "advanced";
  frequency?: string; // "daily", "3x weekly", ...
  frequencyAr?: string;
  frequencyEn?: string;
}

export interface ICarePathTemplate extends Document {
  name: string;
  description?: string;
  duration: number; // weeks
  targetTags?: string[]; // optional matching
  targetDiagnoses?: string[]; // optional matching
  tasks: ICarePathTaskTemplate[];
  createdAt: Date;
  updatedAt: Date;
}

const CarePathTaskTemplateSchema = new Schema<ICarePathTaskTemplate>(
  {
    week: { type: Number, required: true, min: 1 },
    title: { type: String, required: true },
    titleAr: { type: String },
    titleEn: { type: String },
    description: { type: String, required: true },
    descriptionAr: { type: String },
    descriptionEn: { type: String },
    instructions: { type: String },
    instructionsAr: { type: String },
    instructionsEn: { type: String },
    expectedOutcome: { type: String },
    expectedOutcomeAr: { type: String },
    expectedOutcomeEn: { type: String },
    category: { type: String },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    frequency: { type: String },
    frequencyAr: { type: String },
    frequencyEn: { type: String },
  },
  { _id: false }
);

const CarePathTemplateSchema = new Schema<ICarePathTemplate>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    duration: { type: Number, required: true, min: 1 },
    targetTags: { type: [String], default: [] },
    targetDiagnoses: { type: [String], default: [] },
    tasks: { type: [CarePathTaskTemplateSchema], default: [] },
  },
  { timestamps: true }
);

CarePathTemplateSchema.index({ targetTags: 1 });
CarePathTemplateSchema.index({ targetDiagnoses: 1 });

export default mongoose.model<ICarePathTemplate>(
  "CarePathTemplate",
  CarePathTemplateSchema
);
