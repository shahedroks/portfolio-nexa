import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const meetingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30)
    .regex(/^[+\d][\d\s()-]{6,}$/, "Please enter a valid phone number."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please select a valid time."),
  notes: z.string().trim().max(1000).optional(),
});

export const Route = createFileRoute("/api/meeting")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = meetingSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            {
              success: false,
              error: parsed.error.issues[0]?.message ?? "Invalid submission.",
              fields: parsed.error.flatten().fieldErrors,
            },
            { status: 422 },
          );
        }

        const {
          createGoogleMeetEvent,
          emailMeetingInvite,
          isMeetingConfigured,
        } = await import("@/lib/meeting.server");

        if (!isMeetingConfigured()) {
          return Response.json(
            {
              success: false,
              error:
                "Meeting booking is not configured yet. Add Google Calendar + Resend keys to .env.",
            },
            { status: 503 },
          );
        }

        const data = parsed.data;
        const selected = new Date(`${data.date}T${data.time}:00`);
        if (Number.isNaN(selected.getTime()) || selected.getTime() < Date.now() - 60_000) {
          return Response.json(
            { success: false, error: "Please choose a future date and time." },
            { status: 422 },
          );
        }

        try {
          const meeting = await createGoogleMeetEvent(data);

          let firebaseSaved = false;
          try {
            const { saveMeetingToFirebase } = await import("@/lib/firebase.server");
            const fb = await saveMeetingToFirebase({
              name: data.name,
              email: data.email,
              phone: data.phone,
              date: data.date,
              time: data.time,
              notes: data.notes,
              meetLink: meeting.meetLink,
              eventId: meeting.eventId,
            });
            firebaseSaved = fb.saved;
            if (!fb.saved) console.warn("Meeting Firebase save:", fb.reason);
          } catch (err) {
            console.error("Meeting Firebase save failed:", err);
          }

          let emailSent = true;
          let emailWarning: string | undefined;
          try {
            await emailMeetingInvite({
              to: data.email,
              name: data.name,
              meetLink: meeting.meetLink,
              date: data.date,
              time: data.time,
              notes: data.notes,
            });
          } catch (emailErr) {
            emailSent = false;
            emailWarning =
              emailErr instanceof Error
                ? emailErr.message
                : "Could not send the email invite.";
          }

          // Always try to notify host with visitor contact info
          try {
            const { emailHostMeetingBooked } = await import("@/lib/contact-store.server");
            await emailHostMeetingBooked({
              name: data.name,
              email: data.email,
              phone: data.phone,
              date: data.date,
              time: data.time,
              meetLink: meeting.meetLink,
              notes: data.notes,
            });
          } catch {
            // Host notify is best-effort; don't fail the booking
          }

          return Response.json({
            success: true,
            emailSent,
            firebaseSaved,
            message: emailSent
              ? "Meeting booked! Check your email for the Google Meet link."
              : "Meeting booked with Google Meet. Email could not be sent (Resend test mode) — use the link below.",
            meetLink: meeting.meetLink,
            eventId: meeting.eventId,
            emailWarning,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not book the meeting.";
          return Response.json({ success: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
