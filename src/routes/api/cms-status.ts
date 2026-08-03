import { createFileRoute } from "@tanstack/react-router";
import { fetchCmsStatus } from "@/lib/cms.fn";

export const Route = createFileRoute("/api/cms-status")({
  server: {
    handlers: {
      GET: async () => {
        const status = await fetchCmsStatus();
        return Response.json(status, {
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
