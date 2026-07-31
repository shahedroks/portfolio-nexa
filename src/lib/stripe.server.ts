import Stripe from "stripe";
import { env } from "@/lib/contact-store.server";

export type StripePlan = "starter" | "growth";

const PLAN_META: Record<
  StripePlan,
  { name: string; description: string; envKey: string; defaultCents: number }
> = {
  starter: {
    name: "Starter deposit",
    description: "NexaSoft Starter plan deposit — balance invoiced after scope confirmation.",
    envKey: "STRIPE_DEPOSIT_STARTER_CENTS",
    defaultCents: 50_000,
  },
  growth: {
    name: "Growth deposit",
    description: "NexaSoft Growth plan deposit — balance invoiced after scope confirmation.",
    envKey: "STRIPE_DEPOSIT_GROWTH_CENTS",
    defaultCents: 150_000,
  },
};

export function isStripeConfigured() {
  return Boolean(env("STRIPE_SECRET_KEY"));
}

export function getStripe() {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY).");
  }
  return new Stripe(key);
}

export function getSiteUrl() {
  return (env("SITE_URL") || "http://localhost:8080").replace(/\/$/, "");
}

export function getDepositCents(plan: StripePlan) {
  const meta = PLAN_META[plan];
  const raw = env(meta.envKey);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return meta.defaultCents;
}

export function getPlanMeta(plan: StripePlan) {
  return PLAN_META[plan];
}

export async function createDepositCheckoutSession(plan: StripePlan) {
  const stripe = getStripe();
  const meta = PLAN_META[plan];
  const amount = getDepositCents(plan);
  const site = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: meta.name,
            description: meta.description,
          },
        },
      },
    ],
    success_url: `${site}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/#pricing`,
    metadata: {
      plan,
      type: "pricing_deposit",
    },
  });

  return session;
}
