import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  channel: z.enum(["whatsapp", "messenger", "quick-reply", "open"]),
  message: z.string().trim().max(2000).optional(),
  page: z.string().trim().max(200).optional(),
});

/** Log chat widget intents (WhatsApp / Messenger clicks) to Firestore. */
export const Route = createFileRoute("/api/chat-intent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "Invalid JSON." }, { status: 400 });
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, error: "Invalid payload." }, { status: 422 });
        }

        try {
          const { saveChatIntentToFirebase } = await import("@/lib/firebase.server");
          const result = await saveChatIntentToFirebase({
            channel: parsed.data.channel,
            message: parsed.data.message,
            page: parsed.data.page,
          });
          return Response.json({ success: true, firebaseSaved: result.saved });
        } catch (err) {
          console.error("Chat intent save failed:", err);
          return Response.json({ success: true, firebaseSaved: false });
        }
      },
    },
  },
});
