import { createServerFn } from "@tanstack/react-start";
import type { CmsBundle } from "@/lib/cms.types";
import { getCmsDefaults } from "@/lib/cms.defaults";

/**
 * Server-only CMS load. Route loaders are isomorphic — never import
 * firebase-admin / cms.server directly inside a loader.
 */
export const fetchCmsBundle = createServerFn({ method: "GET" }).handler(
  async (): Promise<CmsBundle> => {
    try {
      const { getCmsBundle } = await import("@/lib/cms.server");
      return await getCmsBundle();
    } catch (err) {
      console.error("CMS server fn failed, using defaults:", err);
      return getCmsDefaults();
    }
  },
);

export const fetchCmsStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { isFirebaseConfigured } = await import("@/lib/firebase.server");
    const configured = isFirebaseConfigured();
    if (!configured) {
      return {
        firebaseConfigured: false,
        source: "local-defaults" as const,
        message:
          "Firebase not configured. Add serviceAccountKey.json to project root, then run npm run seed:cms.",
      };
    }
    const { getCmsBundle } = await import("@/lib/cms.server");
    const bundle = await getCmsBundle({ bypassCache: true });
    return {
      firebaseConfigured: true,
      source: "firebase" as const,
      brandName: bundle.settings.brandName,
      sectionCount: Object.keys(bundle.sections).length,
      projectCount: bundle.projects.length,
      message: "CMS content is loading from Firebase Firestore.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      firebaseConfigured: false,
      source: "error" as const,
      message,
    };
  }
});
