import mongoose, { Document, Schema } from "mongoose";

export interface ICarePathCheckin extends Document {
  carePathId: mongoose.Types.ObjectId;
  date: Date;
  difficulty?: "easy" | "ok" | "hard";
  engagement?: "low" | "medium" | "high";
  note?: string;
  answers?: Record<string, any>; // optional JSON blob
  createdAt: Date;
  updatedAt: Date;
}

const CarePathCheckinSchema = new Schema<ICarePathCheckin>(
  {
    carePathId: { type: Schema.Types.ObjectId, ref: "CarePath", required: true },
    date: { type: Date, default: Date.now },

    difficulty: { type: String, enum: ["easy", "ok", "hard"] },
    engagement: { type: String, enum: ["low", "medium", "high"] },
    note: { type: String },
    answers: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

CarePathCheckinSchema.index({ carePathId: 1, date: -1 });

export default mongoose.model<ICarePathCheckin>(
  "CarePathCheckin",
  CarePathCheckinSchema
);
