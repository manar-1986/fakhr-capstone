export type HomeActivityCategoryId =
  | "occupational"
  | "behavioral"
  | "sensory";

export type HomeActivityVideo = {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: HomeActivityCategoryId;
  duration: string;
  sourceAr: string;
  sourceEn: string;
  youtubeUrl: string;
  thumbnail: string;
};

export type HomeActivityCategory = {
  id: HomeActivityCategoryId;
  labelAr: string;
  labelEn: string;
};

export const HOME_ACTIVITY_CATEGORIES: HomeActivityCategory[] = [
  {
    id: "occupational",
    labelAr: "العلاج الوظيفي",
    labelEn: "Occupational Therapy",
  },
  {
    id: "behavioral",
    labelAr: "العلاج السلوكي وتنظيم السلوك",
    labelEn: "Behavioral & Self-Regulation",
  },
  {
    id: "sensory",
    labelAr: "الأنشطة الحسية",
    labelEn: "Sensory Activities",
  },
];

export function youtubeIdFromUrl(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? "";
}

export function thumbnailForVideo(video: HomeActivityVideo): string {
  if (video.thumbnail?.trim()) return video.thumbnail.trim();
  const id = youtubeIdFromUrl(video.youtubeUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

/**
 * Approved home-activity videos only.
 * Add or replace entries here after a YouTube URL is provided/approved.
 *
 * {
 *   titleAr: "...",
 *   titleEn: "...",
 *   descriptionAr: "...",
 *   descriptionEn: "...",
 *   category: "occupational" | "behavioral" | "sensory",
 *   duration: "...",
 *   sourceAr: "...",
 *   sourceEn: "...",
 *   youtubeUrl: "https://www.youtube.com/watch?v=...",
 *   thumbnail: "https://img.youtube.com/vi/<id>/hqdefault.jpg",
 * }
 */
const CRIT_SOURCE_AR = "معهد إعادة تأهيل الأطفال TeletonUSA (CRIT)";
const CRIT_SOURCE_EN = "Children's Rehabilitation Institute TeletonUSA (CRIT)";

function youtubeThumb(youtubeUrl: string): string {
  const id = youtubeIdFromUrl(youtubeUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

export const HOME_ACTIVITY_VIDEOS: HomeActivityVideo[] = [
  {
    titleAr: "تمرين تقوية المسكة واستخدام الأدوات",
    titleEn: "Easy Grip",
    descriptionAr: "تمرين من CRIT لتقوية المسكة والتدريب على استخدام الأدوات في المنزل.",
    descriptionEn: "A CRIT activity to build grip strength and practice using tools at home.",
    category: "occupational",
    duration: "",
    sourceAr: CRIT_SOURCE_AR,
    sourceEn: CRIT_SOURCE_EN,
    youtubeUrl: "https://youtu.be/MuSFKcYkH_M",
    thumbnail: youtubeThumb("https://youtu.be/MuSFKcYkH_M"),
  },
  {
    titleAr: "تمارين اليد والأصابع",
    titleEn: "Hand Rainbows",
    descriptionAr: "تمارين لليدين والأصابع من CRIT لدعم المهارات الدقيقة.",
    descriptionEn: "CRIT hand and finger exercises that support fine-motor skills.",
    category: "occupational",
    duration: "",
    sourceAr: CRIT_SOURCE_AR,
    sourceEn: CRIT_SOURCE_EN,
    youtubeUrl: "https://youtu.be/n0Dq1I5rVhc",
    thumbnail: youtubeThumb("https://youtu.be/n0Dq1I5rVhc"),
  },
  {
    titleAr: "تدريب الأهل على التعامل مع السلوك",
    titleEn: "ABA Parent Training",
    descriptionAr:
      "فيديوهات إرشادية للأهل تساعد على فهم السلوك وتطبيق استراتيجيات سلوكية في المنزل.",
    descriptionEn:
      "Parent training videos for understanding behavior and applying behavioral strategies at home.",
    category: "behavioral",
    duration: "",
    sourceAr: "Fairfax County Public Schools",
    sourceEn: "Fairfax County Public Schools",
    youtubeUrl:
      "https://www.fcps.edu/academics/academic-overview/special-education-instruction/applied-behavior-analysis-aba-program",
    thumbnail: "",
  },
  {
    titleAr: "نشاط الصندوق الحسي",
    titleEn: "Sensory Box",
    descriptionAr: "نشاط صندوق حسي من CRIT لاستكشاف الملمس في المنزل.",
    descriptionEn: "A CRIT sensory box activity for exploring textures at home.",
    category: "sensory",
    duration: "",
    sourceAr: CRIT_SOURCE_AR,
    sourceEn: CRIT_SOURCE_EN,
    youtubeUrl: "https://youtu.be/UnHDvXQJUAc",
    thumbnail: youtubeThumb("https://youtu.be/UnHDvXQJUAc"),
  },
  {
    titleAr: "نشاط الضغط العميق",
    titleEn: "Deep Pressure Massage",
    descriptionAr: "نشاط ضغط عميق من CRIT للمساعدة على تنظيم الإحساس الجسدي.",
    descriptionEn: "A CRIT deep-pressure activity to support body awareness and calm.",
    category: "sensory",
    duration: "",
    sourceAr: CRIT_SOURCE_AR,
    sourceEn: CRIT_SOURCE_EN,
    youtubeUrl: "https://youtu.be/CI8rLrnL4QY",
    thumbnail: youtubeThumb("https://youtu.be/CI8rLrnL4QY"),
  },
  {
    titleAr: "نشاط الضغط على المفاصل",
    titleEn: "Joint Compression",
    descriptionAr: "نشاط ضغط على المفاصل من CRIT لدعم التنظيم الحسي.",
    descriptionEn: "A CRIT joint-compression activity to support sensory regulation.",
    category: "sensory",
    duration: "",
    sourceAr: CRIT_SOURCE_AR,
    sourceEn: CRIT_SOURCE_EN,
    youtubeUrl: "https://youtu.be/FZQgKRERFLc",
    thumbnail: youtubeThumb("https://youtu.be/FZQgKRERFLc"),
  },
];
