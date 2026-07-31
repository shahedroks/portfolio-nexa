import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  plan: z.enum(["starter", "growth"]),
});

export const Route = createFileRoute("/api/stripe/checkout")({
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
          return Response.json(
            { success: false, error: "Choose Starter or Growth to pay a deposit." },
            { status: 422 },
          );
        }

        try {
          const { createDepositCheckoutSession, isStripeConfigured } = await import(
            "@/lib/stripe.server"
          );

          if (!isStripeConfigured()) {
            return Response.json(
              {
                success: false,
                error:
                  "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your .env (test key is fine).",
              },
              { status: 503 },
            );
          }

          const session = await createDepositCheckoutSession(parsed.data.plan);
          if (!session.url) {
            return Response.json(
              { success: false, error: "Stripe did not return a checkout URL." },
              { status: 502 },
            );
          }

          return Response.json({ success: true, url: session.url, sessionId: session.id });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not start Stripe Checkout.";
          console.error("Stripe checkout error:", err);
          return Response.json({ success: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
