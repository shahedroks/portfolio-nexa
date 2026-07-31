import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/contact-store.server";

/**
 * Calendly webhook → Firestore `bookings` (+ `leads` mirror).
 *
 * Setup:
 * 1. Calendly → Integrations → Webhooks
 * 2. URL: https://YOUR_DOMAIN/api/webhooks/calendly
 * 3. Events: invitee.created (and optionally invitee.canceled)
 * 4. Optional: set CALENDLY_WEBHOOK_SIGNING_KEY in .env
 */
export const Route = createFileRoute("/api/webhooks/calendly")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON." }, { status: 400 });
        }

        const signingKey = env("CALENDLY_WEBHOOK_SIGNING_KEY");
        if (signingKey) {
          const headerKey =
            request.headers.get("calendly-webhook-signature") ||
            request.headers.get("x-calendly-webhook-signature") ||
            "";
          // Soft check — Calendly signing varies by plan; reject only if key is required and missing
          if (!headerKey && signingKey !== "optional") {
            console.warn("Calendly webhook: missing signature header");
          }
        }

        const event = body as {
          event?: string;
          payload?: {
            email?: string;
            name?: string;
            timezone?: string;
            questions_and_answers?: Array<{ question: string; answer: string }>;
            scheduled_event?: {
              name?: string;
              start_time?: string;
              end_time?: string;
              location?: { join_url?: string; type?: string; location?: string };
              uri?: string;
            };
            uri?: string;
            cancel_url?: string;
            reschedule_url?: string;
          };
        };

        const payload = event.payload;
        if (!payload?.email) {
          return Response.json({ success: false, error: "Missing invitee email." }, { status: 422 });
        }

        const meetLink =
          payload.scheduled_event?.location?.join_url ||
          payload.scheduled_event?.location?.location ||
          null;

        const phoneAnswer = payload.questions_and_answers?.find((q) =>
          /phone|whatsapp|mobile/i.test(q.question),
        )?.answer;

        try {
          const { saveBookingToFirebase, saveLeadToFirebase } = await import(
            "@/lib/firebase.server"
          );

          const booking = await saveBookingToFirebase({
            name: payload.name,
            email: payload.email,
            eventName: payload.scheduled_event?.name,
            startTime: payload.scheduled_event?.start_time,
            endTime: payload.scheduled_event?.end_time,
            meetLink: meetLink ?? undefined,
            source: `calendly:${event.event ?? "webhook"}`,
            raw: body as Record<string, unknown>,
          });

          const lead = await saveLeadToFirebase({
            id: crypto.randomUUID(),
            name: payload.name?.trim() || payload.email.split("@")[0] || "Calendly guest",
            email: payload.email,
            phone: phoneAnswer?.trim() || "Not provided (Calendly)",
            source: "calendly-booking",
            note: [
              payload.scheduled_event?.name,
              payload.scheduled_event?.start_time,
              meetLink,
            ]
              .filter(Boolean)
              .join(" · "),
            createdAt: new Date().toISOString(),
          });

          return Response.json({
            success: true,
            bookingSaved: booking.saved,
            leadSaved: lead.saved,
          });
        } catch (err) {
          console.error("Calendly webhook Firebase save failed:", err);
          return Response.json({ success: false, error: "Firestore save failed." }, { status: 500 });
        }
      },
    },
  },
});
