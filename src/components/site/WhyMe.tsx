import { Reveal, SectionHeading } from "./Reveal";
import { resolveCmsIcon } from "@/lib/cms-icons";
import { useCms } from "@/lib/cms-context";

export function WhyMe() {
  const { why_me: why } = useCms().sections;

  return (
    <section id="why" className="section-pad bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={why.eyebrow} title={why.title} subtitle={why.subtitle} />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {why.values.map(({ iconKey, title, description }, i) => {
            const Icon = resolveCmsIcon(iconKey);
            return (
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
