import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/admin-auth.server";
import { adminLoadCms } from "@/lib/cms-admin.server";

export const Route = createFileRoute("/api/admin/cms")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = requireAdmin(request);
        if (auth instanceof Response) return auth;

        const loaded = await adminLoadCms();
        if (!loaded.ok) {
          return Response.json({ success: false, error: loaded.error }, { status: 500 });
        }

        return Response.json({
          success: true,
          firebaseConfigured: loaded.firebaseConfigured,
          data: loaded.data,
        });
      },
    },
  },
});
