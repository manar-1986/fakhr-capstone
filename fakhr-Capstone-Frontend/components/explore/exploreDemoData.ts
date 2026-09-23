import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

/**
 * Isolated visual demo data for the Explore (استكشف) tab.
 * Not wired to APIs — content.api resources are not implemented yet.
 */

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type ExploreCategoryId =
  | "all"
  | "sensory"
  | "life-skills"
  | "communication"
  | "behavior";

export type ExploreCategory = {
  id: ExploreCategoryId;
  label: string;
  icon: IoniconName;
  backgroundColor: string;
  iconColor: string;
};

export type WeeklyContentKind = "video" | "activity" | "article";

export type WeeklyContentItem = {
  id: string;
  kind: WeeklyContentKind;
  badge: string;
  title: string;
  imageUrl: string;
  duration?: string;
  categoryIds: ExploreCategoryId[];
};

export type ExploreArticleItem = {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  imageUrl: string;
  categoryIds: ExploreCategoryId[];
};

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: "all",
    label: "جميع\nالمواضيع",
    icon: "book-outline",
    backgroundColor: "#BCC3D8",
    iconColor: "#8B91AF",
  },
  {
    id: "sensory",
    label: "الحسي",
    icon: "ear-outline",
    backgroundColor: "#E4E0F6",
    iconColor: "#7B73C0",
  },
  {
    id: "life-skills",
    label: "المهارات\nالحياتية",
    icon: "hand-left-outline",
    backgroundColor: "#F8E6D8",
    iconColor: "#D0895A",
  },
  {
    id: "communication",
    label: "التواصل\nوالنطق",
    icon: "extension-puzzle-outline",
    backgroundColor: "#DDE4F8",
    iconColor: "#6E7CAF",
  },
  {
    id: "behavior",
    label: "السلوك",
    icon: "heart-outline",
    backgroundColor: "#F8DDE4",
    iconColor: "#D46A86",
  },
];

export const FEATURED_CARD = {
  title: "أنشطة بسيطة تصنع فرق كبير",
  subtitle: "أفكار عملية يمكنك تطبيقها في المنزل مع طفلك",
  cta: "استكشف الآن",
  imageUrl:
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
};

export const WEEKLY_CONTENT: WeeklyContentItem[] = [
  {
    id: "w1",
    kind: "video",
    badge: "فيديو",
    title: "كيف أشجع طفلي على التواصل البصري؟",
    duration: "4:12",
    imageUrl:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=700&q=80",
    categoryIds: ["communication", "all"],
  },
  {
    id: "w2",
    kind: "activity",
    badge: "نشاط",
    title: "نشاط حسي بسيط في المنزل (5 دقائق)",
    imageUrl:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=700&q=80",
    categoryIds: ["sensory", "all"],
  },
  {
    id: "w3",
    kind: "article",
    badge: "مقال",
    title: "دليل التعامل مع نوبات الغضب",
    imageUrl:
      "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=700&q=80",
    categoryIds: ["behavior", "all"],
  },
];

export const EXPLORE_ARTICLES: ExploreArticleItem[] = [
  {
    id: "a1",
    title: "إعداد طفلك للانتقال إلى المدرسة",
    subtitle: "خطوات عملية لبداية ناجحة",
    readTime: "5 دقائق قراءة",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80",
    categoryIds: ["life-skills", "all"],
  },
  {
    id: "a2",
    title: "تحسين النوم لدى الأطفال ذوي الاحتياجات الخاصة",
    subtitle: "استراتيجيات مجربة من مختصين",
    readTime: "7 دقائق قراءة",
    imageUrl:
      "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=500&q=80",
    categoryIds: ["sensory", "behavior", "all"],
  },
];
