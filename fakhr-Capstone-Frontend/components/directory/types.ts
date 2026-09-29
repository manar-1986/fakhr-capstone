export type DirectoryListing = {
  id: string;
  kind: "center" | "doctor";
  name: string;
  nameAr: string;
  nameEn: string;
  subtitle: string;
  subtitleAr: string;
  subtitleEn: string;
  status: "OPEN" | "BUSY";
  locationLine: string;
  locationLineAr?: string;
  locationLineEn?: string;
  rating: string;
  imageUrl: string;
  tags: string[];
  tagsAr?: string[];
  tagsEn?: string[];
  /** When set, shows "+N more" after visible tags */
  moreTagCount?: number;
  phone: string;
};
