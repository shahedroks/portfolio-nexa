import { createFileRoute } from "@tanstack/react-router";
import { clearAdminCookieHeader } from "@/lib/admin-auth.server";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          { success: true },
          { headers: { "Set-Cookie": clearAdminCookieHeader() } },
        ),
    },
  },
});
