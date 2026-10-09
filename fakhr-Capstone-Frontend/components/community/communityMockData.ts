import type { CommunityCategoryId, CommunityPost } from "./types";

export const CATEGORY_TABS: { id: CommunityCategoryId; labelKey: string }[] = [
  { id: "all", labelKey: "community.allPosts" },
  { id: "tips", labelKey: "community.parentingTips" },
  { id: "education", labelKey: "community.education" },
];

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: "p1",
    kind: "text",
    categoryIds: ["all", "tips"],
    nameKey: "community.posts.ahmed.name",
    timeKey: "community.posts.ahmed.time",
    roleKey: "community.posts.ahmed.role",
    bodyKey: "community.posts.ahmed.body",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    likes: 24,
    comments: 8,
  },
  {
    id: "p2",
    kind: "image",
    categoryIds: ["all", "education"],
    nameKey: "community.posts.sarah.name",
    timeKey: "community.posts.sarah.time",
    roleKey: "community.posts.sarah.role",
    bodyKey: "community.posts.sarah.body",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1200&q=80",
    likes: 142,
    comments: 15,
    liked: true,
  },
  {
    id: "p3",
    kind: "question",
    categoryIds: ["all", "tips"],
    nameKey: "community.posts.anon.name",
    timeKey: "community.posts.anon.time",
    roleKey: "community.posts.anon.role",
    bodyKey: "community.posts.anon.body",
    badgeKey: "community.posts.anon.badge",
    responseCount: 12,
  },
  {
    id: "p4",
    kind: "text",
    categoryIds: ["education"],
    nameKey: "community.posts.layla.name",
    timeKey: "community.posts.layla.time",
    roleKey: "community.posts.layla.role",
    bodyKey: "community.posts.layla.body",
    likes: 56,
    comments: 11,
  },
  {
    id: "p5",
    kind: "text",
    categoryIds: ["tips"],
    nameKey: "community.posts.omar.name",
    timeKey: "community.posts.omar.time",
    roleKey: "community.posts.omar.role",
    bodyKey: "community.posts.omar.body",
    likes: 89,
    comments: 22,
  },
];

export function postsForCategory(cat: CommunityCategoryId): CommunityPost[] {
  if (cat === "all") return MOCK_POSTS.slice(0, 3);
  return MOCK_POSTS.filter((p) => p.categoryIds.includes(cat));
}
