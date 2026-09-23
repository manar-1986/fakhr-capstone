/**
 * Resource data and category config - shared across home and resource screens
 */

import { colors } from "../theme";

export type ResourceType = "add" | "adhd" | "autism";
export type ContentType = "videos" | "articles" | "podcasts" | "guides";

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  url: string;
  source: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  description: string;
  readTime: string;
  url: string;
  source: string;
}

export interface GuideItem {
  id: string;
  title: string;
  description: string;
  pages: string;
  url: string;
  source: string;
}

export interface PodcastItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  url: string;
  source: string;
}

export const RESOURCES: Record<
  ResourceType,
  {
    videos: VideoItem[];
    articles: ArticleItem[];
    guides: GuideItem[];
    podcasts: PodcastItem[];
  }
> = {
  add: {
    videos: [
      {
        id: "v1",
        title: "Understanding ADD in Children",
        description: "Learn about Attention Deficit Disorder symptoms and support",
        duration: "8 min",
        url: "https://www.youtube.com/watch?v=ouZrZa5pLXk",
        source: "YouTube",
      },
      {
        id: "v2",
        title: "ADD Strategies for Parents",
        description: "Practical tips for supporting your child with ADD",
        duration: "12 min",
        url: "https://www.youtube.com/watch?v=Li_tcua0AJI",
        source: "YouTube",
      },
    ],
    articles: [
      {
        id: "a1",
        title: "ADD vs ADHD: What's the Difference?",
        description: "Understanding the distinction between ADD and ADHD diagnoses",
        readTime: "5 min read",
        url: "https://www.healthline.com/health/adhd/difference-between-add-and-adhd",
        source: "Healthline",
      },
      {
        id: "a2",
        title: "Parenting a Child with ADD",
        description: "Expert advice on supporting your child's development",
        readTime: "7 min read",
        url: "https://chadd.org/for-parents/",
        source: "CHADD",
      },
    ],
    guides: [
      {
        id: "g1",
        title: "ADD Treatment Options Guide",
        description: "Comprehensive overview of treatment approaches",
        pages: "12 pages",
        url: "https://chadd.org/about-adhd/treatment/",
        source: "CHADD",
      },
    ],
    podcasts: [],
  },
  adhd: {
    videos: [
      {
        id: "v1",
        title: "What is ADHD?",
        description: "A comprehensive guide to understanding ADHD",
        duration: "10 min",
        url: "https://www.youtube.com/watch?v=xMWtGozn5jU",
        source: "YouTube",
      },
      {
        id: "v2",
        title: "ADHD Management Techniques",
        description: "Evidence-based strategies for managing ADHD",
        duration: "15 min",
        url: "https://www.youtube.com/watch?v=cx13a2-unjE",
        source: "YouTube",
      },
      {
        id: "v3",
        title: "ADHD in the Classroom",
        description: "Supporting children with ADHD at school",
        duration: "11 min",
        url: "https://www.youtube.com/watch?v=QW5jOmD2J94",
        source: "YouTube",
      },
      {
        id: "v4",
        title: "What Is ADHD?",
        description: "Child psychologist explains the three presentations of ADHD and how symptoms show up for parents",
        duration: "5 min",
        url: "https://www.youtube.com/watch?v=FnA18psiA1U",
        source: "YouTube · Child Mind Institute",
      },
      {
        id: "v5",
        title: "ADHD and Executive Function",
        description: "Dr. Russell Barkley on key thinking skills affected in ADHD and why behavior support matters",
        duration: "3 min",
        url: "https://www.youtube.com/watch?v=GR1IZJXc6d8",
        source: "YouTube · Child Mind Institute",
      },
      {
        id: "v6",
        title: "6 Principles for Raising a Child With ADHD",
        description: "Research-based parenting foundations from Dr. Russell Barkley (CHADD)",
        duration: "15 min",
        url: "https://www.youtube.com/watch?v=52wQuMSUAkY",
        source: "YouTube · CHADD",
      },
      {
        id: "v7",
        title: "Failing at Normal: An ADHD Success Story",
        description: "Relatable overview of life with ADHD—useful for teens, parents, and teachers",
        duration: "17 min",
        url: "https://www.youtube.com/watch?v=JiwRQpjRPlg",
        source: "YouTube · How to ADHD",
      },
      {
        id: "v8",
        title: "How to Help Kids Who Are Struggling in School",
        description: "Practical ideas for motivation, avoidance, and confidence when ADHD affects learning",
        duration: "3 min",
        url: "https://www.youtube.com/watch?v=Pk22d9cp-7c",
        source: "YouTube · Child Mind Institute",
      },
      {
        id: "v9",
        title: "How Science Says to Treat ADHD",
        description: "Overview of evidence-backed approaches to ADHD care (medications, behavior therapy, school supports)",
        duration: "13 min",
        url: "https://www.youtube.com/watch?v=SCAGc-rk40o",
        source: "YouTube",
      },
    ],
    articles: [
      {
        id: "a1",
        title: "ADHD Symptoms Checklist",
        description: "Common signs and symptoms to look for in children",
        readTime: "6 min read",
        url: "https://www.cdc.gov/adhd/signs-symptoms/index.html",
        source: "CDC",
      },
      {
        id: "a2",
        title: "ADHD and Diet: What You Need to Know",
        description: "How nutrition affects ADHD symptoms",
        readTime: "8 min read",
        url: "https://chadd.org/about-adhd/overview/",
        source: "CHADD",
      },
    ],
    guides: [],
    podcasts: [
      {
        id: "p1",
        title: "ADHD Experts Podcast",
        description: "Weekly insights from leading ADHD specialists",
        duration: "45 min",
        url: "https://www.additudemag.com/adhd-podcast/",
        source: "ADDitude",
      },
    ],
  },
  autism: {
    videos: [
      {
        id: "v1",
        title: "Understanding Autism Spectrum",
        description: "Learn about autism signs, diagnosis, and support",
        duration: "14 min",
        url: "https://www.youtube.com/watch?v=Lk4qs8jGN4U",
        source: "YouTube",
      },
      {
        id: "v2",
        title: "Autism: Early Intervention",
        description: "The importance of early support for autistic children",
        duration: "9 min",
        url: "https://www.youtube.com/watch?v=dAKvM7wXtyg",
        source: "YouTube",
      },
      {
        id: "v3",
        title: "Communication Strategies for Autism",
        description: "Helping your child communicate effectively",
        duration: "12 min",
        url: "https://www.youtube.com/watch?v=wKlMcLTqRLs",
        source: "YouTube",
      },
    ],
    articles: [
      {
        id: "a1",
        title: "Early Signs of Autism",
        description: "Recognizing autism spectrum disorder in young children",
        readTime: "6 min read",
        url: "https://www.autismspeaks.org/signs-autism",
        source: "Autism Speaks",
      },
      {
        id: "a2",
        title: "Sensory Processing in Autism",
        description: "Understanding sensory sensitivities and how to help",
        readTime: "9 min read",
        url: "https://www.autism.org/sensory-processing/",
        source: "Autism Research Institute",
      },
    ],
    guides: [
      {
        id: "g1",
        title: "ABA Therapy Parent Guide",
        description: "Everything parents need to know about ABA therapy",
        pages: "15 pages",
        url: "https://www.autismspeaks.org/applied-behavior-analysis",
        source: "Autism Speaks",
      },
      {
        id: "g2",
        title: "IEP Guide for Autism",
        description: "Navigating special education for your child",
        pages: "20 pages",
        url: "https://www.understood.org/en/articles/what-is-an-iep",
        source: "Understood",
      },
    ],
    podcasts: [],
  },
};

export const RESOURCE_CATEGORIES: Record<
  ContentType,
  { title: string; icon: string; color: string; bgColor: string }
> = {
  videos: {
    title: "Videos",
    icon: "play-circle",
    color: "#FF0000",
    bgColor: "#FFE4E4",
  },
  articles: {
    title: "Articles",
    icon: "document-text",
    color: colors.primary,
    bgColor: colors.brandPale,
  },
  guides: {
    title: "Guides & Resources",
    icon: "book",
    color: "#7B68EE",
    bgColor: "#EDE8FF",
  },
  podcasts: {
    title: "Podcasts",
    icon: "headset",
    color: "#E8A838",
    bgColor: "#FFF4E0",
  },
};
