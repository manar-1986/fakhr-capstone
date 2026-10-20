export type LibraryVideoItem = {
  id: string;
  kind: "video";
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  durationLabel: string;
  authorName: string;
};

export type LibraryInfographicItem = {
  id: string;
  kind: "infographic";
  title: string;
  subtitle: string;
  pdfSizeLabel: string;
};

export type LibraryArticleItem = {
  id: string;
  kind: "article";
  readTimeLabel: string;
  title: string;
  description: string;
};

export type LibraryFeedItem =
  | LibraryVideoItem
  | LibraryInfographicItem
  | LibraryArticleItem;
