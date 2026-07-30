import { Smartphone, LayoutDashboard, Globe, PenTool } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const services = [
  {
    Icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Production-ready Flutter apps for iOS and Android from a single codebase — offline support, push notifications, payments, and store submission handled end to end.",
    points: ["Flutter & Dart", "iOS + Android", "App Store & Play launch"],
  },
  {
    Icon: LayoutDashboard,
    title: "Admin Panel / Dashboard",
    description:
      "Role-based back offices that make your operations team faster: real-time analytics, CRUD workflows, exports, and secure authentication on a clean Node.js API.",
    points: ["Role-based access", "Live analytics", "REST APIs"],
  },
  {
    Icon: Globe,
    title: "Website Development",
    description:
      "Marketing sites and web apps engineered for speed and SEO, with responsive layouts, CMS-ready content, and 90+ Lighthouse scores as a baseline, not a bonus.",
    points: ["Responsive builds", "SEO ready", "Performance tuned"],
  },
  {
    Icon: PenTool,
    title: "UI/UX Design",
    description:
      "User flows, wireframes, and high-fidelity prototypes in Figma — plus a reusable design system so your product stays consistent as it grows.",
    points: ["Figma prototypes", "Design systems", "Usability testing"],
  },
];

export function Services() {
  return (
    <section id="services" className="section-pad bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Services"
          title="Everything you need to launch and scale"
          subtitle="One partner for design, mobile, web, and backend — so nothing gets lost between handoffs."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {services.map(({ Icon, title, description, points }, i) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
