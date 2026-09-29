import mongoose, { Document, Schema } from "mongoose";

export type TaskStatus = "pending" | "completed" | "skipped";

export interface ITask extends Document {
  carePathId: mongoose.Types.ObjectId;
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
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  frequency?: string;
  frequencyAr?: string;
  frequencyEn?: string;
  note?: string;
  noteAr?: string;
  noteEn?: string;

  status: TaskStatus;
  completedAt?: Date;
  dueDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    carePathId: { type: Schema.Types.ObjectId, ref: "CarePath", required: true },
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
    note: { type: String },
    noteAr: { type: String },
    noteEn: { type: String },

    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
    },
    completedAt: { type: Date },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ carePathId: 1, week: 1 });
TaskSchema.index({ status: 1 });

export default mongoose.model<ITask>("Task", TaskSchema);
