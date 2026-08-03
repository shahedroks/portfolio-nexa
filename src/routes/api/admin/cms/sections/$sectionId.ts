import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/admin-auth.server";
import { adminSaveSection } from "@/lib/cms-admin.server";
import { isCmsSectionId } from "@/lib/cms-sections";

export const Route = createFileRoute("/api/admin/cms/sections/$sectionId")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const auth = requireAdmin(request);
        if (auth instanceof Response) return auth;

        const sectionId = params.sectionId;
        if (!isCmsSectionId(sectionId)) {
          return Response.json({ success: false, error: "Unknown section." }, { status: 404 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const data =
          body && typeof body === "object" && "data" in body
            ? ((body as { data: Record<string, unknown> }).data)
            : (body as Record<string, unknown>);

        if (!data || typeof data !== "object") {
          return Response.json({ success: false, error: "Missing section payload." }, { status: 422 });
        }

        const result = await adminSaveSection(sectionId, data);
        if (!result.saved) {
          return Response.json({ success: false, error: result.reason }, { status: 503 });
        }
        return Response.json({ success: true });
      },
    },
  },
});
