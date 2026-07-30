import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { SocialRow } from "./Socials";
import { HeroMockups } from "./HeroMockups";
import { TrustedStrip } from "./TrustedStrip";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 50, y: 45, rx: 0, ry: 0 });
  const targetRef = useRef({ x: 50, y: 45, rx: 0, ry: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const mockup = mockupRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!section || !mockup || !finePointer.matches || reducedMotion.matches) return;

    let running = true;
    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.09;
      current.y += (target.y - current.y) * 0.09;
      current.rx += (target.rx - current.rx) * 0.08;
      current.ry += (target.ry - current.ry) * 0.08;

      section.style.setProperty("--spot-x", `${current.x}%`);
      section.style.setProperty("--spot-y", `${current.y}%`);
      mockup.style.setProperty("--tilt-x", `${current.rx}deg`);
      mockup.style.setProperty("--tilt-y", `${current.ry}deg`);
      frameRef.current = running ? requestAnimationFrame(animate) : null;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const ny = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      targetRef.current = {
        x: nx * 100,
        y: ny * 100,
        rx: (0.5 - ny) * 4,
        ry: (nx - 0.5) * 5,
      };
    };

    const onPointerLeave = () => {
      targetRef.current = { x: 50, y: 45, rx: 0, ry: 0 };
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="hero-premium relative overflow-hidden pb-16 pt-28 sm:pt-36"
    >
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
      <div aria-hidden className="hero-cursor-spotlight pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="animate-float-slow pointer-events-none absolute -top-40 left-1/4 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[12%] h-[34rem] w-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.17),rgba(59,130,246,0.12)_38%,rgba(124,58,237,0.07)_58%,transparent_72%)] blur-2xl"
      />
      <div className="relative mx-auto max-w-[90rem] px-3 sm:px-5 lg:px-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 xl:gap-10">
          <Reveal className="relative z-20 flex h-full min-w-0 flex-col justify-between py-1 text-left lg:py-2">
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/12 bg-background/70 px-3.5 py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground/75">
                Open for new projects
              </span>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <span className="hidden text-[0.68rem] font-medium tracking-wide text-muted-foreground sm:inline">
                Remote · Global clients
              </span>
            </div>

            <h1 className="mt-6 max-w-[18ch] font-display text-[2.4rem] font-semibold leading-[1.1] tracking-[-0.035em] text-foreground sm:mt-7 sm:text-[3.15rem] sm:leading-[1.06] lg:text-[3.4rem]">
              Product-ready{" "}
              <span className="text-gradient">Flutter apps</span>
              <span className="text-foreground/88">, admin systems &amp; web platforms</span>
            </h1>

            <p className="mt-5 max-w-md text-[0.95rem] leading-7 text-foreground/68 sm:mt-6 sm:text-[1.02rem] sm:leading-8">
              NexaSoft helps startups and growing teams ship cross-platform mobile apps, secure
              dashboards, and conversion-focused websites — with clean architecture, clear
              timelines, and code you fully own.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2 sm:mt-7">
              {[
                "Flutter · iOS & Android",
                "Admin panels & APIs",
                "App Store & Play Store",
              ].map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-background/55 px-3 py-1.5 text-[0.72rem] font-medium text-foreground/80 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
              <a
                href="#book"
                className="hero-primary-cta group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-14px_rgba(56,189,248,0.85)] transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
              >
                Book a Call
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#projects"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-foreground/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/45 hover:bg-white/[0.05] hover:text-accent sm:w-auto"
              >
                View selected work
              </a>
            </div>

            <div className="mt-8 border-t border-white/8 pt-6 sm:mt-9">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Connect
              </p>
              <SocialRow />
            </div>
          </Reveal>

          <Reveal delay={140} className="relative z-10 flex h-full min-w-0 items-center">
            <div ref={mockupRef} className="hero-parallax-stage w-full">
              <HeroMockups />
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <TrustedStrip />
        </Reveal>
      </div>
    </section>
  );
}
