import instance from "./axios";
export type CommunityComment = { id: string; author: { name: string }; content: string; createdAt: string };
export type CommunityPost = {
  id: string; title: string; content: string; author: { name: string };
  tags: string[]; imageUrl?: string; isPinned: boolean; visibility: "public" | "members";
  likes: number; commentCount: number; isLiked: boolean; isSaved: boolean; isOwn: boolean;
  createdAt: string; comments?: CommunityComment[];
};
export type CommunitySort = "latest" | "engaged" | "saved";
type PostResult = { data: { post: CommunityPost } };
export type CommunityFeed = { posts: CommunityPost[]; pagination: { page: number; totalPages: number; total: number } };
export async function getCommunityPosts(params: { page?: number; category?: string; search?: string; sort?: CommunitySort; pinned?: boolean }) {
  const result = await instance.get("/community/posts", { params }) as unknown as { data: CommunityFeed };
  return result.data;
}
export async function getCommunityPost(id: string) {
  const result = await instance.get(`/community/posts/${encodeURIComponent(id)}`) as unknown as PostResult;
  return result.data.post;
}
export async function createCommunityPost(input: { title: string; content: string; tags: string[]; imageUrl?: string; visibility: "public" | "members" }) {
  const result = await instance.post("/community/posts", input) as unknown as PostResult;
  return result.data.post;
}
export async function setCommunityInteraction(id: string, action: "like" | "save", active: boolean) {
  const result = await instance.put(`/community/posts/${encodeURIComponent(id)}/${action}`, { active }) as unknown as PostResult;
  return result.data.post;
}
export async function commentOnCommunityPost(id: string, content: string) {
  const result = await instance.post(`/community/posts/${encodeURIComponent(id)}/comments`, { content }) as unknown as PostResult;
  return result.data.post;
}
export async function reportCommunityPost(id: string, reason: string) {
  await instance.post(`/community/posts/${encodeURIComponent(id)}/report`, { reason });
}
