import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import { useCms } from "@/lib/cms-context";
import type { Project } from "@/lib/projects.data";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function isPhoneProject(project: Project) {
  return project.category === "Mobile Apps" || project.category === "UI/UX";
}

function projectCover(project: Project) {
  return project.coverUrl || "";
}

function projectGallery(project: Project) {
  if (project.galleryUrls?.length) return project.galleryUrls;
  return project.coverUrl ? [project.coverUrl] : [];
}

function ProjectPreview({ project }: { project: Project }) {
  const src = projectCover(project);
  const phone = isPhoneProject(project);

  if (phone) {
    return (
      <div className="relative flex aspect-[4/3] items-end justify-center overflow-hidden bg-gradient-to-b from-[#12161f] to-[#0a0c12] px-6 pb-3 pt-5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="relative w-[42%] max-w-[7.5rem] origin-bottom transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.04]">
          <div className="rounded-[1.35rem] bg-[#2a2f3a] p-[2px] shadow-[0_18px_36px_rgba(0,0,0,0.55)]">
            <div className="rounded-[1.25rem] bg-black p-1">
              <div className="relative aspect-[9/19] overflow-hidden rounded-[1.05rem]">
                <div className="absolute left-1/2 top-1 z-10 h-1.5 w-[30%] -translate-x-1/2 rounded-full bg-black/90" />
                <img src={src} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-b from-[#12161f] to-[#0a0c12] px-5 py-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(99,102,241,0.14),transparent_55%)]" />
      <div className="relative w-full max-w-[18rem] overflow-hidden rounded-xl border border-white/10 bg-[#151922] shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03]">
        <div className="flex items-center gap-1.5 border-b border-white/8 bg-[#1a1f2a] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 h-4 flex-1 rounded bg-white/5" />
        </div>
        <div className="aspect-[16/10] overflow-hidden">
          <img src={src} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

export function Portfolio() {
  const { sections, projects, settings } = useCms();
  const portfolio = sections.portfolio;
  const filters = portfolio.filters;
  type Filter = string;
  const [active, setActive] = useState<Filter>("All");
  const [displayed, setDisplayed] = useState<Filter>("All");
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [selected, setSelected] = useState<Project | null>(null);

  const data = useMemo(
    () =>
      projects.map(
        ({ order: _order, published: _published, ...project }): Project => project,
      ),
    [projects],
  );

  const visible = useMemo(() => {
    return displayed === "All" ? data : data.filter((p) => p.category === displayed);
  }, [data, displayed]);

  useEffect(() => {
    if (active === displayed) return;

    setPhase("out");
    const swap = window.setTimeout(() => {
      setDisplayed(active);
      setPhase("in");
    }, 220);

    const settle = window.setTimeout(() => setPhase("idle"), 220 + 420);
    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(settle);
    };
  }, [active, displayed]);

  function onFilter(filter: Filter) {
    if (filter === active || phase === "out") return;
    setActive(filter);
  }

  return (
    <section id="projects" className="section-pad bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={portfolio.eyebrow}
          title={portfolio.title}
          subtitle={portfolio.subtitle}
        />

        <Reveal className="mt-10 flex flex-wrap justify-center gap-2">
          {filters.map((filter) => {
            const isActive = active === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilter(filter)}
                aria-pressed={isActive}
                className={cn(
                  "relative overflow-hidden rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-300 ease-out",
                  isActive
                    ? "border-transparent text-primary-foreground shadow-[0_10px_28px_-14px_rgba(56,189,248,0.8)]"
                    : "border-border bg-surface-2/50 text-muted-foreground hover:-translate-y-0.5 hover:border-accent/35 hover:text-foreground",
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-brand transition-opacity duration-300"
                  />
                ) : null}
                <span className="relative z-[1]">{filter}</span>
              </button>
            );
          })}
        </Reveal>

        {data.length === 0 ? (
          <p className="mt-14 text-center text-sm text-muted-foreground">
            No projects published yet. Add documents in Firestore <code>projects</code>.
          </p>
        ) : (
          <div
            className={cn(
              "mt-10 grid gap-6 transition-all duration-300 ease-out md:grid-cols-2 lg:grid-cols-3",
              phase === "out"
                ? "pointer-events-none translate-y-2 scale-[0.98] opacity-0"
                : "translate-y-0 scale-100 opacity-100",
            )}
          >
            {visible.map((project, i) => (
              <article
                key={`${displayed}-${project.id}`}
                style={{
                  animationDelay: phase === "out" ? "0ms" : `${i * 55}ms`,
                }}
                className={cn(
                  "surface-card lift group flex h-full flex-col overflow-hidden hover:lift-hover hover:border-accent/40",
                  "motion-safe:animate-project-in",
                )}
              >
                <button
                  type="button"
                  onClick={() => setSelected(project)}
                  className="block w-full overflow-hidden border-b border-border text-left"
                >
                  <ProjectPreview project={project} />
                </button>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {project.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(project)}
                    className="mt-2 text-left text-lg font-semibold transition-colors hover:text-accent"
                  >
                    {project.title}
                  </button>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-lg border border-border bg-surface-2/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:border-accent/20"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelected(project)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/40 px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:border-accent/50 hover:text-accent"
                    >
                      View Details
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-accent/50 hover:text-accent"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Demo
                    </a>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`View ${project.title} on GitHub`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-accent/50 hover:text-accent"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {data.length > 0 && visible.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground transition-opacity duration-300">
            No projects in this category yet.
          </p>
        ) : null}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-border bg-surface">
          {selected ? (
            <>
              <DialogHeader>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {selected.category}
                </p>
                <DialogTitle className="text-xl sm:text-2xl">{selected.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {selected.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {projectGallery(selected).map((img, idx) => (
                  <div
                    key={`${selected.slug}-${idx}`}
                    className="overflow-hidden rounded-xl border border-border bg-surface-2"
                  >
                    <img src={img} alt="" className="aspect-[4/3] w-full object-cover object-top" />
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    Result / impact
                  </h4>
                  <p className="mt-1.5 font-medium text-foreground">{selected.impact}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Overview / problem</h4>
                  <p className="mt-1 text-muted-foreground">{selected.problem}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Solution</h4>
                  <p className="mt-1 text-muted-foreground">{selected.solution}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">My role</h4>
                  <p className="mt-1 text-muted-foreground">{selected.role}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Key features</h4>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {selected.features.map((f) => (
                      <li key={f} className="flex gap-2 text-muted-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Tech stack</h4>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {selected.tech.map((t) => (
                      <li
                        key={t}
                        className="rounded-lg border border-border bg-surface-2/60 px-2.5 py-1 text-xs"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <a
                  href="#book"
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  {settings.ctaLabel || "Book a Call"}
                </a>
                <a
                  href={selected.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:border-accent/50 hover:text-accent"
                >
                  Live Demo
                </a>
                <a
                  href={selected.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:border-accent/50 hover:text-accent"
                >
                  GitHub
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:ml-auto"
                >
                  Close
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
