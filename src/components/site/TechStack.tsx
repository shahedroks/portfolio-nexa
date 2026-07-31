import { Reveal, SectionHeading } from "./Reveal";
import { resolveCmsIcon } from "@/lib/cms-icons";
import { useCms } from "@/lib/cms-context";

export function TechStack() {
  const { tech_stack: stack } = useCms().sections;

  return (
    <section id="stack" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={stack.eyebrow} title={stack.title} subtitle={stack.subtitle} />

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {stack.items.map(({ name, iconKey }, i) => {
            const Icon = resolveCmsIcon(iconKey);
            return (
              <Reveal key={name} delay={i * 40}>
                <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-3.5 py-3 transition-colors hover:border-accent">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-brand-soft text-accent transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium leading-tight">{name}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
