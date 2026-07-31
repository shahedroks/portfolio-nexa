import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";

/**
 * Stripe webhook → Firestore `payments`.
 *
 * Local: stripe listen --forward-to localhost:8080/api/webhooks/stripe
 * Live: Dashboard → Webhooks → checkout.session.completed
 */
export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { env } = await import("@/lib/contact-store.server");
        const { getStripe } = await import("@/lib/stripe.server");
        const { savePaymentToFirebase } = await import("@/lib/firebase.server");

        const webhookSecret = env("STRIPE_WEBHOOK_SECRET");
        if (!webhookSecret) {
          return Response.json(
            { success: false, error: "STRIPE_WEBHOOK_SECRET is not configured." },
            { status: 503 },
          );
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return Response.json({ success: false, error: "Missing stripe-signature." }, { status: 400 });
        }

        const rawBody = await request.text();
        let event: Stripe.Event;

        try {
          const stripe = getStripe();
          event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Invalid signature.";
          console.error("Stripe webhook signature failed:", message);
          return Response.json({ success: false, error: message }, { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          try {
            await savePaymentToFirebase({
              sessionId: session.id,
              email: session.customer_details?.email ?? session.customer_email,
              amount: session.amount_total,
              currency: session.currency,
              plan: session.metadata?.plan ?? null,
              status: session.payment_status ?? "paid",
              paymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
            });
          } catch (err) {
            console.error("Stripe payment Firebase save failed:", err);
            return Response.json({ success: false, error: "Firestore save failed." }, { status: 500 });
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
