import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z
  .object({
    accessToken: z.string().min(20).optional(),
    credential: z.string().min(20).optional(),
  })
  .refine((v) => Boolean(v.accessToken || v.credential), {
    message: "Missing Google token.",
  });

async function profileFromAccessToken(accessToken: string) {
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = (await profileRes.json()) as {
    email?: string;
    name?: string;
    picture?: string;
    error?: string;
    error_description?: string;
  };
  if (!profileRes.ok || !profile.email) {
    throw new Error(profile.error_description ?? profile.error ?? "Could not read Google profile.");
  }
  return profile;
}

async function profileFromIdToken(credential: string) {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );
  const profile = (await res.json()) as {
    email?: string;
    name?: string;
    picture?: string;
    aud?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !profile.email) {
    throw new Error(profile.error_description ?? profile.error ?? "Invalid Google credential.");
  }

  const expectedAud = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (expectedAud && profile.aud && profile.aud !== expectedAud) {
    throw new Error("Google credential audience mismatch.");
  }
  return profile;
}

export const Route = createFileRoute("/api/auth/google-lead")({
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
          return Response.json({ success: false, error: "Missing Google token." }, { status: 422 });
        }

        try {
          const { saveLead, env } = await import("@/lib/contact-store.server");
          const { saveGoogleLeadToFirebase } = await import("@/lib/firebase.server");
          // Load .env into process.env for audience verification
          env("GOOGLE_CLIENT_ID");

          const profile = parsed.data.credential
            ? await profileFromIdToken(parsed.data.credential)
            : await profileFromAccessToken(parsed.data.accessToken!);

          const payload = {
            name: profile.name?.trim() || profile.email!.split("@")[0] || "Google visitor",
            email: profile.email!,
            phone: "Not provided (Google login)",
            note: profile.picture ? `Google avatar: ${profile.picture}` : undefined,
            source: parsed.data.credential ? "google-one-tap" : "google-side-login",
          };

          const record = saveLead(payload);

          let firebaseSaved = false;
          try {
            const fb = await saveGoogleLeadToFirebase({
              name: payload.name,
              email: payload.email,
              picture: profile.picture,
              source: payload.source,
            });
            firebaseSaved = fb.saved;
            if (!fb.saved) {
              console.warn("Firebase Google lead not saved:", fb.reason);
            }
          } catch (err) {
            console.error("Firebase Google lead save failed:", err);
          }

          // Skip Resend for Google leads — visitor must not see Resend test-mode errors.
          return Response.json({
            success: true,
            message: "Thanks — your Google account was shared. We'll be in touch.",
            visitor: { name: payload.name, email: payload.email },
            firebaseSaved,
            emailed: false,
            id: record.id,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Google auth failed.";
          return Response.json({ success: false, error: message }, { status: 401 });
        }
      },
    },
  },
});
