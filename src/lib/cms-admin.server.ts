import { clearCmsCache, getCmsBundle } from "@/lib/cms.server";
import type { CmsBundle, CmsProject, CmsSiteSettings, CmsSections } from "@/lib/cms.types";
import { isCmsSectionId, type CmsSectionId, CMS_SECTION_IDS } from "@/lib/cms-sections";
import {
  deleteFirestoreDoc,
  isFirebaseConfigured,
  uploadCmsFile,
  writeFirestoreDoc,
} from "@/lib/firebase.server";

function stripMeta(data: Record<string, unknown>) {
  const { updatedAt: _u, createdAt: _c, id: _id, ...rest } = data;
  return rest;
}

export async function adminLoadCms(): Promise<
  | { ok: true; firebaseConfigured: boolean; data: CmsBundle }
  | { ok: false; error: string }
> {
  try {
    const data = await getCmsBundle({ bypassCache: true });
    return { ok: true, firebaseConfigured: isFirebaseConfigured(), data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to load CMS." };
  }
}

export async function adminSaveSettings(settings: CmsSiteSettings) {
  if (!isFirebaseConfigured()) {
    return {
      saved: false as const,
      reason: "Firebase is not configured. Add serviceAccountKey.json.",
    };
  }
  const result = await writeFirestoreDoc(
    "site_settings",
    "main",
    stripMeta(settings as unknown as Record<string, unknown>),
    { merge: true },
  );
  // Keep homepage Hero primary button in sync with Brand & SEO CTA label.
  if (result.saved && settings.ctaLabel?.trim()) {
    const heroDoc = await import("@/lib/firebase.server").then((m) =>
      m.readFirestoreDoc<Record<string, unknown>>("cms_sections", "hero"),
    );
    const primaryCta = {
      ...((heroDoc?.primaryCta as Record<string, unknown> | undefined) ?? {}),
      label: settings.ctaLabel.trim(),
    };
    await writeFirestoreDoc(
      "cms_sections",
      "hero",
      { primaryCta },
      { merge: true },
    );
  }
  if (result.saved) clearCmsCache();
  return result;
}

export async function adminSaveSection(sectionId: CmsSectionId, data: Record<string, unknown>) {
  if (!isFirebaseConfigured()) {
    return {
      saved: false as const,
      reason: "Firebase is not configured. Add serviceAccountKey.json.",
    };
  }
  const result = await writeFirestoreDoc("cms_sections", sectionId, stripMeta(data), { merge: true });
  if (result.saved) clearCmsCache();
  return result;
}

export async function adminSaveProject(project: CmsProject) {
  if (!isFirebaseConfigured()) {
    return {
      saved: false as const,
      reason: "Firebase is not configured. Add serviceAccountKey.json.",
    };
  }
  const slug = project.slug?.trim();
  if (!slug) return { saved: false as const, reason: "Project slug is required." };
  const payload = stripMeta({
    ...project,
    id: project.id || slug,
    slug,
    published: project.published !== false,
  } as unknown as Record<string, unknown>);
  const result = await writeFirestoreDoc("projects", slug, payload, { merge: true });
  if (result.saved) clearCmsCache();
  return result;
}

export async function adminDeleteProject(slug: string) {
  if (!isFirebaseConfigured()) {
    return {
      saved: false as const,
      reason: "Firebase is not configured. Add serviceAccountKey.json.",
    };
  }
  const result = await deleteFirestoreDoc("projects", slug);
  if (result.saved) clearCmsCache();
  return result;
}

export async function adminUploadImage(fileName: string, buffer: Buffer, contentType: string) {
  if (!isFirebaseConfigured()) {
    return {
      saved: false as const,
      reason: "Firebase is not configured. Add serviceAccountKey.json.",
    };
  }
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `cms/uploads/${Date.now()}-${safe}`;
  return uploadCmsFile(path, buffer, contentType || "application/octet-stream");
}

export { CMS_SECTION_IDS as SECTION_IDS, isCmsSectionId };
export type { CmsSectionId, CmsSections };
