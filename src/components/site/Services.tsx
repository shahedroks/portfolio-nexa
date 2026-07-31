import { Reveal, SectionHeading } from "./Reveal";
import { resolveCmsIcon } from "@/lib/cms-icons";
import { useCms } from "@/lib/cms-context";

export function Services() {
  const { services } = useCms().sections;

  return (
    <section id="services" className="section-pad bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={services.eyebrow}
          title={services.title}
          subtitle={services.subtitle}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.items.map(({ iconKey, title, description, points }, i) => {
            const Icon = resolveCmsIcon(iconKey);
            return (
              <Reveal key={title} delay={i * 90}>
                <article className="surface-card lift group h-full p-7 hover:lift-hover hover:border-accent/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {points.map((point) => (
                      <li
                        key={point}
                        className="rounded-lg border border-border bg-surface-2/50 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
