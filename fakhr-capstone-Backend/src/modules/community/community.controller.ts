import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Post from "../../models/Post.model";
import PostReport from "../../models/PostReport.model";
import { ApiError } from "../../middlewares/apiError";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { USER_ROLES } from "../../config/constants";

const member = (req: AuthRequest) => req.user?.role === USER_ROLES.PARENT;
const visibility = (req: AuthRequest) => member(req) ? {} : { visibility: "public" };
const idOf = (req: AuthRequest) => {
  const id = String(req.params.postId ?? "");
  if (!mongoose.Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid post ID");
  return id;
};
function publicName(author: any) {
  const name = typeof author?.name === "string" ? author.name.trim() : "";
  return name.includes("@") ? "" : name;
}
/** Explicit allowlist: never return populated user objects, email, saves, or child/account data. */
export function postResponse(post: any, userId?: string, includeComments = false) {
  return {
    id: String(post._id), title: post.title, content: post.content,
    author: { name: publicName(post.authorId) },
    tags: post.tags ?? [], imageUrl: post.imageUrl || undefined,
    isPinned: post.isPinned === true, visibility: post.visibility ?? "members",
    likes: post.likes ?? 0, commentCount: post.comments?.length ?? 0,
    isLiked: !!userId && (post.likedBy ?? []).some((id: any) => String(id) === userId),
    isSaved: !!userId && (post.savedBy ?? []).some((id: any) => String(id) === userId),
    isOwn: !!userId && String(post.authorId?._id ?? post.authorId) === userId,
    createdAt: post.createdAt, updatedAt: post.updatedAt,
    ...(includeComments ? { comments: (post.comments ?? []).map((comment: any) => ({
      id: String(comment._id), author: { name: publicName(comment.authorId) }, content: comment.content, createdAt: comment.createdAt,
    })) } : {}),
  };
}
function requiredText(value: unknown, max: number, field: string) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw ApiError.badRequest(`Invalid ${field}`);
  return value.trim();
}
function escaped(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const title = requiredText(req.body.title, 200, "title");
    const content = requiredText(req.body.content, 5000, "content");
    const tags = Array.isArray(req.body.tags) ? req.body.tags.filter((tag: unknown) => typeof tag === "string" && tag.length <= 80).slice(0, 10).map((tag: string) => tag.trim().toLowerCase()) : [];
    let imageUrl: string | undefined;
    if (req.body.imageUrl) {
      imageUrl = requiredText(req.body.imageUrl, 2048, "image URL");
      try { const url = new URL(imageUrl); if (url.protocol !== "https:" || url.username || url.password) throw Error(); } catch { throw ApiError.badRequest("Image must be an HTTPS URL"); }
    }
    const post = await Post.create({ title, content, tags, imageUrl, authorId: req.user!.id, visibility: req.body.visibility === "public" ? "public" : "members" });
    await post.populate("authorId", "name");
    res.status(201).json({ success: true, data: { post: postResponse(post, req.user!.id) } });
  } catch (error) { next(error); }
};
export const getPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Math.min(10000, Number.parseInt(String(req.query.page)) || 1));
    const limit = Math.max(1, Math.min(50, Number.parseInt(String(req.query.limit)) || 20));
    const query: any = { ...visibility(req) };
    const category = String(req.query.category ?? "").slice(0, 80);
    if (category && category !== "all") query.tags = category;
    // Retain the legacy tags filter for existing callers.
    else if (req.query.tags) query.tags = { $in: (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]).map(String).slice(0, 10) };
    if (req.query.authorId) {
      const authorId = String(req.query.authorId);
      if (!mongoose.Types.ObjectId.isValid(authorId)) throw ApiError.badRequest("Invalid author ID");
      query.authorId = new mongoose.Types.ObjectId(authorId);
    }
    const search = String(req.query.search ?? "").trim().slice(0, 200);
    if (search) query.$or = [{ title: { $regex: escaped(search), $options: "i" } }, { content: { $regex: escaped(search), $options: "i" } }];
    if (req.query.pinned === "true") query.isPinned = true;
    if (req.query.sort === "saved") {
      if (!member(req)) throw ApiError.unauthorized("Sign in to view saved posts");
      query.savedBy = new mongoose.Types.ObjectId(req.user!.id);
    }
    const sort: Record<string, 1 | -1> = req.query.sort === "engaged" ? { _engagement: -1, createdAt: -1, _id: -1 } : { createdAt: -1, _id: -1 };
    const [total, ordered] = await Promise.all([
      Post.countDocuments(query),
      Post.aggregate([{ $match: query }, { $addFields: { _engagement: { $add: [{ $ifNull: ["$likes", 0] }, { $size: { $ifNull: ["$comments", []] } }] } } }, { $sort: sort }, { $skip: (page - 1) * limit }, { $limit: limit }, { $project: { _id: 1 } }]),
    ]);
    const posts = await Post.find({ _id: { $in: ordered.map(item => item._id) } }).populate("authorId", "name");
    const byId = new Map(posts.map(post => [String(post._id), post]));
    res.json({ success: true, data: { posts: ordered.map(item => byId.get(String(item._id))).filter(Boolean).map(post => postResponse(post, req.user?.id)), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};
export const getPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findOne({ _id: idOf(req), ...visibility(req) }).populate("authorId", "name").populate("comments.authorId", "name");
    if (!post) throw ApiError.notFound("Post not found");
    res.json({ success: true, data: { post: postResponse(post, req.user?.id, true) } });
  } catch (error) { next(error); }
};
// Explicit desired state + conditional atomic update: retries do not add duplicate likes/saves.
export const interactPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = idOf(req), userId = new mongoose.Types.ObjectId(req.user!.id);
    const kind = req.params.action;
    if (kind !== "like" && kind !== "save") throw ApiError.badRequest("Invalid action");
    if (typeof req.body.active !== "boolean") throw ApiError.badRequest("active must be boolean");
    const field = kind === "like" ? "likedBy" : "savedBy";
    const active = req.body.active;
    const query = { _id: id, [field]: active ? { $ne: userId } : userId };
    const update: any = active ? { $addToSet: { [field]: userId } } : { $pull: { [field]: userId } };
    if (kind === "like") update.$inc = { likes: active ? 1 : -1 };
    await Post.updateOne(query, update);
    const post = await Post.findById(id).populate("authorId", "name").populate("comments.authorId", "name");
    if (!post) throw ApiError.notFound("Post not found");
    res.json({ success: true, data: { post: postResponse(post, req.user!.id, true) } });
  } catch (error) { next(error); }
};
export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = idOf(req), content = requiredText(req.body.content, 2000, "comment");
    // Bound embedded discussion size so a post cannot exceed MongoDB's document limit.
    const post = await Post.findOneAndUpdate({ _id: id, "comments.499": { $exists: false } }, { $push: { comments: { authorId: req.user!.id, content, createdAt: new Date() } } }, { new: true, runValidators: true }).populate("authorId", "name").populate("comments.authorId", "name");
    if (!post) throw ApiError.badRequest("Post unavailable or discussion full");
    res.status(201).json({ success: true, data: { post: postResponse(post, req.user!.id, true) } });
  } catch (error) { next(error); }
};
export const reportPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = idOf(req), reason = requiredText(req.body.reason, 500, "reason");
    const post = await Post.findById(postId);
    if (!post) throw ApiError.notFound("Post not found");
    if (String(post.authorId) === req.user!.id) throw ApiError.forbidden("You cannot report your own post");
    const report = await PostReport.create({ postId, reporterId: req.user!.id, reason, status: "pending" });
    res.status(201).json({ success: true, data: { report: { id: String(report._id), status: report.status } } });
  } catch (error) {
    next((error as any)?.code === 11000 ? ApiError.conflict("You have already reported this post") : error);
  }
};
