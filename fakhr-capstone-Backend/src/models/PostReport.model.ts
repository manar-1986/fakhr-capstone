import mongoose, { Schema, Document } from "mongoose";

export interface IPostReport extends Document {
  postId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const postReportSchema = new Schema<IPostReport>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports from same user for same post
postReportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });

const PostReport = mongoose.model<IPostReport>("PostReport", postReportSchema);

export default PostReport;
