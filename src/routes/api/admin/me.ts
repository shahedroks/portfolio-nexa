import { createFileRoute } from "@tanstack/react-router";
import {
  ADMIN_COOKIE,
  getAdminAllowlist,
  readCookie,
  verifyAdminSessionToken,
} from "@/lib/admin-auth.server";
import { isFirebaseConfigured } from "@/lib/firebase.server";

export const Route = createFileRoute("/api/admin/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = verifyAdminSessionToken(readCookie(request, ADMIN_COOKIE));
        if (!session) {
          return Response.json({
            authenticated: false,
            firebaseConfigured: isFirebaseConfigured(),
            allowlist: getAdminAllowlist(),
          });
        }
        return Response.json({
          authenticated: true,
          firebaseConfigured: isFirebaseConfigured(),
          admin: {
            email: session.email,
            name: session.name,
            picture: session.picture,
          },
        });
      },
    },
  },
});
