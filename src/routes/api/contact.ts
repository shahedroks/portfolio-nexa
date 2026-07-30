import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30)
    .regex(/^[+\d][\d\s()-]{6,}$/, "Please enter a valid phone number."),
  projectType: z.string().trim().min(1, "Please select a project type.").max(80),
  budget: z.string().trim().min(1, "Please select a budget range.").max(80),
  message: z.string().trim().min(10, "Please describe your project (10+ characters).").max(4000),
});

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json(
            { success: false, error: "Invalid JSON body." },
            { status: 400 },
          );
        }

        const parsed = contactSchema.safeParse(body);
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

        const { saveSubmission, emailContactSubmission } = await import(
          "@/lib/contact-store.server"
        );
        const record = saveSubmission(parsed.data);

        try {
          await emailContactSubmission(parsed.data);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not deliver your message.";
          return Response.json({ success: false, error: message, id: record.id }, { status: 502 });
        }

        return Response.json({
          success: true,
          message: "Thanks! Your message was received. I'll reply within 24 hours.",
          id: record.id,
        });
      },
    },
  },
});
