import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/admin-auth.server";
import { adminUploadImage } from "@/lib/cms-admin.server";

export const Route = createFileRoute("/api/admin/cms/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = requireAdmin(request);
        if (auth instanceof Response) return auth;

        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return Response.json({ success: false, error: "Missing file." }, { status: 422 });
          }
          if (file.size > 8 * 1024 * 1024) {
            return Response.json({ success: false, error: "File too large (max 8MB)." }, { status: 413 });
          }
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await adminUploadImage(file.name || "upload.bin", buffer, file.type);
          if (!result.saved) {
            return Response.json({ success: false, error: result.reason }, { status: 503 });
          }
          return Response.json({ success: true, url: result.url });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed.";
          return Response.json({ success: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
