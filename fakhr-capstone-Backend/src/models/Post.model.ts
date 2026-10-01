import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  tags: string[];
  likes: number;
  visibility: "public" | "members";
  imageUrl?: string;
  isPinned: boolean;
  likedBy: mongoose.Types.ObjectId[];
  savedBy: mongoose.Types.ObjectId[];
  comments: { _id: mongoose.Types.ObjectId; authorId: mongoose.Types.ObjectId; content: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Legacy posts stay members-only. Publishing publicly is explicit in createPost.
    visibility: { type: String, enum: ["public", "members"], default: "members", index: true },
    imageUrl: { type: String, maxlength: 2048 },
    isPinned: { type: Boolean, default: false },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{
      authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      content: { type: String, required: true, maxlength: 2000 },
      createdAt: { type: Date, default: Date.now },
    }],
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
