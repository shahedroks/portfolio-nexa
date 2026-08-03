import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/admin-auth.server";
import { adminSaveSettings } from "@/lib/cms-admin.server";
import type { CmsSiteSettings } from "@/lib/cms.types";

export const Route = createFileRoute("/api/admin/cms/settings")({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const auth = requireAdmin(request);
        if (auth instanceof Response) return auth;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const settings = (body as { settings?: CmsSiteSettings }).settings ?? (body as CmsSiteSettings);
        if (!settings || typeof settings !== "object") {
          return Response.json({ success: false, error: "Missing settings payload." }, { status: 422 });
        }

        const result = await adminSaveSettings(settings);
        if (!result.saved) {
          return Response.json({ success: false, error: result.reason }, { status: 503 });
        }
        return Response.json({ success: true });
      },
    },
  },
});
