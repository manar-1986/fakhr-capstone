import mongoose, { Document, Schema } from "mongoose";

export type TaskStatus = "pending" | "completed" | "skipped";

export interface ITask extends Document {
  dashboardFingerprint?:string; startedAt?: Date; dashboardRevision?: number; scheduledDate?: string; startTime?: string; timezone?: string; durationMinutes?: number;
  titleAr?:string; titleEn?:string; descriptionAr?:string; descriptionEn?:string; instructionsAr?:string; instructionsEn?:string; expectedOutcomeAr?:string; expectedOutcomeEn?:string; guidanceAr?:string; guidanceEn?:string; skillsAr?:string; skillsEn?:string; materialsAr?:string; materialsEn?:string;
  carePathId: mongoose.Types.ObjectId;
  week: number;
  title: string;
  description: string;
  instructions?: string;
  expectedOutcome?: string;
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  frequency?: string;

  status: TaskStatus;
  completedAt?: Date;
  dueDate?: Date;
  note?: string;

  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    startedAt: Date, dashboardFingerprint: {type: String},
 dashboardRevision:{type:Number,default:0},scheduledDate:String,startTime:String,timezone:String,durationMinutes:Number,
    titleAr:String,titleEn:String,descriptionAr:String,descriptionEn:String,instructionsAr:String,instructionsEn:String,expectedOutcomeAr:String,expectedOutcomeEn:String,guidanceAr:String,guidanceEn:String,skillsAr:String,skillsEn:String,materialsAr:String,materialsEn:String,
    carePathId: { type: Schema.Types.ObjectId, ref: "CarePath", required: true },
    week: { type: Number, required: true, min: 1 },

    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String },
    expectedOutcome: { type: String },
    category: { type: String },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },
    frequency: { type: String },

    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
    },
    completedAt: { type: Date },
    dueDate: { type: Date },
    note: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

TaskSchema.index({ carePathId: 1, week: 1 });
TaskSchema.index({ status: 1 });

export default mongoose.model<ITask>("Task", TaskSchema);
