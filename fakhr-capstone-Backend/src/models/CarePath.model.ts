import mongoose, { Document, Schema } from "mongoose";

export type CarePathStatus = "active" | "completed" | "paused";

export interface ICarePath extends Document {
  childId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  startDate: Date;
  status: CarePathStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CarePathSchema = new Schema<ICarePath>(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "CarePathTemplate",
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
  },
  { timestamps: true }
);

CarePathSchema.index({ childId: 1, status: 1 });

export default mongoose.model<ICarePath>("CarePath", CarePathSchema);
