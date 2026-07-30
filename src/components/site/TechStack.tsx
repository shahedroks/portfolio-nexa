import type { LucideIcon } from "lucide-react";
import {
  Smartphone,
  Code2,
  Flame,
  Server,
  Network,
  Database,
  Cylinder,
  Leaf,
  Figma,
  GitBranch,
  Layers,
  CreditCard,
  Atom,
} from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const stack: Array<{ name: string; Icon: LucideIcon }> = [
  { name: "Flutter", Icon: Smartphone },
  { name: "Dart", Icon: Code2 },
  { name: "Firebase", Icon: Flame },
  { name: "REST API", Icon: Server },
  { name: "Node.js", Icon: Server },
  { name: "Express.js", Icon: Network },
  { name: "MySQL", Icon: Database },
  { name: "PostgreSQL", Icon: Cylinder },
  { name: "MongoDB", Icon: Leaf },
  { name: "Figma", Icon: Figma },
  { name: "Git & GitHub", Icon: GitBranch },
  { name: "Provider / Bloc", Icon: Layers },
  { name: "Payment Gateways", Icon: CreditCard },
  { name: "React", Icon: Atom },
];

export function TechStack() {
  return (
    <section id="stack" className="section-pad">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Tech Stack"
          title="Tools I use to build reliable software"
          subtitle="A pragmatic stack chosen for speed of delivery, long-term maintainability, and easy handover to your in-house team."
        />

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {stack.map(({ name, Icon }, i) => (
            <Reveal key={name} delay={i * 40}>
              <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-3.5 py-3 transition-colors hover:border-accent">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-brand-soft text-accent transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium leading-tight">{name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
