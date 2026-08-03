import { getCmsDefaults } from "@/lib/cms.defaults";
import type {
  CmsBundle,
  CmsProject,
  CmsSiteSettings,
} from "@/lib/cms.types";
import {
  isFirebaseConfigured,
  listFirestoreCollection,
  readFirestoreDoc,
} from "@/lib/firebase.server";

const CACHE_TTL_MS = 5_000;
let cache: { at: number; data: CmsBundle } | null = null;

const SECTION_IDS = [
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Deep-merge objects; arrays from remote replace defaults entirely when present. */
function mergeDeep<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(override)) return override as T;
  if (!isPlainObject(override) || !isPlainObject(base as unknown)) {
    // Keep defaults when Firestore stores an empty string for a field
    if (override === "" && typeof base === "string" && base.length > 0) return base;
    return override as T;
  }

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = mergeDeep(out[key], value);
  }
  return out as T;
}

function normalizeProject(
  raw: Record<string, unknown>,
  fallback?: CmsProject,
): CmsProject | null {
  const slug = String(raw.slug ?? raw.id ?? fallback?.slug ?? "");
  if (!slug) return null;

  const base = fallback ?? {
    id: slug,
    slug,
    title: "",
    description: "",
    category: "Mobile Apps" as const,
    tech: [],
    demoUrl: "#",
    githubUrl: "#",
    problem: "",
    solution: "",
    role: "",
    features: [],
    impact: "",
    coverUrl: "",
    galleryUrls: [],
    order: 999,
    published: true,
  };

  const merged = mergeDeep(base, raw);
  return {
    ...merged,
    id: String(merged.id || slug),
    slug,
    published: merged.published !== false,
    order: typeof merged.order === "number" ? merged.order : base.order,
    coverUrl: String(merged.coverUrl || base.coverUrl || ""),
    galleryUrls: Array.isArray(merged.galleryUrls)
      ? (merged.galleryUrls as string[])
      : base.galleryUrls,
  };
}

async function loadFromFirestore(defaults: CmsBundle): Promise<CmsBundle> {
  if (!isFirebaseConfigured()) return defaults;

  const [settingsDoc, ...sectionDocs] = await Promise.all([
    readFirestoreDoc<Record<string, unknown>>("site_settings", "main"),
    ...SECTION_IDS.map((id) =>
      readFirestoreDoc<Record<string, unknown>>("cms_sections", id).then((doc) => ({
        id,
        doc,
      })),
    ),
  ]);

  const settings = settingsDoc
    ? mergeDeep(defaults.settings, settingsDoc)
    : defaults.settings;

  const sections = { ...defaults.sections };
  for (const { id, doc } of sectionDocs) {
    if (!doc) continue;
    switch (id) {
      case "hero":
        sections.hero = mergeDeep(defaults.sections.hero, doc);
        break;
      case "about":
        sections.about = mergeDeep(defaults.sections.about, doc);
        break;
      case "services":
        sections.services = mergeDeep(defaults.sections.services, doc);
        break;
      case "portfolio":
        sections.portfolio = mergeDeep(defaults.sections.portfolio, doc);
        break;
      case "process":
        sections.process = mergeDeep(defaults.sections.process, doc);
        break;
      case "tech_stack":
        sections.tech_stack = mergeDeep(defaults.sections.tech_stack, doc);
        break;
      case "why_me":
        sections.why_me = mergeDeep(defaults.sections.why_me, doc);
        break;
      case "pricing":
        sections.pricing = mergeDeep(defaults.sections.pricing, doc);
        break;
      case "hire":
        sections.hire = mergeDeep(defaults.sections.hire, doc);
        break;
      case "testimonials":
        sections.testimonials = mergeDeep(defaults.sections.testimonials, doc);
        break;
      case "faq":
        sections.faq = mergeDeep(defaults.sections.faq, doc);
        break;
      case "contact":
        sections.contact = mergeDeep(defaults.sections.contact, doc);
        break;
      case "lead_capture":
        sections.lead_capture = mergeDeep(defaults.sections.lead_capture, doc);
        break;
    }
  }

  const remoteProjects = await listFirestoreCollection<Record<string, unknown>>("projects");
  let projects = defaults.projects;

  if (remoteProjects.length > 0) {
    const bySlug = new Map(defaults.projects.map((p) => [p.slug, p]));
    const normalized = remoteProjects
      .map((raw) => normalizeProject(raw, bySlug.get(String(raw.slug ?? raw.id))))
      .filter((p): p is CmsProject => Boolean(p))
      .filter((p) => p.published)
      .sort((a, b) => a.order - b.order);

    if (normalized.length > 0) projects = normalized;
  }

  return { settings: settings as CmsSiteSettings, sections, projects };
}

export async function getCmsBundle(options?: { bypassCache?: boolean }): Promise<CmsBundle> {
  const now = Date.now();
  if (!options?.bypassCache && cache && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  const defaults = getCmsDefaults();
  try {
    const data = await loadFromFirestore(defaults);
    cache = { at: now, data };
    return data;
  } catch (err) {
    console.error("CMS load failed, using defaults:", err);
    cache = { at: now, data: defaults };
    return defaults;
  }
}

export function clearCmsCache() {
  cache = null;
}
