import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  adminCookieHeader,
  isAdminEmail,
  signAdminSession,
  verifyGoogleIdToken,
} from "@/lib/admin-auth.server";
import { env } from "@/lib/contact-store.server";

const bodySchema = z.object({
  credential: z.string().min(20),
});

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, error: "Missing Google credential." }, { status: 422 });
        }

        try {
          env("GOOGLE_CLIENT_ID");
          const profile = await verifyGoogleIdToken(parsed.data.credential);
          if (!isAdminEmail(profile.email)) {
            return Response.json(
              {
                success: false,
                error: "This Google account is not allowed to access the admin panel.",
              },
              { status: 403 },
            );
          }

          const token = signAdminSession({
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
          });

          return Response.json(
            {
              success: true,
              admin: {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
              },
            },
            {
              headers: {
                "Set-Cookie": adminCookieHeader(token),
              },
            },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "Admin login failed.";
          return Response.json({ success: false, error: message }, { status: 401 });
        }
      },
    },
  },
});
