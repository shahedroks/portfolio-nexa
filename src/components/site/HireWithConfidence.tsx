import { ArrowUpRight, BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const platforms = [
  {
    name: "Fiverr",
    title: "Hire me on Fiverr",
    blurb: "Fixed-price gigs with money-back guarantee",
    cta: "View Fiverr Profile",
    href:
      (import.meta.env.VITE_FIVERR_URL as string | undefined)?.trim() ||
      "https://www.fiverr.com/",
    accent: "#1DBF73",
    features: ["Fixed-price gigs", "Money-back guarantee"],
    featured: true,
  },
  {
    name: "Upwork",
    title: "Hire me on Upwork",
    blurb: "Secure milestone payments & buyer protection",
    cta: "View Upwork Profile",
    href:
      (import.meta.env.VITE_UPWORK_URL as string | undefined)?.trim() ||
      "https://www.upwork.com/freelancers/",
    accent: "#14A800",
    features: ["Milestone escrow", "Buyer protection"],
    featured: false,
  },
] as const;

function BrandLogo({ name }: { name: "Fiverr" | "Upwork" }) {
  if (name === "Fiverr") {
    return (
      <span
        aria-label="Fiverr"
        className="font-sans text-[1.65rem] font-black leading-none tracking-[-0.08em] text-[#1DBF73]"
      >
        fiverr<span className="tracking-normal">.</span>
      </span>
    );
  }

  return (
    <span
      aria-label="Upwork"
      className="font-sans text-[1.55rem] font-extrabold leading-none tracking-[-0.07em] text-[#14A800]"
    >
      up<span className="tracking-[-0.12em]">work</span>
    </span>
  );
}

export function HireWithConfidence() {
  return (
    <section id="hire" className="relative overflow-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Hire with confidence"
          title="Prefer a Trusted Platform?"
          subtitle="You can also hire and pay securely through these platforms — with their built-in buyer protection."
        />

        <Reveal className="relative mx-auto mt-9 max-w-4xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_30%,rgba(29,191,115,0.10),transparent_38%),radial-gradient(circle_at_80%_65%,rgba(20,168,0,0.08),transparent_38%)] blur-2xl"
          />
          <div className="relative grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-3 shadow-[0_28px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:grid-cols-2 sm:p-4">
            {platforms.map((platform, i) => (
              <Reveal key={platform.name} delay={i * 80}>
                <article className="surface-card lift group relative flex h-full flex-col overflow-hidden p-5 hover:lift-hover sm:p-6">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px opacity-80"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${platform.accent}, transparent)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
                    style={{ backgroundColor: platform.accent }}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div
                      className="inline-flex min-h-12 items-center rounded-xl border border-white/10 bg-white/[0.035] px-4"
                      style={{
                        boxShadow: `inset 0 0 24px color-mix(in oklab, ${platform.accent} 8%, transparent)`,
                      }}
                    >
                      <BrandLogo name={platform.name} />
                    </div>
                    {platform.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#1DBF73]/30 bg-[#1DBF73]/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-[#1DBF73]">
                        <BadgeCheck className="h-3 w-3" />
                        Recommended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2/60 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        <LockKeyhole className="h-3 w-3 text-[#14A800]" />
                        Secure
                      </span>
                    )}
                  </div>

                  <h3 className="relative mt-5 text-lg font-semibold text-foreground">
                    {platform.title}
                  </h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-foreground/70">
                    {platform.blurb}
                  </p>

                  <ul className="relative mt-4 grid gap-2 text-xs text-foreground/70">
                    {platform.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full"
                          style={{
                            color: platform.accent,
                            background: `color-mix(in oklab, ${platform.accent} 12%, transparent)`,
                          }}
                        >
                          <ShieldCheck className="h-3 w-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={platform.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      borderColor: `color-mix(in oklab, ${platform.accent} 28%, var(--color-border))`,
                      background: `linear-gradient(135deg, color-mix(in oklab, ${platform.accent} 12%, transparent), color-mix(in oklab, ${platform.accent} 4%, transparent))`,
                    }}
                  >
                    {platform.cta}
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{ color: platform.accent }}
                    />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
