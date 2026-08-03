export const CMS_SECTION_IDS = [
  "hero",
  "about",
  "services",
  "portfolio",
  "process",
  "tech_stack",
  "why_me",
  "pricing",
  "hire",
  "testimonials",
  "faq",
  "contact",
  "lead_capture",
] as const;

export type CmsSectionId = (typeof CMS_SECTION_IDS)[number];

export function isCmsSectionId(value: string): value is CmsSectionId {
  return (CMS_SECTION_IDS as readonly string[]).includes(value);
}
