import { createFileRoute } from "@tanstack/react-router";
import { projects } from "@/lib/projects.data";

export const Route = createFileRoute("/api/projects")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { success: true, count: projects.length, data: projects },
          { headers: { "Cache-Control": "public, max-age=60" } },
        ),
    },
  },
});
