import { Reveal, SectionHeading } from "./Reveal";

const companies = ["Northline", "CareBridge", "Halo", "PayNest", "Freightly", "Bookora"];

function monogram(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function TrustedBy() {
  return (
    <section className="section-pad bg-surface/40 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Clients"
          title="Trusted by teams & founders like"
          subtitle="Product leaders and operators who ship with NexaSoft across mobile, web, and ops tooling."
        />

        <Reveal className="mt-10">
          <ul className="flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {companies.map((name) => (
              <li key={name} className="shrink-0">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/40 px-4 py-3 opacity-60 grayscale transition-all duration-300 hover:border-accent hover:opacity-100 hover:grayscale-0">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/60 font-display text-xs font-bold tracking-wide text-muted-foreground">
                    {monogram(name)}
                  </span>
                  <span className="text-sm font-semibold tracking-wide text-muted-foreground">
                    {name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
