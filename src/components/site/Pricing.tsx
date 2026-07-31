import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "./Reveal";
import { useCms } from "@/lib/cms-context";

type CheckoutPlan = "starter" | "growth";

export function Pricing() {
  const { pricing } = useCms().sections;
  const [loadingPlan, setLoadingPlan] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: CheckoutPlan) {
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as { success: boolean; url?: string; error?: string };
      if (!res.ok || !json.success || !json.url) {
        setError(json.error ?? "Could not start checkout. Please try again.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section id="pricing" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={pricing.eyebrow}
          title={pricing.title}
          subtitle={pricing.subtitle}
        />

        {error ? (
          <p
            role="alert"
            className="mx-auto mt-6 max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricing.plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 90}>
              <article
                className={cn(
                  "surface-card relative flex h-full flex-col p-7",
                  plan.featured && "border-accent/50 shadow-[0_24px_60px_-36px_var(--color-accent)]",
                )}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
                    Most Popular
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight">
                  {plan.price}
                  {plan.price.startsWith("$") ? (
                    <span className="ml-1.5 align-middle text-sm font-medium text-foreground/60">
                      USD
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-xs font-medium text-accent/90">{plan.depositNote}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-foreground/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {plan.checkout ? (
                  <button
                    type="button"
                    disabled={loadingPlan !== null}
                    onClick={() => startCheckout(plan.id as CheckoutPlan)}
                    className={cn(
                      "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70",
                      plan.featured
                        ? "bg-gradient-brand text-primary-foreground hover:-translate-y-0.5"
                        : "border border-border bg-surface-2 text-foreground hover:border-accent/60 hover:text-accent",
                    )}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      plan.depositLabel
                    )}
                  </button>
                ) : (
                  <a
                    href="#contact"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface-2 px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-accent/60 hover:text-accent"
                  >
                    {plan.depositLabel}
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-foreground/70">
          {pricing.footerNote}
        </p>
      </div>
    </section>
  );
}
