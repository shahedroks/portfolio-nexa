import { Reveal, SectionHeading } from "./Reveal";
import aboutPortrait from "@/assets/about-portrait.jpg";

const stats = [
  { value: "50+", label: "Projects Completed" },
  { value: "30+", label: "Happy Clients" },
  { value: "5+", label: "Years Experience" },
  { value: "100%", label: "On-Time Delivery" },
];

export function About() {
  return (
    <section id="about" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="About Me"
          title="A developer who ships products, not just code"
        />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Photo column */}
          <Reveal className="mx-auto w-full max-w-[18rem] lg:mx-0 lg:max-w-none">
            <div className="relative mx-auto w-fit">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] bg-gradient-brand opacity-30 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-surface-2 p-1.5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] ring-1 ring-accent/20">
                <img
                  src={aboutPortrait}
                  alt="NexaSoft founder portrait"
                  width={640}
                  height={640}
                  className="aspect-square w-full max-w-[17rem] rounded-[1.35rem] object-cover object-top sm:max-w-[19rem]"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Available status badge */}
              <div className="absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/12 bg-background/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="whitespace-nowrap text-xs font-medium text-foreground">
                  Available for hire
                </span>
              </div>
            </div>
          </Reveal>

          {/* Bio + stats */}
          <Reveal delay={100}>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-[1.05rem] sm:leading-8">
              I&apos;m a full-stack developer with 5+ years building cross-platform mobile apps,
              admin panels, and websites for startups and agencies across the US, UK, and Australia.
              I work end-to-end — from Flutter interfaces and Node.js APIs to app store launches and
              post-release support. My focus is simple: clear communication, predictable timelines,
              and software that measurably moves your business metrics. Every project ships with
              clean, documented code you fully own.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="surface-card lift h-full p-4 text-center hover:lift-hover sm:p-5"
                >
                  <p className="text-2xl font-bold text-gradient sm:text-3xl">{stat.value}</p>
                  <p className="mt-1.5 text-xs text-foreground/70 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
