import type { ProjectCategory } from "@/lib/projects.data";

export type CmsNavLink = { label: string; href: string };

export type CmsSiteLinks = {
  whatsappNumber: string;
  messengerPage: string;
  bookingEmbedUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  upworkUrl: string;
  fiverrUrl: string;
  contactEmail: string;
  estimatePdfUrl: string;
};

export type CmsSiteSettings = {
  brandName: string;
  availabilityLabel: string;
  ctaLabel: string;
  seo: { title: string; description: string };
  links: CmsSiteLinks;
  chat: {
    title: string;
    statusLabel: string;
    intro: string;
    defaultMessage: string;
    fallbackMessage: string;
    quickReplies: string[];
  };
  navLinks: CmsNavLink[];
  footer: {
    tagline: string;
    legalLinks: CmsNavLink[];
  };
};

export type CmsHeroSection = {
  badge: string;
  badgeSecondary: string;
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
  subcopy: string;
  chips: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  connectLabel: string;
  trustedStrip: {
    eyebrow: string;
    copy: string;
    platforms: string[];
    proofs: Array<{ value: string; label: string; iconKey: string }>;
  };
  mockups: {
    screens: Array<{ src: string; alt: string; kind: "laptop" | "phone" }>;
    proofs: Array<{
      label: string;
      detail: string;
      iconKey: string;
      tone: string;
      position: string;
    }>;
  };
};

export type CmsAboutSection = {
  eyebrow: string;
  title: string;
  bio: string;
  portraitUrl: string;
  portraitAlt: string;
  availableBadge: string;
  stats: Array<{ value: string; label: string }>;
};

export type CmsServicesSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Array<{
    iconKey: string;
    title: string;
    description: string;
    points: string[];
  }>;
};

export type CmsPortfolioSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  filters: string[];
};

export type CmsProcessSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: Array<{
    title: string;
    description: string;
    iconKey: string;
    highlights: string[];
    optional?: boolean;
  }>;
};

export type CmsTechStackSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Array<{ name: string; iconKey: string }>;
};

export type CmsWhyMeSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  values: Array<{ iconKey: string; title: string; description: string }>;
};

export type CmsPricingPlan = {
  id: "starter" | "growth" | "custom" | string;
  name: string;
  price: string;
  depositLabel: string;
  depositNote: string;
  description: string;
  featured: boolean;
  checkout: boolean;
  bullets: string[];
};

export type CmsPricingSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  footerNote: string;
  plans: CmsPricingPlan[];
};

export type CmsHireSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  platforms: Array<{
    name: "Fiverr" | "Upwork" | string;
    title: string;
    blurb: string;
    cta: string;
    hrefKey: "fiverrUrl" | "upworkUrl" | string;
    accent: string;
    features: string[];
    featured: boolean;
  }>;
};

export type CmsTestimonialsSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  platformRatings: Array<{ label: string; mark: string }>;
  items: Array<{
    quote: string;
    name: string;
    title: string;
    company: string;
    avatarUrl?: string;
  }>;
};

export type CmsFaqSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  faqs: Array<{ q: string; a: string }>;
};

export type CmsContactSection = {
  eyebrow: string;
  title: string;
  subtitle: string;
  responseLabel: string;
  projectTypes: string[];
  budgets: string[];
  connectTitle: string;
  connectCopy: string;
};

export type CmsLeadCaptureSection = {
  title: string;
  subtitle: string;
  delayMs: number;
};

export type CmsSections = {
  hero: CmsHeroSection;
  about: CmsAboutSection;
  services: CmsServicesSection;
  portfolio: CmsPortfolioSection;
  process: CmsProcessSection;
  tech_stack: CmsTechStackSection;
  why_me: CmsWhyMeSection;
  pricing: CmsPricingSection;
  hire: CmsHireSection;
  testimonials: CmsTestimonialsSection;
  faq: CmsFaqSection;
  contact: CmsContactSection;
  lead_capture: CmsLeadCaptureSection;
};

export type CmsProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  tech: string[];
  demoUrl: string;
  githubUrl: string;
  problem: string;
  solution: string;
  role: string;
  features: string[];
  impact: string;
  coverUrl: string;
  galleryUrls: string[];
  order: number;
  published: boolean;
};

export type CmsBundle = {
  settings: CmsSiteSettings;
  sections: CmsSections;
  projects: CmsProject[];
};
