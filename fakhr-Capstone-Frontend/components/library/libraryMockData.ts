import type { LibraryFeedItem } from "./types";

/** Disability category chips (horizontal). */
export const DISABILITY_CATEGORIES = [
  { id: "physical", label: "Physical", icon: "accessibility-outline" as const },
  { id: "intellectual", label: "Intellectual", icon: "cog-outline" as const },
  { id: "sensory", label: "Sensory", icon: "ear-outline" as const },
];

/** Tag chips under categories. */
export const DISABILITY_TAGS = [
  "#Speech",
  "#Behavior",
  "#Mobility",
  "#Inclusion",
  "#LegalRights",
];

/** Expert topic chips (horizontal) — specialist-focused themes. */
export const EXPERT_TOPICS = [
  "ADHD",
  "ADD",
  "Autism",
  "Speech therapy",
  "Behavior support",
];

/**
 * Curated feed: videos use real YouTube IDs for thumbnails + deep links.
 * Replace or extend when wiring to a CMS.
 */
export const LIBRARY_FEED: LibraryFeedItem[] = [
  {
    id: "v1",
    kind: "video",
    youtubeId: "jNQXAC9IVRw",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    title: "Navigating Early Intervention Services: A Step-by-Step Guide",
    durationLabel: "VIDEO • 08:45",
    authorName: "Dr. Sarah Ahmed",
  },
  {
    id: "inf1",
    kind: "infographic",
    title: "10 Signs of Sensory Processing Sensitivity in Children",
    subtitle: "Understanding Sensory Overload",
    pdfSizeLabel: "Download PDF (2.4MB)",
  },
  {
    id: "a1",
    kind: "article",
    readTimeLabel: "ARTICLE • 5 MIN READ",
    title: "Empowering Your Child's Communication Skills",
    description:
      "Explore practical strategies for supporting non-verbal communication, AAC tools, and everyday routines that build confidence at home and in school.",
  },
  {
    id: "v2",
    kind: "video",
    youtubeId: "M7lc1UVf-VE",
    youtubeUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    title: "Assistive Technology: Tools for Independent Living",
    durationLabel: "VIDEO • 12:20",
    authorName: "Tech Experts Panel",
  },
];

export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}
