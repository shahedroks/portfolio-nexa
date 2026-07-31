import { resolveCmsIcon } from "@/lib/cms-icons";
import { useCms } from "@/lib/cms-context";

export function TrustedStrip() {
  const strip = useCms().sections.hero.trustedStrip;

  return (
    <div className="mt-14 border-t border-border pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {strip.eyebrow}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{strip.copy}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {strip.platforms.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {strip.proofs.map(({ iconKey, value, label }) => {
          const Icon = resolveCmsIcon(iconKey);
          return (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand-soft text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
