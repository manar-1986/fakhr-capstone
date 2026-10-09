export type CommunityCategoryId = "all" | "tips" | "education";

type LocalizedPostFields = {
  nameKey: string;
  timeKey: string;
  roleKey: string;
  bodyKey: string;
};

export type TextPost = LocalizedPostFields & {
  id: string;
  kind: "text";
  categoryIds: CommunityCategoryId[];
  avatarUrl?: string;
  likes: number;
  comments: number;
};

export type ImagePost = LocalizedPostFields & {
  id: string;
  kind: "image";
  categoryIds: CommunityCategoryId[];
  avatarUrl?: string;
  imageUrl: string;
  likes: number;
  comments: number;
  liked?: boolean;
};

export type QuestionPost = LocalizedPostFields & {
  id: string;
  kind: "question";
  categoryIds: CommunityCategoryId[];
  badgeKey: string;
  responseCount: number;
};

export type CommunityPost = TextPost | ImagePost | QuestionPost;
