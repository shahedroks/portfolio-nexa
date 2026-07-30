import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const leadSchema = z
  .object({
    name: z.string().trim().max(80).optional(),
    email: z.string().trim().email("Please enter a valid email.").max(160),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^$|^[+\d][\d\s()-]{6,}$/, "Please enter a valid phone number.")
      .optional(),
    note: z.string().trim().max(500).optional(),
    source: z.string().trim().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    const source = data.source ?? "lead-popup";
    const isMagnet = source === "estimate-pdf" || source === "newsletter";

    if (!isMagnet) {
      if (!data.name || data.name.length < 2) {
        ctx.addIssue({ code: "custom", message: "Please enter your name.", path: ["name"] });
      }
      if (!data.phone || data.phone.length < 7) {
        ctx.addIssue({
          code: "custom",
          message: "Please enter a valid phone number.",
          path: ["phone"],
        });
      }
    }
  });

export const Route = createFileRoute("/api/lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = leadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            {
              success: false,
              error: parsed.error.issues[0]?.message ?? "Invalid submission.",
            },
            { status: 422 },
          );
        }

        const source = parsed.data.source ?? "lead-popup";
        const { saveLead, emailLeadSubmission } = await import("@/lib/contact-store.server");
        const payload = {
          name: parsed.data.name?.trim() || "PDF subscriber",
          email: parsed.data.email,
          phone: parsed.data.phone?.trim() || "—",
          note: parsed.data.note,
          source,
        };
        const record = saveLead(payload);

        try {
          await emailLeadSubmission(payload);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not deliver lead.";
          return Response.json({ success: false, error: message, id: record.id }, { status: 502 });
        }

        const message =
          source === "estimate-pdf"
            ? "Thanks! Your free estimate PDF is ready."
            : "Thanks! We'll reach out shortly.";

        return Response.json({
          success: true,
          message,
          id: record.id,
        });
      },
    },
  },
});
