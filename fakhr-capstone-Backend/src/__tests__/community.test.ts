import express from "express";
import request from "supertest";
import User from "../models/User.model";
import Post from "../models/Post.model";
import PostReport from "../models/PostReport.model";
import communityRoutes from "../modules/community/community.routes";
import { generateToken } from "../utils/jwt";
import { errorHandler } from "../middlewares/error.middleware";

const app = express();
app.use(express.json());
app.use("/api/community", communityRoutes);
app.use(errorHandler);
let token: string, otherToken: string, authorId: string;
beforeEach(async () => {
  const author = await User.create({ name: "Test Parent", email: "private@example.test", password: "test-password", role: "parent" });
  const other = await User.create({ name: "Other Parent", email: "other@example.test", password: "test-password", role: "parent" });
  authorId = String(author._id);
  token = generateToken({ userId: authorId }); otherToken = generateToken({ userId: String(other._id) });
  await PostReport.init();
});
const create = (body: object = {}) => request(app).post("/api/community/posts").auth(token, { type: "bearer" }).send({ title: "Test experience", content: "Test discussion", tags: ["autism"], visibility: "public", ...body });

test("guest browsing excludes legacy private posts and never exposes account email", async () => {
  await Post.create({ title: "Legacy private", content: "Members only", authorId });
  const created = await create().expect(201);
  expect(JSON.stringify(created.body)).not.toContain("private@example.test");
  const feed = await request(app).get("/api/community/posts").expect(200);
  expect(feed.body.data.posts).toHaveLength(1);
  expect(feed.body.data.posts[0].author).toEqual({ name: "Test Parent" });
  const privatePost = await Post.findOne({ title: "Legacy private" });
  await request(app).get(`/api/community/posts/${privatePost!._id}`).expect(404);
  const members = await request(app).get("/api/community/posts").auth(token, { type: "bearer" }).expect(200);
  expect(members.body.data.posts).toHaveLength(2);
});
test("category, escaped search, pinned content and pagination use persisted posts", async () => {
  await create({ title: "Sensory [tips]" }).expect(201);
  const second = await create({ title: "School discussion", tags: ["learning"] }).expect(201);
  await Post.findByIdAndUpdate(second.body.data.post.id, { isPinned: true });
  const filtered = await request(app).get("/api/community/posts?category=autism&search=%5Btips%5D").expect(200);
  expect(filtered.body.data.posts).toHaveLength(1);
  const pinned = await request(app).get("/api/community/posts?pinned=true").expect(200);
  expect(pinned.body.data.posts[0].title).toBe("School discussion");
  const page = await request(app).get("/api/community/posts?limit=1&page=2").expect(200);
  expect(page.body.data.pagination.totalPages).toBe(2);
});
test("guest mutations and saved feed require authentication", async () => {
  const created = await create(); const id = created.body.data.post.id;
  await request(app).post("/api/community/posts").send({ title: "x", content: "y" }).expect(401);
  await request(app).put(`/api/community/posts/${id}/like`).send({ active: true }).expect(401);
  await request(app).post(`/api/community/posts/${id}/comments`).send({ content: "x" }).expect(401);
  await request(app).post(`/api/community/posts/${id}/report`).send({ reason: "x" }).expect(401);
  await request(app).get("/api/community/posts?sort=saved").expect(401);
});
test("likes are idempotent, comments persist, and bookmarks are account-scoped", async () => {
  const created = await create(); const id = created.body.data.post.id;
  for (let i = 0; i < 2; i++) await request(app).put(`/api/community/posts/${id}/like`).auth(otherToken, { type: "bearer" }).send({ active: true }).expect(200);
  await request(app).put(`/api/community/posts/${id}/save`).auth(otherToken, { type: "bearer" }).send({ active: true }).expect(200);
  await request(app).post(`/api/community/posts/${id}/comments`).auth(otherToken, { type: "bearer" }).send({ content: "My experience" }).expect(201);
  const detail = await request(app).get(`/api/community/posts/${id}`).expect(200);
  expect(detail.body.data.post.likes).toBe(1);
  expect(detail.body.data.post.comments[0].content).toBe("My experience");
  expect(JSON.stringify(detail.body)).not.toContain("example.test");
  expect(JSON.stringify(detail.body)).not.toContain("savedBy");
  const saved = await request(app).get("/api/community/posts?sort=saved").auth(otherToken, { type: "bearer" }).expect(200);
  expect(saved.body.data.posts).toHaveLength(1);
  const ownSaved = await request(app).get("/api/community/posts?sort=saved").auth(token, { type: "bearer" }).expect(200);
  expect(ownSaved.body.data.posts).toHaveLength(0);
  for (let i = 0; i < 2; i++) await request(app).put(`/api/community/posts/${id}/like`).auth(otherToken, { type: "bearer" }).send({ active: false }).expect(200);
  expect((await Post.findById(id))!.likes).toBe(0);
});
test("reports use the existing moderation queue and reject self/duplicate reporting", async () => {
  const created = await create(); const id = created.body.data.post.id;
  await request(app).post(`/api/community/posts/${id}/report`).auth(token, { type: "bearer" }).send({ reason: "Test" }).expect(403);
  await request(app).post(`/api/community/posts/${id}/report`).auth(otherToken, { type: "bearer" }).send({ reason: "Test report" }).expect(201);
  await request(app).post(`/api/community/posts/${id}/report`).auth(otherToken, { type: "bearer" }).send({ reason: "Test report" }).expect(409);
  expect(await PostReport.countDocuments({ postId: id, status: "pending" })).toBe(1);
});
test("image links are validated, user pinning is ignored, and visibility defaults to members", async () => {
  await create({ imageUrl: "javascript:alert(1)" }).expect(400);
  const created = await create({ isPinned: true, visibility: undefined, imageUrl: "https://example.test/image.png" }).expect(201);
  expect(created.body.data.post.isPinned).toBe(false);
  expect(created.body.data.post.visibility).toBe("members");
  expect((await request(app).get("/api/community/posts")).body.data.posts).toHaveLength(0);
});
