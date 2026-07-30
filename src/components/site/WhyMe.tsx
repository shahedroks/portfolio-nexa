import { MessageSquare, Clock, DollarSign, CalendarCheck, LifeBuoy, ShieldCheck } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const values = [
  {
    Icon: MessageSquare,
    title: "Clear & Fast Communication",
    description: "Daily updates on Slack or email, and replies within a few hours — never days.",
  },
  {
    Icon: Clock,
    title: "US Time-Zone Friendly",
    description: "Overlapping hours for EST and PST calls, so feedback loops stay same-day.",
  },
  {
    Icon: DollarSign,
    title: "Transparent Pricing",
    description: "Fixed-scope quotes or clear hourly rates. No hidden fees, no scope-creep invoices.",
  },
  {
    Icon: CalendarCheck,
    title: "On-Time Delivery",
    description: "Milestone-based schedules with a 100% on-time record across 50+ projects.",
  },
  {
    Icon: LifeBuoy,
    title: "Post-Launch Support",
    description: "30 days of free bug fixes, plus optional monthly maintenance retainers.",
  },
  {
    Icon: ShieldCheck,
    title: "NDA & Code Ownership",
    description: "Happy to sign your NDA. You own 100% of the source code and all repositories.",
  },
];

export function WhyMe() {
  return (
    <section id="why" className="section-pad bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Why Work With Me"
          title="Built for clients who value reliability"
          subtitle="Great code matters. So does knowing your project is in dependable hands from kickoff to launch."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(({ Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 70}>
              <div className="surface-card lift h-full p-6 hover:lift-hover hover:border-accent/40">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2/60 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
