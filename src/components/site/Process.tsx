import { Reveal, SectionHeading } from "./Reveal";
import { resolveCmsIcon } from "@/lib/cms-icons";
import { useCms } from "@/lib/cms-context";

export function Process() {
  const { process } = useCms().sections;
  const steps = process.steps;

  return (
    <section id="process" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={process.eyebrow}
          title={process.title}
          subtitle={process.subtitle}
        />

        <div className="relative mt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[1.35rem] top-4 bottom-4 hidden w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent sm:left-[1.6rem] md:block"
          />

          <ol className="space-y-5 md:space-y-6">
            {steps.map((step, i) => {
              const Icon = resolveCmsIcon(step.iconKey);
              return (
                <Reveal as="li" key={step.title} delay={i * 70}>
                  <div className="group relative grid gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-accent/30 hover:bg-white/[0.05] sm:grid-cols-[auto_1fr] sm:gap-5 sm:p-6">
                    <div className="flex items-start gap-4 sm:block">
                      <div className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-[0_12px_30px_-14px_rgba(56,189,248,0.8)] sm:h-12 sm:w-12">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="sm:hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                            Step {i + 1}
                          </span>
                          {step.optional ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                              If needed
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h3>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 hidden flex-wrap items-center gap-2 sm:flex">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                          Step {String(i + 1).padStart(2, "0")}
                        </span>
                        {step.optional ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                            Optional · if you need it
                          </span>
                        ) : null}
                      </div>

                      <h3 className="hidden text-xl font-semibold tracking-tight text-foreground sm:block">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-2.5">
                        {step.description}
                      </p>

                      <ul className="mt-4 flex flex-wrap gap-2">
                        {step.highlights.map((item) => (
                          <li
                            key={item}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/70"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>

                      {i === steps.length - 1 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-foreground">
                            Apple App Store
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-foreground">
                            Google Play Store
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
