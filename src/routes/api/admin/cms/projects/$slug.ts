import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/admin-auth.server";
import { adminDeleteProject, adminSaveProject } from "@/lib/cms-admin.server";
import type { CmsProject } from "@/lib/cms.types";

export const Route = createFileRoute("/api/admin/cms/projects/$slug")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const auth = requireAdmin(request);
        if (auth instanceof Response) return auth;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const project =
          body && typeof body === "object" && "project" in body
            ? ((body as { project: CmsProject }).project)
            : (body as CmsProject);

        if (!project || typeof project !== "object") {
          return Response.json({ success: false, error: "Missing project payload." }, { status: 422 });
        }

        const slug = params.slug || project.slug;
        const result = await adminSaveProject({ ...project, slug });
        if (!result.saved) {
          return Response.json({ success: false, error: result.reason }, { status: 503 });
        }
        return Response.json({ success: true });
      },
      DELETE: async ({ request, params }) => {
        const auth = requireAdmin(request);
        if (auth instanceof Response) return auth;

        const result = await adminDeleteProject(params.slug);
        if (!result.saved) {
          return Response.json({ success: false, error: result.reason }, { status: 503 });
        }
        return Response.json({ success: true });
      },
    },
  },
});
