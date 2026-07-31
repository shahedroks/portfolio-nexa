import { createFileRoute } from "@tanstack/react-router";
import { projects as fallbackProjects } from "@/lib/projects.data";

export const Route = createFileRoute("/api/projects")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getCmsBundle } = await import("@/lib/cms.server");
          const cms = await getCmsBundle();
          const data = cms.projects.map(
            ({ order: _order, published: _published, ...project }) => project,
          );
          return Response.json(
            { success: true, count: data.length, data },
            { headers: { "Cache-Control": "public, max-age=60" } },
          );
        } catch (err) {
          console.error("Projects API CMS read failed:", err);
          return Response.json(
            { success: true, count: fallbackProjects.length, data: fallbackProjects },
            { headers: { "Cache-Control": "public, max-age=30" } },
          );
        }
      },
    },
  },
});
