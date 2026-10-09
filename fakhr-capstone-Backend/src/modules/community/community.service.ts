import { Types } from "mongoose";
import { ApiError } from "../../middlewares/apiError";
import Post from "../../models/Post.model";
import PostReport from "../../models/PostReport.model";

function toObjId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid id");
  return new Types.ObjectId(id);
}

export const communityService = {
  async listPosts() {
    const rows = await Post.find({}).sort({ createdAt: -1 }).limit(50);
    return rows.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content,
      tags: p.tags,
      authorId: p.authorId.toString(),
      createdAt: p.createdAt,
    }));
  },

  async createPost(userId: string, data: { title: string; content: string; tags?: string[] }) {
    const post = await Post.create({
      authorId: toObjId(userId),
      title: data.title,
      content: data.content,
      tags: data.tags ?? [],
    });

    return { id: post._id.toString() };
  },

  async reportPost(userId: string, postId: string, data: { reason: string }) {
    const post = await Post.findById(toObjId(postId));
    if (!post) throw ApiError.notFound("Post not found");

    try {
      await PostReport.create({
        postId: post._id,
        reporterId: toObjId(userId),
        reason: data.reason,
      });
    } catch {
      throw ApiError.conflict("You already reported this post");
    }

    return { ok: true };
  },
};
