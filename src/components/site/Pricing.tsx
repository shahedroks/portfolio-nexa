import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "./Reveal";

const plans = [
  {
    name: "Starter",
    price: "$2,500+",
    description: "Focused builds for MVPs, landing sites, and tightly scoped features.",
    featured: false,
    bullets: [
      "Single platform or marketing site",
      "Core screens / key flows",
      "Basic API or CMS integration",
      "2 weeks of post-launch support",
    ],
  },
  {
    name: "Growth",
    price: "$7,500+",
    description: "Production apps and dashboards ready for real users and ops teams.",
    featured: true,
    bullets: [
      "iOS + Android or full admin panel",
      "Auth, roles, and core workflows",
      "Payments or third-party APIs",
      "Store / production deploy help",
      "1 month of post-launch support",
    ],
  },
  {
    name: "Custom / Enterprise",
    price: "Custom quote",
    description: "Multi-product systems, complex integrations, and ongoing partnership.",
    featured: false,
    bullets: [
      "Multi-app or multi-tenant systems",
      "Custom architecture & SLAs",
      "Dedicated roadmap & iterations",
      "Priority support & handoff docs",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Clear starting points for every stage"
          subtitle="Transparent ranges so you can plan with confidence — final quotes always match your scope."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 90}>
              <article
                className={cn(
                  "surface-card relative flex h-full flex-col p-7",
                  plan.featured && "border-accent/50 shadow-[0_24px_60px_-36px_var(--color-accent)]",
                )}
              >
                {plan.featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
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
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                  {plan.description}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-foreground/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={cn(
                    "mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300",
                    plan.featured
                      ? "bg-gradient-brand text-primary-foreground hover:-translate-y-0.5"
                      : "border border-border bg-surface-2 text-foreground hover:border-accent/60 hover:text-accent",
                  )}
                >
                  Get a Quote
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-foreground/70">
          All prices are in USD. Final quotes depend on scope, platforms, integrations, and timeline —
          share a brief and we&apos;ll send a fixed quote before any work starts.
        </p>
      </div>
    </section>
  );
}
