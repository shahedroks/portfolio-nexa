import { Star, FolderCheck, Users, Clock3 } from "lucide-react";

const proofs = [
  {
    icon: FolderCheck,
    value: "50+",
    label: "Projects shipped",
  },
  {
    icon: Users,
    value: "30+",
    label: "Happy clients",
  },
  {
    icon: Clock3,
    value: "5+",
    label: "Years experience",
  },
  {
    icon: Star,
    value: "4.9★",
    label: "Average rating",
  },
];

const platforms = ["Flutter", "iOS", "Android", "Admin Panels", "Web Apps"];

export function TrustedStrip() {
  return (
    <div className="mt-14 border-t border-border pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Proven delivery
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Results clients care about — shipped apps, clear communication, and on-time launches.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {platforms.map((item) => (
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
        {proofs.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand-soft text-accent">
              <Icon className="h-4 w-4" />
            </div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
